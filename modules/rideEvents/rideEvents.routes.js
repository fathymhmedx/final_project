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

const { protect, authorizeRoles } = require("../../shared/middlewares/auth.middleware");
const router = express.Router();


// PUBLIC
router.get("/my-events",protect, getMyRideEvents);
router.get("/", validate(getEventsQuerySchema, "query"), getRideEvents);

router.get("/upcoming", getUpcomingEvents);

router.get("/:id", validate(eventIdSchema, "params"), getRideEvent);


// PRIVATE
router.use(protect);

router.post("/", validate(createRideEventSchema), createRideEvent);

router.post("/:id/join", validate(eventIdSchema, "params"), joinRideEvent);

router.delete("/:id/leave", validate(eventIdSchema, "params"), leaveRideEvent);




router.patch(
    "/:id",
    validate(eventIdSchema, "params"),
    validate(updateRideEventSchema),
    updateRideEvent
);



router.delete("/:id",
    validate(eventIdSchema, "params"),
    authorizeRoles("user", "admin"), deleteRideEvent
);

module.exports = router;