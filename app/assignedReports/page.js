"use client";

import { useState, useEffect } from "react";

export default function AssignedReportsPage() {
  const backendUrl = "https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
  const sastoken = "?sp=r&st=2025-03-12T12:14:46Z&se=2026-03-31T20:14:46Z&spr=https&sv=2022-11-02&sr=c&sig=j4Mc241rEaPiBzNQ1qPFwwHEamVp83OERRYmBj1Tums%3D";
  const [reports, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [modalType, setModalType] = useState(""); // "details" or "update"
  const [selectedReport, setSelectedReport] = useState(null); // Current report being viewed or updated
  const [status, setStatus] = useState(""); // Updated status
  const [comments, setComments] = useState(""); // Textbox comments
  const [photos, setPhotos] = useState([]); // Uploaded photos
  const [updates, setUpdates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");


  // Open the modal with the selected report
  const handleOpenModal = (report, type) => {
    setSelectedReport(report);
    setModalType(type);
    setStatus(report.status); // Pre-fill the status dropdown with the current status
    setComments(""); // Clear any existing comments
    setPhotos([]); // Clear photos
    setIsModalOpen(true);

    if (type === "details") {
      fetchUpdates(report.id); // Fetch updates only when viewing details
    }
  };

  // Handle photo uploads
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...files]);
  };

  // Handle update action
  const handleUpdate = async () => {
    if (!selectedReport) return;
  
    const formData = new FormData();
    formData.append("issueId", selectedReport.id);
    formData.append("status", status);
    formData.append("comment", comments);
  
    photos.forEach((photo) => {
      formData.append("photos", photo);
    });
  
    try {
      const response = await fetch(`${backendUrl}/issues/updates`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorDetails = await response.text(); // Read the error response body
        throw new Error(`Failed to update report: ${response.status} - ${errorDetails}`);
      }
  
      alert(`Report updated successfully.`);
      setIsModalOpen(false);
      fetchReports(); // Refresh the reports list after update
    } catch (error) {
      console.error("Error updating report:", error);
      alert(`Failed to update the report: ${error.message}`);
    }
  };
  
  // Fetch updates for a specific issue by issueId
  const fetchUpdates = async (issueId) => {
    try {
      const response = await fetch(`${backendUrl}/issues/${issueId}/updates`);
      if (!response.ok) {
        throw new Error("Failed to fetch updates");
      }
      const data = await response.json();
      setUpdates(data); // Store the fetched updates in the state
    } catch (error) {
      console.error("Error fetching updates:", error);
    }
  };


  // Function to fetch reports from the backend
  const fetchReports = () => {
    fetch(`${backendUrl}/issues/assigned`) // Adjust the endpoint as needed
      .then((response) => response.json())
      .then(data => setReports(data))
      .catch((error) => console.error("Error fetching reports:", error));
  };

  const filteredReports = reports.filter(
    (report) =>
      (report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||  // Search by both description and category
      report.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      report.status !== "COMPLETED"   // filtering out the completed reports in the groupedReports
  );
  

  const groupedReports = filteredReports.reduce((groups, report) => {
    if (!groups[report.category]) {
      groups[report.category] = [];
    }
    groups[report.category].push(report);
    return groups;
  }, {});

  useEffect(() => {
    fetchReports();
  }, []);

  // // Map
  // useEffect(() => {
  //   if (isModalOpen && selectedReport && selectedReport.usingCustomLocation === false) {
  //     const loadGoogleMaps = () => {
  //       if (!window.google) {
  //         const script = document.createElement("script");
  //         script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAsR5qRX8IB3xtGZCxzSoh62usnHTgOpTU`;
  //         script.async = true;
  //         script.defer = true;
  //         script.onload = initializeMap;
  //         document.body.appendChild(script);
  //       } else {
  //         initializeMap();
  //       }
  //     };
  
  //     const initializeMap = () => {
  //       const mapDiv = document.getElementById("map");
  //       if (!mapDiv) return; // Prevent error if the div is missing
  
  //       const location = {
  //         lat: selectedReport.latitude || 0, 
  //         lng: selectedReport.longitude || 0, 
  //       };
  
  //       const map = new google.maps.Map(mapDiv, {
  //         zoom: 14,
  //         center: location,
  //       });
  
  //       new google.maps.Marker({
  //         position: location,
  //         map: map,
  //       });
  //     };
  
  //     loadGoogleMaps();
  //   }
  // }, [isModalOpen, selectedReport, modalType]);                                      // no more map
  

  return (
    <div className="flex-1 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assigned Reports</h1>
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600"
            onClick={fetchReports}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
      <input
        type="text"
        placeholder="Search by description or category..."
        className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      </div>

      {/* Cards Grid */}
      
      {Object.entries(groupedReports).map(([category, reports]) => (
        <div key={category} className="mb-8">
        <h2 className="text-xl font-bold mb-4">{category}</h2>
        <div className="grid grid-cols-3 gap-4">

          {reports
          .filter((report) => report.status !== "COMPLETED")
          .map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
            >
              {/* Report Title */}
              <h2 className="text-lg font-semibold mb-2">{report.description}</h2>
              {/* Category */}
              <p className="text-sm text-gray-600">Category: {report.category}</p>
              {/* Status */}
              <p className="text-sm text-gray-600 mt-1">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    report.status === "COMPLETED"
                      ? "text-green-600"
                      : report.status === "IN PROGRESS"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {report.status}
                </span>
              </p>
            
              {/* Assigned To */}
              <p className="text-sm text-gray-600 mt-1">
                Assigned To: {report.assignedTo?.name}
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
      </div>
      ))}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div  className="bg-white p-6 rounded-lg shadow-lg w-1/3 h-4/5 flex flex-col ">
            <div className="flex-1" style={{ overflowY: "auto", maxHeight: "calc(100% - 20px)", /* Adjusting for padding*/ }}>                             
            {modalType === "details" ? (
              <>
                {/* Details Modal */}
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
              <p className="mb-2">
                <strong>Reported By:</strong> {selectedReport.reportedBy?.username } 
              </p>
                {selectedReport.photoUrls && selectedReport.photoUrls.length > 0 ? (
              <div className="mt-3">
                  <strong className="mb-2">Report Photo:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedReport.photoUrls.map((photo, i) => (
                        <img 
                        key={i} 
                        src={`${photo}?${sastoken}`}  
                        alt={`Report Photo ${i + 1}`} 
                        className="w-60 h-60 rounded-md shadow-md border border-gray-200 object-cover"
                        onError={(e) => { e.target.src = "placeholder.jpg"; }} // Handle broken URLs
                        />
                      ))}
                    </div>
                </div>
            )  : (
                <p className="text-sm text-gray-500 mt-2"><strong>Report Photo:</strong> No photos</p>
                  )}
                <p className="mb-2">
                  <strong>Assigned To: </strong> {selectedReport.assignedTo?.name}
                </p>
                <p className="mb-2">
                  <strong>Reported Date:</strong> { new Date(selectedReport.createdAt).toLocaleString("en-US", { timeZone: "Asia/Bangkok" })}
                </p>
                <p className="mb-2">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      selectedReport.status === "COMPLETED"
                        ? "text-green-600"
                        : selectedReport.status === "IN PROGRESS"
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedReport.status}
                  </span>
                </p>
                 
                <p className="mb-2">
                  <strong>Location: </strong> Some sort of location information here
                </p>
                {/* Google Map Section
                {selectedReport.usingCustomLocation === false && (
                  <div id="map" className="w-full h-60 mt-4 rounded-lg border border-gray-300"></div>
                )} */}


                {/* Update Details Section */}
                <h4 className="text-lg font-semibold mb-2">Update Details</h4>
                
                {updates.length > 0 ? (
                  <div className="space-y-4">
                    {updates.map((update, index) => (
                      <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md border border-gray-300">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-600">
                            <strong>Status:</strong> 
                            <span className={`ml-2 font-semibold ${update.status === "COMPLETED" ? "text-green-600" : update.status === "IN PROGRESS" ? "text-blue-600" : "text-red-600"}`}>
                              {update.status}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">{new Date(update.update_time).toLocaleString("en-US", { timeZone: "Asia/Bangkok" })}</p>
                        </div>

                        <p className="text-sm text-gray-800">
                          <strong>Comment:</strong> {update.comment ? update.comment : "No comments"}
                        </p>

                        {update.photoUrls && update.photoUrls.length > 0 ? (
                          <div className="mt-3">
                            <strong className="text-sm">Photos:</strong>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {update.photoUrls.map((photo, i) => (
                                <img 
                                  key={i} 
                                  src={photo + sastoken}  
                                  alt={`Update Photo ${i + 1}`} 
                                  className="w-60 h-60 rounded-md shadow-md border border-gray-200 object-cover"
                                  onError={(e) => { e.target.src = "/placeholder.jpg"; }} // Handle broken URLs
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2"><strong>Photos:</strong> No photos</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No updates yet.</p>
                )}
                
                  

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
                  Update Report: {selectedReport.description}
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
                    <option value="PENDING">PENDING</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
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
        </div>
      )}
    </div>
  );
}
