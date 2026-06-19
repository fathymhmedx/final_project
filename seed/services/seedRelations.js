const User = require("../../modules/users/users.model");


module.exports =
    async (
        users,
        products
    ) => {

        for (
            let i = 0;
            i < users.length;
            i++
        ) {

            if (
                users[i].role
                ===
                "admin"
            )
                continue;

            const followCount =
                Math.floor(
                    Math.random() * 4
                );

            for (
                let j = 0;
                j < followCount;
                j++
            ) {

                const target =
                    users[
                    Math.floor(
                        Math.random()
                        *
                        users.length
                    )
                    ];

                if (
                    target._id.toString()
                    ===
                    users[i]._id.toString()
                )
                    continue;

                if (
                    target.role
                    ===
                    "admin"
                )
                    continue;

                const randomProduct =
                    products[
                    Math.floor(
                        Math.random()
                        *
                        products.length
                    )
                    ];

                await User.findByIdAndUpdate(
                    users[i]._id,
                    {

                        $addToSet: {
                            following:
                                target._id,

                            wishlist:
                                randomProduct._id
                        },

                        $inc: {
                            followingCount: 1
                        }

                    }

                );

                await User.findByIdAndUpdate(
                    target._id,
                    {

                        $addToSet: {
                            followers:
                                users[i]._id
                        },

                        $inc: {
                            followersCount: 1
                        }

                    }

                );

            }

        }

        console.log(
            "Relations Seeded"
        );

    };