# Pagination Documentation

This API now supports pagination for both the products listing and search endpoints.

## Endpoints with Pagination

### 1. GET /products
Lists all products with pagination support.

**Query Parameters:**
- `page` (optional): Page number, starting from 1 (default: 1)
- `limit` (optional): Number of items per page, max 100 (default: 20)

**Example Request:**
```bash
GET /products?page=2&limit=10
```

### 2. GET /products/search
Search products with filtering and pagination support.

**Query Parameters:**
- `page` (optional): Page number, starting from 1 (default: 1)
- `limit` (optional): Number of items per page, max 100 (default: 20)
- `brand` (optional): Filter by brand
- `color` (optional): Filter by color
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Example Request:**
```bash
GET /products/search?brand=Nike&page=1&limit=15
```

## Response Format

Both endpoints return a consistent pagination response format:

```json
{
  "data": [
    {
      "id": 1,
      "sku": "SKU001",
      "name": "Product Name",
      "brand": "Brand Name",
      "color": "Red",
      "size": "M",
      "mrp": 1000,
      "price": 800,
      "quantity": 50
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Pagination Metadata

- `page`: Current page number
- `limit`: Items per page
- `total`: Total number of items available
- `totalPages`: Total number of pages
- `hasNext`: Boolean indicating if there's a next page
- `hasPrev`: Boolean indicating if there's a previous page

## Constraints

- Maximum items per page: 100
- Minimum items per page: 1
- Page numbers start from 1
- Invalid page numbers are automatically corrected to valid ranges