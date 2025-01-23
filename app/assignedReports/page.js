"use client";

import { useState } from "react";

export default function AssignedReportsPage() {
  // Mock data for assigned reports
  const assignedReports = [
    {
      id: 1,
      title: "Leaking Pipe in Dorm 3",
      category: "Plumbing",
      assignedTo: "John Doe",
      status: "In Progress",
      description: "A leaking pipe in Dorm 3 needs urgent repair.",
      reportedDate: "2024-12-10",
    },
    {
      id: 2,
      title: "Broken Window in Library",
      category: "Maintenance",
      assignedTo: "Jane Smith",
      status: "Pending",
      description: "A window in the library is broken and needs replacement.",
      reportedDate: "2024-12-11",
    },
    {
      id: 3,
      title: "Flickering Lights in Hallway",
      category: "Electrical",
      assignedTo: "Michael Brown",
      status: "Completed",
      description: "Flickering lights in the main hallway were fixed.",
      reportedDate: "2024-12-09",
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [modalType, setModalType] = useState(""); // "details" or "update"
  const [selectedReport, setSelectedReport] = useState(null); // Current report being viewed or updated
  const [status, setStatus] = useState(""); // Updated status
  const [comments, setComments] = useState(""); // Textbox comments
  const [photos, setPhotos] = useState([]); // Uploaded photos

  // Open the modal with the selected report
  const handleOpenModal = (report, type) => {
    setSelectedReport(report);
    setModalType(type);
    setStatus(report.status); // Pre-fill the status dropdown with the current status
    setComments(""); // Clear any existing comments
    setPhotos([]); // Clear photos
    setIsModalOpen(true);
  };

  // Handle photo uploads
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...files]);
  };

  // Handle update action
  const handleUpdate = () => {
    alert(
      `Report "${selectedReport.title}" updated with status "${status}" and comments: "${comments}".`
    );
    // Here, you can make an API call to save the updated report in the backend
    setIsModalOpen(false); // Close the modal after updating
  };

  return (
    <div className="flex-1 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assigned Reports</h1>
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600">
            Refresh
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {assignedReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
          >
            {/* Report Title */}
            <h2 className="text-lg font-semibold mb-2">{report.title}</h2>
            {/* Category */}
            <p className="text-sm text-gray-600">Category: {report.category}</p>
            {/* Status */}
            <p className="text-sm text-gray-600 mt-1">
              Status:{" "}
              <span
                className={`font-semibold ${
                  report.status === "Completed"
                    ? "text-green-600"
                    : report.status === "In Progress"
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {report.status}
              </span>
            </p>
            {/* Assigned To */}
            <p className="text-sm text-gray-600 mt-1">
              Assigned To: {report.assignedTo}
            </p>
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleOpenModal(report, "details")}
                className="flex-1 px-4 py-2 bg-gray-200 text-sm font-medium rounded hover:bg-gray-300"
              >
                Details
              </button>
              <button
                onClick={() => handleOpenModal(report, "update")}
                className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            {modalType === "details" ? (
              <>
                {/* Details Modal */}
                <h2 className="text-xl font-bold mb-4">Report Details</h2>
                <p className="mb-2">
                  <strong>Description:</strong> {selectedReport.title}
                </p>
                <p className="mb-2">
                  <strong>Category:</strong> {selectedReport.category}
                </p>
                <p className="mb-2">
                  <strong>Assigned To:</strong> {selectedReport.assignedTo}
                </p>
                <p className="mb-2">
                  <strong>Reported Date:</strong> {selectedReport.reportedDate}
                </p>
                <p className="mb-2">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      selectedReport.status === "Completed"
                        ? "text-green-600"
                        : selectedReport.status === "In Progress"
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedReport.status}
                  </span>
                </p>
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-sm font-medium rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Update Modal */}
                <h2 className="text-xl font-bold mb-4">
                  Update Report: {selectedReport.title}
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    Comments/Notes
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Add comments or notes here"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    Attach Photos
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handlePhotoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                  />
                  {photos.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600">
                      {photos.map((photo, index) => (
                        <li key={index}>{photo.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-sm font-medium rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
                  >
                    Update
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
