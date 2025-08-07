"use client";

import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function HistoryPage() {
  const [completedReports, setCompletedReports] = useState([]);
  const backendUrl =
    "https://aufondue-backend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";

  const fetchCompletedReports = () => {
    fetch(`${backendUrl}/issues/completed`)
      .then((response) => response.json())
      .then((data) => setCompletedReports(data))
      .catch((error) =>
        console.error("Error fetching Completed Reports", error)
      );
  };

  const getDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;

    if (isNaN(diffMs) || diffMs < 0) return "Invalid";

    const totalMinutes = Math.floor(diffMs / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  // ✅ NEW: Export to Excel using exceljs
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Completed Reports");

    // Define header
    const header = [
      "Description",
      "Category",
      "Assigned To",
      "Status",
      "Reported Date",
      "Completion Date",
      "Duration",
    ];
    worksheet.addRow(header);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows
    completedReports.forEach((report) => {
      worksheet.addRow([
        report.description,
        report.category,
        report.assignedTo?.name || "Unassigned",
        "Completed",
        new Date(report.createdAt).toLocaleString("en-GB", {
          timeZone: "Asia/Bangkok",
        }),
        new Date(report.updatedAt).toLocaleString("en-GB", {
          timeZone: "Asia/Bangkok",
        }),
        getDuration(report.createdAt, report.updatedAt),
      ]);
    });

    // Set column widths
    worksheet.columns = [
      { width: 40 },
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 25 },
      { width: 25 },
      { width: 15 },
    ];

    // Generate file and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Completed_Reports.xlsx");
  };

  useEffect(() => {
    fetchCompletedReports();
  }, []);

  return (
    <div className="flex-1 p-6">
      {/* Header */}
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md p-3.5 overflow-x-auto max-w-full">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 text-sm font-semibold">#</th>
              <th className="p-3 text-sm font-semibold">Description</th>
              <th className="p-3 text-sm font-semibold">Category</th>
              <th className="p-3 text-sm font-semibold">Assigned To</th>
              <th className="p-3 text-sm font-semibold">Status</th>
              <th className="p-3 text-sm font-semibold">Reported Date</th>
              <th className="p-3 text-sm font-semibold">Completion Date</th>
              <th className="p-3 text-sm font-semibold">Duration</th>
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
                <td className="p-3 text-sm">{report.category}</td>
                <td className="p-3 text-sm">{report.assignedTo?.name}</td>
                <td className="p-3 text-sm font-semibold text-green-600">
                  Completed
                </td>
                <td className="p-3 text-sm">
                  {new Date(report.createdAt).toLocaleString("en-GB", {
                    timeZone: "Asia/Bangkok",
                  })}
                </td>
                <td className="p-3 text-sm">
                  {new Date(report.updatedAt).toLocaleString("en-GB", {
                    timeZone: "Asia/Bangkok",
                  })}
                </td>
                <td className="p-3 text-sm">
                  {getDuration(report.createdAt, report.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
