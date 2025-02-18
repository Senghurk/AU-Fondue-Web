"use client";

import { useState, useEffect } from "react";

export default function ReportsPage() {
  const backendUrl = "https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";

  // State to store fetched reports
  const [reports, setReports] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);

  // State to manage assigned staff for each report
  const [assignments, setAssignments] = useState({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Function to fetch reports from the backend
  const fetchReports = () => {
    fetch(`${backendUrl}/issues/unassigned`)
      .then((response) => response.json())
      .then((data) => {
        setReports(data);
        // Initialize assignments for the fetched reports
        setAssignments(
          data.reduce((acc, report) => ({ ...acc, [report.id]: "" }), {})
        );
      })
      .catch((error) => console.error("Error fetching reports:", error));
  };

  const fetchStaffMembers = () => {
    fetch(`${backendUrl}/staff`)
      .then((response) => response.json())
      .then((data) => setStaffMembers(data))
      .catch((error) => console.error("Error fetching staff members:", error));
  };

  // Fetch reports when the component loads
  useEffect(() => {
    fetchReports();
    fetchStaffMembers();
  }, []);

  // Function to update assigned staff
  const handleAssignStaff = (id, staffId) => {
    setAssignments((prev) => ({ ...prev, [id]: staffId }));
  };

  // Function to handle assigning a report
  const handleConfirmAssign = (id) => {
    if (!assignments[id]) {
      alert("Please select a staff member before assigning!");
      return;
    }
  
    // Make a POST request to the backend with staffId as a query parameter
    fetch(`${backendUrl}/issues/${id}/assign?staffId=${assignments[id]}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          alert(`Report "${id}" successfully assigned to staff ID ${assignments[id]}`);
          fetchReports(); // Refresh the reports list after assignment
        } else {
          alert("Failed to assign the report. Please try again.");
        }
      })
      .catch((error) => console.error("Error assigning report:", error));
  };

  // Function to open the details modal
  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Map
  useEffect(() => {
    if (isModalOpen && selectedReport) {
      const loadGoogleMaps = () => {
        if (!window.google) {
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAsR5qRX8IB3xtGZCxzSoh62usnHTgOpTU`;
          script.async = true;
          script.defer = true;
          script.onload = initializeMap;
          document.body.appendChild(script);
        } else {
          initializeMap();
        }
      };

      const initializeMap = () => {
        const location = {
          lat: selectedReport.latitude || 0, 
          lng: selectedReport.longitude || 0, 
        };

        const map = new google.maps.Map(document.getElementById("map"), {
          zoom: 14,
          center: location,
        });

        new google.maps.Marker({
          position: location,
          map: map,
        });
      };

      loadGoogleMaps();
    }
  }, [isModalOpen, selectedReport]);

  return (
    <div className="flex-1 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reported Issues</h1>
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600"
          >
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
                value={assignments[report.id] || ""}
                onChange={(e) => handleAssignStaff(report.id, e.target.value)}
              >
                <option value="">Select Staff Member</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.email})
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
              <strong>Location:</strong> {selectedReport.customLocation}
            </p>

            {/* Google Map Section */}
            <div id="map" className="w-full h-60 mt-4 rounded-lg border border-gray-300"></div>
            
            <p className="mb-2">
              <strong>Reported By:</strong> {selectedReport.reportedBy?.username } ({selectedReport.reportedBy?.id})
            </p>
            <p className="mb-2">
              <strong>Reported Date:</strong> { new Date(selectedReport.createdAt).toLocaleString()}
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
