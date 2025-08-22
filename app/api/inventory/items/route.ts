import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notification-service';
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  currentStock: z.number().min(0, 'Current stock cannot be negative'),
  minimumStock: z.number().min(0, 'Minimum stock cannot be negative'),
  maximumStock: z.number().optional(),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  sellingPrice: z.number().optional(),
  supplier: z.string().optional(),
  supplierContact: z.string().optional(),
  location: z.string().optional(),
  expiryDate: z.string().optional(),
});

const updateItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  minimumStock: z.number().min(0, 'Minimum stock cannot be negative'),
  maximumStock: z.number().optional(),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  sellingPrice: z.number().optional(),
  supplier: z.string().optional(),
  supplierContact: z.string().optional(),
  location: z.string().optional(),
  expiryDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

const transactionSchema = z.object({
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
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';
    const outOfStock = searchParams.get('outOfStock') === 'true';
    const expiringSoon = searchParams.get('expiringSoon') === 'true';

    // Build where clause
    const where: any = {};

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (lowStock) {
      where.currentStock = {
        lte: prisma.inventory_item.fields.minimumStock,
      };
    }

    if (outOfStock) {
      where.currentStock = 0;
    }

    if (expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expiryDate = {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      };
    }

    const [items, totalCount] = await Promise.all([
      prisma.inventory_item.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventory_item.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
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
    const validated = createItemSchema.parse(body);

    // Check if SKU or barcode already exists
    if (validated.sku) {
      const existingSku = await prisma.inventory_item.findUnique({
        where: { sku: validated.sku },
      });
      if (existingSku) {
        return NextResponse.json(
          { error: 'Item with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    if (validated.barcode) {
      const existingBarcode = await prisma.inventory_item.findUnique({
        where: { barcode: validated.barcode },
      });
      if (existingBarcode) {
        return NextResponse.json(
          { error: 'Item with this barcode already exists' },
          { status: 400 }
        );
      }
    }

    const item = await prisma.inventory_item.create({
      data: {
        name: validated.name,
        description: validated.description,
        categoryId: validated.categoryId,
        sku: validated.sku,
        barcode: validated.barcode,
        unit: validated.unit,
        currentStock: validated.currentStock,
        minimumStock: validated.minimumStock,
        maximumStock: validated.maximumStock,
        costPrice: validated.costPrice,
        sellingPrice: validated.sellingPrice,
        supplier: validated.supplier,
        supplierContact: validated.supplierContact,
        location: validated.location,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
        createdBy: (session.user as any).id,
      },
      include: {
        category: true,
      },
    });

    // Create initial stock transaction if currentStock > 0
    if (validated.currentStock > 0) {
      await prisma.inventory_transaction.create({
        data: {
          itemId: item.id,
          transactionType: 'purchase',
          quantity: validated.currentStock,
          unitPrice: validated.costPrice,
          totalAmount: validated.currentStock * validated.costPrice,
          previousStock: 0,
          newStock: validated.currentStock,
          notes: 'Initial stock',
          processedBy: (session.user as any).id,
        },
      });
    }

    // Check for low stock alert
    if (validated.currentStock <= validated.minimumStock) {
      await prisma.inventory_alert.create({
        data: {
          itemId: item.id,
          alertType: validated.currentStock === 0 ? 'out_of_stock' : 'low_stock',
          message: validated.currentStock === 0 
            ? `${item.name} is out of stock`
            : `${item.name} is running low on stock (${validated.currentStock} ${validated.unit} remaining)`,
        },
      });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateItemSchema.parse(body);

    // Check if SKU or barcode already exists for other items
    if (validated.sku) {
      const existingSku = await prisma.inventory_item.findFirst({
        where: {
          sku: validated.sku,
          id: { not: validated.id },
        },
      });
      if (existingSku) {
        return NextResponse.json(
          { error: 'Item with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    if (validated.barcode) {
      const existingBarcode = await prisma.inventory_item.findFirst({
        where: {
          barcode: validated.barcode,
          id: { not: validated.id },
        },
      });
      if (existingBarcode) {
        return NextResponse.json(
          { error: 'Item with this barcode already exists' },
          { status: 400 }
        );
      }
    }

    const item = await prisma.inventory_item.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        description: validated.description,
        categoryId: validated.categoryId,
        sku: validated.sku,
        barcode: validated.barcode,
        unit: validated.unit,
        minimumStock: validated.minimumStock,
        maximumStock: validated.maximumStock,
        costPrice: validated.costPrice,
        sellingPrice: validated.sellingPrice,
        supplier: validated.supplier,
        supplierContact: validated.supplierContact,
        location: validated.location,
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
        isActive: validated.isActive,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Check if item has any transactions or alerts
    const [transactionCount, alertCount] = await Promise.all([
      prisma.inventory_transaction.count({
        where: { itemId: id },
      }),
      prisma.inventory_alert.count({
        where: { itemId: id },
      }),
    ]);

    if (transactionCount > 0 || alertCount > 0) {
      // Instead of deleting, deactivate the item
      const item = await prisma.inventory_item.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: `Item deactivated as it has ${transactionCount} transactions and ${alertCount} alerts`,
        item,
      });
    }

    // Safe to delete if no related records
    await prisma.inventory_item.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
