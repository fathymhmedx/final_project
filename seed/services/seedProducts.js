const Product = require("../../modules/products/prodcuts.model");

const productsData = require("../data/products.data");

module.exports =
    async (
        users
    ) => {

        const normalUsers =
            users.filter(
                u =>
                    u.role
                    !==
                    "admin"
            );

        const products =
            productsData.map(
                (
                    product,
                    i
                ) => ({

                    ...product,

                    seller:
                        normalUsers[
                            i %
                            normalUsers.length
                        ]._id

                })
            );

        return await Product.create(
            products
        );

    };