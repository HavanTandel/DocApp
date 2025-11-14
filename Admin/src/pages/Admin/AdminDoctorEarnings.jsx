// src/pages/AdminDoctorEarnings.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const AdminDoctorEarnings = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(""); // empty = all doctors
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load doctor list once (admin backend: /api/admin/all-doctors)
    const loadDoctors = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
          headers: { aToken },
        });
        if (data.success) setDoctors(data.doctors || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load doctors");
      }
    };
    loadDoctors();
  }, [backendUrl, aToken]);

  const fetchJson = async () => {
    if (!from || !to) return toast.error("Select from and to");
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/doctor-earnings`, {
        params: { doctorId, from, to, format: "json" },
        headers: { aToken },
      });
      setLoading(false);
      if (data.success) {
        console.log("Earnings:", data.data);
        toast.success("Fetched data — check console");
      } else {
        toast.error(data.message || "No data");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Error fetching data");
    }
  };

  const downloadPdf = async () => {
    if (!from || !to) return toast.error("Select dates");
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/admin/doctor-earnings`, {
        params: { doctorId, from, to, format: "pdf" },
        headers: { aToken },
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `doctor_earnings_${from}_${to}.pdf`;
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setLoading(false);
      toast.success("PDF downloaded");
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="container mt-4">
      <h4>Doctor Earnings (Date-wise)</h4>

      <div className="row g-2 align-items-end">
        <div className="col-auto">
          <label>Doctor</label>
          <select className="form-select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
            <option value="">All Doctors</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.speciality}</option>)}
          </select>
        </div>

        <div className="col-auto">
          <label>From</label>
          <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} />
        </div>

        <div className="col-auto">
          <label>To</label>
          <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} />
        </div>

        <div className="col-auto">
          <button className="btn btn-primary" onClick={fetchJson} disabled={loading}>Fetch</button>
          <button className="btn btn-secondary ms-2" onClick={downloadPdf} disabled={loading}>Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctorEarnings;
