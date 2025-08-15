# 🏨 Complete Billing, Invoice & Revenue Management System

A comprehensive, professional-grade billing and revenue management system for hotel management systems featuring automatic calculations, GST compliance, multiple payment methods, split payments, real-time analytics, and guest access.

## 🚀 Key Features

### 💰 Advanced Billing Process
- **Automatic Charge Calculation**: Room rates, nights stayed, applicable taxes
- **Add-on Services**: Meals, spa, transport, minibar, laundry, conference facilities
- **Manual Charge Management**: Add/remove charges from backend dashboard
- **Real-time Calculations**: Instant bill updates with tax breakdowns
- **Tax Compliance**: GST-compliant calculations with configurable tax rates

### 💳 Multi-Payment Support
- **Payment Methods**: Cash, Card, UPI, Bank Transfer, Online Gateway, Cheque, Wallet
- **Split Payments**: Configure multiple payment methods for single booking
- **Gateway Integration**: Support for payment gateway responses and transaction IDs
- **Payment Tracking**: Complete payment history with references and receipts
- **Real-time Status**: Automatic payment status updates (pending, partially paid, paid, overdue)

### 📄 GST-Compliant Invoice Generation
- **Professional Invoices**: Auto-generate GST-compliant PDF invoices
- **Hotel Branding**: Include hotel logo, details, and custom branding
- **QR Code Integration**: Verification QR codes for invoice authenticity
- **Itemized Billing**: Detailed breakdown of all charges and taxes
- **HSN Codes**: Automatic HSN code assignment for different services
- **Tax Breakdown**: CGST, SGST, IGST calculations as per GST regulations

### 📧 Automated Communication
- **Email Delivery**: Automatic invoice delivery via email
- **WhatsApp Integration**: Send invoices via WhatsApp Business API
- **Guest Access**: Secure guest billing view with access tokens
- **Real-time Updates**: Live bill updates for guests

### 📊 Comprehensive Revenue Analytics
- **Multi-level Reports**: Daily, monthly, yearly revenue reports
- **Category Breakdown**: Revenue by accommodation, F&B, spa, transport, etc.
- **Payment Analysis**: Reports by payment method and outstanding balances
- **Booking Source Tracking**: Revenue breakdown by booking source (direct, OTA, corporate, walk-in)
- **Trend Analysis**: Growth metrics and comparative analytics
- **Export Options**: Downloadable reports in PDF/Excel/CSV formats

### 🔐 Security & Access Control
- **Admin Authentication**: Secure access for billing operations
- **Guest Access Tokens**: Time-limited access for guest billing views
- **Audit Trail**: Complete tracking of all billing changes
- **Data Integrity**: Transaction-safe operations

## 🏗️ System Architecture

### Database Schema Enhancement
The system extends your existing HMS with comprehensive billing models:

```sql
-- Enhanced booking model with payment tracking
model booking {
  // ... existing fields ...
  paymentStatus    payment_status  @default(pending)
  source           booking_source  @default(website)
  billItems        bill_item[]
  splitPayments    split_payment[]
  guestBillingView guest_billing_view?
}

-- Service catalog for add-on billing
model service {
  id          String           @id @default(cuid())
  name        String
  category    service_category
  price       Float
  taxable     Boolean         @default(true)
  isActive    Boolean         @default(true)
}

-- Individual bill items
model bill_item {
  id          String @id @default(cuid())
  bookingId   String
  serviceId   String?
  itemName    String
  quantity    Float  @default(1)
  unitPrice   Float
  totalPrice  Float
  discount    Float  @default(0)
  taxAmount   Float  @default(0)
  finalAmount Float
  addedBy     String?
  addedAt     DateTime @default(now())
}

-- Enhanced invoice with GST compliance
model invoice {
  // ... existing fields ...
  qrCode       String?  @db.Text
  emailSent    Boolean  @default(false)
  whatsappSent Boolean  @default(false)
  invoiceItems invoice_item[]
}

-- Split payment support
model split_payment {
  id            String         @id @default(cuid())
  bookingId     String
  amount        Float
  paymentMethod payment_method
  description   String?
  status        String         @default("pending")
}

-- Revenue tracking and analytics
model revenue_report {
  id                   String   @id @default(cuid())
  date                 DateTime
  period_type          String   // daily, monthly, yearly
  accommodation_revenue Float   @default(0)
  food_beverage_revenue Float   @default(0)
  spa_revenue          Float    @default(0)
  total_revenue        Float    @default(0)
  // ... more revenue categories
}
```

