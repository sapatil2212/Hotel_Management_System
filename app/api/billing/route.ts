import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET - Fetch all bills
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supplier = searchParams.get('supplier');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (supplier) {
      where.supplierName = {
        contains: supplier,
        mode: 'insensitive'
      };
    }

    const bills = await prisma.supplier_bill.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

// POST - Create new bill
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      supplierName,
      supplierContact,
      gstNumber,
      billDate,
      dueDate,
      items,
      subtotal,
      gstAmount,
      totalAmount,
      paymentTerms,
      paymentMethod,
      notes,
    } = body;

    // Validate required fields
    if (!supplierName || !billDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate bill number
    const billNumber = `BILL-${Date.now().toString().slice(-6)}`;

    const bill = await prisma.supplier_bill.create({
      data: {
        billNumber,
        supplierName,
        supplierContact,
        gstNumber,
        billDate: new Date(billDate),
        dueDate: new Date(dueDate),
        subtotal,
        gstAmount,
        totalAmount,
        paymentTerms,
        paymentMethod,
        notes,
        status: 'pending',
        createdBy: session.user.id,
        items: {
          create: items.map((item: any) => ({
            itemName: item.itemName,
            sku: item.sku,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    );
  }
}

// PUT - Update bill
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Bill ID is required' },
        { status: 400 }
      );
    }

    const bill = await prisma.supplier_bill.update({
      where: { id },
      data: {
        ...updateData,
        billDate: updateData.billDate ? new Date(updateData.billDate) : undefined,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        updatedAt: new Date(),
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    );
  }
}

// DELETE - Delete bill
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
        { error: 'Bill ID is required' },
        { status: 400 }
      );
    }

    // Delete bill items first
    await prisma.supplier_bill_item.deleteMany({
      where: { billId: id },
    });

    // Delete the bill
    await prisma.supplier_bill.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
}
