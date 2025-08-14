import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createExpenseTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const updateExpenseTypeSchema = z.object({
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

    const expenseTypes = await prisma.expense_type.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(expenseTypes);
  } catch (error) {
    console.error('Error fetching expense types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense types' },
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
    const validated = createExpenseTypeSchema.parse(body);

    // Check if expense type name already exists
    const existingType = await prisma.expense_type.findUnique({
      where: { name: validated.name },
    });

    if (existingType) {
      return NextResponse.json(
        { error: 'Expense type with this name already exists' },
        { status: 400 }
      );
    }

    const expenseType = await prisma.expense_type.create({
      data: {
        name: validated.name,
        description: validated.description,
        createdBy: (session.user as any).id,
      },
    });

    return NextResponse.json(expenseType, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating expense type:', error);
    return NextResponse.json(
      { error: 'Failed to create expense type' },
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
    const validated = updateExpenseTypeSchema.parse(body);

    // Check if another expense type with the same name exists
    const existingType = await prisma.expense_type.findFirst({
      where: {
        name: validated.name,
        id: {
          not: validated.id,
        },
      },
    });

    if (existingType) {
      return NextResponse.json(
        { error: 'Expense type with this name already exists' },
        { status: 400 }
      );
    }

    const expenseType = await prisma.expense_type.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        description: validated.description,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json(expenseType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating expense type:', error);
    return NextResponse.json(
      { error: 'Failed to update expense type' },
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
        { error: 'Expense type ID is required' },
        { status: 400 }
      );
    }

    // Check if expense type has any associated expenses
    const expenseCount = await prisma.expense.count({
      where: { expenseTypeId: id },
    });

    if (expenseCount > 0) {
      // Instead of deleting, deactivate the expense type
      const expenseType = await prisma.expense_type.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: 'Expense type deactivated as it has associated expenses',
        expenseType,
      });
    }

    // Safe to delete if no associated expenses
    await prisma.expense_type.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Expense type deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense type:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense type' },
      { status: 500 }
    );
  }
}




