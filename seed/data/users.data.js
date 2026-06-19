const bikes = [
    "BMW",
    "Yamaha",
    "Honda",
    "Kawasaki",
    "Ducati"
];

const locations = [
    "Cairo",
    "Giza",
    "Alex",
    "Mansoura",
    "Tanta"
];

const users = Array.from(
    {
        length: 7
    },

    (_, i) => ({

        name:
            `Rider ${i + 1}`,

        email:
            `rider${i + 1}@gmail.com`,

        password:
            "12345678",

        role:
            "user",

        profileCompleted:
            true,

        profileImage:
            `rider${(i % 8) + 1
            }.jpg`,

        bikeType:
            bikes[
            i %
            bikes.length
            ],

        location:
            locations[
            i %
            locations.length
            ],

        bio:
            `Motorcycle rider ${i + 1}`,

        isVerified:
            i < 5

    })
);

// Admin
users.unshift({

    name:
        "System Admin",

    email:
        "admin@gmail.com",

    password:
        "Admin@123",

    role:
        "admin",

    profileCompleted:
        true,

    profileImage:
        "/uploads/users/admin.jpg",

    bikeType:
        "BMW",

    location:
        "Cairo",

    bio:
        "Administrator account",

    isVerified:
        true,

    rank:
        "Elite Member"

});

module.exports = users;