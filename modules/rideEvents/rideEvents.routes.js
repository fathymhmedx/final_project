const express = require("express");
const validate = require("../../shared/middlewares/validation/validate.middleware");
const {
    createRideEvent,
    deleteRideEvent,
    getMyRideEvents,
    getRideEvent,
    getRideEvents,
    getUpcomingEvents,
    joinRideEvent,
    leaveRideEvent,
    updateRideEvent
} = require("./rideEvents.controller");

const {
    createRideEventSchema,
    updateRideEventSchema,
    eventIdSchema,
    getEventsQuerySchema,
} = require("./rideEvents.validators");

const { uploadFields } = require("../../shared/middlewares/uploadImage.middleware");
const { resizeRideEventImage } = require("../../shared/middlewares/imageProcessing.middleware");

const { protect, authorizeRoles } = require("../../shared/middlewares/auth.middleware");
const router = express.Router();


// PUBLIC
router.get("/my-events", protect, getMyRideEvents);
router.get("/", validate(getEventsQuerySchema, "query"), getRideEvents);

router.get("/upcoming", getUpcomingEvents);

router.get("/:id", validate(eventIdSchema, "params"), getRideEvent);


// PRIVATE
router.use(protect);

router.post("/",
    uploadFields([
        { name: "coverImage", maxCount: 1 },
    ]),
    resizeRideEventImage,
    validate(createRideEventSchema),
    createRideEvent);

router.post("/:id/join", validate(eventIdSchema, "params"), joinRideEvent);

router.delete("/:id/leave", validate(eventIdSchema, "params"), leaveRideEvent);




router.patch(
    "/:id",
    validate(eventIdSchema, "params"),
    uploadFields([
        { name: "coverImage", maxCount: 1 },
    ]),
    resizeRideEventImage,
    validate(updateRideEventSchema),
    updateRideEvent
);



router.delete("/:id",
    validate(eventIdSchema, "params"),
    authorizeRoles("user", "admin"), deleteRideEvent
);

module.exports = router;