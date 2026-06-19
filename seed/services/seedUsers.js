const User = require("../../modules/users/users.model");
const users =require("../data/users.data");

module.exports =
    async () => {

        return await User.create(
            users
        );
    };