## 📱 User Interface Components

### Enhanced Billing Management Dashboard
- **Booking Selection**: Side panel with booking list and status indicators
- **Bill Management**: Add/remove items with real-time calculations
- **Payment Processing**: Record payments with multiple methods
- **Split Payment Setup**: Configure complex payment arrangements
- **Invoice Generation**: One-click GST invoice creation
- **Guest Access**: Generate secure guest billing URLs

### Revenue Analytics Dashboard
- **Key Metrics**: Total revenue, bookings, occupancy, average revenue
- **Interactive Charts**: Revenue by category, payment methods, booking sources
- **Trend Analysis**: Growth comparisons with previous periods
- **Export Tools**: Download detailed reports in multiple formats

### Guest Billing View
- **Secure Access**: Token-based guest access without login
- **Real-time Updates**: Live bill status and payment tracking
- **Mobile Responsive**: Optimized for guest mobile devices
- **Print/Save Options**: Easy bill download and printing

## 🔧 API Endpoints

### Billing Operations
```typescript
// Bill item management
POST   /api/billing/bill-items        // Add new bill item
GET    /api/billing/bill-items        // Get bill items for booking
PUT    /api/billing/bill-items/[id]   // Update bill item
DELETE /api/billing/bill-items/[id]   // Remove bill item

// Payment processing
POST   /api/payments                  // Record payment
GET    /api/payments                  // Get payment summary
POST   /api/billing/split-payments    // Setup split payments

// Bill calculations
GET    /api/billing/calculation       // Get bill breakdown
POST   /api/billing/calculation       // Recalculate totals
```

### Invoice Management
```typescript
// Enhanced invoices with GST
POST   /api/enhanced-invoices         // Generate GST invoice
GET    /api/enhanced-invoices         // List invoices with filters
GET    /api/enhanced-invoices/[id]    // Get specific invoice
PUT    /api/enhanced-invoices/[id]    // Update invoice status

// Invoice delivery
POST   /api/enhanced-invoices/[id]/send-email     // Email invoice
POST   /api/enhanced-invoices/[id]/send-whatsapp  // WhatsApp invoice
```

### Revenue Analytics
```typescript
// Revenue reports
GET    /api/revenue/reports           // Generate revenue reports
GET    /api/revenue/trends            // Get revenue trends
GET    /api/revenue/export            // Export revenue data

// Guest access
POST   /api/guest-billing/create-access  // Create guest access token
GET    /api/guest-billing/[token]         // Get guest billing info
```

## ⚙️ Setup & Installation

### 1. Database Migration
```bash
# Run the enhanced billing migration
npx prisma migrate dev --name add_enhanced_billing_system

# Generate Prisma client
npx prisma generate
```

### 2. Seed Sample Data
```bash
# Setup sample services and configuration
node scripts/setup-billing-system.js
```

### 3. Environment Configuration
```env
# Add to your .env file
NEXTAUTH_URL=http://localhost:3000

# Optional: Email service configuration
EMAIL_SERVICE_API_KEY=your_email_api_key
EMAIL_FROM=noreply@yourdomain.com

# Optional: WhatsApp Business API
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_API_TOKEN=your_whatsapp_token
```

