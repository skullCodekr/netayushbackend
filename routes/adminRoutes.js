const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/role");
const {
  createAdmin,
  deleteAdmin,
  getPendingDoctors,
} = require("../controllers/adminController");

router.post("/create-admin", protect, authorizeRoles("admin"), createAdmin);
router.delete("/:id", protect, authorizeRoles("admin"), deleteAdmin);
router.get(
  "/pending-doctors",
  protect,
  authorizeRoles("admin"),
  getPendingDoctors,
);

module.exports = router;
