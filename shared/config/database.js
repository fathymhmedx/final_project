const mongoose = require("mongoose");
const connectedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("db is connected")
    } catch (error) {
        console.log(error)
    }
}
module.exports = connectedDB;