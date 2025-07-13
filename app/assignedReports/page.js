"use client";
 
import { useState, useEffect } from "react";
 
export default function AssignedReportsPage() {
  // const backendUrl ="https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
  const backendUrl = "https://aufondue-webtest.kindisland-399ef298.southeastasia.azurecontainerapps.io/api"; //test link
  const sastoken ="?sp=r&st=2025-03-12T12:14:46Z&se=2026-03-31T20:14:46Z&spr=https&sv=2022-11-02&sr=c&sig=j4Mc241rEaPiBzNQ1qPFwwHEamVp83OERRYmBj1Tums%3D";
 
  const [reports, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [status, setStatus] = useState("");
  const [comments, setComments] = useState("");
  const [photos, setPhotos] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
 
 
  const handleOpenModal = (report, type) => {
    setSelectedReport(report);
    setModalType(type);
    setStatus(report.status);
    setComments("");
    setPhotos([]);
    setIsModalOpen(true);
    if (type === "details") fetchUpdates(report.id);
  };
 
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
  };
 
  const handleUpdate = async () => {
    if (!selectedReport) return;
 
    const formData = new FormData();
    formData.append("issueId", selectedReport.id);
    formData.append("status", status);
    formData.append("comment", comments);
    photos.forEach((photo) => formData.append("photos", photo));
 
    try {
      const response = await fetch(`${backendUrl}/issues/updates`, {
        method: "POST",
        body: formData,
      });
 
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed: ${response.status} - ${errorDetails}`);
      }
 
      alert("Report updated successfully.");
      setIsModalOpen(false);
      fetchReports();
    } catch (error) {
      console.error("Update error:", error);
      alert(`Error: ${error.message}`);
    }
  };
 
  const fetchUpdates = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/issues/${id}/updates`);
      if (!res.ok) throw new Error("Update fetch failed");
      setUpdates(await res.json());
    } catch (err) {
      console.error("Update fetch error:", err);
    }
  };
 
  const fetchReports = () => {
    fetch(`${backendUrl}/issues/assigned`)
      .then((res) => res.json())
      .then(setReports)
      .catch((err) => console.error("Report fetch error:", err));
  };
 
  const filteredReports = reports.filter(   
  (r) => {
    const status = (r.status || "").toUpperCase();
    return (
      (r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
       r.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      status !== "COMPLETED"
    );
  }
);
 
  const groupedReports = filteredReports.reduce((groups, r) => {
    if (!groups[r.category]) groups[r.category] = [];
    groups[r.category].push(r);
    return groups;
  }, {});
 
  useEffect(() => {
    fetchReports();
  }, []);
 
  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assigned Reports</h1>
        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600"
        >
          Refresh
        </button>
      </div>
 
      <input
        type="text"
        placeholder="Search by description or category..."
        className="w-full px-4 py-2 border rounded shadow-sm mb-6"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
 
      {Object.entries(groupedReports).map(([category, reports]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-bold mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => {
              // Normalize priority to uppercase so it matches HIGH / LOW properly
              const priority = r.priority;

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
                >
                  {/* Priority + Title */}
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">{r.description}</h2>
                    <span
                      className={`text-xs px-3 py-1 font-semibold rounded-full ${
                        priority === "HIGH"
                          ? "bg-red-600 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {priority}
                    </span>
                  </div>

                  <p className="text-sm">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        r.status === "COMPLETED"
                          ? "text-green-600"
                          : r.status === "IN PROGRESS"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Assigned To: {r.assignedTo?.name}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleOpenModal(r, "details")}
                      className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleOpenModal(r, "update")}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Update
                    </button>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      ))}
 
      {isModalOpen && selectedReport && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg h-5/6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto">
              {modalType === "details" ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Report Details</h2>
                  <p><strong>Description:</strong> {selectedReport.description}</p>
                  <p><strong>Category:</strong> {selectedReport.category}</p>
                  <p><strong>Location:</strong> {selectedReport.customLocation}</p>
                  <p><strong>Reported By:</strong> {selectedReport.reportedBy?.username}</p>
                  <p><strong>Status:</strong> <span className={`font-semibold ${selectedReport.status === "COMPLETED" ? "text-green-600" : selectedReport.status === "IN PROGRESS" ? "text-blue-600" : "text-red-600"}`}>{selectedReport.status}</span></p>
                  <p><strong>Reported At:</strong> {new Date(selectedReport.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Bangkok" })}</p>
 
                  {selectedReport.photoUrls?.length > 0 && (
                    <div className="mt-3">
                      <strong>Photos:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedReport.photoUrls.map((photo, i) => (
                          <img
                            key={i}
                            src={`${photo}${sastoken}`}
                            alt={`Photo ${i + 1}`}
                            className="w-40 h-40 object-cover rounded border shadow"
                          />
                        ))}
                      </div>
                    </div>
                  )}
 
                  <h4 className="text-lg font-semibold mt-4 mb-2">Update History</h4>
                  {updates.length > 0 ? (
                    updates.map((u, i) => (
                      <div key={i} className="bg-gray-100 p-3 rounded mb-2">
                        <p className="text-sm"><strong>Status:</strong> {u.status}</p>
                        <p className="text-sm"><strong>Comment:</strong> {u.comment || "No comments"}</p>
                        <p className="text-xs text-gray-500">{new Date(u.updateTime).toLocaleString("en-GB", { timeZone: "Asia/Bangkok" })}</p>
                        {u.photoUrls?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {u.photoUrls.map((photo, j) => (
                              <img
                                key={j}
                                src={`${photo}${sastoken}`}
                                alt={`Update Photo ${j + 1}`}
                                className="w-20 h-20 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No updates available.</p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">Update Report</h2>
                  <label className="block mb-2">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full mb-4 p-2 border rounded">
                    <option value="PENDING">PENDING</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
 
                  <label className="block mb-2">Comments</label>
                  <textarea value={comments} onChange={(e) => setComments(e.target.value)} className="w-full mb-4 p-2 border rounded" />
 
                  <label className="block mb-2">Attach Photos</label>
                  <input type="file" multiple onChange={handlePhotoUpload} />
                  {photos.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600">
                      {photos.map((p, i) => (
                        <li key={i}>{p.name}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm">Cancel</button>
              {modalType === "update" && (
                <button onClick={handleUpdate} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Update</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
// 🔄 REPORT CARD COMPONENT
function ReportCard({ report, sastoken, handleOpenModal }) {
  const priority = report.priority || "LOW";
 
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{report.description}</h2>
        <span
          className={`text-xs px-3 py-1 font-semibold rounded-full ${
            priority === "HIGH"
              ? "bg-red-600 text-white"
              : "bg-green-600 text-white"
          }`}
        >
          {priority}
        </span>
      </div>
 
      <p className="text-sm">
        Status:{" "}
        <span
          className={`font-semibold ${
            report.status === "COMPLETED"
              ? "text-green-600"
              : report.status === "IN PROGRESS"
              ? "text-blue-600"
              : "text-red-600"
          }`}
        >
          {report.status}
        </span>
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Assigned To: {report.assignedTo?.name}
      </p>
 
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => handleOpenModal(report, "details")}
          className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Details
        </button>
        <button
          onClick={() => handleOpenModal(report, "update")}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Update
        </button>
      </div>
    </div>
  );
}