### 4. Hotel Information Setup
Configure your hotel information with GST details:
```typescript
// Update hotel info with GST settings
{
  gstNumber: "GSTIN123456789",
  gstPercentage: 18,
  serviceTaxPercentage: 0,
  taxEnabled: true,
  otherTaxes: [
    { name: "City Tax", percentage: 2 },
    { name: "Tourism Tax", percentage: 1 }
  ]
}
```

## 🎯 Usage Workflows

### 1. Complete Billing Process
```typescript
// 1. Guest checks in - booking created
const booking = await createBooking(bookingData);

// 2. Add services during stay
await BillingService.addBillItem(booking.id, {
  serviceId: "spa-massage",
  itemName: "Full Body Massage",
  quantity: 1,
  unitPrice: 2500,
  discount: 250 // 10% discount
});

// 3. Calculate final bill
const billCalculation = await BillingService.calculateBill(booking.id);

// 4. Generate GST invoice
const invoice = await EnhancedInvoiceService.generateGSTInvoice({
  bookingId: booking.id,
  includeQRCode: true,
  sendEmail: true,
  sendWhatsApp: true
});

// 5. Process payment (single or split)
await BillingService.processPayment(
  booking.id,
  billCalculation.totalAmount,
  'card',
  'TXN123456',
  'Front Desk Staff'
);
```

### 2. Split Payment Processing
```typescript
// Setup split payments
await BillingService.setupSplitPayments(booking.id, [
  { amount: 15000, paymentMethod: 'cash', description: 'Partial cash payment' },
  { amount: 10000, paymentMethod: 'card', description: 'Card payment' },
  { amount: 5000, paymentMethod: 'upi', description: 'UPI payment' }
]);
```

### 3. Guest Access Creation
```typescript
// Create secure guest access
const accessToken = await EnhancedInvoiceService.createGuestBillingAccess(booking.id);
const guestUrl = `https://yourdomain.com/guest-billing/${accessToken}`;

// Send URL to guest via email/SMS
```

## 📊 Revenue Analytics Usage

### Generate Reports
```typescript
// Get monthly revenue report
const monthlyReport = await RevenueService.getMonthlyRevenue();

// Custom date range report
const customReport = await RevenueService.generateRevenueReport(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);

