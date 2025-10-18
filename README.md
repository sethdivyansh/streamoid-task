# Streamoid Backend

A Node.js/Express REST API with PostgreSQL for product management, featuring CSV bulk upload capabilities and advanced search functionality.

## ✨ Features

- 🛍️ Complete CRUD operations for products
- 📁 Bulk product upload via CSV files
- � Advanced search and filtering
- 📄 Pagination support
- �🐳 Docker-ready deployment
- ✅ CSV validation with detailed error reporting
- 🔄 Automatic SKU-based upsert (insert or update)

## 🐳 Docker Setup (Recommended)

The easiest way to run this application is using Docker:

### Quick Start with Docker

```bash
# Option 1: Use the setup script (easiest)
chmod +x docker-setup.sh
./docker-setup.sh

# Option 2: Manual Docker Compose
docker-compose up --build
```

The application will be available at http://localhost:8000

## 🛠️ Local Development (Without Docker)

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run database migrations:**

   ```bash
   npm run migrate
   ```

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## 📋 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations
- `npm run rollback` - Rollback last migration
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View Docker logs

## 🏗️ Project Structure

```
streamoid/
├── server.js              # Express application entry point
├── knexfile.js            # Database configuration
├── package.json           # Dependencies and scripts
├── Dockerfile             # Docker container definition
├── docker-compose.yml     # Multi-container orchestration
├── db/
│   └── knex.js           # Knex instance
├── migrations/            # Database migrations
│   └── 20251018140254_create_products_table.js
├── routes/
│   └── products.js       # Product API routes
├── lib/
│   └── csvValidator.js   # CSV validation utilities
└── uploads/              # File upload directory
```

## 🔌 API Endpoints

### Products

#### GET `/products`

List all products with pagination support.

**Query Parameters:**

- `page` (optional): Page number (default: 0)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**

```json
{
  "data": [...],
  "page": 0,
  "limit": 20,
  "total": 150
}
```

#### GET `/products/search`

Search and filter products.

**Query Parameters:**

- `brand` (optional): Filter by brand name
- `color` (optional): Filter by color
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Example:**

```bash
GET /products/search?brand=Nike&minPrice=1000&maxPrice=5000
```

#### POST `/upload`

Bulk upload products from a CSV file.

**Request:**

- Content-Type: `multipart/form-data`
- Field: `file` (CSV file)

**CSV Format:**

```csv
sku,name,brand,color,size,mrp,price,quantity
SKU001,Product Name,Brand Name,Red,M,2000,1500,100
```

**Required Fields:** sku, name, brand, mrp, price  
**Optional Fields:** color, size, quantity

**Response:**

```json
{
  "stored": 45,
  "failed": 5
}
```

**Features:**

- Automatic validation of CSV data
- Upsert functionality (updates existing SKUs)
- Transaction-based processing
- Detailed error reporting for failed rows

## 🗄️ Database

This project uses PostgreSQL with Knex.js as the query builder and migration tool.

### Database Schema

**Products Table:**
| Column | Type | Description |
|------------|--------------|--------------------------------|
| sku | VARCHAR(255) | Primary key, unique identifier |
| name | VARCHAR(255) | Product name |
| brand | VARCHAR(255) | Brand name |
| color | VARCHAR(100) | Product color (optional) |
| size | VARCHAR(50) | Product size (optional) |
| mrp | INTEGER | Maximum Retail Price |
| price | INTEGER | Selling price |
| quantity | INTEGER | Stock quantity (default: 0) |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### Migrations

```bash
# Create a new migration
npx knex migrate:make migration_name

# Run pending migrations
npm run migrate

# Rollback last migration
npm run rollback
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable     | Description              | Default | Required |
| ------------ | ------------------------ | ------- | -------- |
| `PORT`       | Server port              | 8000    | No       |
| `PGHOST`     | PostgreSQL host          | -       | Yes      |
| `PGUSER`     | PostgreSQL user          | -       | Yes      |
| `PGPASSWORD` | PostgreSQL password      | -       | Yes      |
| `PGDATABASE` | PostgreSQL database name | -       | Yes      |
| `PGPORT`     | PostgreSQL port          | 5432    | No       |

**Example `.env` file:**

```env
PORT=8000
PGHOST=your-db-host.com
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=streamoid_db
PGPORT=5432
```

## � Usage Examples

### Upload CSV File

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@products.csv"
```

### Get All Products (with pagination)

```bash
curl http://localhost:8000/products?page=0&limit=20
```

### Search Products

```bash
# Search by brand
curl http://localhost:8000/products/search?brand=Nike

# Search by multiple filters
curl "http://localhost:8000/products/search?brand=Adidas&color=Blue&minPrice=1000&maxPrice=3000"
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify credentials in `.env` file
- Check database exists and is accessible
- For cloud databases (e.g., Aiven), ensure IP is whitelisted

### Port Already in Use

- Change `PORT` in `.env` file
- Or stop the conflicting service: `lsof -ti:8000 | xargs kill -9`

### Migration Errors

- Check database connection
- Verify migration files are valid
- Try rolling back and re-running
- Ensure database user has CREATE TABLE privileges

### CSV Upload Issues

- Verify CSV has required headers: `sku`, `name`, `brand`, `mrp`, `price`
- Check file encoding is UTF-8
- Ensure numeric fields (mrp, price, quantity) contain valid integers
- Review response for specific validation errors

## Testing

You can use the included `products.csv` file to test the bulk upload functionality:

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@products.csv"
```

## Deployment

This application is designed to work with cloud PostgreSQL providers like:

- Aiven
- AWS RDS
- Heroku Postgres
- DigitalOcean Managed Databases

Simply update the `.env` file with your database credentials.

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Query Builder:** Knex.js
- **File Upload:** Multer
- **CSV Parsing:** csv-parser
- **Container:** Docker

## License

ISC

## 👤 Author

Divyansh Seth

---

**Note:** This project was developed as part of the Streamoid backend assessment task.
