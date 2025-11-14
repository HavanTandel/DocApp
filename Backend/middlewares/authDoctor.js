// import jwt from "jsonwebtoken";

// //doctor authentication middleware

// const authDoctor = async (req, res, next) => {
//   try {
//     const { dtoken } = req.headers;
//     if (!dtoken) {
//       return res.json({
//         success: false,
//         message: "Not Authorized Login Again",
//       });
//     }

//     const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);

//     req.body.docId = token_decode.id;

//     next();
//   } catch (error) {
//     console.log("error:", error);
//     res.json({ success: false, message: error.message });
//   }
// };

// export default authDoctor;
import jwt from "jsonwebtoken";

const authDoctor = (req, res, next) => {
  try {
    const dtoken = req.headers.dtoken;    // FIX: read header safely

    if (!dtoken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);

    // FIX: req.body may be undefined (GET request)
    if (req.method === "GET") {
      req.query.docId = decoded.id;
    } else {
      req.body.docId = decoded.id;
    }

    req.body.docId = decoded.id;          // FIX: safe assignment

    next();
  } catch (error) {
    console.log("AuthDoctor Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
