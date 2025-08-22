# Inventory Management System

## Overview

The Hotel Management System now includes a comprehensive Inventory Management System that allows hotel staff to efficiently manage hotel supplies, track stock levels, monitor transactions, and receive alerts for low stock or expiring items.

## Features

### 1. Inventory Categories Management
- Create and manage inventory categories (e.g., Food & Beverage, Cleaning Supplies, Amenities)
- Categorize items for better organization
- Enable/disable categories as needed

### 2. Inventory Items Management
- Add new inventory items with detailed information
- Track SKU (Stock Keeping Unit) and barcode for each item
- Set minimum and maximum stock levels
- Monitor current stock levels
- Track cost and selling prices
- Store supplier information and contact details
- Set storage locations
- Track expiry dates for perishable items

### 3. Stock Transactions
- Record various types of transactions:
  - **Purchase**: Adding new stock
  - **Sale**: Selling items to guests or other departments
  - **Return**: Returning items to inventory
  - **Damage**: Recording damaged items
  - **Adjustment**: Manual stock adjustments
  - **Transfer**: Moving items between locations
  - **Expiry**: Removing expired items
- Automatic stock level updates
- Transaction history tracking
- Reference numbers for invoices/POs

### 4. Automated Alerts System
- **Low Stock Alerts**: Notify when items reach minimum stock levels
- **Out of Stock Alerts**: Immediate notification when items are completely out of stock
- **Expiry Warnings**: Alert for items approaching expiry dates
- **Overstock Alerts**: Warn when items exceed maximum stock levels
- Alert management (mark as read, resolve)

### 5. Dashboard Analytics
- Total inventory value calculation
- Stock status overview
- Low stock item counts
- Out of stock item tracking
- Real-time inventory statistics

## Database Schema

### Core Tables

#### `inventory_category`
```sql
- id: String (Primary Key)
- name: String (Unique)
- description: Text (Optional)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
- createdBy: String (User ID)
```

#### `inventory_item`
```sql
- id: String (Primary Key)
- name: String
- description: Text (Optional)
- categoryId: String (Foreign Key)
- sku: String (Unique, Optional)
- barcode: String (Unique, Optional)
- unit: String
- currentStock: Float
- minimumStock: Float
- maximumStock: Float (Optional)
- costPrice: Float
- sellingPrice: Float (Optional)
- supplier: String (Optional)
- supplierContact: String (Optional)
- location: String (Optional)
- expiryDate: DateTime (Optional)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
- createdBy: String (User ID)
```

#### `inventory_transaction`
```sql
- id: String (Primary Key)
- itemId: String (Foreign Key)
- transactionType: Enum (purchase, sale, return, damage, adjustment, transfer, expiry)
- quantity: Float
- unitPrice: Float
- totalAmount: Float
- previousStock: Float
- newStock: Float
- referenceNumber: String (Optional)
- supplier: String (Optional)
- notes: Text (Optional)
- transactionDate: DateTime
- processedBy: String (User ID)
- createdAt: DateTime
- updatedAt: DateTime
```

