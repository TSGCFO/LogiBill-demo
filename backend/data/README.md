# Data Directory

## Required File

Place your Excel file here with the name:
```
vasanti_order_nov_23-nov_29.xlsx
```

This file should contain your Vasanti order data with columns including:
- Transaction ID
- Reference Number
- Billing Type
- Status
- Line Items
- Total Item Qty
- Packages
- Customer
- And all other 49+ WMS fields

## Generated Files

The following files will be automatically generated:
- `vasanti_orders.json` - Cached orders from Excel
- `rules.json` - Your billing rules
