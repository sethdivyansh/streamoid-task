require('dotenv').config();
const express = require('express');
const productsRouter = require('./routes/products');

const app = express();
app.use(express.json());

app.use('/', productsRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
