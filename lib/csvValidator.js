function validateRow(row) {
    const errors = [];

    const required = ['sku', 'name', 'brand', 'mrp', 'price'];
    for (const f of required) {
        if (!row[f] && row[f] !== 0) {
            errors.push(`${f} is required`);
        }
    }

    const mrp = Number(row.mrp);
    const price = Number(row.price);
    const qty = row.quantity !== undefined && row.quantity !== '' ? Number(row.quantity) : 0;

    if (Number.isNaN(mrp)) errors.push('mrp must be a number');
    if (Number.isNaN(price)) errors.push('price must be a number');
    if (Number.isNaN(qty)) errors.push('quantity must be a number');

    if (!Number.isNaN(mrp) && !Number.isNaN(price) && price > mrp) errors.push('price must be ≤ mrp');
    if (!Number.isNaN(qty) && qty < 0) errors.push('quantity must be ≥ 0');


    return { valid: errors.length === 0, errors };
}


module.exports = { validateRow };