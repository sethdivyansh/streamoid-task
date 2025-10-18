require('dotenv').config();

const isDocker = process.env.PGHOST === 'db';
const isLocalhost = process.env.PGHOST === 'localhost' || process.env.PGHOST === '127.0.0.1';
const useSSL = !isDocker && !isLocalhost && process.env.PGHOST;

const sslConfig = useSSL ? {
    rejectUnauthorized: true,
    ca: process.env.PGSSLCERT
} : false;

const baseConfig = {
    client: 'pg',
    connection: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT || 5432,
        ...(sslConfig && { ssl: sslConfig })
    },
    migrations: {
        directory: './migrations',
        tableName: 'knex_migrations'
    }
};

module.exports = {
    development: baseConfig,
    production: baseConfig,
    test: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'streamoid_test',
            port: process.env.DB_PORT || 5432
        },
        migrations: {
            directory: './migrations',
            tableName: 'knex_migrations'
        }
    }
};