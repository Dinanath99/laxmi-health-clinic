import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Edit2,
  Trash2,
  X,
  ClipboardList,
  Phone,
  MapPin,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../api";
import NepaliDate from "nepali-datetime";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 25;

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    address: "",
    diagnosis: "",
    chiefComplaints: "",
    pastMedicalHistory: "",
    bp: "",
    pulse: "",
    investigation: "",
    temp: "",
    spo2: "",
    weight: "",
    pilccod: "",
    cns: "",
    cvs: "",
    rs: "",
    pa: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "Male",
      phone: "",
      address: "",
      diagnosis: "",
      chiefComplaints: "",
      pastMedicalHistory: "",
      bp: "",
      pulse: "",
      investigation: "",
      temp: "",
      spo2: "",
      weight: "",
      pilccod: "",
      cns: "",
      cvs: "",
      rs: "",
      pa: "",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (p) => {
    setFormData({
      name: p.name || "",
      age: p.age || "",
      gender: p.gender || "Male",
      phone: p.phone || "",
      address: p.address || "",
      diagnosis: p.diagnosis || "",
      chiefComplaints: p.chiefComplaints || "",
      pastMedicalHistory: p.pastMedicalHistory || "",
      bp: p.bp || "",
      pulse: p.pulse || "",
      investigation: p.investigation || "",
      temp: p.temp || "",
      spo2: p.spo2 || "",
      weight: p.weight || "",
      pilccod: p.pilccod || "",
      cns: p.cns || "",
      cvs: p.cvs || "",
      rs: p.rs || "",
      pa: p.pa || "",
    });
    setEditingId(p._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this patient record?")
    ) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (err) {
        alert("Failed deleting patient record");
      }
    }
  };

  const handleSave = async (shouldPrint = false) => {
    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, formData);
      } else {
        await api.post("/patients", formData);
      }
      fetchPatients();
      if (shouldPrint) {
        window.print();
      } else {
        resetForm();
      }
    } catch (err) {
      alert("Failed saving patient data.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleSave(false);
  };

  const handleSaveAndPrint = (e) => {
    e.preventDefault();
    handleSave(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleKeyDown = (e) => {
    if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) return;

    // Allow default behavior for textareas
    if (
      e.target.tagName === "TEXTAREA" &&
      (e.key === "Enter" || e.key === "ArrowUp" || e.key === "ArrowDown")
    )
      return;

    // Allow default behavior for select dropdown options
    if (
      e.target.tagName === "SELECT" &&
      (e.key === "ArrowUp" || e.key === "ArrowDown")
    )
      return;

    // Allow Enter key to normally trigger buttons
    if (e.target.tagName === "BUTTON" && e.key === "Enter") return;

    const formElements = Array.from(
      e.currentTarget.querySelectorAll("input, select, textarea, button"),
    );
    const focusableElements = formElements.filter((el) => !el.disabled);

    const currentIndex = focusableElements.indexOf(e.target);
    if (currentIndex === -1) return;

    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % focusableElements.length;
      focusableElements[nextIndex].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex =
        (currentIndex - 1 + focusableElements.length) %
        focusableElements.length;
      focusableElements[prevIndex].focus();
    }
  };

  // Get current Date Time in the format shown typically
  const currentDateTime = new NepaliDate().format("YYYY-MM-DD");

  // Compute bill number
  const computedBillNo = editingId
    ? patients.findIndex((p) => p._id === editingId) + 1
    : patients.length + 1;

  // Pagination logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(
    indexOfFirstPatient,
    indexOfLastPatient,
  );
  const totalPages = Math.ceil(patients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-full relative z-10">
      <div className="print:hidden flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Patient Directory
          </h1>
          <p className="text-slate-500 mt-1">
            Register new patients, manage medical records, and print clinic
            forms.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition"
        >
          <UserPlus size={18} /> Patient Record
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm print:backdrop-blur-none print:static print:bg-transparent print:p-0 print:block print:m-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6 md:p-10 print-area print:max-h-none print:shadow-none print:w-full print:max-w-none print:overflow-visible">
            {/* Modal Actions */}
            <div className="absolute top-4 right-4 flex gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 p-2.5 rounded-full transition shadow-sm"
                title="Print Record Form"
              >
                <Printer size={20} />
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2.5 rounded-full transition shadow-sm"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Container */}
            <form
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="h-full flex flex-col font-serif text-slate-800"
            >
              {/* Header section matching image */}
              <div className="flex justify-between items-start text-xs font-bold mb-3 border-b-2 border-red-500 pb-4">
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex w-full justify-between items-center">
                    <span>Reg.No :- 13425/413/750/32</span>
                    <span className="italic font-bold">
                      " Dedicated Towards Your Health "
                    </span>
                  </div>

                  <div className="relative mt-2 mb-1 flex items-center justify-center w-full min-h-[5rem]">
                    <div className="absolute left-0">
                      <img
                        src="/crest-logo.png"
                        alt="Shree Laxmi Health Clinic Crest"
                        className="h-16 w-16 md:h-20 md:w-20 object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <h1 className="text-[28px] md:text-3xl font-extrabold uppercase tracking-wide mb-1 leading-none text-slate-900">
                        SHREE LAXMI HEALTH CLINIC
                      </h1>
                      <p className="text-[15px] font-extrabold tracking-tight text-slate-800">
                        Garuda Nagarpalika'5 Shivnagar Rautahat'Nepal
                      </p>
                    </div>
                  </div>

                  {/* PAN No */}
                  <div className="flex justify-center mb-2 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm md:text-base text-slate-900">
                        PAN No:-
                      </span>
                      <div className="flex">
                        {"125084804".split("").map((digit, idx) => (
                          <div
                            key={idx}
                            className="w-5 h-6 md:w-6 md:h-7 border-[1.5px] border-slate-800 print:border-black flex items-center justify-center font-bold text-sm md:text-base text-slate-900"
                          >
                            {digit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Linear fields grouped tightly */}
                  <div className="flex flex-col space-y-3 mt-4 text-sm md:text-[15px] font-bold">
                    {/* Patient's Name/Age/Sex */}
                    <div className="flex items-end gap-1 w-full flex-wrap">
                      <span>Patient's Name/Age/Sex:-</span>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="flex-[3] min-w-[200px] border-b-[1.5px] border-dotted border-slate-800 focus:outline-none focus:border-blue-600 bg-transparent px-1 pb-1 text-blue-900 placeholder-slate-300 transition-colors"
                        placeholder="Full Name"
                        required
                      />
                      <span>/</span>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        className="flex-1 min-w-[50px] max-w-[80px] border-b-[1.5px] border-dotted border-slate-800 focus:outline-none focus:border-blue-600 bg-transparent px-1 pb-1 text-center text-blue-900 placeholder-slate-300 transition-colors"
                        placeholder="Age"
                      />
                      <span>/</span>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="flex-1 min-w-[80px] max-w-[100px] border-b-[1.5px] border-dotted border-slate-800 focus:outline-none focus:border-blue-600 bg-transparent px-1 pb-1 text-blue-900 cursor-pointer transition-colors appearance-none outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Address & Date/Time */}
                    <div className="flex items-start gap-1 w-full justify-between mt-2 flex-wrap text-sm md:text-[15px]">
                      <div className="flex items-end gap-1 flex-[2] min-w-[300px] pt-2">
                        <span>Address:-</span>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          className="flex-1 border-b-[1.5px] border-dotted border-slate-800 focus:outline-none focus:border-blue-600 bg-transparent px-1 pb-1 text-blue-900 placeholder-slate-300 transition-colors"
                          placeholder="Address Details"
                        />
                      </div>
                      <div className="flex flex-col gap-2 flex-1 min-w-[200px] md:pl-4">
                        <div className="flex items-end gap-1 w-full mt-2 md:mt-0">
                          <span>Date/Time:</span>
                          <div className="flex-1 border-b-[1.5px] border-dotted border-slate-800 bg-transparent px-1 pb-1 text-blue-900 text-center font-mono text-sm">
                            {currentDateTime}
                          </div>
                        </div>
                        <div className="flex items-end gap-1 w-full">
                          <span>Bill No:-</span>
                          <div className="w-16 border-b-[1.5px] border-dotted border-slate-800 bg-transparent px-1 pb-1 text-blue-900 text-center font-mono text-sm h-6">
                            {computedBillNo}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-1.5 bg-red-500 rounded-sm mb-6 print:hidden hidden"></div>

              {/* Invoice Section for Printing */}
              <div className="mt-4 flex flex-col w-full border-[1.5px] border-slate-800 print:border-black flex-1 min-h-[500px] text-slate-900">
                {/* Table Header */}
                <div className="flex border-b-[1.5px] border-slate-800 print:border-black font-bold text-center text-sm md:text-base">
                  <div className="w-12 md:w-16 border-r-[1.5px] border-slate-800 print:border-black py-2">
                    S.N.
                  </div>
                  <div className="flex-1 border-r-[1.5px] border-slate-800 print:border-black py-2 text-left pl-4">
                    Particular
                  </div>
                  <div className="w-24 md:w-32 border-r-[1.5px] border-slate-800 print:border-black py-2">
                    Rate
                  </div>
                  <div className="w-24 md:w-32 py-2">Total</div>
                </div>

                {/* Empty Rows Space */}
                <div className="flex-1 flex w-full relative min-h-[400px]">
                  <div className="w-12 md:w-16 border-r-[1.5px] border-slate-800 print:border-black"></div>
                  <div className="flex-1 border-r-[1.5px] border-slate-800 print:border-black"></div>
                  <div className="w-24 md:w-32 border-r-[1.5px] border-slate-800 print:border-black"></div>
                  <div className="w-24 md:w-32"></div>
                </div>

                {/* Total Row */}
                <div className="flex border-t-[1.5px] border-slate-800 print:border-black font-bold text-center h-10 items-center">
                  <div className="w-12 md:w-16 border-r-[1.5px] border-slate-800 print:border-black h-full"></div>
                  <div className="flex-1 border-r-[1.5px] border-slate-800 print:border-black h-full text-right pr-4 py-1.5 uppercase font-black">
                    Total
                  </div>
                  <div className="w-24 md:w-32 border-r-[1.5px] border-slate-800 print:border-black h-full"></div>
                  <div className="w-24 md:w-32 h-full"></div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-4 flex justify-between items-end text-sm md:text-base font-bold pb-2 text-slate-900 mb-8 min-h-[60px]">
                <div className="flex items-end gap-2 flex-[2]">
                  <span className="whitespace-nowrap">Amount in words:-</span>
                  <input
                    type="text"
                    className="w-full max-w-[400px] border-b-[1.5px] border-dotted border-slate-800 print:border-black mb-1 h-6 bg-transparent border-t-0 border-l-0 border-r-0 focus:outline-none focus:border-blue-500 rounded-none text-sm text-slate-900 px-2"
                    placeholder="e.g. Fifty Thousands Only"
                  />
                </div>
                <div className="flex items-end gap-2 flex-1 justify-end mt-8 sm:mt-0">
                  <span className="whitespace-nowrap"> Sign:</span>
                  <input
                    type="text"
                    className="w-40 border-b-[1.5px] border-dotted border-slate-800 print:border-black mb-1 h-6 bg-transparent border-t-0 border-l-0 border-r-0 focus:outline-none focus:border-blue-500 rounded-none text-sm text-center text-slate-900"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Submit action */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4 print:hidden flex-col md:flex-row">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-8 rounded-xl transition"
                >
                  {editingId ? "Update Record" : "Save Only"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-xl transition shadow-lg shadow-blue-200"
                >
                  {editingId ? "Update & Print Record" : "Save & Print Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="print:hidden bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                Reg Code
              </th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                Full Name
              </th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                Age & Sex
              </th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                Vitals/Complaints
              </th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                Registered On
              </th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
            {patients.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-12 text-center text-slate-400 font-semibold tracking-wide"
                >
                  No patients registered. Add one above!
                </td>
              </tr>
            ) : (
              currentPatients.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400">
                    PAT-{p._id.substring(18).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-800">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {p.age ? `${p.age} yrs` : "N/A"},{" "}
                    <span
                      className={
                        p.gender === "Female"
                          ? "text-rose-500"
                          : "text-blue-500"
                      }
                    >
                      {p.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-normal max-w-xs">
                    <div className="flex flex-col gap-1 text-xs">
                      {p.bp && (
                        <div className="text-slate-500">
                          <span className="font-bold">BP:</span> {p.bp}
                        </div>
                      )}
                      {p.chiefComplaints && (
                        <div className="text-slate-400 italic line-clamp-1">
                          {p.chiefComplaints}
                        </div>
                      )}
                      {!p.bp && !p.chiefComplaints && (
                        <span className="text-slate-400 italic">
                          No initial data
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                    {new NepaliDate(new Date(p.createdAt)).format("YYYY-MM-DD")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          handleEdit(p);
                          setTimeout(() => window.print(), 200);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1.5 px-3 font-semibold text-xs rounded-lg transition border border-transparent hover:border-emerald-200"
                        title="Print Invoice / Record directly"
                      >
                        Print Invoice
                      </button>
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-1.5 px-3 font-semibold text-xs rounded-lg transition border border-transparent hover:border-blue-200"
                        title="View File Details"
                      >
                        View File
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 p-2 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="print:hidden mt-6 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <p className="text-sm font-semibold text-slate-500">
            Showing{" "}
            <span className="text-blue-600 font-extrabold">
              {indexOfFirstPatient + 1}
            </span>{" "}
            to{" "}
            <span className="text-blue-600 font-extrabold">
              {Math.min(indexOfLastPatient, patients.length)}
            </span>{" "}
            of <span className="font-extrabold">{patients.length}</span>{" "}
            patients
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1 flex-wrap justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // To keep it clean if there are many pages, show surrounding pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition flex items-center justify-center ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200 border-none"
                            : "text-slate-500 border border-transparent hover:bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <span key={page} className="px-1 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                },
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
