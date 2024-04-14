const express = require("express");
const router = express.Router();
const Staff = require("../models/staffModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");

router.post("/get-staff-info-by-user-id", authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Staff info fetched successfully",
      data: staff,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting staff info", success: false, error });
  }
});

router.post("/get-staff-info-by-id", authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findOne({ _id: req.body.staffId });
    res.status(200).send({
      success: true,
      message: "Staff info fetched successfully",
      data: staff,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting staff info", success: false, error });
  }
});

router.post("/update-staff-profile", authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(200).send({
      success: true,
      message: "Staff profile updated successfully",
      data: staff,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting staff info", success: false, error });
  }
});

router.get(
  "/get-appointments-by-staff-id",
  authMiddleware,
  async (req, res) => {
    try {
      const staff = await Staff.findOne({ userId: req.body.userId });
      const appointments = await Appointment.find({ staffId: staff._id });
      res.status(200).send({
        message: "Appointments fetched successfully",
        success: true,
        data: appointments,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error fetching appointments",
        success: false,
        error,
      });
    }
  }
);

router.post("/change-appointment-status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status,
    });

    const user = await User.findOne({ _id: appointment.userId });
    const unseenNotifications = user.unseenNotifications;
    unseenNotifications.push({
      type: "appointment-status-changed",
      message: `Your appointment status has been ${status}`,
      onClickPath: "/appointments",
    });

    await user.save();

    res.status(200).send({
      message: "Appointment status updated successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error changing appointment status",
      success: false,
      error,
    });
  }
});

module.exports = router;
