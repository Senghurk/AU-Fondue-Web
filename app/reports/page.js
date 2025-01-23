"use client";

import { useState } from "react";

export default function ReportsPage() {
  // Mock data for reported issues
  const reports = [
    {
      id: 1,
      description: "Leaking Pipe in Dorm 3",
      category: "Plumbing",
      reportedDate: "2024-12-10",
    },
    {
      id: 2,
      description: "Broken Window in Library",
      category: "Maintenance",
      reportedDate: "2024-12-11",
    },
    {
      id: 3,
      description: "Flickering Lights in Hallway",
      category: "Electrical",
      reportedDate: "2024-12-09",
    },
  ];

  // Mock data for staff members
  const staffMembers = [
    "John Doe",
    "Jane Smith",
    "Michael Brown",
    "Emily Davis",
    "Chris Johnson",
  ];

  // State to manage assigned staff for each report
  const [assignments, setAssignments] = useState(
    reports.reduce((acc, report) => ({ ...acc, [report.id]: "" }), {})
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Function to update assigned staff
  const handleAssignStaff = (id, staffName) => {
    setAssignments((prev) => ({ ...prev, [id]: staffName }));
  };

  // Function to handle assigning a report
  const handleConfirmAssign = (id) => {
    if (!assignments[id]) {
      alert("Please select a staff member before assigning!");
      return;
    }
    alert(`Report "${id}" assigned to ${assignments[id]}`);
  };

  // Function to open the details modal
  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reported Issues</h1>
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600">
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
          >
            {/* Report Description */}
            <h2 className="text-lg font-semibold mb-2">{report.description}</h2>
            {/* Category */}
            <p className="text-sm text-gray-600">Category: {report.category}</p>
            {/* Staff Selector */}
            <div className="mt-4">
              <label className="text-sm font-semibold block mb-2">
                Assign Staff Member
              </label>
              <select
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                value={assignments[report.id]}
                onChange={(e) => handleAssignStaff(report.id, e.target.value)}
              >
                <option value="">Select Staff Member</option>
                {staffMembers.map((staff, index) => (
                  <option key={index} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleOpenModal(report)}
                className="flex-1 px-4 py-2 bg-gray-200 text-sm font-medium rounded hover:bg-gray-300"
              >
                View
              </button>
              <button
                onClick={() => handleConfirmAssign(report.id)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
              >
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Report Details</h2>
            <p className="mb-2">
              <strong>Description:</strong> {selectedReport.description}
            </p>
            <p className="mb-2">
              <strong>Category:</strong> {selectedReport.category}
            </p>
            <p className="mb-2">
              <strong>Reported Date:</strong> {selectedReport.reportedDate}
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-sm font-medium rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
