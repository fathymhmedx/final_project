const types = [
    "group",
    "meetup",
    "social",
    "workshop"
];

const difficulty = [
    "easy",
    "medium",
    "hard"
];

module.exports =
    Array.from(
        {
            length: 7
        },

        (_, i) => ({

            title:
                `Ride Event ${i + 1}`,

            description:
                `Ride description ${i + 1}`,

            coverImage:
                `event${i + 1}.jpg`,

            type:
                types[
                i %
                types.length
                ],

            meetingPoint:
                [
                    "Cairo",
                    "Giza",
                    "Alex"
                ][
                i %
                3
                ],

            difficulty:
                difficulty[
                i %
                difficulty.length
                ],

            maxParticipants:
                10 + i

        })
    );