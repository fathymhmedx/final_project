const RideEvent = require("../../modules/rideEvents/rideEvents.model");

const eventsData = require("../data/rideEvents.data");

module.exports =
    async (
        users
    ) => {

        const normalUsers =
            users.filter(
                u =>
                    u.role
                    !== "admin"
            );

        const events =
            eventsData.map(
                (
                    event,
                    i
                ) => {

                    const creator =
                        normalUsers[
                        i %
                        normalUsers.length
                        ];

                    const participants =
                        [
                            normalUsers[
                                (i + 1)
                                %
                                normalUsers.length
                            ]._id,

                            normalUsers[
                                (i + 2)
                                %
                                normalUsers.length
                            ]._id
                        ];

                    return {

                        ...event,

                        createdBy:
                            creator._id,

                        startDate:
                            new Date(
                                Date.now()
                                +
                                (i + 1)
                                *
                                86400000
                            ),

                        participants,

                        participantsCount:
                            participants.length

                    };

                }
            );

        return await RideEvent.create(
            events
        );

    };