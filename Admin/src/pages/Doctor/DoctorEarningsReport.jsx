// src/pages/DoctorEarningsReport.jsx
import { useState, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../../context/DontorContext";
import { toast } from "react-toastify";

const DoctorEarningsReport = () => {
  const { backendUrl, dToken, profileData } = useContext(DoctorContext);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const doctorId = profileData?._id; // auto use logged-in doctor’s ID

  const fetchJson = async () => {
    if (!from || !to) return toast.error("Select date range");
    if (!doctorId) return toast.error("Doctor not loaded");

    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/doctor-earnings`, {
        params: { doctorId, from, to, format: "json" },
        headers: { dToken }, // use doctor token instead of admin token
      });
      setLoading(false);
      if (data.success && data.data.length) {
        console.log("Doctor Earnings:", data.data);
        toast.success("Report data fetched — check console");
      } else {
        toast.warn("No earnings found in this range");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Error fetching report");
    }
  };

  const downloadPdf = async () => {
    if (!from || !to) return toast.error("Select date range");
    if (!doctorId) return toast.error("Doctor not loaded");

    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/admin/doctor-earnings`, {
        params: { doctorId, from, to, format: "pdf" },
        headers: { dToken },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `earnings_${profileData?.name || "doctor"}_${from}_${to}.pdf`;
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h4>Doctor Earnings Report</h4>

      <p className="text-muted">
        Doctor: <strong>{profileData?.name}</strong>
        {profileData?.speciality ? ` (${profileData.speciality})` : ""}
      </p>

      <div className="row g-2 align-items-end">
        <div className="col-auto">
          <label>From</label>
          <input
            type="date"
            className="form-control"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="col-auto">
          <label>To</label>
          <input
            type="date"
            className="form-control"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={fetchJson}
            disabled={loading}
          >
            Fetch Report
          </button>
          <button
            className="btn btn-secondary ms-2"
            onClick={downloadPdf}
            disabled={loading}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorEarningsReport;
