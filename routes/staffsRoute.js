const express = require("express");
const router = express.Router();
const StaffModel = require("../models/StaffModel"); // Changed variable name to StaffModel
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");

router.post("/get-Staff-info-by-user-id", authMiddleware, async (req, res) => {
  try {
    const staff = await StaffModel.findOne({ userId: req.body.userId }); // Changed variable name to staff
    res.status(200).send({
      success: true,
      message: "Staff info fetched successfully",
      data: staff, // Changed variable name to staff
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting Staff info", success: false, error });
  }
});

router.post("/get-Staff-info-by-id", authMiddleware, async (req, res) => {
  try {
    const staff = await StaffModel.findOne({ _id: req.body.staffId }); // Changed variable name to staff, and body property to lowercase 'staffId'
    res.status(200).send({
      success: true,
      message: "Staff info fetched successfully",
      data: staff, // Changed variable name to staff
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting Staff info", success: false, error });
  }
});

router.post("/update-Staff-profile", authMiddleware, async (req, res) => {
  try {
    const staff = await StaffModel.findOneAndUpdate(
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
      .send({ message: "Error updating Staff profile", success: false, error }); // Changed error message
  }
});

router.get(
  "/get-appointments-by-Staff-id",
  authMiddleware,
  async (req, res) => {
    try {
      const staff = await StaffModel.findOne({ userId: req.body.userId });
      const appointments = await Appointment.find({ StaffId: staff._id });
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

module.exports = router;
