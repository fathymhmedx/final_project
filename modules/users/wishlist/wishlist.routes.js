const express = require("express");
const router = express.Router();

const {
    addProductToWishlist,
    removeProductFromWishlist,
    getLoggedUserWishlist,
} = require("./wishlist.controller");

const { protect } = require("../../../shared/middlewares/auth.middleware");
const validate = require("../../../shared/middlewares/validation/validate.middleware");
const { addWishlistSchema, removeWishlistSchema } = require("./wishlist.validators");

router.use(protect);

router.get("/", getLoggedUserWishlist);

router.post(
    "/",
    validate(addWishlistSchema),
    addProductToWishlist
);

router.delete(
    "/:productId",
    validate(removeWishlistSchema, "params"),
    removeProductFromWishlist
);

module.exports = router;