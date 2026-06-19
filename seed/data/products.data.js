const categories = [
    "motorcycle",
    "parts",
    "accessories"
];
const products = [
    {
        title: "Yamaha R6",
        category: "motorcycle",
        condition: "used"
    },

    {
        title: "Honda CBR 600RR",
        category: "motorcycle",
        condition: "used"
    },

    {
        title: "BMW S1000RR",
        category: "motorcycle",
        condition: "new"
    },

    {
        title: "Kawasaki Ninja ZX-6R",
        category: "motorcycle",
        condition: "new"
    },

    {
        title: "Ducati Panigale V2",
        category: "motorcycle",
        condition: "used"
    },

    {
        title: "KTM Duke 390",
        category: "motorcycle",
        condition: "new"
    },

    {
        title: "AGV K1 Helmet",
        category: "accessories",
        condition: "new"
    },

    {
        title: "Shoei RF-1400 Helmet",
        category: "accessories",
        condition: "new"
    },

    {
        title: "Akrapovic Exhaust",
        category: "parts",
        condition: "used"
    },

    {
        title: "Brembo Brake Kit",
        category: "parts",
        condition: "new"
    }
];

module.exports =
    products.map(
        (
            product,
            i
        ) => ({

            ...product,

            description:
                `${product.title} in excellent condition`,

            price:
                [
                    220000,
                    260000,
                    480000,
                    390000,
                    530000,
                    180000,
                    9500,
                    14000,
                    25000,
                    18000
                ][i],

            location:
                [
                    "Cairo",
                    "Giza",
                    "Alex",
                    "Mansoura"
                ][
                i %
                4
                ],

            viewsCount:
                Math.floor(
                    Math.random() * 500
                ),

            status:
                i < 8
                    ?
                    "available"
                    :
                    "sold",

            images: [
                {
                    url:
                        `product${i + 1}.jpg`
                }
            ]

        })
    );