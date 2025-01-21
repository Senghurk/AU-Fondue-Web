"use client";

import { useParams } from "next/navigation"; // Hook to get route parameters
import Link from "next/link"; // For Back button

export default function ReportDetailPage() {
  const { id } = useParams(); // Get the report ID from the route

  // Mock data for the report
  const reportsData = {
    1: {
      description: "Leaking pipe in Dorm 3",
      reportedDate: "2024-10-15",
      location: "Dorm 3",
      status: "Pending",
      assignedTo: "John Doe",
    },
    2: {
      description: "Broken window in library",
      reportedDate: "2024-10-20",
      location: "Library",
      status: "In Progress",
      assignedTo: "Jane Smith",
    },
    // Add more data as needed
  };

  const report = reportsData[id] || {
    description: "No details available for this report.",
    reportedDate: "N/A",
    location: "N/A",
    status: "Unknown",
    assignedTo: "Not Assigned",
  };

  return (
    <div className="flex flex-1 p-6 bg-gray-50">
      {/* Left Section: Main Content */}
      <div className="w-3/4 p-6 bg-blue-50 rounded-lg shadow-md">
        {/* Back Arrow Button */}
        <Link
          href="/reports"
          className="mb-4 flex items-center space-x-2 text-blue-600 hover:underline"
        >
          <span>Back</span>
        </Link>

        <h1 className="text-3xl font-bold mb-4">Issue Details (ID: {id})</h1>
        <div className="space-y-4">
          <p>
            <strong>Description:</strong> {report.description}
          </p>
          <p>
            <strong>Reported Date:</strong> {report.reportedDate}
          </p>
          <p>
            <strong>Location:</strong> {report.location}
          </p>
          <p>
            <strong>Status:</strong> {report.status}
          </p>
          <p>
            <strong>Assigned To:</strong> {report.assignedTo}
          </p>
        </div>
      </div>
    </div>
  );
}