// Export revenue data
const exportData = await RevenueService.exportRevenueData(
  startDate,
  endDate,
  'csv'
);
```

### Analytics Breakdown
- **Revenue by Category**: Track accommodation vs. service revenue
- **Payment Method Analysis**: Understand guest payment preferences
- **Booking Source Performance**: Measure channel effectiveness
- **Occupancy & Revenue Correlation**: Optimize pricing strategies
- **Outstanding Payment Tracking**: Manage receivables effectively

## 🔐 Security Features

### Data Protection
- **Encrypted Access Tokens**: Secure guest billing access
- **Role-based Access**: Admin-only billing operations
- **Audit Logging**: Complete transaction tracking
- **Payment Security**: Safe payment data handling

### Compliance
- **GST Compliance**: Full GST calculation and reporting
- **Invoice Standards**: Professional invoice formats
- **Tax Documentation**: Proper tax breakdown and reporting
- **Data Retention**: Configurable data retention policies

## 🚀 Performance Optimizations

### Database Optimizations
- **Indexed Queries**: Optimized database queries for revenue reports
- **Calculated Fields**: Pre-calculated totals for faster access
- **Batch Operations**: Efficient bulk data processing

### Caching Strategy
- **Report Caching**: Cache frequently accessed reports
- **Service Catalog**: Cache service pricing and details
- **Tax Calculations**: Cache tax rates for faster billing

## 🛠️ Customization Options

### Service Categories
Extend service categories based on your hotel offerings:
```typescript
enum service_category {
  accommodation
  food_beverage
  spa
  transport
  laundry
  minibar
  conference
  gym
  pool
  golf
  casino
  entertainment
  other
}
```

### Payment Methods
Add custom payment methods:
```typescript
enum payment_method {
  cash
  card
  upi
  bank_transfer
  online_gateway
  cheque
  wallet
  cryptocurrency
  corporate_account
  voucher
}
```

### Tax Configuration
Configure complex tax structures:
```typescript
// Multi-tier tax system
{
  gstPercentage: 18,
  serviceTaxPercentage: 0,
  otherTaxes: [
    { name: "City Tax", percentage: 2, description: "Municipal tax" },
    { name: "Tourism Fee", percentage: 1, description: "State tourism tax" },
    { name: "Green Tax", percentage: 0.5, description: "Environmental tax" }
  ]
}
```

## 📈 Advanced Features

### Automated Processes
- **Overdue Payment Detection**: Automatic overdue status updates
- **Revenue Report Generation**: Scheduled daily/monthly reports
- **Email Notifications**: Automated payment reminders
- **Inventory Integration**: Service availability checking

### Integration Capabilities
- **Accounting Software**: Export to popular accounting systems
- **Payment Gateways**: Multiple gateway support
- **PMS Integration**: Seamless property management integration
- **Channel Manager**: OTA booking source tracking

### Mobile Optimization
- **Responsive Design**: Mobile-first approach
- **Guest App Integration**: In-app billing views
- **Staff Mobile Access**: Mobile billing management
- **Offline Capabilities**: Basic offline billing support

## 🔄 Maintenance & Updates

### Regular Maintenance
- **Database Cleanup**: Archive old billing data
- **Performance Monitoring**: Track system performance
- **Security Updates**: Regular security patches
- **Report Optimization**: Optimize slow-running reports

### Backup Strategy
- **Daily Backups**: Automated daily database backups
- **Transaction Logs**: Detailed transaction logging
- **Disaster Recovery**: Comprehensive recovery procedures

## 💡 Best Practices

### Billing Operations
1. **Always verify** bill calculations before invoice generation
2. **Document** all manual charges with proper descriptions
3. **Reconcile** payments daily with actual collections
4. **Archive** old billing data to maintain performance
5. **Monitor** overdue payments and follow up promptly

### Revenue Management
1. **Analyze** revenue trends weekly for pricing decisions
2. **Track** booking source performance for marketing optimization
3. **Monitor** occupancy vs. revenue ratios
4. **Review** service category performance monthly
5. **Export** financial data for accounting integration

### Security Practices
1. **Rotate** guest access tokens regularly
2. **Audit** billing operations monthly
3. **Backup** billing data before major updates
4. **Monitor** for unusual payment patterns
5. **Train** staff on secure billing procedures

## 🆘 Troubleshooting

### Common Issues

**Bill calculations not updating**
- Check tax configuration in hotel settings
- Verify service pricing and taxable status
- Ensure database connections are stable

**Invoice generation fails**
- Verify booking has required data
- Check PDF generation dependencies
- Ensure sufficient disk space for file creation

**Payment processing errors**
- Validate payment amount and method
- Check booking payment status
- Verify admin permissions

**Guest access not working**
- Check token expiration dates
- Verify booking ID association
- Ensure access token is active

### Support Contacts
For technical support or customization requests:
- **Documentation**: Check this README and inline code comments
- **Issues**: Create issues in the project repository
- **Custom Development**: Contact the development team

---

## 🎉 Conclusion

This comprehensive billing and revenue management system transforms your HMS into a professional-grade hospitality solution with:

- ✅ **Complete Billing Automation** with tax compliance
- ✅ **Multi-Payment Processing** with split payment support
- ✅ **Professional Invoice Generation** with GST compliance
- ✅ **Real-time Revenue Analytics** with export capabilities
- ✅ **Guest Self-Service** with secure billing access
- ✅ **Automated Communications** via email and WhatsApp
- ✅ **Comprehensive Dashboard** with intuitive management

The system is designed to scale with your business needs while maintaining simplicity for daily operations. All features are production-ready and follow hospitality industry best practices for billing and revenue management.

---

*Built with ❤️ for the hospitality industry*
