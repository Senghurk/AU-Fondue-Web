"use client";

import { useState, useEffect } from "react";
import { getBackendUrl } from "../config/api";
import ReportDetailsModal from "../components/ReportDetailsModal";

export default function ReportsPage() {
  const backendUrl = getBackendUrl();
  const sastoken =
    "?sv=2024-11-04&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2027-07-16T22:11:38Z&st=2025-07-16T13:56:38Z&spr=https,http&sig=5xb1czmfngshEckXBdlhtw%2BVe%2B5htYpCnXyhPw9tnHk%3D";

  // Data
  const [reports, setReports] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState({});
  const [isAssigning, setIsAssigning] = useState({});

  const [assignmentMessage, setAssignmentMessage] = useState(null);

  // Details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Media viewer (images and videos)
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [mediaViewerUrl, setMediaViewerUrl] = useState("");
  const [mediaViewerType, setMediaViewerType] = useState(""); // "image" or "video"

  const AssignmentFeedback = ({ message, onClose }) => {
    if (!message) return null;

    const style =
      message.type === "success"
        ? "bg-green-100 border-green-400 text-green-700"
        : message.type === "error"
        ? "bg-red-100 border-red-400 text-red-700"
        : "bg-blue-100 border-blue-400 text-blue-700";

    return (
      <div className={`border px-4 py-3 rounded mb-4 relative ${style}`} role="alert">
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await Promise.all([fetchReports(), fetchStaffMembers()]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load reports. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${backendUrl}/issues/unassigned`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      if (!Array.isArray(data)) return;
      
      setReports(data);
      // initialize per-report assignment selection
      setAssignments(data.reduce((acc, r) => ({ ...acc, [r.id]: "" }), {}));
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const res = await fetch(`${backendUrl}/staff`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      setStaffMembers(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      throw error;
    }
  };

  // Assign helpers
  const handleAssignStaff = (id, staffId) => {
    setAssignments((prev) => ({ ...prev, [id]: staffId }));
  };

  const handleConfirmAssign = async (id) => {
    if (!assignments[id]) {
      setAssignmentMessage({
        type: "error",
        text: "Please select a staff member.",
      });
      return;
    }

    setIsAssigning((prev) => ({ ...prev, [id]: true }));
    setAssignmentMessage(null);

    try {
      // Removed priority from the API call
      const response = await fetch(
        `${backendUrl}/issues/${id}/assign?staffId=${assignments[id]}`,
        { method: "POST" }
      );

      if (response.ok) {
        setAssignmentMessage({
          type: "success",
          text: "✅ Report assigned successfully!",
        });
        fetchReports();
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

  // Details modal
  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedReport(null);
    setIsModalOpen(false);
  };

  // Media viewer helpers
  const openMediaViewer = (rawUrl, type = "image") => {
    // Ensure inline display for Azure Blob (prevents download behavior)
    const joiner = rawUrl.includes("?") ? "&" : "?";
    const contentType = type === "video" ? "video/mp4" : "image/jpeg";
    const viewUrl = `${rawUrl}${joiner}rscd=inline&rsct=${contentType}`;
    setMediaViewerUrl(viewUrl);
    setMediaViewerType(type);
    setMediaViewerOpen(true);
  };
  
  const closeMediaViewer = () => {
    setMediaViewerUrl("");
    setMediaViewerType("");
    setMediaViewerOpen(false);
  };

  // Filter + Group by category
  const filteredReports = reports.filter(
    (report) =>
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedReports = filteredReports.reduce((groups, report) => {
    if (!groups[report.category]) groups[report.category] = [];
    groups[report.category].push(report);
    return groups;
  }, {});

  return (
    <div className="flex-1 p-4 lg:p-6">
      {assignmentMessage && (
        <AssignmentFeedback
          message={assignmentMessage}
          onClose={() => setAssignmentMessage(null)}
        />
      )}

      <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">Unassigned Reports</h1>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading unassigned reports...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Search */}
          <div className="mb-4 lg:mb-6">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Groups */}
      {Object.keys(groupedReports).length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No unassigned reports found.</p>
        </div>
      ) : (
        Object.entries(groupedReports).map(([category, reports]) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{category}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Header with gradient background */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                          {report.description?.substring(0, 45)}...
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          Report #{report.id}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.customLocation}</p>
                          <p className="text-gray-500 text-xs">Location</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.reportedBy?.username}</p>
                          <p className="text-gray-500 text-xs">Reported by</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</p>
                          <p className="text-gray-500 text-xs">Date reported</p>
                        </div>
                      </div>
                    </div>

                    {/* Media Gallery */}
                    {(report.photoUrls?.length > 0 || report.videoUrls?.length > 0) && (
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-700">Media Attachments</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {/* Photos */}
                          {report.photoUrls?.slice(0, 3).map((photo, i) => {
                            const base = `${photo}${sastoken}`;
                            const joiner = base.includes("?") ? "&" : "?";
                            const inlineUrl = `${base}${joiner}rscd=inline&rsct=image/jpeg`;
                            return (
                              <div key={`photo-${i}`} className="relative group">
                                <img
                                  src={inlineUrl}
                                  alt={`Photo ${i + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0 cursor-pointer transition-all duration-200 group-hover:border-blue-300 group-hover:shadow-md"
                                  onClick={() => openMediaViewer(base, "image")}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center pointer-events-none">
                                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </div>
                              </div>
                            );
                          })}
                          {/* Videos */}
                          {report.videoUrls?.slice(0, 3).map((video, i) => {
                            const base = `${video}${sastoken}`;
                            const joiner = base.includes("?") ? "&" : "?";
                            const inlineUrl = `${base}${joiner}rscd=inline&rsct=video/mp4`;
                            return (
                              <div key={`video-${i}`} className="relative group">
                                <video
                                  src={inlineUrl}
                                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0 cursor-pointer transition-all duration-200 group-hover:border-blue-300 group-hover:shadow-md"
                                  onClick={() => openMediaViewer(base, "video")}
                                  onMouseEnter={(e) => e.target.play()}
                                  onMouseLeave={(e) => {e.target.pause(); e.target.currentTime = 0;}}
                                  muted
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="bg-black/60 backdrop-blur-sm rounded-full p-2 group-hover:bg-black/70 transition-all duration-200">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {/* More items indicator */}
                          {(report.photoUrls?.length > 3 || report.videoUrls?.length > 3) && (
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                              <div className="text-center">
                                <p className="text-xs font-bold text-gray-600">+{(report.photoUrls?.length || 0) + (report.videoUrls?.length || 0) - 3}</p>
                                <p className="text-xs text-gray-500">more</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Assign Staff Member
                      </label>
                      <div className="relative">
                        <select
                          value={assignments[report.id] || ""}
                          onChange={(e) =>
                            handleAssignStaff(report.id, e.target.value)
                          }
                          className="w-full px-4 py-3 text-base bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl shadow-sm appearance-none cursor-pointer transition-all duration-200 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white"
                        >
                          <option value="" className="text-gray-500">Choose a staff member...</option>
                          {staffMembers.map((staff) => (
                            <option key={staff.id} value={staff.id} className="py-2">
                              {staff.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <svg className="w-5 h-5 text-blue-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleConfirmAssign(report.id)}
                            disabled={isAssigning[report.id] || !assignments[report.id]}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 min-h-[48px] ${
                              isAssigning[report.id]
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : !assignments[report.id]
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:scale-105"
                            }`}
                          >
                            {isAssigning[report.id] ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Assigning...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Assign
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => openModal(report)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 min-h-[48px]"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Details
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <ReportDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        report={selectedReport}
        sastoken={sastoken}
        onMediaView={(url, type) => openMediaViewer(url, type)}
        showUpdateHistory={false}
      />

      {/* Media Lightbox Viewer */}
      {mediaViewerOpen && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100]"
          onClick={closeMediaViewer}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              className="absolute -top-12 right-0 w-10 h-10 bg-white/95 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white hover:text-gray-900 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
              onClick={closeMediaViewer}
            >
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {mediaViewerType === "image" ? (
              <img
                src={`${mediaViewerUrl}${mediaViewerUrl.includes("?") ? "&" : "?"}rscd=inline&rsct=image/jpeg`}
                alt="Preview"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={`${mediaViewerUrl}${mediaViewerUrl.includes("?") ? "&" : "?"}rscd=inline&rsct=video/mp4`}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded"
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
