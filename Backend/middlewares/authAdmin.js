// import jwt from "jsonwebtoken";

// //admin authentication middleware

// const authAdmin = async (req, res, next) => {
//   try {
//     const { atoken } = req.headers;
//     if (!atoken) {
//       return res.json({
//         success: false,
//         message: "Not Authorized Login Again",
//       });
//     }

//     const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

//     if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
//       return res.json({
//         success: false,
//         message: "Not Authorized Login Again",
//       });
//     }

//     next();
//   } catch (error) {
//     console.log("error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };

// export default authAdmin;
import jwt from "jsonwebtoken";

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    const atoken = req.headers.atoken;

    if (!atoken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

    // Check payload
    if (
      token_decode.email !== process.env.ADMIN_EMAIL ||
      token_decode.password !== process.env.ADMIN_PASSWORD
    ) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    next();
  } catch (error) {
    console.log("error:", error);
    return res.json({ success: false, message: "Invalid or expired token" });
  }
};

export default authAdmin;
