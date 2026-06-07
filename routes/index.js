const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/users.routes');
const productRoutes = require('../modules/products/products.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);

module.exports = router;