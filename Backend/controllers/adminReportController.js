// controllers/adminReportController.js
import PDFDocument from "pdfkit";
import appointmentModel from "../models/appointmentModel.js";
import mongoose from "mongoose";
import fs from "fs";
/**
 * GET /api/admin/doctor-earnings?doctorId=...&from=YYYY-MM-DD&to=YYYY-MM-DD&format=json|pdf
 * Protected with authAdmin
 */
const doctorEarningsReport = async (req, res) => {
  try {
    const { doctorId, from, to, format } = req.query;

    if (!doctorId || !from || !to) {
      return res.status(400).json({ success: false, message: "from and to required (YYYY-MM-DD)" });
    }

    const fromDate = new Date(from + "T00:00:00");
    const toDate = new Date(to + "T23:59:59.999");
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" });
    }
    const fromTs = fromDate.getTime();
    const toTs = toDate.getTime();

   const match = {
  slotDate: { $gte: fromTs, $lte: toTs }, // because slotDate is a string (YYYY-MM-DD)
};

if (doctorId) {
  match.docId = doctorId;
}

// Aggregation pipeline
const pipeline = [
  {
    $addFields: {
      // Convert slotDate like "17_9_2025" → ISO Date object
      slotDateObj: {
        $dateFromString: {
          dateString: {
            $concat: [
              {
                $let: {
                  vars: { parts: { $split: ["$slotDate", "_"] } },
                  in: {
                    $concat: [
                      { $arrayElemAt: ["$$parts", 2] }, "-", // year
                      {
                        $cond: [
                          { $lt: [{ $strLenCP: { $arrayElemAt: ["$$parts", 1] } }, 2] },
                          { $concat: ["0", { $arrayElemAt: ["$$parts", 1] }] },
                          { $arrayElemAt: ["$$parts", 1] }
                        ]
                      },
                      "-",
                      {
                        $cond: [
                          { $lt: [{ $strLenCP: { $arrayElemAt: ["$$parts", 0] } }, 2] },
                          { $concat: ["0", { $arrayElemAt: ["$$parts", 0] }] },
                          { $arrayElemAt: ["$$parts", 0] }
                        ]
                      }
                    ]
                  }
                }
              },
              "T00:00:00Z"
            ]
          }
        }
      },
      earningsAmount: { $ifNull: ["$amount", "$docData.fees"] }
    }
  },
  {
    $match: {
      slotDateObj: {
        $gte: new Date(from + "T00:00:00Z"),
        $lte: new Date(to + "T23:59:59Z")
      },
      ...(doctorId && { docId: doctorId })
    }
  },
  {
    $group: {
      _id: {
        slotDate: "$slotDate",
        docId: "$docId",
        docName: "$docData.name",
        speciality: "$docData.speciality"
      },
      totalEarnings: { $sum: "$earningsAmount" },
      totalAppointments: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      slotDate: "$_id.slotDate",
      docId: "$_id.docId",
      docName: "$_id.docName",
      speciality: "$_id.speciality",
      totalEarnings: 1,
      totalAppointments: 1
    }
  },
  { $sort: { slotDateObj: 1 } }
];


const rows = await appointmentModel.aggregate(pipeline);
console.log("Rows found:", rows);


    // If client requested JSON
    if (format === "json") {
      return res.json({ success: true, data: rows });
    }
    
    // === PDF (format === "pdf") ===
    // Generate a PDF that contains doctor -> dates rows
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const filename = `doctor_earnings_${from}_to_${to}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Header
    doc.fontSize(18).text("Doctor Earnings Report", { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(10).text(`Date range: ${from} → ${to}`, { align: "center" });
    doc.moveDown(0.8);

    // Group rows by docName
    const groupByDoctor = {};
    rows.forEach((r) => {
      const key = `${r.docId}||${r.docName || "Unknown"}`;
      if (!groupByDoctor[key]) groupByDoctor[key] = [];
      groupByDoctor[key].push(r);
    });

    // For each doctor, output a small table
    Object.keys(groupByDoctor).forEach((key, idx) => {
      const [docIdKey, docName] = key.split("||");
      if (idx > 0) doc.addPage();

      doc.fontSize(12).font("Helvetica-Bold").text(`Doctor: ${docName}`, { continued: false });
      const speciality = groupByDoctor[key][0]?.speciality || "";
      if (speciality) doc.fontSize(9).text(`Speciality: ${speciality}`);
      doc.moveDown(0.4);

      // table header
      doc.fontSize(9).font("Helvetica-Bold");
      const tableTop = doc.y;
      doc.text("Date", 50, tableTop);
      doc.text("Total Appointments", 200, tableTop);
      doc.text("Total Earnings", 360, tableTop);
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(10);

      let y = doc.y;
      groupByDoctor[key].forEach((r) => {
        if (y > 740) {
          doc.addPage();
          y = doc.y;
        }
        doc.text(r.slotDate, 50, y);
        doc.text(String(r.totalAppointments), 200, y);
        doc.text(String(r.totalEarnings.toFixed(2)), 360, y);
        y += 18;
        doc.y = y;
      });

      // doctor summary
      const sumEarnings = groupByDoctor[key].reduce((s, it) => s + it.totalEarnings, 0);
      const sumAppointments = groupByDoctor[key].reduce((s, it) => s + it.totalAppointments, 0);
      doc.moveDown(0.6);
      doc.font("Helvetica-Bold").text(`Total appointments: ${sumAppointments}`, { continued: true });
      doc.text(`   Total earnings: ${sumEarnings.toFixed(2)}`, { align: "left" });
    });

    doc.end();
    // stream will finish when doc.end() completes
  } catch (error) {
    console.error("doctorEarningsReport error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
  const sample = await appointmentModel.find().limit(5);
console.log("Sample appointments:", sample.map(a => ({
  slotDate: a.slotDate,
  docId: a.docId,
  amount: a.amount,
  createdAt: a.createdAt
})));
};

export default doctorEarningsReport;
