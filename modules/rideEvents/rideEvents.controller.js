const RideEvent = require("./rideEvents.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../../shared/errors/ApiError");
const ApiFeatures = require("../../shared/utils/apiFeatures");

/**
 * @desc Create Ride Event
 * @route POST /api/v1/ride-events
 * @access Private
 */

exports.createRideEvent = asyncHandler(async (req, res) => {
    const event = await RideEvent.create({
        ...req.body,
        createdBy: req.user._id,
    });

    res.status(201).json({
        status: "success",
        message: "Ride event created successfully",
        data: {
            event
        },
    });
});


/**
 * @desc Get All Events
 * @route GET /api/v1/ride-events
 * @access Public
 */

exports.getRideEvents = asyncHandler(async (req, res) => {

    const features = new ApiFeatures(
        RideEvent.find({
            isArchived: false,
        })
            .populate("createdBy", "name profileImage rank"),
        req.query
    )
        .search()
        .filter()
        .sort()
        .paginate();

    const events = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: events.length,
        data: {
            events
        },
    });

});

/**
 * @desc Get Event Details
 * @route GET /api/v1/ride-events/:id
 * @access Public
 */

exports.getRideEvent = asyncHandler(async (req, res) => {

    const event = await RideEvent.findOne({
        _id: req.params.id,
        isArchived: false,
    })
        .populate("createdBy", "name profileImage rank")
        .populate(
            "participants",
            "name profileImage"
        );

    if (!event) {
        throw new ApiError("Ride event not found", 404);
    }

    res.status(200).json({
        status: "success",
        data: event,
    });

});

/**
 * @desc Join Event
 * @route POST /api/v1/ride-events/:id/join
 * @access Private 
 */

exports.joinRideEvent = asyncHandler(async (req, res) => {

    const event = await RideEvent.findOneAndUpdate(
        {
            _id: req.params.id,
            isArchived: false,
            participants: { $ne: req.user._id },
            $expr: {
                $lt: ["$participantsCount", "$maxParticipants"]
            }
        },
        {
            $addToSet: {
                participants: req.user._id
            },
            $inc: {
                participantsCount: 1
            }
        },
        {
            new: true
        }
    );

    if (!event) {
        throw new ApiError("Cannot join event", 400);
    }

    res.status(200).json({
        status: "success",
        message: "Joined successfully"
    });
});

/**
 * @desc Leave Event
 * @route DELETE /api/v1/ride-events/:id/leave
 * @access Private
 */
exports.leaveRideEvent = asyncHandler(async (req, res) => {

    const event =
        await RideEvent.findOneAndUpdate(
            {
                _id: req.params.id,
                participants: req.user._id
            },
            {
                $pull: {
                    participants: req.user._id
                },
                $inc: {
                    participantsCount: -1
                }
            },
            {
                new: true
            }
        );

    if (!event) {
        throw new ApiError("You are not joined", 400);
    }

    res.status(200).json({
        status: "success",
        message: "Left successfully"
    });

});


/**
 * @desc Get My Joined Events
 * @route GET /api/v1/ride-events/my-events
 * @access Private
 */
exports.getMyRideEvents = asyncHandler(async (req, res) => {

    const events = await RideEvent.find({
        participants: req.user._id,
        isArchived: false
    }).populate(
        "createdBy",
        "name profileImage"
    );

    res.status(200).json({
        status: "success",
        results: events.length,
        data: events
    });
});



/**
 * @desc Update Event
 * @route PATCH /api/v1/ride-events/:id
 * @access Event Creator
*/
exports.updateRideEvent = asyncHandler(async (req, res) => {

    const updated = await RideEvent.findOneAndUpdate(
        {
            _id: req.params.id,
            createdBy: req.user._id,
            isArchived: false
        },
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updated) {
        throw new ApiError(
            "Ride event not found or unauthorized",
            404
        );
    }

    res.status(200).json({
        status: "success",
        data: {
            event: updated
        }
    });

});

/**
 * @desc Delete Event
 * @route DELETE /api/v1/ride-events/:id
 * @access Admin or Event Creator
 */
exports.deleteRideEvent = asyncHandler(async (req, res) => {

    const filter = {
        _id: req.params.id,
        isArchived: false
    };

    if (req.user.role !== "admin") {
        filter.createdBy = req.user._id;
    }

    const event = await RideEvent.findOneAndUpdate(
        filter,
        {
            isArchived: true
        },
        {
            new: true
        }
    );

    if (!event) {
        throw new ApiError(
            "Ride event not found or unauthorized",
            404
        );
    }

    res.status(200).json({
        status: "success",
        message: "Ride archived successfully"
    });

});

/**
 * @access Public
 * @route GET /api/v1/ride-events/upcoming
 * @desc Upcoming Events
 */
exports.getUpcomingEvents = asyncHandler(async (req, res) => {
    const events =
        await RideEvent.find({
            startDate: {
                $gte:
                    new Date()
            },
            isArchived: false
        }).sort({ startDate: 1 })
            .limit(5)

    res.status(200).json({
        status: "success",
        data: {
            events
        }
    });

});