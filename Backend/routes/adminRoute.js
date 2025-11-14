import express from "express";

import {
  addDoctor,
  adminDashboard,
  allDoctors,
  appointmentCancel,
  appointmentsAdmin,
  loginAdmin,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import authDoctor from "../middlewares/authDoctor.js";
import doctorEarningsReport from "../controllers/adminReportController.js";
import { changeAvailabilty } from "../controllers/doctorController.js";

const adminRouter = express.Router();

// adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
// adminRouter.post("/login", loginAdmin);
// adminRouter.get("/all-doctors", authAdmin, allDoctors);
// adminRouter.post("/change-availability", authAdmin, changeAvailabilty);
// adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
// adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
// adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.post("/add-doctor", upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all-doctors", allDoctors);
adminRouter.post("/change-availability", changeAvailabilty);
adminRouter.get("/appointments", appointmentsAdmin);
adminRouter.post("/cancel-appointment", appointmentCancel);
adminRouter.get("/dashboard", adminDashboard);
adminRouter.get("/doctor-earnings", doctorEarningsReport);
adminRouter.get("/doctor-earnings", authDoctor, doctorEarningsReport);
export default adminRouter;