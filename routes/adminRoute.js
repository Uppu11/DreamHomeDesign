const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Staff = require("../models/staffModel");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/get-all-staffs", authMiddleware, async (req, res) => {
  try {
    const staffs = await Staff.find({});
    res.status(200).send({
      message: "Staffs fetched successfully",
      success: true,
      data: staffs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error applying staff account",
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
      message: "Error applying staff account",
      success: false,
      error,
    });
  }
});

router.post(
  "/change-staff-account-status",
  authMiddleware,
  async (req, res) => {
    try {
      const { staffId, status } = req.body;
      const staff = await Staff.findByIdAndUpdate(staffId, {
        status,
      });

      const user = await User.findOne({ _id: staff.userId });
      const unseenNotifications = user.unseenNotifications;
      unseenNotifications.push({
        type: "new-staff-request-changed",
        message: `Your staff account has been ${status}`,
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
        message: "Error applying staff account",
        success: false,
        error,
      });
    }
  }
);



module.exports = router;
