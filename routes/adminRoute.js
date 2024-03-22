const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const StaffModel = require("../models/StaffModel"); // Changed variable name to StaffModel
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/get-all-Staffs", authMiddleware, async (req, res) => {
  try {
    const Staffs = await StaffModel.find({}); // Changed variable name to StaffModel
    res.status(200).send({
      message: "Staffs fetched successfully",
      success: true,
      data: Staffs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching Staffs",
      success: false,
      error,
    });
  }
});

router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching users",
      success: false,
      error,
    });
  }
});

router.post(
  "/change-Staff-account-status",
  authMiddleware,
  async (req, res) => {
    try {
      const { StaffId, status } = req.body;
      const staff = await StaffModel.findByIdAndUpdate(StaffId, {
        status,
      }); // Changed variable name to staff

      const user = await User.findOne({ _id: staff.userId }); // Changed variable name to staff
      const unseenNotifications = user.unseenNotifications;
      unseenNotifications.push({
        type: "new-Staff-request-changed",
        message: `Your Staff account has been ${status}`,
        onClickPath: "/notifications",
      });
      user.isStaff = status === "approved" ? true : false;
      await user.save();

      res.status(200).send({
        message: "Staff status updated successfully",
        success: true,
        data: staff,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error applying Staff account status",
        success: false,
        error,
      });
    }
  }
);

module.exports = router;
