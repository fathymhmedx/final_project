const express = require("express");
const router = express.Router();

const {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getMyProducts
} = require("./products.controller");

const validate = require("../../shared/middlewares/validation/validate.middleware");
const {
    createProductSchema,
    updateProductSchema,
} = require("./products.validators");

const { protect } = require("../../shared/middlewares/auth.middleware");

/**
 * PUBLIC ROUTES
 */
router.get(
    "/my",
    protect,
    getMyProducts
);
router.get("/", getAllProducts);
router.get("/:id", getProduct);

/**
 * PROTECTED ROUTES
*/
router.post(
    "/",
    protect,
    validate(createProductSchema),
    createProduct
);

router.patch(
    "/:id",
    protect,
    validate(updateProductSchema),
    updateProduct
);

router.delete(
    "/:id",
    protect,
    deleteProduct
);


module.exports = router;