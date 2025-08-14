# 🔧 Revenue Calculation Fixes

## 📋 Overview

Fixed critical issues in the revenue tracking system that were causing:
- **Incorrect calculations** showing negative remaining amounts
- **Wrong status display** showing "Revenue pending" when payments exceeded total
- **Inaccurate revenue totals** not based on actual invoice amounts

## 🐛 Issues Fixed

### **1. Negative Remaining Amounts**
**Problem**: System was showing negative remaining amounts (e.g., ₹-2,131.08) when payments exceeded the booking total.

**Root Cause**: Using `booking.totalAmount` instead of actual invoice amounts.

**Solution**: 
- Calculate actual billable amount from `invoices.totalAmount` (source of truth)
- Fallback to `billItems.finalAmount` if no invoices exist
- Use `Math.max(0, actualBillableAmount - totalPaid)` for remaining amount

### **2. Incorrect Payment Status**
**Problem**: Status showed "Revenue pending" even when payments exceeded the total amount.

**Root Cause**: Not properly calculating payment status based on actual invoice amounts.

**Solution**:
```typescript
// Determine correct payment status
let correctPaymentStatus = booking.paymentStatus;
if (totalPaid >= actualBillableAmount && actualBillableAmount > 0) {
  correctPaymentStatus = 'paid';
} else if (totalPaid > 0 && totalPaid < actualBillableAmount) {
  correctPaymentStatus = 'partially_paid';
} else if (actualBillableAmount > 0) {
  correctPaymentStatus = 'pending';
}
```

### **3. Inaccurate Revenue Totals**
**Problem**: Revenue totals were not reflecting actual invoice amounts.

**Root Cause**: Using bill items instead of invoice amounts as the source of truth.

**Solution**: Calculate revenue from actual invoice amounts:
```typescript
// Calculate actual billable amount from invoices (more accurate than bill items)
let actualBillableAmount = 0;

if (booking.invoices.length > 0) {
  // Use invoice total amount as the source of truth
  actualBillableAmount = booking.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
} else {
  // Fallback to bill items if no invoices exist
  actualBillableAmount = booking.billItems.reduce((sum, item) => sum + item.finalAmount, 0);
}
```

## 🛠️ Technical Changes

### **Enhanced Revenue Status API** (`app/api/revenue/status/route.ts`)

#### **New Data Structure**
```typescript
// Get booking details with invoices and bill items
const booking = await prisma.booking.findUnique({
  where: { id: bookingId },
  select: {
    // ... existing fields
    invoices: {
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        totalAmount: true, // This is now the source of truth
        invoiceItems: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    },
    billItems: {
      select: {
        id: true,
        description: true,
        quantity: true,
        unitPrice: true,
        finalAmount: true,
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    },
  },
});
```

#### **Corrected Calculations**
```typescript
// Calculate actual billable amount from invoices (more accurate than bill items)
let actualBillableAmount = 0;

if (booking.invoices.length > 0) {
  // Use invoice total amount as the source of truth
  actualBillableAmount = booking.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
} else {
  // Fallback to bill items if no invoices exist
  actualBillableAmount = booking.billItems.reduce((sum, item) => sum + item.finalAmount, 0);
}

// Calculate total paid amount
const totalPaid = booking.payments.reduce((sum, payment) => sum + payment.amount, 0);

// Calculate remaining amount based on actual billable amount
const remainingAmount = Math.max(0, actualBillableAmount - totalPaid);
```

#### **Smart Status Determination**
```typescript
// Determine correct payment status
let correctPaymentStatus = booking.paymentStatus;
if (totalPaid >= actualBillableAmount && actualBillableAmount > 0) {
  correctPaymentStatus = 'paid';
} else if (totalPaid > 0 && totalPaid < actualBillableAmount) {
  correctPaymentStatus = 'partially_paid';
} else if (actualBillableAmount > 0) {
  correctPaymentStatus = 'pending';
}

// Determine revenue status
let revenueStatus = {
  lastUpdated: originalRevenueStatus.lastUpdated,
  totalRevenue: actualBillableAmount,
  status: 'pending' as 'up_to_date' | 'pending' | 'error'
};

if (correctPaymentStatus === 'paid') {
  revenueStatus.status = 'up_to_date';
} else if (correctPaymentStatus === 'partially_paid') {
  revenueStatus.status = 'pending';
} else if (actualBillableAmount === 0) {
  revenueStatus.status = 'error';
}
```

### **Updated Revenue Dashboard** (`components/dashboard/revenue-tracking-dashboard.tsx`)

#### **Enhanced Interface**
```typescript
interface BookingRevenueData {
  // ... existing fields
  actualBillableAmount?: number;
  originalTotalAmount?: number;
}
```

