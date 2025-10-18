const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const knex = require('../db/knex');
const { validateRow } = require('../lib/csvValidator');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Helper function to parse pagination parameters
const getPaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

// Helper function to build pagination response
const buildPaginationResponse = (data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
};

router.post('/upload', upload.any(), async (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'file is required' });

    const filePath = req.files[0].path;
    const results = [];
    const failed = [];
    let stored = 0;

    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
                .on('data', (data) => {
                    results.push(data);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        await knex.transaction(async (trx) => {
            for (const row of results) {
                const r = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), v === '' ? null : v]));
                const { valid, errors } = validateRow(r);
                if (!valid) {
                    failed.push({ row: r, errors });
                    continue;
                }

                const product = {
                    sku: r.sku,
                    name: r.name,
                    brand: r.brand,
                    color: r.color || null,
                    size: r.size || null,
                    mrp: parseInt(r.mrp, 10),
                    price: parseInt(r.price, 10),
                    quantity: r.quantity !== null && r.quantity !== undefined ? parseInt(r.quantity, 10) : 0
                };

                try {
                    await trx('products').insert(product).onConflict('sku').merge();
                    stored += 1;
                } catch (e) {
                    failed.push({ row: r, errors: [e.message] });
                }
            }
        });

        res.json({ stored, failed: failed.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal_server_error', details: err.message });
    } finally {
        fs.unlink(filePath, () => { });
    }
});

router.get('/products', async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);

    try {
        const rows = await knex('products')
            .select('*')
            .orderBy('sku', 'asc')
            .limit(limit)
            .offset(offset);

        const [{ count }] = await knex('products').count('sku as count');
        const total = parseInt(count, 10);

        res.json(buildPaginationResponse(rows, page, limit, total));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'db_error', details: err.message });
    }
});

router.get('/products/search', async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);

    try {
        // Build the base query for filtering
        const baseQuery = knex('products');
        if (req.query.brand) baseQuery.where('brand', req.query.brand);
        if (req.query.color) baseQuery.where('color', req.query.color);
        if (req.query.minPrice) baseQuery.where('price', '>=', parseInt(req.query.minPrice, 10));
        if (req.query.maxPrice) baseQuery.where('price', '<=', parseInt(req.query.maxPrice, 10));

        // Get the total count for pagination
        const countQuery = baseQuery.clone().count('sku as count');
        const [{ count }] = await countQuery;
        const total = parseInt(count, 10);

        // Get the paginated results
        const rows = await baseQuery
            .clone()
            .select('*')
            .orderBy('sku', 'asc')
            .limit(limit)
            .offset(offset);

        res.json(buildPaginationResponse(rows, page, limit, total));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'db_error', details: err.message });
    }
});


module.exports = router;