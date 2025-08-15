# Extra Charges Feature - Bookings Management

## Overview
The Extra Charges feature allows hotel staff to add, manage, and track additional charges for guest bookings beyond the base room rate. This feature integrates seamlessly with the existing billing system and automatically updates the final billing amount.

## Features

### 1. Extra Charges Button
- **Location**: Bookings Management table → Actions column
- **Icon**: Plus (+) icon with blue styling
- **Function**: Opens the Extra Charges modal for the selected booking

### 2. Extra Charges Modal
The modal provides a comprehensive interface for managing extra charges:

#### Add New Charge Form
- **Item Name** (Required): Name of the service/item (e.g., "Room Service", "Laundry", "Mini Bar")
- **Price** (Required): Unit price in Indian Rupees (₹)
- **Units**: Quantity of the item (default: 1)
- **Description** (Optional): Additional details about the charge
- **GST Controls**: 
  - Checkbox to enable/disable GST for the charge
  - Custom GST percentage input (0-100%) when enabled
  - Default GST percentage: 18%
- **Price Preview**: Real-time calculation showing base amount, GST, and total

#### Current Charges List
- Displays all existing extra charges for the booking
- Shows item details: name, description, quantity, unit price, and total amount
- **Detailed Tax Breakdown**: Shows subtotal, tax rate, tax amount, and final amount for each item
- **Tax Information**: Displays GST and Service Tax calculations with clear labeling
- **Summary Section**: Shows overall subtotal, total tax, and grand total for all charges
- Provides delete functionality for each charge
- Real-time updates when charges are added/removed

### 3. Automatic Billing Integration
- Extra charges are automatically added to the booking's total amount
- **Flexible GST Control**: Choose whether GST applies to each charge
- **Custom GST Percentage**: Set specific GST rates (0-100%) for individual charges
- **Comprehensive Tax Calculations**: Includes GST, Service Tax, and other applicable taxes
- **Detailed Tax Display**: Shows tax breakdown for each item and overall summary
- **Tax Rate Transparency**: Displays exact tax percentages applied to each charge
- Real-time updates to the booking display in the main table
- Integration with the existing invoice generation system

## Technical Implementation

### Database Schema
The feature uses the existing `bill_item` table:
```sql
model bill_item {
  id          String  @id @default(cuid())
  bookingId   String
  serviceId   String?
  itemName    String
  description String?
  quantity    Float   @default(1)
  unitPrice   Float
  totalPrice  Float
  discount    Float   @default(0)
  taxRate     Float   @default(0)
  taxAmount   Float   @default(0)
  finalAmount Float
  addedBy     String?
  addedAt     DateTime @default(now())
  booking     booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  service     service? @relation(fields: [serviceId], references: [id])
}
```

### API Endpoints
The feature leverages existing billing API endpoints:
- `POST /api/billing/bill-items` - Add new bill item
- `GET /api/billing/bill-items?bookingId={id}` - Get bill items for booking
- `DELETE /api/billing/bill-items/{id}` - Remove bill item
- `PUT /api/billing/bill-items/{id}` - Update bill item

### Component Structure
- **Main Component**: `components/dashboard/bookings-table.tsx`
- **Modal**: Integrated within the bookings table component
- **State Management**: React hooks for form data and API interactions

## Tax Display Example

### GST Control Form
```
┌─────────────────────────────────┐
│ ☑️ GST Applicable               │
│ GST Percentage: 18%             │
└─────────────────────────────────┘
```

### Price Preview
```
┌─────────────────────────────────┐
│ Base Amount: ₹500               │
│ GST (18%): ₹90                  │
│ ─────────────────────────────── │
│ Total: ₹590                     │
└─────────────────────────────────┘
```

### Individual Item Display
```
Extra Bed
test

Qty: 1
₹500/unit
Total: ₹590

┌─────────────────────────────────┐
│ Subtotal: ₹500                  │
│ Tax Rate: 18.0%                 │
│ Tax Amount: ₹90                 │
│                                 │
│ 📋 GST (18.0%)                  │
└─────────────────────────────────┘
```

### Summary Section
```
┌─────────────────────────────────┐
│ Subtotal: ₹500                  │
│ Total Tax: ₹90 (Custom GST)     │
│ ─────────────────────────────── │
│ Grand Total: ₹590               │
└─────────────────────────────────┘
```

## Usage Instructions

### Adding Extra Charges
1. Navigate to Bookings Management
2. Find the desired booking in the table
3. Click the blue "+" (Extra Charges) button in the Actions column
4. Fill in the required fields in the "Add New Charge" form:
   - Item Name: Enter the service name
   - Price: Enter the unit price
   - Units: Set the quantity (default: 1)
   - Description: Add optional details
   - **GST Controls**: 
     - Check "GST Applicable" if the charge should include GST
     - Set the GST percentage (default: 18%)
5. Review the Price Preview to see the calculated total
6. Click "Add Charge" to save
7. The charge will appear in the "Current Charges" list
8. The booking's total amount will automatically update

### Managing Existing Charges
- **View**: All charges are displayed in the "Current Charges" section
- **Delete**: Click the trash icon next to any charge to remove it
- **Real-time Updates**: Changes are immediately reflected in the booking total

### Integration with Billing
- Extra charges are automatically included in invoice generation
- Tax calculations are applied according to hotel settings
- Charges appear as separate line items in invoices
- Total amounts are recalculated automatically

### Tax Display Features
- **Individual Item Breakdown**: Each charge shows subtotal, tax rate, and tax amount
- **Tax Rate Display**: Shows the exact percentage of taxes applied (e.g., "18.0%")
- **Custom GST Labeling**: Clearly indicates custom GST rates vs. hotel default taxes
- **Summary Totals**: Overall subtotal, total tax, and grand total for all charges
- **Visual Separation**: Tax information is displayed in a clean, organized format
- **Price Preview**: Real-time calculation before adding charges

## Benefits

1. **Flexible Pricing**: Add any type of charge beyond room rates
2. **Real-time Updates**: Immediate reflection of changes in booking totals
3. **Tax Compliance**: Automatic tax calculations for all charges
4. **Audit Trail**: Complete tracking of who added charges and when
5. **Invoice Integration**: Seamless inclusion in guest invoices
6. **User-Friendly**: Intuitive interface for hotel staff

## Future Enhancements

Potential improvements for the Extra Charges feature:
- Bulk charge addition
- Charge templates for common services
- Charge approval workflows
- Integration with POS systems
- Charge categorization and reporting
- Guest notification system for added charges

## Support

For technical support or feature requests related to the Extra Charges functionality, please refer to the main HMS documentation or contact the development team.
