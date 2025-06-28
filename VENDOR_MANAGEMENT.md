# Vendor Management System Documentation

## Overview

A comprehensive CRUD system for managing vendors and their facility contracts with services in the LEMS application.

## Features

### Vendor Management (`/vendors`)

- **Create Vendors**: Add new vendors with code, name, and status
- **View Vendors**: Display all vendors in a searchable, filterable table
- **Edit Vendors**: Update vendor information using the upsert API
- **Delete Vendors**: Remove vendors from the system
- **Status Management**: Activate/deactivate vendors
- **Search & Filter**: Filter by name, code, and status

### Contract Management (`/contracts` or `/vendors/{vendorCode}/contracts`)

- **Create Contracts**: Link vendors to facilities with specific lot numbers
- **View Contracts**: Display contract relationships with service counts
- **Manage Services**: Add/remove services from contracts
- **Filter Contracts**: Filter by vendor, facility, lot, and status
- **Service Assignment**: Bulk update contract services

## API Endpoints

### Vendors

- **GET** `/api/v1/vendors` - Fetch all vendors
- **POST** `/api/v1/vendors/upsert` - Create/update vendor
- **DELETE** `/api/v1/vendors/{id}` - Delete vendor

### Contracts

- **GET** `/api/v1/vendor/facility/contracts` - Fetch contracts
- **POST** `/api/v1/vendor/facility/contract` - Create contract
- **POST** `/api/v1/upsert/contract` - Update contract services

## Data Structures

### Vendor

```typescript
interface Vendor {
  id: string;
  name: string;
  code: string;
  is_active: string; // "1" or "0"
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

### Contract

```typescript
interface Contract {
  id: string;
  vendor_code: string;
  vendor_name: string;
  facility_code: string;
  facility_name: string;
  lot_number: string;
  lot_name: string;
  is_active: string;
  services: ContractService[];
}
```

### Contract Service

```typescript
interface ContractService {
  service_id: string;
  service_code: string;
  service_name: string;
  is_active: string;
}
```

## Pages

### `/vendors`

- Main vendor management page
- CRUD operations for vendors
- Navigation to vendor-specific contracts

### `/contracts`

- Global contract management
- Filter by any vendor/facility combination

### `/vendors/{vendorCode}/contracts`

- Vendor-specific contract management
- Pre-filtered by vendor code

## Components

### `VendorManagement.tsx`

- Main vendor CRUD interface
- Search and filtering
- Action dropdown with view/edit/delete/contracts options
- Modal forms for create/edit/view operations
- Delete confirmation

### `ContractManagement.tsx`

- Contract and service management
- Multi-level filtering (vendor, facility, lot, status)
- Service assignment interface
- Contract creation and service updates

## Hooks

### Vendor Hooks

- `useVendors()` - Fetch vendors
- `useCreateVendor()` - Create vendor mutation
- `useUpdateVendor()` - Update vendor mutation
- `useDeleteVendor()` - Delete vendor mutation

### Contract Hooks

- `useContracts(filters)` - Fetch contracts with filters
- `useCreateContract()` - Create contract mutation
- `useUpdateContractServices()` - Update contract services mutation

## Features

### Modern UI/UX

- Gradient backgrounds and modern card designs
- Responsive table layouts
- Search and filter functionality
- Action dropdowns with icons
- Modal forms for operations
- Loading states and error handling
- Status badges and indicators

### Error Handling

- Toast notifications for success/error states
- Loading indicators during operations
- Error boundaries and retry mechanisms

### Navigation

- Seamless navigation between vendors and contracts
- Breadcrumb navigation for vendor-specific views
- Back buttons and consistent routing

## Usage

1. **Adding a Vendor**:

   - Navigate to `/vendors`
   - Click "Add Vendor"
   - Fill in name, code, and status
   - Submit form

2. **Managing Contracts**:

   - From vendor list, click actions → "Contracts"
   - Or navigate to `/contracts` for global view
   - Create new contracts by selecting vendor, facility, and lot
   - Manage services by editing contract service codes

3. **Service Assignment**:
   - In contract management, click "Manage Services"
   - Enter service codes (one per line)
   - Update to replace all services for that contract

## Security & Validation

- Required field validation
- Unique code constraints (handled by API)
- Status toggle restrictions
- Confirmation dialogs for destructive actions

## Performance

- React Query caching for efficient data fetching
- Optimistic updates for better UX
- Pagination ready (can be added when needed)
- Efficient filtering and search

This system provides a complete vendor and contract management solution with modern UI/UX and comprehensive CRUD operations.
