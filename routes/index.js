const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/users.routes');
const productRoutes = require('../modules/products/products.routes');
const wishlistRoutes = require('../modules/users/wishlist/wishlist.routes');
const rideEventsRoutes = require('../modules/rideEvents/rideEvents.routes');
const communityRoutes = require('../modules/community/index.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/ride-events", rideEventsRoutes);
router.use("/community", communityRoutes);

module.exports = router;