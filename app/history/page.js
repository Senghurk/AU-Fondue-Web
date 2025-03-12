"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";


export default function HistoryPage() {
  const [completedReports, setCompletedReports] = useState([]);
  const backendUrl = "https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
  const fetchCompletedReports = () =>{
    fetch(`${backendUrl}/issues/completed`)
      .then((response) => response.json())
      .then((data) => setCompletedReports(data))
      .catch((error) => console.error("Error fetching Completed Reports", error));
  }
  

  // Function to export data to Excel
  const exportToExcel = () => {
    // Prepare the data for export
    const dataToExport = completedReports.map((report) => ({
      "Description": report.description,
      "Assigned To": report.assignedTo?.name,
      "Reported Date": report.createdAt.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }), 
      "Completion Date": report.updatedAt.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
    }));

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Completed Reports");

    // Export the Excel file
    XLSX.writeFile(workbook, "Completed_Reports.xlsx");
  };


  useEffect(() => {
    fetchCompletedReports();
  }, []);

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
                <td className="p-3 text-sm">{report.assignedTo?.name}</td> 
                <td className="p-3 text-sm font-semibold text-green-600">
                  Completed
                </td>
                <td className="p-3 text-sm">{ new Date(report.createdAt).toLocaleString()}</td>
                <td className="p-3 text-sm">{ new Date(report.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