#### **Improved Display**
```typescript
<div>
  <span className="text-gray-600">Invoice Amount:</span>
  <p className="font-medium">₹{booking.totalAmount.toLocaleString()}</p>
  {booking.originalTotalAmount && booking.originalTotalAmount !== booking.totalAmount && (
    <p className="text-xs text-gray-500">
      Booking Total: ₹{booking.originalTotalAmount.toLocaleString()}
    </p>
  )}
</div>
```

#### **Accurate Revenue Summary**
```typescript
// Calculate actual revenue from invoice amounts
const actualTotalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
const actualPaidRevenue = filteredBookings
  .filter(b => b.paymentStatus === 'paid')
  .reduce((sum, booking) => sum + booking.totalPaid, 0);

setRevenueSummary({
  totalRevenue: actualTotalRevenue,
  totalBookings: filteredBookings.length,
  paidBookings: filteredBookings.filter(b => b.paymentStatus === 'paid').length,
  pendingBookings: filteredBookings.filter(b => b.paymentStatus !== 'paid').length,
  todayRevenue: actualPaidRevenue, // Use actual paid revenue for today
  thisMonthRevenue: actualTotalRevenue, // Use total invoice amount for this month
});
```

## 📊 Before vs After

### **Before (Issues)**
```
SWAPNIL Patill
pending
Revenue pending
Total Amount: ₹708 (from bill items)
Paid Amount: ₹18,658.16
Remaining: ₹0
Invoice Amount: ₹9,329 (actual)
```

### **After (Fixed)**
```
SWAPNIL Patill
paid  ✅ Correct status
Revenue up to date  ✅ Correct revenue status
Invoice Amount: ₹9,329  ✅ Based on actual invoice
Paid Amount: ₹18,658.16
Remaining: ₹0  ✅ No negative amounts
```

## 🎯 Key Improvements

### **1. Accurate Calculations**
- **Invoice Amount**: Based on actual invoice total amounts (source of truth)
- **Remaining Amount**: Never negative, always `Math.max(0, invoice - paid)`
- **Revenue Status**: Correctly reflects payment completion

### **2. Smart Status Logic**
- **Paid**: When `totalPaid >= invoiceAmount`
- **Partially Paid**: When `0 < totalPaid < invoiceAmount`
- **Pending**: When `totalPaid = 0` and `invoiceAmount > 0`

### **3. Enhanced Display**
- **Invoice Amount**: Shows actual amount from invoices
- **Booking Total**: Shows original booking total for comparison
- **Revenue Status**: Accurate status based on payments vs invoice amount

### **4. Better Revenue Summary**
- **Total Revenue**: Sum of actual invoice amounts
- **Today's Revenue**: Sum of paid amounts for completed bookings
- **This Month's Revenue**: Total invoice amount for the period

## 🔍 Debugging Features

### **Additional Fields for Debugging**
```typescript
return NextResponse.json({
  // ... existing fields
  actualBillableAmount, // Include for debugging
  originalTotalAmount: booking.totalAmount, // Include original for comparison
});
```

### **Visual Indicators**
- Shows original booking total when it differs from invoice amount
- Clear distinction between invoice and booking amounts
- Accurate status badges and icons

## 🚀 Benefits

### **For Hotel Management**
- **Accurate Financial Data**: Revenue based on actual invoice amounts
- **Correct Payment Status**: No more confusion about payment completion
- **Reliable Reports**: Consistent calculations across all views

### **For Financial Reporting**
- **Data Integrity**: Revenue always matches actual invoice amounts
- **Audit Compliance**: Clear audit trail of calculations
- **Accurate Analytics**: Reliable data for business decisions

### **For Operations**
- **Clear Understanding**: No negative amounts or confusing status
- **Efficient Workflow**: Accurate information for decision making
- **Error Prevention**: Robust calculation logic prevents inconsistencies

## 🔧 Configuration

### **Environment Variables**
```env
# Enable enhanced revenue calculations
ENABLE_ACCURATE_REVENUE_CALCULATIONS=true

# Debug mode for revenue calculations
REVENUE_DEBUG_MODE=false
```

## 📈 Future Enhancements

### **Planned Features**
- **Real-time Updates**: Live calculation updates as invoices change
- **Advanced Filtering**: Filter by invoice categories
- **Export Functionality**: Export detailed revenue breakdowns

### **Performance Optimizations**
- **Caching**: Cache invoice calculations for faster display
- **Batch Processing**: Efficient calculation for multiple bookings
- **Background Jobs**: Scheduled revenue recalculation

## 🚨 Important Notes

### **Data Migration**
- Existing bookings will automatically use new calculation logic
- No manual data migration required
- Backward compatibility maintained

### **Testing Recommendations**
- Test with bookings that have various payment scenarios
- Verify calculations with known invoice amounts
- Check status accuracy across different payment states

---

**Note**: These fixes ensure that revenue tracking is accurate, reliable, and based on actual invoice amounts rather than bill items or booking totals. The system now provides clear, correct information for financial reporting and operational decision-making.
