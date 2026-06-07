const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["motorcycle", "parts", "accessories"],
            index: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,

        },
        images: [
            {
                url: String
            }
        ],
        condition: {
            type: String,
            required: true,
            enum: ["new", "used"],
        },
        location: {
            type: String,
            required: true,
            index: true,
        },
        status: {
            type: String,
            default: "available",
            enum: ["available", "sold", "archived"],
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        viewsCount: {
            type: Number,
            default: 0
        },
        deletedAt: Date,
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;