#### `inventory_alert`
```sql
- id: String (Primary Key)
- itemId: String (Foreign Key)
- alertType: Enum (low_stock, out_of_stock, expiry_warning, overstock)
- message: Text
- isRead: Boolean
- isResolved: Boolean
- resolvedBy: String (User ID, Optional)
- resolvedAt: DateTime (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

## API Endpoints

### Inventory Categories
- `GET /api/inventory/categories` - Get all categories
- `POST /api/inventory/categories` - Create new category
- `PUT /api/inventory/categories` - Update category
- `DELETE /api/inventory/categories?id={id}` - Delete/deactivate category

### Inventory Items
- `GET /api/inventory/items` - Get all items with filters
- `POST /api/inventory/items` - Create new item
- `PUT /api/inventory/items` - Update item
- `DELETE /api/inventory/items?id={id}` - Delete/deactivate item

### Inventory Transactions
- `GET /api/inventory/transactions` - Get transaction history
- `POST /api/inventory/transactions` - Create new transaction

### Inventory Alerts
- `GET /api/inventory/alerts` - Get all alerts
- `PUT /api/inventory/alerts` - Update alert status
- `DELETE /api/inventory/alerts?id={id}` - Delete alert

## Usage Examples

### Adding a New Inventory Item

1. Navigate to Inventory Management in the dashboard
2. Click "Add Item" button
3. Fill in the required information:
   - Name: "Coffee Beans"
   - Category: "Food & Beverage"
   - Unit: "kg"
   - Current Stock: 50
   - Minimum Stock: 10
   - Cost Price: 500
   - Supplier: "Local Coffee Supplier"
   - Location: "Kitchen Storage"

### Recording a Purchase Transaction

1. Go to the Transactions tab
2. Click "Add Transaction"
3. Select the item and transaction type "Purchase"
4. Enter quantity and unit price
5. Add reference number (invoice number)
6. Save the transaction

### Managing Stock Alerts

1. View alerts in the Alerts tab
2. Mark alerts as read or resolved
3. Take action based on alert type:
   - Low stock: Place order with supplier
   - Out of stock: Emergency purchase
   - Expiry warning: Use items before expiry

## Business Logic

### Stock Level Calculations
- **Purchase/Return**: `newStock = previousStock + quantity`
- **Sale/Damage/Expiry**: `newStock = previousStock - quantity`
- **Adjustment**: `newStock = quantity` (direct setting)
- **Transfer**: `newStock = quantity` (location change)

### Alert Triggers
- **Low Stock**: When `currentStock <= minimumStock` and `currentStock > 0`
- **Out of Stock**: When `currentStock === 0`
- **Overstock**: When `currentStock > maximumStock * 0.9`
- **Expiry Warning**: When `expiryDate <= 30 days from now`

### Validation Rules
- SKU and barcode must be unique across all items
- Stock levels cannot be negative
- Maximum stock must be greater than minimum stock
- Cost price must be non-negative
- Transaction quantities must be positive

## Security & Permissions

### Role-Based Access
- **OWNER/ADMIN**: Full access to all inventory functions
- **RECEPTION**: Limited access to view inventory and create basic transactions
- All users can view their own transactions

### Data Validation
- Input validation using Zod schemas
- SQL injection prevention through Prisma ORM
- XSS protection through proper data sanitization

## Integration Points

### With Existing Systems
- **Expense Management**: Inventory purchases automatically create expense records
- **Notification System**: Stock alerts trigger notifications
- **User Management**: Transaction tracking with user accountability
- **Bank Account System**: Financial transactions linked to inventory purchases

### Financial Integration
- Inventory purchases deduct from appropriate bank accounts
- Cost tracking for profit margin calculations
- Automated expense categorization

## Best Practices

### Inventory Management
1. **Regular Stock Takes**: Conduct periodic physical inventory counts
2. **ABC Analysis**: Categorize items by value and usage frequency
3. **Just-in-Time**: Maintain optimal stock levels to minimize holding costs
4. **Supplier Management**: Maintain good relationships with reliable suppliers

### Data Management
1. **Regular Backups**: Ensure inventory data is regularly backed up
2. **Audit Trails**: All transactions are logged with user accountability
3. **Data Integrity**: Use database constraints to maintain data consistency

### User Training
1. **Standard Operating Procedures**: Document processes for common tasks
2. **User Permissions**: Assign appropriate access levels
3. **Regular Reviews**: Monitor system usage and user compliance

## Troubleshooting

### Common Issues

1. **Stock Discrepancies**
   - Check transaction history for errors
   - Verify physical count against system
   - Review recent adjustments

2. **Alert Spam**
   - Adjust minimum stock levels
   - Review alert thresholds
   - Mark resolved alerts appropriately

3. **Performance Issues**
   - Optimize database queries
   - Implement pagination for large datasets
   - Use appropriate indexes

### Support
For technical support or feature requests, please contact the development team or create an issue in the project repository.

## Future Enhancements

### Planned Features
1. **Barcode Scanning**: Mobile app integration for barcode scanning
2. **Automated Reordering**: Set up automatic purchase orders
3. **Supplier Portal**: Direct integration with supplier systems
4. **Advanced Analytics**: Predictive analytics for demand forecasting
5. **Multi-location Support**: Manage inventory across multiple hotel locations
6. **Recipe Management**: Link inventory to food service recipes
7. **Waste Tracking**: Monitor and reduce inventory waste

### Integration Opportunities
1. **POS Systems**: Real-time integration with point-of-sale systems
2. **Accounting Software**: Direct export to accounting systems
3. **Supplier APIs**: Automated ordering and price updates
4. **Mobile Apps**: Inventory management on mobile devices

## Conclusion

The Inventory Management System provides a robust foundation for efficient hotel supply management. With its comprehensive features, automated alerts, and integration capabilities, it helps hotels maintain optimal stock levels, reduce waste, and improve operational efficiency.

The system is designed to be scalable, user-friendly, and adaptable to different hotel sizes and requirements. Regular updates and enhancements ensure it remains current with industry best practices and technological advancements.
