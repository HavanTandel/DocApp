// import validator from "validator";
// import bcrypt from "bcrypt";
// import { v2 as cloudinary } from "cloudinary";
// import doctorModel from "../models/doctorModel.js";
// import jwt from "jsonwebtoken";
// import appointmentModel from "../models/appointmentModel.js";
// import userModel from "../models/userModel.js";
// //Api for adding doctor
// const addDoctor = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       speciality,
//       degree,
//       experience,
//       about,
//       fees,
//       address,
//     } = req.body;
//     const imageFile = req.file;

//     //checking for all data to add doctor
//     if (
//       !name ||
//       !email ||
//       !password ||
//       !speciality ||
//       !degree ||
//       !experience ||
//       !about ||
//       !fees ||
//       !address
//     ) {
//       return res.json({ success: false, message: "missing details" });
//     }

//     // validatin email format

//     if (!validator.isEmail(email)) {
//       return res.json({
//         success: false,
//         message: "Please enter a valid email",
//       });
//     }

//     //validating strong password
//     if (password.length < 8) {
//       return res.json({
//         success: false,
//         message: "Please enter a strong password",
//       });
//     }

//     //check user existed
//     const existedUser = await doctorModel.findOne({
//       $or: [{ name }, { email }],
//     });

//     if (existedUser) {
//       return res.status(409).json({
//         success: false,
//         message: "Docter with email already exists",
//       });
//     }

//     // hashing doctor password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // upload image cloudinary

//     const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
//       resource_type: "image",
//     });

//     const imageUrl = imageUpload.secure_url;

//     const doctorData = {
//       name,
//       email,
//       image: imageUrl,
//       password: hashedPassword,
//       speciality,
//       degree,
//       experience,
//       about,
//       fees,
//       address: JSON.parse(address),
//       date: Date.now(),
//     };

//     const newDoctor = new doctorModel(doctorData);

//     await newDoctor.save();
//     res.json({
//       success: true,
//       message: "doctor added",
//     });
//   } catch (error) {
//     console.log("error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API for admin login
// // const loginAdmin = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     if (
// //       email === process.env.ADMIN_EMAIL &&
// //       password === process.env.ADMIN_PASSWORD
// //     ) {
// //       const token = jwt.sign(email + password, process.env.JWT_SECRET);
// //       res.json({ success: true, token });
// //     } else {
// //       res.json({ success: false, message: "Invalid credential" });
// //     }
// //   } catch (error) {
// //     console.log("error:", error);
// //     res.json({ success: false, message: error.message });
// //   }
// // };
// const loginAdmin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (
//       email === process.env.ADMIN_EMAIL &&
//       password === process.env.ADMIN_PASSWORD
//     ) {
//       const token = jwt.sign(
//         { email: process.env.ADMIN_EMAIL, role: "admin" },
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//       );

//       return res.json({ success: true, token });
//     } else {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
//   } catch (error) {
//     console.log("error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Api for get all doctors list
// const allDoctors = async (req, res) => {
//   try {
//     const doctors = await doctorModel.find({}).select("-password");
//     res.json({ success: true, doctors });
//   } catch (error) {
//     console.log("error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };


// // API to get all appointments list
// const appointmentsAdmin = async (req, res) => {
//   try {
//     const appointments = await appointmentModel.find({});
//     res.json({ success: true, appointments });
//   } catch (error) {
//     console.log("error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API for  appointment cancel

// const appointmentCancel = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;
//     const appointmentData = await appointmentModel.findById(appointmentId);

//     await appointmentModel.findByIdAndUpdate(appointmentId, {
//       cancelled: true,
//     });

//     // releaseing doctor slot
//     const { docId, slotDate, slotTime } = appointmentData;

//     const doctorData = await doctorModel.findById(docId);

//     let slots_booked = doctorData.slots_booked;
//     slots_booked[slotDate] = slots_booked[slotDate].filter(
//       (e) => e !== slotTime
//     );

//     await doctorModel.findByIdAndUpdate(docId, { slots_booked });

//     res.json({ success: true, message: "Appointment Cancelled" });
//   } catch (error) {
//     console.log("error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };

// //API to get dashboard data for admin panel

// const adminDashboard = async (req, res) => {
//   try {
//     const doctors = await doctorModel.find({});
//     const users = await userModel.find({});
//     const appointments = await appointmentModel.find({});

//     const dashData = {
//       doctors: doctors.length,
//       appointments: appointments.length,
//       users: users.length,
//       latestAppointments: appointments.reverse().slice(0, 5),
//     };

//     res.json({ success: true, dashData });
//   } catch (error) {
//     console.log("error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };
// export {
//   addDoctor,
//   loginAdmin,
//   allDoctors,
//   appointmentsAdmin,
//   appointmentCancel,
//   adminDashboard,
// };
import validator from "validator";
import bcrypt from "bcrypt";
// import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// ✅ API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      // image,
    } = req.body;

    const imageFile = req.file;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid Email Format" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password too short" });
    }

    // ✅ Check if doctor already exists
    const existedUser = await doctorModel.findOne({ $or: [{ name }, { email }] });
    if (existedUser) {
      return res
        .status(409)
        .json({ success: false, message: "Doctor with email already exists" });
    }

    // ✅ Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //image upload
    const imageUrl = `http://localhost:5174/public/${imageFile.filename}`;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    return res.json({ success: true, message: "Doctor Added Successfully" });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email: process.env.ADMIN_EMAIL, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({ success: true, token });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Doctors (without password)
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get All Appointments
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Cancel Appointment
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Release slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Admin Dashboard Data
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const latestAppointments = appointments
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      users: users.length,
      latestAppointments,
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};
