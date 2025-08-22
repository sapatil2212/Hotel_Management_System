import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const categories = await prisma.inventory_category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory categories' },
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
    const validated = createCategorySchema.parse(body);

    // Check if category name already exists
    const existingCategory = await prisma.inventory_category.findUnique({
      where: { name: validated.name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.inventory_category.create({
      data: {
        name: validated.name,
        description: validated.description,
        createdBy: (session.user as any).id,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating inventory category:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory category' },
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
    const validated = updateCategorySchema.parse(body);

    // Check if another category with the same name exists
    const existingCategory = await prisma.inventory_category.findFirst({
      where: {
        name: validated.name,
        id: {
          not: validated.id,
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.inventory_category.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        description: validated.description,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating inventory category:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory category' },
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
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category has any associated items
    const itemCount = await prisma.inventory_item.count({
      where: { categoryId: id },
    });

    if (itemCount > 0) {
      // Instead of deleting, deactivate the category
      const category = await prisma.inventory_category.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: 'Category deactivated as it has associated items',
        category,
      });
    }

    // Safe to delete if no associated items
    await prisma.inventory_category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory category:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory category' },
      { status: 500 }
    );
  }
}
