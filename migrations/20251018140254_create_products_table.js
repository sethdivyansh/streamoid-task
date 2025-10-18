exports.up = function (knex) {
    return knex.schema.createTable('products', function (table) {
        table.string('sku').primary();
        table.string('name').notNullable();
        table.string('brand').notNullable();
        table.string('color');
        table.string('size');
        table.integer('mrp').notNullable();
        table.integer('price').notNullable();
        table.integer('quantity').notNullable().defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.check('price <= mrp');
        table.check('quantity >= 0');
    }).then(() =>
        knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_products_created_sku ON products (created_at ASC, sku ASC)')
    );
};


exports.down = function (knex) {
    return knex.schema.dropTableIfExists('products');
};