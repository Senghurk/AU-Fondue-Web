"use client";

import { useState } from "react";

export default function ReportsPage() {
  // Mock data for reported issues
  const reports = [
    { id: 1, title: "Leaking Pipe in Dorm 3", category: "Plumbing", priority: "" },
    { id: 2, title: "Broken Window in Library", category: "Maintenance", priority: "" },
    { id: 3, title: "Flickering Lights in Hallway", category: "Electrical", priority: "" },
    { id: 4, title: "Blocked Sink in Cafeteria", category: "Plumbing", priority: "" },
    { id: 5, title: "Cracked Floor in Auditorium", category: "Maintenance", priority: "" },
    { id: 6, title: "Malfunctioning AC in Lab", category: "Electrical", priority: "" },
  ];

  // State to manage priorities for each report
  const [priorities, setPriorities] = useState(
    reports.reduce((acc, report) => ({ ...acc, [report.id]: "" }), {})
  );

  // Function to update priority
  const handlePriorityChange = (id, value) => {
    setPriorities((prev) => ({ ...prev, [id]: value }));
  };

  // Function to handle assigning a report
  const handleAssign = (id) => {
    if (!priorities[id]) {
      alert("Please select a priority before assigning!");
      return;
    }
    alert(`Report ${id} assigned with priority: ${priorities[id]}`);
  };

  return (
    <div className="flex-1 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reported Issues</h1>
        <div className="flex items-center gap-2">
          {/* Location Filter */}
          <select
            className="px-4 py-2 text-sm border rounded"
            aria-label="Filter by location"
          >
            <option value="">Location</option>
            <option value="dorm">Dorms</option>
            <option value="library">Library</option>
            <option value="hallway">Hallways</option>
          </select>
          {/* Filter Button */}
          <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600">
            Filter
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
            {/* Report Title */}
            <h2 className="text-lg font-semibold mb-2">{report.title}</h2>
            {/* Category */}
            <p className="text-sm text-gray-600">Category: {report.category}</p>
            {/* Priority Selector */}
            <div className="mt-4">
              <label className="text-sm font-semibold block mb-2">Priority</label>
              <select
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                value={priorities[report.id]}
                onChange={(e) => handlePriorityChange(report.id, e.target.value)}
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleAssign(report.id)}
                className="flex-1 px-4 py-2 bg-gray-200 text-sm font-medium rounded hover:bg-gray-300"
              >
                Assign
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-200 text-sm font-medium rounded hover:bg-gray-300">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
