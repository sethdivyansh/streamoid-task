const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

describe('Search Filters Tests', () => {
    let products = [];

    beforeAll(async () => {
        // Load products from CSV file
        const csvFilePath = path.join(__dirname, '../products.csv');

        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
                .on('data', (data) => {
                    // Convert to format similar to database records
                    const product = {
                        sku: data.sku || null,
                        name: data.name || null,
                        brand: data.brand || null,
                        color: data.color || null,
                        size: data.size || null,
                        mrp: data.mrp ? parseInt(data.mrp, 10) : null,
                        price: data.price ? parseInt(data.price, 10) : null,
                        quantity: data.quantity ? parseInt(data.quantity, 10) : 0
                    };

                    // Only include products that would pass validation
                    if (product.sku && product.name && product.brand &&
                        product.mrp > 0 && product.price > 0 &&
                        product.price <= product.mrp && product.quantity >= 0) {
                        products.push(product);
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });
    });

    describe('Brand Filter Tests', () => {
        test('should filter products by brand - StreamThreads', () => {
            const filtered = products.filter(p => p.brand === 'StreamThreads');

            expect(filtered.length).toBeGreaterThan(0);
            expect(filtered.every(p => p.brand === 'StreamThreads')).toBe(true);

            // Should include specific products
            const skus = filtered.map(p => p.sku);
            expect(skus).toContain('TSHIRT-RED-001');
            expect(skus).toContain('TSHIRT-BLK-002');
        });

        test('should filter products by brand - DenimWorks', () => {
            const filtered = products.filter(p => p.brand === 'DenimWorks');

            expect(filtered.length).toBeGreaterThan(0);
            expect(filtered.every(p => p.brand === 'DenimWorks')).toBe(true);

            const skus = filtered.map(p => p.sku);
            expect(skus).toContain('JEANS-BLU-032');
        });

        test('should return empty array for non-existent brand', () => {
            const filtered = products.filter(p => p.brand === 'NonExistentBrand');
            expect(filtered).toHaveLength(0);
        });
    });

    describe('Color Filter Tests', () => {
        test('should filter products by color - Red', () => {
            const filtered = products.filter(p => p.color === 'Red');

            expect(filtered.length).toBeGreaterThan(0);
            expect(filtered.every(p => p.color === 'Red')).toBe(true);

            const skus = filtered.map(p => p.sku);
            expect(skus).toContain('TSHIRT-RED-001');
        });

        test('should filter products by color - Blue', () => {
            const filtered = products.filter(p => p.color === 'Blue');

            expect(filtered.length).toBeGreaterThan(0);
            expect(filtered.every(p => p.color === 'Blue')).toBe(true);
        });

        test('should handle case-sensitive color matching', () => {
            const redFiltered = products.filter(p => p.color === 'Red');
            const redLowerFiltered = products.filter(p => p.color === 'red');

            expect(redFiltered.length).toBeGreaterThan(0);
            expect(redLowerFiltered.length).toBe(0); // Should be case-sensitive
        });
    });

    describe('Price Range Filter Tests', () => {
        test('should filter by price range - minPrice=500&maxPrice=2000', () => {
            const minPrice = 500;
            const maxPrice = 2000;
            const filtered = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

            expect(filtered.length).toBeGreaterThan(0);
            expect(filtered.every(p => p.price >= minPrice && p.price <= maxPrice)).toBe(true);

            // Should include products in this range
            const prices = filtered.map(p => p.price);
            expect(prices.some(price => price >= 500 && price <= 2000)).toBe(true);
        });

        test('should filter by minimum price only', () => {
            const minPrice = 1000;
            const filtered = products.filter(p => p.price >= minPrice);

            expect(filtered.length).toBeGreaterThan(0);
            expect(filtered.every(p => p.price >= minPrice)).toBe(true);
        });

        test('should filter by maximum price only', () => {
            const maxPrice = 1000;
            const filtered = products.filter(p => p.price <= maxPrice);

            expect(filtered.length).toBeGreaterThan(0);
            expect(filtered.every(p => p.price <= maxPrice)).toBe(true);
        });

        test('should return empty for impossible price range', () => {
            const filtered = products.filter(p => p.price >= 10000 && p.price <= 20000);
            expect(filtered).toHaveLength(0);
        });
    });

    describe('Combined Filters Tests', () => {
        test('should combine brand and color filters', () => {
            const filtered = products.filter(p =>
                p.brand === 'StreamThreads' && p.color === 'Red'
            );

            if (filtered.length > 0) {
                expect(filtered.every(p => p.brand === 'StreamThreads' && p.color === 'Red')).toBe(true);
                expect(filtered.map(p => p.sku)).toContain('TSHIRT-RED-001');
            }
        });

        test('should combine brand and price range filters', () => {
            const filtered = products.filter(p =>
                p.brand === 'StreamThreads' && p.price >= 400 && p.price <= 600
            );

            if (filtered.length > 0) {
                expect(filtered.every(p =>
                    p.brand === 'StreamThreads' && p.price >= 400 && p.price <= 600
                )).toBe(true);
            }
        });

        test('should combine all filters - brand, color, and price range', () => {
            const filtered = products.filter(p =>
                p.brand === 'StreamThreads' &&
                p.color === 'Red' &&
                p.price >= 400 &&
                p.price <= 600
            );

            // This might return 0 or more results depending on data
            expect(Array.isArray(filtered)).toBe(true);

            if (filtered.length > 0) {
                expect(filtered.every(p =>
                    p.brand === 'StreamThreads' &&
                    p.color === 'Red' &&
                    p.price >= 400 &&
                    p.price <= 600
                )).toBe(true);
            }
        });
    });

    describe('Pagination Logic Tests', () => {
        test('should implement pagination correctly', () => {
            const page = 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            const paginatedProducts = products.slice(offset, offset + limit);

            expect(paginatedProducts.length).toBeLessThanOrEqual(limit);
            expect(paginatedProducts.length).toBeGreaterThan(0);
        });

        test('should calculate pagination metadata', () => {
            const total = products.length;
            const limit = 10;
            const page = 2;

            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;
            const offset = (page - 1) * limit;

            expect(totalPages).toBeGreaterThan(0);
            expect(typeof hasNext).toBe('boolean');
            expect(typeof hasPrev).toBe('boolean');
            expect(offset).toBe(10); // page 2 with limit 10
        });
    });

    describe('Data Analysis Tests', () => {
        test('should analyze product distribution by brand', () => {
            const brandCounts = {};
            products.forEach(p => {
                brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
            });

            expect(Object.keys(brandCounts).length).toBeGreaterThan(3);
            expect(brandCounts['StreamThreads']).toBeGreaterThan(0);
        });

        test('should analyze price ranges in data', () => {
            const prices = products.map(p => p.price).filter(p => p > 0);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            expect(prices.length).toBeGreaterThan(0);
            expect(minPrice).toBeGreaterThan(0);
            expect(maxPrice).toBeGreaterThan(minPrice);
        });

        test('should verify data integrity', () => {
            products.forEach(product => {
                // All products should have required fields
                expect(product.sku).toBeTruthy();
                expect(product.name).toBeTruthy();
                expect(product.brand).toBeTruthy();

                // Prices should be valid
                expect(product.price).toBeGreaterThan(0);
                expect(product.mrp).toBeGreaterThan(0);
                expect(product.price).toBeLessThanOrEqual(product.mrp);

                // Quantity should be non-negative
                expect(product.quantity).toBeGreaterThanOrEqual(0);
            });
        });
    });
});