"use client";

import { useState, useEffect } from "react";

export default function AssignedReportsPage() {
  const backendUrl =
    "https://aufondue-webtest.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
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

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  const UpdateFeedback = ({ message, onClose }) => {
    if (!message) return null;

    const getStyles = () => {
      switch (message.type) {
        case "success":
          return "bg-green-100 border-green-400 text-green-700";
        case "warning":
          return "bg-yellow-100 border-yellow-400 text-yellow-700";
        case "error":
          return "bg-red-100 border-red-400 text-red-700";
        default:
          return "bg-blue-100 border-blue-400 text-blue-700";
      }
    };

    return (
      <div
        className={`border px-4 py-3 rounded mb-4 relative ${getStyles()}`}
        role="alert"
      >
        <div className="flex justify-between items-center">
          <span className="block sm:inline">{message.text}</span>
          <button
            className="text-current hover:text-gray-600 ml-4 text-xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  const handleOpenModal = (report, type) => {
    setSelectedReport(report);
    setModalType(type);
    setStatus(report.status);
    setComments("");
    setPhotos([]);
    setUpdateMessage(null);
    setIsModalOpen(true);
    if (type === "details") fetchUpdates(report.id);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
  };

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
    formData.append("updatedBy", "admin@au.edu");

    photos.forEach((photo) => formData.append("photos", photo));

    try {
      setIsUpdating(true);
      setUpdateMessage(null);

      const response = await fetch(`${backendUrl}/issues/updates`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed: ${response.status} - ${errorDetails}`);
      }

      const result = await response.json();

      let message = "Report updated successfully";
      if (result.notificationSent) {
        message += ". 📱 Push notification sent to user.";
      } else if (result.notificationError) {
        message += `. ⚠️ Warning: Notification failed - ${result.notificationError}`;
      }

      setUpdateMessage({
        type: result.notificationSent ? "success" : "warning",
        text: message,
      });

      setStatus("PENDING");
      setComments("");
      setPhotos([]);
      setIsModalOpen(false);
      fetchReports();

      setTimeout(() => setUpdateMessage(null), 5000);
    } catch (error) {
      console.error("Error updating report:", error);
      setUpdateMessage({
        type: "error",
        text: `Failed to update the report: ${error.message}`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchUpdates = async (issueId) => {
    try {
      const response = await fetch(`${backendUrl}/issues/${issueId}/updates`);
      if (!response.ok) throw new Error("Failed to fetch updates");
      const data = await response.json();
      setUpdates(data);
    } catch (error) {
      console.error("Error fetching updates:", error);
    }
  };

  const fetchReports = () => {
    fetch(`${backendUrl}/issues/assigned`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          console.error("Expected array but got:", data);
          setReports([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
        setReports([]);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter out COMPLETED reports and apply search
  const filteredReports = reports
    .filter(
      (report) =>
        report.status !== "COMPLETED" &&
        (
          report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.reportedBy?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

  // Group remaining reports by category
  const groupedReports = filteredReports.reduce((groups, report) => {
    if (!groups[report.category]) groups[report.category] = [];
    groups[report.category].push(report);
    return groups;
  }, {});

  return (
    <div className="flex-1 p-6">
      {updateMessage && (
        <UpdateFeedback
          message={updateMessage}
          onClose={() => setUpdateMessage(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6">Assigned Reports</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {Object.keys(groupedReports).length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No assigned reports found.</p>
        </div>
      ) : (
        Object.entries(groupedReports).map(([category, reports]) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {report.description?.substring(0, 50)}...
                    </h3>
                    <div className="flex flex-col items-start gap-1">
                      {/* Status */}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === "IN PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {report.status}
                      </span>
                      {/* Priority */}
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          report.priority === "URGENT"
                            ? "bg-red-600 text-white"
                            : report.priority === "NORMAL"
                            ? "bg-yellow-500 text-white"
                            : "bg-green-600 text-white"
                        }`}
                      >
                        {report.priority || "NORMAL"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>
                      <strong>Location:</strong> {report.customLocation}
                    </p>
                    <p>
                      <strong>Reported By:</strong> {report.reportedBy?.username}
                    </p>
                    <p>
                      <strong>Assigned To:</strong> {report.assignedTo?.name}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {report.photoUrls?.length > 0 && (
                    <div className="mb-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {report.photoUrls.slice(0, 3).map((photo, i) => (
                          <img
                            key={i}
                            src={`${photo}${sastoken}`}
                            alt={`Photo ${i + 1}`}
                            className="w-16 h-16 object-cover rounded border flex-shrink-0 cursor-pointer hover:opacity-75"
                            onClick={() =>
                              window.open(`${photo}${sastoken}`, "_blank")
                            }
                          />
                        ))}
                        {report.photoUrls.length > 3 && (
                          <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                            +{report.photoUrls.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(report, "update")}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleOpenModal(report, "details")}
                      className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal with Update & Details */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {modalType === "update" ? "Update Report" : "Report Details"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {modalType === "update" ? (
                <>
                  {/* Update Modal */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments
                      </label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add your comments..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Photos (Optional)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                                onClick={() =>
                                  window.open(URL.createObjectURL(photo), "_blank")
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                                }
                                className="absolute top-0 right-0 bg-black bg-opacity-50 text-white px-1 text-xs rounded-bl hover:bg-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className={`flex-1 px-4 py-2 rounded text-white transition-colors ${
                        isUpdating
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {isUpdating ? "Updating..." : "Update Report"}
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Details Modal */}
                  <div className="space-y-3">
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
                      <strong>Reported By:</strong> {selectedReport.reportedBy?.username}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedReport.status}
                    </p>
                    <p>
                      <strong>Priority:</strong> {selectedReport.priority || "NORMAL"}
                    </p>
                    <p>
                      <strong>Assigned To:</strong> {selectedReport.assignedTo?.name}
                    </p>
                    <p>
                      <strong>Reported At:</strong>{" "}
                      {new Date(selectedReport.createdAt).toLocaleString("en-GB", {
                        timeZone: "Asia/Bangkok",
                      })}
                    </p>
                  </div>

                  {selectedReport.photoUrls?.length > 0 && (
                    <div className="mt-4">
                      <strong>Photos:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedReport.photoUrls.map((photo, i) => (
                          <img
                            key={i}
                            src={`${photo}${sastoken}`}
                            alt={`Photo ${i + 1}`}
                            className="w-40 h-40 object-cover rounded border shadow cursor-pointer hover:opacity-75"
                            onClick={() =>
                              window.open(`${photo}${sastoken}`, "_blank")
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show update history */}
                  <hr className="my-4" />
                  <h3 className="font-semibold mb-2">Update History</h3>
                  {updates.length === 0 ? (
                    <p className="text-gray-500">No updates yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {updates.map((update) => (
                        <div key={update.id} className="border p-3 rounded bg-gray-50">
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
                            <div className="mt-2 flex gap-2">
                              {update.photoUrls.map((photo, i) => (
                                <img
                                  key={i}
                                  src={`${photo}${sastoken}`}
                                  alt={`Update Photo ${i + 1}`}
                                  className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                                  onClick={() =>
                                    window.open(`${photo}${sastoken}`, "_blank")
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
