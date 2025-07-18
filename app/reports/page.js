"use client";

import { useState, useEffect } from "react";

export default function ReportsPage() {
  const backendUrl =
    "https://aufondue-webtest.kindisland-399ef298.southeastasia.azurecontainerapps.io/api"; //test link
  //const backendUrl = "https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
  const sastoken =
    "?sv=2024-11-04&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2027-07-16T22:11:38Z&st=2025-07-16T13:56:38Z&spr=https,http&sig=5xb1czmfngshEckXBdlhtw%2BVe%2B5htYpCnXyhPw9tnHk%3D";

  const [reports, setReports] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [priority, setPriority] = useState({});

  // NEW: Add feedback state
  const [assignmentMessage, setAssignmentMessage] = useState(null);
  const [isAssigning, setIsAssigning] = useState({});

  // NEW: Feedback component
  const AssignmentFeedback = ({ message, onClose }) => {
    if (!message) return null;

    const getStyles = () => {
      switch (message.type) {
        case "success":
          return "bg-green-100 border-green-400 text-green-700";
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

  useEffect(() => {
    fetchReports();
    fetchStaffMembers();
  }, []);

  const fetchReports = () => {
    fetch(`${backendUrl}/issues/unassigned`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setReports(data);
        setAssignments(data.reduce((acc, r) => ({ ...acc, [r.id]: "" }), {}));
        setPriority(data.reduce((acc, r) => ({ ...acc, [r.id]: "" }), {}));
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
        setAssignmentMessage({
          type: "error",
          text: "Failed to fetch reports",
        });
      });
  };

  const fetchStaffMembers = () => {
    fetch(`${backendUrl}/staff`)
      .then((res) => res.json())
      .then(setStaffMembers)
      .catch((error) => {
        console.error("Error fetching staff:", error);
      });
  };

  const handleAssignStaff = (id, staffId) => {
    setAssignments((prev) => ({ ...prev, [id]: staffId }));
  };

  const handlePriorityChange = (id, priorityValue) => {
    setPriority((prev) => ({ ...prev, [id]: priorityValue }));
  };

  // UPDATED: Enhanced assignment function with feedback
  const handleConfirmAssign = async (id) => {
    if (!assignments[id]) {
      setAssignmentMessage({
        type: "error",
        text: "Please select a staff member.",
      });
      return;
    }
    if (!priority[id]) {
      setAssignmentMessage({
        type: "error",
        text: "Please select a priority.",
      });
      return;
    }

    setIsAssigning((prev) => ({ ...prev, [id]: true }));
    setAssignmentMessage(null);

    try {
      const response = await fetch(
        `${backendUrl}/issues/${id}/assign?staffId=${assignments[id]}&priority=${priority[id]}`,
        { method: "POST" }
      );

      if (response.ok) {
        setAssignmentMessage({
          type: "success",
          text: "✅ Report assigned successfully!",
        });
        fetchReports();

        // Clear message after 3 seconds
        setTimeout(() => setAssignmentMessage(null), 3000);
      } else {
        throw new Error(`Failed to assign: ${response.status}`);
      }
    } catch (error) {
      console.error("Assignment error:", error);
      setAssignmentMessage({
        type: "error",
        text: `Failed to assign report: ${error.message}`,
      });
    } finally {
      setIsAssigning((prev) => ({ ...prev, [id]: false }));
    }
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setIsModalOpen(false);
  };

  const filteredReports = reports.filter(
    (report) =>
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy?.username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6">
      {/* NEW: Add feedback message display */}
      {assignmentMessage && (
        <AssignmentFeedback
          message={assignmentMessage}
          onClose={() => setAssignmentMessage(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6">Unassigned Reports</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No unassigned reports found.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {report.description?.substring(0, 50)}...
                </h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  {report.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>
                  <strong>Category:</strong> {report.category}
                </p>
                <p>
                  <strong>Location:</strong> {report.customLocation}
                </p>
                <p>
                  <strong>Reported By:</strong> {report.reportedBy?.username}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Report Photos */}
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

              {/* Assignment Controls */}
              <div className="space-y-3">
                {/* Staff Assignment */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Assign Staff
                  </label>
                  <select
                    value={assignments[report.id] || ""}
                    onChange={(e) =>
                      handleAssignStaff(report.id, e.target.value)
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Staff</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority[report.id] || ""}
                    onChange={(e) =>
                      handlePriorityChange(report.id, e.target.value)
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Priority</option>
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfirmAssign(report.id)}
                    disabled={
                      isAssigning[report.id] ||
                      !assignments[report.id] ||
                      !priority[report.id]
                    }
                    className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                      isAssigning[report.id]
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : !assignments[report.id] || !priority[report.id]
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {isAssigning[report.id] ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Assigning...
                      </div>
                    ) : (
                      "Assign"
                    )}
                  </button>
                  <button
                    onClick={() => openModal(report)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Report Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

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
                  <strong>Reported By:</strong>{" "}
                  {selectedReport.reportedBy?.username}
                </p>
                <p>
                  <strong>Status:</strong> {selectedReport.status}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}