"use client";

import { useState, useEffect } from "react";

export default function AssignedReportsPage() {
  // const backendUrl ="https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
  const backendUrl = "http://localhost:8080/api"; //test link
  const sastoken =
    "?sv=2024-11-04&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2027-07-16T22:11:38Z&st=2025-07-16T13:56:38Z&spr=https,http&sig=5xb1czmfngshEckXBdlhtw%2BVe%2B5htYpCnXyhPw9tnHk%3D";

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

  // Cleanup object URLs on photos change/unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo));
    };
  }, [photos]);

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

  const filteredReports = reports.filter((r) => {
    const status = (r.status || "").toUpperCase();
    return (
      (r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      status !== "COMPLETED"
    );
  });

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
                  <p>
                    <strong>Description:</strong> {selectedReport.description}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedReport.category}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedReport.customLocation}
                  </p>
                  <p>
                    <strong>Reported By:</strong>{" "}
                    {selectedReport.reportedBy?.username}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        selectedReport.status === "COMPLETED"
                          ? "text-green-600"
                          : selectedReport.status === "IN PROGRESS"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedReport.status}
                    </span>
                  </p>
                  <p>
                    <strong>Reported At:</strong>{" "}
                    {new Date(selectedReport.createdAt).toLocaleString(
                      "en-GB",
                      { timeZone: "Asia/Bangkok" }
                    )}
                  </p>

                  {selectedReport.photoUrls?.length > 0 && (
                    <div className="mt-3">
                      <strong>Photos:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedReport.photoUrls.map((photo, i) => (
                          <img
                            key={i}
                            src={`${photo}${sastoken}`}
                            alt={`Photo ${i + 1}`}
                            className="w-40 h-40 object-cover rounded border shadow cursor-pointer"
                            onClick={() => window.open(`${photo}${sastoken}`, "_blank")}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <hr className="my-4" />
                  <h3 className="font-semibold mb-2">Update History</h3>
                  {updates.length === 0 && <p>No updates found.</p>}
                  {updates.map((update) => (
                    <div
                      key={update.id}
                      className="border p-2 rounded mb-2 bg-gray-50"
                    >
                      <p>
                        <strong>Comment:</strong> {update.comment}
                      </p>
                      <p>
                        <strong>Status:</strong> {update.status}
                      </p>
                      <p>
                        <strong>Updated At:</strong>{" "}
                        {new Date(update.updateTime).toLocaleString("en-GB", {
                          timeZone: "Asia/Bangkok",
                        })}
                      </p>
                      {update.photoUrls?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {update.photoUrls.map((photo, i) => (
                            <img
                              key={i}
                              src={`${photo}${sastoken}`}
                              alt={`Update photo ${i + 1}`}
                              className="w-20 h-20 object-cover rounded border shadow cursor-pointer"
                              onClick={() =>
                                window.open(`${photo}${sastoken}`, "_blank")
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : modalType === "update" ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Update Report</h2>
                  <label className="block mb-1 font-semibold">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mb-4 w-full border rounded px-3 py-2"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <label className="block mb-1 font-semibold">Comments</label>
                  <textarea
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="mb-4 w-full border rounded px-3 py-2"
                  />

                  <label className="block mb-2 font-semibold">Attach Photos</label>
                  <input type="file" multiple onChange={handlePhotoUpload} />

                  {/* Photo previews with remove and click to open */}
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {photos.map((photo, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-20 rounded overflow-hidden border shadow cursor-pointer"
                        >
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={photo.name}
                            className="object-cover w-full h-full"
                            onClick={() => window.open(URL.createObjectURL(photo), "_blank")}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPhotos((prev) => prev.filter((_, index) => index !== i))
                            }
                            className="absolute top-0 right-0 bg-black bg-opacity-50 text-white px-1 text-xs rounded-bl hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end mt-6 gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
