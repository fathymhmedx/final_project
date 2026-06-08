const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/users.routes');
const productRoutes = require('../modules/products/products.routes');
const wishlistRoutes = require('../modules/users/wishlist/wishlist.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use("/wishlist", wishlistRoutes);

module.exports = router;