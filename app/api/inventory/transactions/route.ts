import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notification-service';
import { z } from 'zod';

const createTransactionSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  transactionType: z.enum(['purchase', 'sale', 'adjustment', 'return', 'damage', 'expiry', 'transfer']),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  referenceNumber: z.string().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
  transactionDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const itemId = searchParams.get('itemId');
    const transactionType = searchParams.get('transactionType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};

    if (itemId) {
      where.itemId = itemId;
    }

    if (transactionType && transactionType !== 'all') {
      where.transactionType = transactionType;
    }

    if (startDate && endDate) {
      where.transactionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.inventory_transaction.findMany({
        where,
        include: {
          item: {
            include: {
              category: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          transactionDate: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventory_transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createTransactionSchema.parse(body);

    // Get the item and check if it exists
    const item = await prisma.inventory_item.findUnique({
      where: { id: validated.itemId },
      include: { category: true },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    if (!item.isActive) {
      return NextResponse.json(
        { error: 'Cannot perform transactions on inactive items' },
        { status: 400 }
      );
    }

    const previousStock = item.currentStock;
    let newStock = previousStock;

    // Calculate new stock based on transaction type
    switch (validated.transactionType) {
      case 'purchase':
      case 'return':
        newStock += validated.quantity;
        break;
      case 'sale':
      case 'damage':
      case 'expiry':
        if (previousStock < validated.quantity) {
          return NextResponse.json(
            { error: 'Insufficient stock for this transaction' },
            { status: 400 }
          );
        }
        newStock -= validated.quantity;
        break;
      case 'adjustment':
        newStock = validated.quantity; // Direct adjustment
        break;
      case 'transfer':
        // For transfer, we assume it's moving stock between locations
        // This could be enhanced to handle actual transfers between items
        newStock = validated.quantity;
        break;
    }

    // Check for maximum stock limit
    if (item.maximumStock && newStock > item.maximumStock) {
      return NextResponse.json(
        { error: `Stock cannot exceed maximum limit of ${item.maximumStock} ${item.unit}` },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update item stock
      const updatedItem = await tx.inventory_item.update({
        where: { id: validated.itemId },
        data: { currentStock: newStock },
        include: { category: true },
      });

      // Create transaction record
      const transaction = await tx.inventory_transaction.create({
        data: {
          itemId: validated.itemId,
          transactionType: validated.transactionType,
          quantity: validated.quantity,
          unitPrice: validated.unitPrice,
          totalAmount: validated.quantity * validated.unitPrice,
          previousStock,
          newStock,
          referenceNumber: validated.referenceNumber,
          supplier: validated.supplier,
          notes: validated.notes,
          transactionDate: validated.transactionDate ? new Date(validated.transactionDate) : new Date(),
          processedBy: (session.user as any).id,
        },
        include: {
          item: {
            include: {
              category: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Check for stock alerts
      const alerts = [];

      // Low stock alert
      if (newStock <= item.minimumStock && newStock > 0) {
        const alert = await tx.inventory_alert.create({
          data: {
            itemId: validated.itemId,
            alertType: 'low_stock',
            message: `${item.name} is running low on stock (${newStock} ${item.unit} remaining)`,
          },
        });
        alerts.push(alert);
      }

      // Out of stock alert
      if (newStock === 0) {
        const alert = await tx.inventory_alert.create({
          data: {
            itemId: validated.itemId,
            alertType: 'out_of_stock',
            message: `${item.name} is out of stock`,
          },
        });
        alerts.push(alert);
      }

      // Overstock alert
      if (item.maximumStock && newStock > item.maximumStock * 0.9) {
        const alert = await tx.inventory_alert.create({
          data: {
            itemId: validated.itemId,
            alertType: 'overstock',
            message: `${item.name} is approaching maximum stock level (${newStock}/${item.maximumStock} ${item.unit})`,
          },
        });
        alerts.push(alert);
      }

      return { transaction, updatedItem, alerts };
    });

    // Create notification for significant transactions
    try {
      if (validated.transactionType === 'sale' || validated.transactionType === 'damage') {
        await NotificationService.createNotification({
          title: 'Inventory Transaction',
          message: `${validated.transactionType.toUpperCase()}: ${validated.quantity} ${item.unit} of ${item.name}`,
          type: 'inventory',
          referenceId: result.transaction.id,
          referenceType: 'expense'
        });
      }
    } catch (notificationError) {
      console.error('Error creating inventory notification:', notificationError);
      // Don't fail the transaction if notification fails
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating inventory transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory transaction' },
      { status: 500 }
    );
  }
}
