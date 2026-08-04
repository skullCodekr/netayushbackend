const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/role");
const {
  applyAsDoctor,
  getAllDoctors,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getMyDoctorStatus,
} = require("../controllers/doctorController");

router.post("/apply", protect, applyAsDoctor);
router.get("/", getAllDoctors);
router.get("/my-status", protect, getMyDoctorStatus);
router.get("/pending", protect, authorizeRoles("admin"), getPendingDoctors);
router.put("/:id/approve", protect, authorizeRoles("admin"), approveDoctor);
router.put("/:id/reject", protect, authorizeRoles("admin"), rejectDoctor);

module.exports = router;
