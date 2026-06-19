/** @type {import('mongoose').Model} */
const Product = require("./prodcuts.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../../shared/errors/ApiError");
const ApiFeatures = require("../../shared/utils/apiFeatures");

/**
 * @desc    Create product
 * @route   POST /api/v1/products
 * @access  Private (seller)
 */
exports.createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create({
        ...req.body,
        seller: req.user._id,
    });

    res.status(201).json({
        status: "success",
        message: "Product created successfully",
        data: {
            product,
        },
    });
});

/**
 * @desc    Get all products (search + filters)
 * @route   GET /api/v1/products
 * @access  Public
 */
// Search Example: /api/v1/products?keyword = yamaha
//Filters Example: /api/v1/products?category=motorcycle&condition=new
// Price Range: /api/v1/products?price[gte]=100&price[lte]=1000
// Multi category: /api/v1/products?category=motorcycle, parts
exports.getAllProducts = asyncHandler(async (req, res) => {
    const features = new ApiFeatures(Product.find({
        isDeleted: false,
        status: { $ne: "archived" }
    }).lean(), req.query)
        .search()
        .filter();

    await features.paginate();
    const products = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: products.length,
        data: {
            products,
        },
    });
});

/**
 * @desc    Get single product
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findOneAndUpdate(
        {
            _id: req.params.id,
            isDeleted: false
        },
        {
            $inc: { viewsCount: 1 }
        },
        {
            returnDocument: "after"
        }
    ).populate("seller", "name email profileImage");

    if (!product) {
        return next(new ApiError("Product not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            product,
        },
    });
});

/**
 * @desc    Update product
 * @route   PATCH /api/v1/products/:id
 * @access  Private (seller/admin)
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ApiError("Product not found", 404));
    }

    // check ownership
    if (product.seller.toString() !== req.user._id.toString()) {
        return next(new ApiError("Not allowed to update this product", 403));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    res.status(200).json({
        status: "success",
        message: "Product updated successfully",
        data: {
            product: updatedProduct,
        },
    });
});

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/v1/products/:id
 * @access  Private
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ApiError("Product not found", 404));
    }

    // check ownership
    if (product.seller.toString() !== req.user._id.toString()) {
        return next(new ApiError("Not allowed to delete this product", 403));
    }

    product.isDeleted = true;
    product.deletedAt = new Date();
    product.status = "archived";

    await product.save();

    res.status(200).json({
        status: "success",
        message: "Product deleted successfully",
    });
});

/**
 * @desc    Get products of logged in seller
 * @route   GET /api/v1/products/my-products
 * @access  Private (seller)
 */

exports.getMyProducts = asyncHandler(async (req, res) => {
    const features = new ApiFeatures(
        Product.find({
            seller: req.user._id,
            isDeleted: false,
        }).populate("seller", "name email profileImage"),
        req.query
    ).search().filter()

    const products = await features.query;
    res.status(200).json({
        status: "success",
        results: products.length,
        data: {
            products,
        },
    });
});

/**
 * @route /api/v1/admin/products/:id/hard 
 * @access  Private (admin)
 */
exports.hardDeleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ApiError("Product not found", 404));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        status: "success",
        message: "Product permanently deleted",
    });
});