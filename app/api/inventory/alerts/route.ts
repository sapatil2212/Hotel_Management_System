import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateAlertSchema = z.object({
  id: z.string(),
  isRead: z.boolean().optional(),
  isResolved: z.boolean().optional(),
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
    const alertType = searchParams.get('alertType');
    const isRead = searchParams.get('isRead');
    const isResolved = searchParams.get('isResolved');
    const itemId = searchParams.get('itemId');

    // Build where clause
    const where: any = {};

    if (alertType && alertType !== 'all') {
      where.alertType = alertType;
    }

    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    if (isResolved !== null && isResolved !== undefined) {
      where.isResolved = isResolved === 'true';
    }

    if (itemId) {
      where.itemId = itemId;
    }

    const [alerts, totalCount] = await Promise.all([
      prisma.inventory_alert.findMany({
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
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventory_alert.count({ where }),
    ]);

    return NextResponse.json({
      alerts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory alerts' },
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
    const validated = updateAlertSchema.parse(body);

    const updateData: any = {};
    if (validated.isRead !== undefined) {
      updateData.isRead = validated.isRead;
    }
    if (validated.isResolved !== undefined) {
      updateData.isResolved = validated.isResolved;
      if (validated.isResolved) {
        updateData.resolvedBy = (session.user as any).id;
        updateData.resolvedAt = new Date();
      }
    }

    const alert = await prisma.inventory_alert.update({
      where: { id: validated.id },
      data: updateData,
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

    return NextResponse.json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating inventory alert:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory alert' },
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
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    await prisma.inventory_alert.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory alert' },
      { status: 500 }
    );
  }
}
