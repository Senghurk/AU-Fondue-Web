"use client";

import { useState, useEffect } from "react";

export default function ReportsPage() {
  const backendUrl = "https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
  const sastoken = "?sp=r&st=2025-02-28T02:27:10Z&se=2025-02-28T10:27:10Z&spr=https&sv=2022-11-02&sr=c&sig=j0MtkuVGUM79jMo2AMz5662kRcD%2Fp5AHcdmQQGROUKk%3D";
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
        console.log("Fetched data:", data); // Debugging step
  
        if (!Array.isArray(data)) {
          console.error("Error: Expected an array but got:", data);
          return;
        }
  
        setReports(data);
  
        // Initialize assignments only if data is an array
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
    if (isModalOpen && selectedReport && selectedReport.usingCustomLocation === false) {
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
        const mapDiv = document.getElementById("map");
        if (!mapDiv) return; // Prevent error if the div is missing
  
        const location = {
          lat: selectedReport.latitude || 0, 
          lng: selectedReport.longitude || 0, 
        };
  
        const map = new google.maps.Map(mapDiv, {
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 h-4/5 flex flex-col ">
            <div className="flex-1" style={{ overflowY: "auto", maxHeight: "calc(100% - 20px)", /* Adjusting for padding*/ }}>
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
              {selectedReport.usingCustomLocation === false && (
                <div id="map" className="w-full h-60 mt-4 rounded-lg border border-gray-300"></div>
              )}
              <p className="mb-2">
                <strong>Reported By:</strong> {selectedReport.reportedBy?.username } 
              </p>
              <p className="mb-2">
                <strong>Reported Date:</strong> { new Date(selectedReport.createdAt).toLocaleString("en-US", { timeZone: "Asia/Bangkok" })}
              </p>

              {selectedReport.photoUrls && selectedReport.photoUrls.length > 0 ? (
                <div className="mt-3">
                    <strong className="mb-2">Report Photo:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedReport.photoUrls.map((photo, i) => (
                          <img 
                          key={i} 
                          src={photo+sastoken}  
                          alt={`Report Photo ${i + 1}`} 
                          className="w-60 h-60 rounded-md shadow-md border border-gray-200 object-cover"
                          onError={(e) => { e.target.src = "/placeholder.jpg"; }} // Handle broken URLs
                          />
                        ))}
                      </div>
                  </div>
              )  : (
                  <p className="text-sm text-gray-500 mt-2"><strong>Report Photo:</strong> No photos</p>
                    )}
              
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
        </div>
      )}
      <style>
              {`
                .flex-1::-webkit-scrollbar {
                  width: 6px; /* Adjust the width of the scrollbar */
                }

                .flex-1::-webkit-scrollbar-thumb {
                  background-color: rgba(0, 0, 0, 0.3); /* Thumb color */
                  border-radius: 10px;
                }

                .flex-1::-webkit-scrollbar-track {
                  background: transparent; /* Track color */
                }
              `}
            </style>
    </div>
    
  );
}
