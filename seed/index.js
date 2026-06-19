require("dotenv").config();
const mongoose = require("mongoose");

const seedUsers =
    require("./services/seedUsers");

const seedProducts =
    require("./services/seedProducts");

const seedRelations =
    require("./services/seedRelations");

const seedRideEvents =
    require("./services/seedRideEvents");

async function run() {

    await mongoose.connect(
        process.env.MONGO_URI
    );

    console.log("DB Connected");

    await Promise.all([
        mongoose.connection.collection("users").deleteMany({}),
        mongoose.connection.collection("products").deleteMany({}),
        mongoose.connection.collection("rideevents").deleteMany({})
    ]);

    const users =
        await seedUsers();

    const products =
        await seedProducts(
            users
        );

    await seedRelations(
        users,
        products
    );

    await seedRideEvents(
        users
    );

    console.log("Seed Finished");

    process.exit();

}

run();