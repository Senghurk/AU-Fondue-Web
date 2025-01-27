"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function HistoryPage() {
  // Mock data for completed reports
  const completedReports = [
    {
      id: 1,
      description: "Leaking Pipe in Dorm 3",
      assignedTo: "John Doe",
      reportedDate: "2024-12-10",
      completionDate: "2024-12-13",
    },
    {
      id: 2,
      description: "Broken Window in Library",
      assignedTo: "Jane Smith",
      reportedDate: "2024-12-12",
      completionDate: "2024-12-16",
    },
    {
      id: 3,
      description: "Flickering Lights in Hallway",
      assignedTo: "Michael Brown",
      reportedDate: "2024-12-09",
      completionDate: "2024-12-11",
    },
  ];

  // Function to export data to Excel
  const exportToExcel = () => {
    // Prepare the data for export
    const dataToExport = completedReports.map((report) => ({
      "Description": report.description,
      "Assigned To": report.assignedTo,
      "Reported Date": report.reportedDate,
      "Completion Date": report.completionDate,
    }));

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Completed Reports");

    // Export the Excel file
    XLSX.writeFile(workbook, "Completed_Reports.xlsx");
  };

  return (
    <div className="flex-1 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Report History</h1>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600"
        >
          Export to Excel
        </button>
      </div>
      <p className="text-gray-600 mb-4">
        View the history of all completed reports.
      </p>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 text-sm font-semibold">#</th>
              <th className="p-3 text-sm font-semibold">Description</th>
              <th className="p-3 text-sm font-semibold">Assigned To</th>
              <th className="p-3 text-sm font-semibold">Status</th>
              <th className="p-3 text-sm font-semibold">Reported Date</th>
              <th className="p-3 text-sm font-semibold">Completion Date</th>
            </tr>
          </thead>
          <tbody>
            {completedReports.map((report, index) => (
              <tr
                key={report.id}
                className={`border-t ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="p-3 text-sm">{index + 1}</td>
                <td className="p-3 text-sm">{report.description}</td>
                <td className="p-3 text-sm">{report.assignedTo}</td>
                <td className="p-3 text-sm font-semibold text-green-600">
                  Completed
                </td>
                <td className="p-3 text-sm">{report.reportedDate}</td>
                <td className="p-3 text-sm">{report.completionDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
