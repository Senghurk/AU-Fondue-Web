"use client";

import { useState, useEffect } from "react";

export default function AssignedReportsPage() {
  const backendUrl = "https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
  const sastoken = "?sp=r&st=2025-03-12T12:14:46Z&se=2026-03-31T20:14:46Z&spr=https&sv=2022-11-02&sr=c&sig=j4Mc241rEaPiBzNQ1qPFwwHEamVp83OERRYmBj1Tums%3D";
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

    if (type === "details") {
      fetchUpdates(report.id);
    }
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
    (r) =>
      (r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      r.status !== "COMPLETED"
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
          <div className="grid grid-cols-3 gap-4">
            {reports.map((r) => (
              <div key={r.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <h2 className="text-lg font-semibold mb-2">{r.description}</h2>
                <p className="text-sm text-gray-600">Category: {r.category}</p>
                <p className="text-sm mt-1">
                  Status:{" "}
                  <span className={`font-semibold ${r.status === "COMPLETED" ? "text-green-600" : r.status === "IN PROGRESS" ? "text-blue-600" : "text-red-600"}`}>
                    {r.status}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">Assigned To: {r.assignedTo?.name}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleOpenModal(r, "details")} className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                    Details
                  </button>
                  <button onClick={() => handleOpenModal(r, "update")} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-1/3 h-4/5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100% - 20px)" }}>
              {modalType === "details" ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Report Details</h2>
                  <p><strong>Description:</strong> {selectedReport.description}</p>
                  <p><strong>Category:</strong> {selectedReport.category}</p>
                  <p><strong>Location:</strong> {selectedReport.customLocation}</p>
                  <p><strong>Reported By:</strong> {selectedReport.reportedBy?.username}</p>
                  {selectedReport.photoUrls?.length > 0 ? (
                    <div className="mt-3">
                      <strong>Photos:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedReport.photoUrls.map((photo, i) => (
                          <img
                            key={i}
                            src={`${photo}${sastoken}`}
                            alt={`Photo ${i + 1}`}
                            className="w-60 h-60 object-cover rounded border shadow"
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2"><strong>Report Photo:</strong> No photos</p>
                  )}
                  <p><strong>Reported Date:</strong> {new Date(selectedReport.createdAt).toLocaleString("en-US", { timeZone: "Asia/Bangkok" })}</p>
                  <p><strong>Status:</strong> <span className={`font-semibold ${selectedReport.status === "COMPLETED" ? "text-green-600" : selectedReport.status === "IN PROGRESS" ? "text-blue-600" : "text-red-600"}`}>{selectedReport.status}</span></p>
                  <h4 className="text-lg font-semibold mt-4 mb-2">Update Details</h4>
                  {updates.length > 0 ? (
                    updates.map((u, idx) => (
                      <div key={idx} className="bg-gray-100 p-4 rounded mb-2">
                        <p className="text-sm"><strong>Status:</strong> {u.status}</p>
                        <p className="text-sm"><strong>Comment:</strong> {u.comment || "No comments"}</p>
                        <p className="text-xs text-gray-500">{new Date(u.update_time).toLocaleString("en-US", { timeZone: "Asia/Bangkok" })}</p>
                        {u.photoUrls?.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {u.photoUrls.map((photo, i) => (
                              <img
                                key={i}
                                src={photo + sastoken}
                                alt={`Update Photo ${i + 1}`}
                                className="w-28 h-28 object-cover rounded border"
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No update photos</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No updates available.</p>
                  )}
                  <div className="flex justify-end mt-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm">
                      Close
                    </button>
                  </div>
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
                      {photos.map((photo, index) => (
                        <li key={index}>{photo.name}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm">
                      Cancel
                    </button>
                    <button onClick={handleUpdate} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                      Update
                    </button>
                  </div>
                </>
              )}
            </div>
            <style>{`
              .flex-1::-webkit-scrollbar {
                width: 6px;
              }
              .flex-1::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
              }
              .flex-1::-webkit-scrollbar-track {
                background: transparent;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
