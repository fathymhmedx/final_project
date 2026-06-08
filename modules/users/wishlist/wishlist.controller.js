const asyncHandler = require("express-async-handler");
/** @type {import('mongoose').Model} */
const User = require("../users.model");
/** @type {import('mongoose').Model} */
const Product = require("../../products/prodcuts.model");

const ApiError = require("../../../shared/errors/ApiError");

/**
 * @route   POST /api/v1/wishlist
 * @desc    Add product to wishlist
 * @access  Private
 */
exports.addProductToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    const product = await Product.findOne({
        _id: productId,
        isDeleted: false,
        status: { $ne: "archived" }
    });

    if (!product) {
        throw new ApiError("Product not found", 404);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: {
                wishlist: productId,
            },
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    res.status(200).json({
        status: "success",
        message: "Product added to wishlist successfully",
        data: {
            wishlist: user.wishlist,
        },
    });
});

/**
 * @route   DELETE /api/v1/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
exports.removeProductFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: {
                wishlist: productId,
            },
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    res.status(200).json({
        status: "success",
        message: "Product removed from wishlist successfully",
        data: {
            wishlist: user.wishlist,
        },
    });
});

/**
 * @route   GET /api/v1/wishlist
 * @desc    Get logged user wishlist
 * @access  Private
 */
exports.getLoggedUserWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: "wishlist",
        match: { isDeleted: false },
        select: "title price images condition location status"
    });
    
    res.status(200).json({
        status: "success",
        results: user.wishlist.length,
        data: {
            wishlist: user.wishlist,
        },
    });
});