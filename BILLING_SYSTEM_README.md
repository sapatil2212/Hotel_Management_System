# Billing & Invoice System Integration

A comprehensive billing and invoice management system integrated with your HMS booking process, featuring automatic invoice generation, payment tracking, and professional invoice display.

## 🚀 Features

### Automatic Invoice Generation
- **Checkout Integration**: Invoices are automatically generated when users complete booking checkout
- **Pay at Hotel**: Default payment method for all bookings
- **Manual Status Management**: Payment status is not automatically changed to paid - requires manual admin action

### Payment Management
- **Multiple Payment Methods**: Cash, Card, Online Payment, Bank Transfer
- **Payment Recording**: Admins can record payments with detailed information
- **Payment History**: Complete payment tracking for each booking
- **Partial Payments**: Support for partial payment recording

### Professional Invoice System
- **PDF Export**: Download invoices as professional PDF documents
- **Real-time Preview**: View invoices before downloading
- **Customizable Design**: Professional layout matching your brand
- **Tax Calculations**: Automatic tax breakdown and calculations

### Admin Dashboard
- **Billing Management**: Comprehensive billing interface in admin dashboard
- **Invoice Generation**: Manual invoice generation for existing bookings
- **Payment Recording**: Easy payment recording with detailed forms
- **Status Tracking**: Real-time payment and invoice status updates

## 📊 Database Schema

### New Models Added

#### Invoice Model
```sql
model invoice {
  id              String   @id @default(cuid())
  invoiceNumber   String   @unique
  bookingId       String
  guestName       String
  guestEmail      String
  guestPhone      String
  checkIn         DateTime
  checkOut        DateTime
  nights          Int
  adults          Int
  children        Int
  roomTypeName    String
  roomNumber      String
  baseAmount      Float
  discountAmount  Float
  gstAmount       Float
  serviceTaxAmount Float
  otherTaxAmount  Float
  totalTaxAmount  Float
  totalAmount     Float
  status          String   @default("pending")
  dueDate         DateTime
  issuedDate      DateTime @default(now())
  paidDate        DateTime?
  notes           String?  @db.Text
  terms           String?  @default("Payment due upon receipt")
  createdAt       DateTime @default(now())
  updatedAt       DateTime
  booking         booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  payments        payment[]
}
```

#### Payment Model
```sql
model payment {
  id              String   @id @default(cuid())
  bookingId       String
  invoiceId       String?
  amount          Float
  paymentMethod   String
  paymentReference String?
  paymentDate     DateTime @default(now())
  receivedBy      String?
  notes           String?  @db.Text
  status          String   @default("completed")
  createdAt       DateTime @default(now())
  updatedAt       DateTime
  booking         booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  invoice         invoice? @relation(fields: [invoiceId], references: [id], onDelete: SetNull)
}
```

#### Updated Booking Model
```sql
model booking {
  // ... existing fields ...
  paymentMethod   String?    @default("pay_at_hotel")
  paymentStatus   String?    @default("pending")
  invoices        invoice[]
  payments        payment[]
}
```

## 🔧 API Endpoints

### Invoice Management
- `POST /api/invoices` - Generate invoice from booking
- `GET /api/invoices/[id]` - Get specific invoice
- `PUT /api/invoices/[id]` - Update invoice status

### Payment Management
- `POST /api/payments` - Record a payment
- `GET /api/payments?bookingId=xxx` - Get payment history for booking

## 🎯 Usage Workflow

### 1. Booking Checkout Process
```typescript
// When user completes booking
const booking = await createBooking(bookingData)

// Invoice is automatically generated
const invoice = await InvoiceService.generateInvoiceFromBooking({
  bookingId: booking.id,
  dueDate: booking.checkIn, // Default due date
  terms: 'Payment due upon receipt'
})
```

### 2. Admin Payment Recording
```typescript
// Admin records payment
const payment = await InvoiceService.recordPayment({
  bookingId: 'booking-id',
  amount: 100.00,
  paymentMethod: 'cash',
  paymentReference: 'REC-001',
  receivedBy: 'Admin Name',
  notes: 'Payment received at check-in'
})
```

### 3. Invoice Status Updates
- **Pending**: Invoice generated, payment not received
- **Partially Paid**: Some payment received but not full amount
- **Paid**: Full payment received
- **Overdue**: Payment past due date
- **Cancelled**: Invoice cancelled

## 🎨 Invoice Design

The invoice system uses the professional design from your reference image:

- **Header**: Company logo, invoice title, company details
- **Billing Information**: Guest details, check-in/out dates
- **Item Details**: Room type, nights, rates, taxes
- **Totals**: Subtotal, tax breakdown, final amount
- **Payment Terms**: Professional terms and conditions
- **PDF Export**: High-quality PDF generation

