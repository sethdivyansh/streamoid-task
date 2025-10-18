const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { validateRow } = require('../lib/csvValidator');

describe('CSV Parsing Tests', () => {
    const csvFilePath = path.join(__dirname, '../products.csv');
    let csvData = [];

    beforeAll(async () => {
        // Parse the actual products.csv file
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
                .on('data', (data) => {
                    // Clean the data similar to the actual upload process
                    const cleanedData = Object.fromEntries(
                        Object.entries(data).map(([k, v]) => [k.trim(), v === '' ? null : v])
                    );
                    csvData.push(cleanedData);
                })
                .on('end', resolve)
                .on('error', reject);
        });
    });

    describe('CSV File Structure', () => {
        test('should successfully parse products.csv file', () => {
            expect(csvData.length).toBeGreaterThan(0);
            expect(csvData.length).toBe(29); // Expected number of rows in products.csv (excluding header)
        });

        test('should have correct headers', () => {
            const expectedHeaders = ['sku', 'name', 'brand', 'color', 'size', 'mrp', 'price', 'quantity'];
            const firstRow = csvData[0];

            expectedHeaders.forEach(header => {
                expect(firstRow).toHaveProperty(header);
            });
        });

        test('should handle empty values correctly', () => {
            // Find rows with empty values
            const rowWithEmptyBrand = csvData.find(row => row.sku === 'MISSING-BRAND-103');
            const rowWithEmptyPrice = csvData.find(row => row.sku === 'MISSING-PRICE-104');
            const rowWithEmptySku = csvData.find(row => !row.sku || row.sku === '');

            expect(rowWithEmptyBrand.brand).toBeNull();
            expect(rowWithEmptyPrice.price).toBeNull();
            expect(rowWithEmptySku).toBeDefined();
        });
    });

    describe('CSV Data Validation', () => {
        test('should validate valid products from CSV', () => {
            const validProducts = [
                'TSHIRT-RED-001',
                'JEANS-BLU-032',
                'DRESS-PNK-S',
                'SHOE-WHT-7'
            ];

            validProducts.forEach(sku => {
                const product = csvData.find(row => row.sku === sku);
                expect(product).toBeDefined();

                const result = validateRow(product);
                expect(result.valid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });
        });

        test('should identify invalid products from CSV', () => {
            const invalidProducts = [
                { sku: 'TSHIRT-ERR-101', expectedError: 'price must be ≤ mrp' },
                { sku: 'JEANS-NEG-QTY-102', expectedError: 'quantity must be ≥ 0' },
                { sku: 'MISSING-BRAND-103', expectedError: 'brand is required' },
                { sku: 'NONNUMERIC-MRP-106', expectedError: 'mrp must be a number' }
            ];

            invalidProducts.forEach(({ sku, expectedError }) => {
                const product = csvData.find(row => row.sku === sku);
                expect(product).toBeDefined();

                const result = validateRow(product);
                expect(result.valid).toBe(false);
                expect(result.errors).toContain(expectedError);
            });
        });

        test('should count valid vs invalid products', () => {
            let validCount = 0;
            let invalidCount = 0;

            csvData.forEach(product => {
                const result = validateRow(product);
                if (result.valid) {
                    validCount++;
                } else {
                    invalidCount++;
                }
            });

            expect(validCount).toBeGreaterThan(0);
            expect(invalidCount).toBeGreaterThan(0);
            expect(validCount + invalidCount).toBe(csvData.length);

            // Based on the products.csv content, we expect about 20 valid and 8 invalid
            expect(validCount).toBeGreaterThan(15);
            expect(invalidCount).toBeLessThan(15);
        });
    });

    describe('Data Type Handling', () => {
        test('should handle numeric strings correctly', () => {
            const numericProduct = csvData.find(row => row.sku === 'TSHIRT-RED-001');

            expect(typeof numericProduct.mrp).toBe('string');
            expect(typeof numericProduct.price).toBe('string');
            expect(typeof numericProduct.quantity).toBe('string');

            // But they should be valid numbers
            expect(Number.isNaN(Number(numericProduct.mrp))).toBe(false);
            expect(Number.isNaN(Number(numericProduct.price))).toBe(false);
            expect(Number.isNaN(Number(numericProduct.quantity))).toBe(false);
        });

        test('should identify non-numeric values', () => {
            const nonNumericProduct = csvData.find(row => row.sku === 'NONNUMERIC-MRP-106');

            expect(nonNumericProduct.mrp).toBe('one_thousand');
            expect(Number.isNaN(Number(nonNumericProduct.mrp))).toBe(true);
        });
    });

    describe('Brand Analysis', () => {
        test('should identify all brands in CSV', () => {
            const brands = [...new Set(csvData.map(row => row.brand).filter(Boolean))];

            const expectedBrands = [
                'StreamThreads',
                'DenimWorks',
                'BloomWear',
                'StrideLab',
                'CarryCo',
                'Ethniq',
                'UrbanEdge',
                'ButtonUp',
                'SnugWear'
            ];

            expectedBrands.forEach(brand => {
                expect(brands).toContain(brand);
            });
        });

        test('should find products by brand', () => {
            const streamThreadsProducts = csvData.filter(row => row.brand === 'StreamThreads');
            expect(streamThreadsProducts.length).toBeGreaterThan(2);

            const urbanEdgeProducts = csvData.filter(row => row.brand === 'UrbanEdge');
            expect(urbanEdgeProducts.length).toBeGreaterThan(1);
        });
    });
});