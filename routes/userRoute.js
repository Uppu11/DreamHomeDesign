// Import necessary modules and models
const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Staff = require("../models/StaffModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");

// Route for user registration
router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(200).send({ message: "User already exists", success: false });
    }
    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
    const newUser = new User(req.body);
    await newUser.save();
    res.status(200).send({ message: "User created successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error creating user", success: false, error });
  }
});

// Route for user login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Password is incorrect", success: false });
    }
    // Create and send JWT token upon successful login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).send({ message: "Login successful", success: true, data: token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error logging in", success: false, error });
  }
});

// Route to get user information by user ID
router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    // Omit the password field before sending user data in response
    user.password = undefined;
    if (!user) {
      return res.status(200).send({ message: "User does not exist", success: false });
    }
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    res.status(500).send({ message: "Error getting user info", success: false, error });
  }
});

// Route for applying for a Staff account
router.post("/apply-Staff-account", authMiddleware, async (req, res) => {
  try {
    const newStaff = new Staff({ ...req.body, status: "pending" });
    await newStaff.save();
    // Send notification to admin user
    const adminUser = await User.findOne({ isAdmin: true });
    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-Staff-request",
      message: `${newStaff.firstName} ${newStaff.lastName} has applied for a Staff account`,
      data: {
        StaffId: newStaff._id,
        name: newStaff.firstName + " " + newStaff.lastName,
      },
      onClickPath: "/admin/Staffslist",
    });
    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    res.status(200).send({ success: true, message: "Staff account applied successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error applying for Staff account", success: false, error });
  }
});

// Route to mark all notifications as seen
router.post("/mark-all-notifications-as-seen", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const unseenNotifications = user.unseenNotifications;
    const seenNotifications = user.seenNotifications;
    seenNotifications.push(...unseenNotifications);
    user.unseenNotifications = [];
    user.seenNotifications = seenNotifications;
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({ success: true, message: "All notifications marked as seen", data: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error marking notifications as seen", success: false, error });
  }
});

// Route to delete all notifications
router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({ success: true, message: "All notifications cleared", data: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error deleting notifications", success: false, error });
  }
});

// Route to get all approved Staffs
router.get("/get-all-approved-Staffs", authMiddleware, async (req, res) => {
  try {
    const Staffs = await Staff.find({ status: "approved" });
    res.status(200).send({ message: "Staffs fetched successfully", success: true, data: Staffs });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching approved Staffs", success: false, error });
  }
});

// Route to book an appointment
router.post("/book-appointment", authMiddleware, async (req, res) => {
  try {
    req.body.status = "pending";
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    // Push notification to Staff based on their userId
    const user = await User.findOne({ _id: req.body.StaffInfo.userId });
    user.unseenNotifications.push({
      type: "new-appointment-request",
      message: `A new appointment request has been made by ${req.body.userInfo.name}`,
      onClickPath: "/Staff/appointments",
    });
    await user.save();
    res.status(200).send({ message: "Appointment booked successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error booking appointment", success: false, error });
  }
});

// Route to check booking availability
router.post("/check-booking-availability", authMiddleware, async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const StaffId = req.body.StaffId;
    const appointments = await Appointment.find({
      StaffId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });
    if (appointments.length > 0) {
      return res.status(200).send({ message: "Appointments not available", success: false });
    } else {
      return res.status(200).send({ message: "Appointments available", success: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error checking booking availability", success: false, error });
  }
});

// Route to get appointments by user ID
router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.body.userId });
    res.status(200).send({ message: "Appointments fetched successfully", success: true, data: appointments });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching appointments", success: false, error });
  }
});

// Export the router
module.exports = router;