## 🔐 Security & Validation

### Payment Validation
- Amount validation (must be positive)
- Payment method validation
- Reference number tracking
- Admin authentication for payment recording

### Invoice Security
- Unique invoice numbers
- Audit trail for all changes
- Payment history tracking
- Status change validation

## 📱 Admin Dashboard Integration

### Billing Management Page
- **Location**: `/dashboard/billing`
- **Features**:
  - View all bookings with payment status
  - Generate invoices manually
  - Record payments with detailed forms
  - View invoice history
  - Download PDF invoices

### Key Components
- `BillingManagement` - Main billing interface
- `InvoicePDF` - PDF export functionality
- `Invoice` - Invoice display component

## 🚀 Getting Started

### 1. Database Setup
```bash
# Run the migration
npx prisma migrate dev --name add_invoice_and_payment_system

# Generate Prisma client
npx prisma generate
```

### 2. API Integration
The system automatically integrates with your existing booking flow:

```typescript
// In your booking confirmation page
useEffect(() => {
  if (bookingId) {
    // Fetch booking details
    fetchBookingDetails()
    
    // Automatically generate invoice
    generateInvoice(bookingId)
  }
}, [bookingId])
```

### 3. Admin Access
Navigate to `/dashboard/billing` to access the billing management interface.

## 📋 Payment Methods Supported

1. **Cash** - Physical cash payment
2. **Card** - Credit/Debit card payment
3. **Online Payment** - Digital payment methods
4. **Bank Transfer** - Direct bank transfer

## 🔄 Payment Status Flow

```
Booking Created → Invoice Generated → Payment Recorded → Status Updated
     ↓                    ↓                    ↓              ↓
  Pending              Pending            Partially Paid   Paid
```

## 📊 Reporting Features

### Payment Analytics
- Total revenue tracking
- Payment method distribution
- Outstanding payments
- Payment history per booking

### Invoice Analytics
- Invoice generation statistics
- Payment status distribution
- Revenue by period
- Tax collection reports

## 🛠️ Customization

### Invoice Template
- Modify `components/ui/invoice.tsx` for design changes
- Update colors, fonts, and layout
- Add custom fields as needed

### Payment Methods
- Add new payment methods in the database
- Update payment form in billing management
- Extend payment validation logic

### Tax Calculations
- Modify tax calculation logic in `lib/tax-calculator.ts`
- Add new tax types
- Update tax display in invoices

## 🔧 Configuration

### Hotel Information
Update hotel details in the invoice service:

```typescript
// In lib/invoice-service.ts
const hotelInfo = {
  name: 'Your Hotel Name',
  address: [
    'Hotel Address Line 1',
    'Hotel Address Line 2',
    'City, State ZIP',
    'Country'
  ]
}
```

### Default Settings
- Default payment method: `pay_at_hotel`
- Default payment status: `pending`
- Default invoice terms: `Payment due upon receipt`
- Default due date: Check-in date

## 🚨 Important Notes

### Payment Status Management
- **No Automatic Status Changes**: Payment status is NOT automatically changed to paid
- **Manual Admin Action Required**: Admins must manually record payments
- **Audit Trail**: All payment recordings are tracked with admin details

### Invoice Generation
- **Automatic on Checkout**: Invoices are generated when booking is confirmed
- **Manual Generation**: Admins can generate invoices for existing bookings
- **Duplicate Prevention**: System prevents duplicate invoices for same booking

### Data Integrity
- **Cascade Deletion**: Deleting a booking deletes related invoices and payments
- **Referential Integrity**: All foreign key relationships are maintained
- **Transaction Safety**: Payment recording uses database transactions

## 🆘 Troubleshooting

### Common Issues

1. **Invoice Generation Fails**
   - Check if booking exists
   - Verify booking has required data
   - Check database connection

2. **Payment Recording Fails**
   - Validate payment amount
   - Check payment method is valid
   - Verify admin permissions

3. **PDF Generation Issues**
   - Check html2canvas and jsPDF dependencies
   - Verify browser compatibility
   - Check for large invoice content

### Support
For technical support or customization requests, refer to the main project documentation or contact the development team.

## 📈 Future Enhancements

### Planned Features
- Email invoice delivery
- Payment gateway integration
- Advanced reporting dashboard
- Multi-currency support
- Invoice templates customization
- Automated payment reminders

### Integration Opportunities
- Accounting software integration
- Payment gateway APIs
- Email marketing platforms
- Customer relationship management
- Financial reporting tools

---

This billing system provides a complete solution for managing invoices and payments in your HMS, ensuring professional financial management while maintaining flexibility for different payment scenarios.
