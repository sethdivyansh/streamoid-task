const { validateRow } = require('../lib/csvValidator');

describe('CSV Validator Tests', () => {
    describe('Valid Product Data', () => {
        test('should validate correct product from products.csv', () => {
            const validProduct = {
                sku: 'TSHIRT-RED-001',
                name: 'Classic Cotton T-Shirt',
                brand: 'StreamThreads',
                color: 'Red',
                size: 'M',
                mrp: '799',
                price: '499',
                quantity: '20'
            };

            const result = validateRow(validProduct);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should validate product without optional fields', () => {
            const product = {
                sku: 'BASIC-001',
                name: 'Basic Product',
                brand: 'BasicBrand',
                mrp: '1000',
                price: '800'
            };

            const result = validateRow(product);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('Invalid Product Data (from products.csv)', () => {
        test('should fail when price > mrp (TSHIRT-ERR-101)', () => {
            const invalidProduct = {
                sku: 'TSHIRT-ERR-101',
                name: 'Invalid Price High',
                brand: 'ErrorBrand',
                color: 'Red',
                size: 'M',
                mrp: '799',
                price: '899', // Price higher than MRP
                quantity: '5'
            };

            const result = validateRow(invalidProduct);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('price must be ≤ mrp');
        });

        test('should fail when quantity is negative (JEANS-NEG-QTY-102)', () => {
            const invalidProduct = {
                sku: 'JEANS-NEG-QTY-102',
                name: 'Slim Fit Jeans',
                brand: 'DenimWorks',
                color: 'Blue',
                size: '32',
                mrp: '1999',
                price: '1599',
                quantity: '-3' // Negative quantity
            };

            const result = validateRow(invalidProduct);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('quantity must be ≥ 0');
        });

        test('should fail when brand is missing (MISSING-BRAND-103)', () => {
            const invalidProduct = {
                sku: 'MISSING-BRAND-103',
                name: 'No Brand Shirt',
                brand: '', // Empty brand
                color: 'Black',
                size: 'L',
                mrp: '1299',
                price: '999',
                quantity: '10'
            };

            const result = validateRow(invalidProduct);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('brand is required');
        });

        test('should fail when SKU is missing', () => {
            const invalidProduct = {
                sku: '', // Empty SKU
                name: 'No SKU',
                brand: 'GearCo',
                color: 'Blue',
                size: 'M',
                mrp: '499',
                price: '399',
                quantity: '7'
            };

            const result = validateRow(invalidProduct);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('sku is required');
        });

        test('should fail when MRP is not a number (NONNUMERIC-MRP-106)', () => {
            const invalidProduct = {
                sku: 'NONNUMERIC-MRP-106',
                name: 'Weird MRP',
                brand: 'Quirk',
                color: 'Yellow',
                size: 'S',
                mrp: 'one_thousand', // Non-numeric MRP
                price: '899',
                quantity: '3'
            };

            const result = validateRow(invalidProduct);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('mrp must be a number');
        });
    });

    describe('Business Rules Validation', () => {
        test('should enforce price ≤ mrp rule', () => {
            const testCases = [
                { mrp: '1000', price: '800', valid: true },  // Price < MRP
                { mrp: '1000', price: '1000', valid: true }, // Price = MRP
                { mrp: '1000', price: '1200', valid: false } // Price > MRP
            ];

            testCases.forEach(({ mrp, price, valid }) => {
                const product = {
                    sku: 'TEST-001',
                    name: 'Test Product',
                    brand: 'TestBrand',
                    mrp,
                    price
                };

                const result = validateRow(product);
                expect(result.valid).toBe(valid);
                if (!valid) {
                    expect(result.errors).toContain('price must be ≤ mrp');
                }
            });
        });

        test('should enforce quantity ≥ 0 rule', () => {
            const testCases = [
                { quantity: '10', valid: true },  // Positive quantity
                { quantity: '0', valid: true },   // Zero quantity
                { quantity: '-5', valid: false }  // Negative quantity
            ];

            testCases.forEach(({ quantity, valid }) => {
                const product = {
                    sku: 'TEST-001',
                    name: 'Test Product',
                    brand: 'TestBrand',
                    mrp: '1000',
                    price: '800',
                    quantity
                };

                const result = validateRow(product);
                expect(result.valid).toBe(valid);
                if (!valid) {
                    expect(result.errors).toContain('quantity must be ≥ 0');
                }
            });
        });
    });
});