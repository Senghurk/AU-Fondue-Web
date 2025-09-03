"use client";

import { useState, useEffect } from "react";
import { getBackendUrl } from "../config/api";
import ReportDetailsModal from "../components/ReportDetailsModal";

export default function AssignedReportsPage() {
  const backendUrl = getBackendUrl();
  const sastoken =
    "?sv=2024-11-04&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2027-07-16T22:11:38Z&st=2025-07-16T13:56:38Z&spr=https,http&sig=5xb1czmfngshEckXBdlhtw%2BVe%2B5htYpCnXyhPw9tnHk%3D";

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const [status, setStatus] = useState("");
  const [comments, setComments] = useState("");
  const [photos, setPhotos] = useState([]);
  const [resolutionType, setResolutionType] = useState("");

  const [updates, setUpdates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" means show all
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  // Media viewer (prevents downloads; shows images/videos inline)
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [mediaViewerUrl, setMediaViewerUrl] = useState("");
  const [mediaViewerType, setMediaViewerType] = useState(""); // "image" or "video"
  
  // Track viewed reports to hide NEW tag - load from localStorage
  const [viewedReports, setViewedReports] = useState(() => {
    if (typeof window !== 'undefined') {
      // Try to load from new timestamped format first
      const timestamped = localStorage.getItem('viewedReportsWithTimestamp');
      if (timestamped) {
        try {
          const data = JSON.parse(timestamped);
          return new Set(data.map(item => item.reportId));
        } catch (error) {
          console.error('Error parsing timestamped viewed reports:', error);
        }
      }
      
      // Fallback to old format
      const stored = localStorage.getItem('viewedReports');
      if (stored) {
        try {
          return new Set(JSON.parse(stored));
        } catch (error) {
          console.error('Error parsing viewed reports:', error);
        }
      }
    }
    return new Set();
  });

  // Track latest remarks for each report - load from localStorage
  const [reportRemarks, setReportRemarks] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('reportRemarks');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error('Error parsing report remarks:', error);
        }
      }
    }
    return {};
  });

  // ------- Helpers: notifications ----------
  const UpdateFeedback = ({ message, onClose }) => {
    if (!message) return null;
    const style =
      message.type === "success"
        ? "bg-green-100 border-green-400 text-green-700"
        : message.type === "warning"
        ? "bg-yellow-100 border-yellow-400 text-yellow-700"
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

  // ------- Media helpers ----------
  const toInlineUrl = (raw, type = "image") => {
    // Ensure Azure Blob serves inline, not attachment
    const base = `${raw}${sastoken}`;
    const joiner = base.includes("?") ? "&" : "?";
    const contentType = type === "video" ? "video/mp4" : "image/jpeg";
    return `${base}${joiner}rscd=inline&rsct=${contentType}`;
  };
  
  const openMediaViewer = (raw, type = "image") => {
    setMediaViewerUrl(toInlineUrl(raw, type));
    setMediaViewerType(type);
    setMediaViewerOpen(true);
  };
  
  const closeMediaViewer = () => {
    setMediaViewerUrl("");
    setMediaViewerType("");
    setMediaViewerOpen(false);
  };

  // ------- Data fetch ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await fetchReports();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load assigned reports. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Clean up old viewed reports (older than 7 days) from localStorage
    cleanupOldViewedReports();
  }, []);

  // Clean up old viewed reports to prevent localStorage bloat
  const cleanupOldViewedReports = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('viewedReportsWithTimestamp');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const now = Date.now();
          const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
          
          // Keep only reports viewed within last 7 days
          const filtered = data.filter(item => item.timestamp > sevenDaysAgo);
          localStorage.setItem('viewedReportsWithTimestamp', JSON.stringify(filtered));
          
          // Update current state with cleaned data
          const cleanedIds = filtered.map(item => item.reportId);
          setViewedReports(new Set(cleanedIds));
        } catch (error) {
          console.error('Error cleaning up viewed reports:', error);
        }
      }
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${backendUrl}/issues/assigned`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (Array.isArray(data)) setReports(data);
      else setReports([]);
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  };

  const fetchUpdates = async (issueId) => {
    try {
      const response = await fetch(`${backendUrl}/issues/${issueId}/updates`);
      if (!response.ok) throw new Error("Failed to fetch updates");
      const data = await response.json();
      setUpdates(data);
    } catch (error) {
      console.error("Error fetching updates:", error);
    }
  };

  // ------- UI handlers ----------
  // Mark report as viewed (remove NEW tag)
  const markReportAsViewed = (reportId) => {
    setViewedReports(prev => {
      const newSet = new Set(prev).add(reportId);
      
      // Save to localStorage with timestamp
      if (typeof window !== 'undefined') {
        try {
          // Get existing timestamped data
          const existing = localStorage.getItem('viewedReportsWithTimestamp');
          const existingData = existing ? JSON.parse(existing) : [];
          
          // Add new report if not already there
          const reportExists = existingData.some(item => item.reportId === reportId);
          if (!reportExists) {
            existingData.push({
              reportId: reportId,
              timestamp: Date.now()
            });
          }
          
          localStorage.setItem('viewedReportsWithTimestamp', JSON.stringify(existingData));
          
          // Remove old format if it exists
          localStorage.removeItem('viewedReports');
        } catch (error) {
          console.error('Error saving viewed report:', error);
        }
      }
      
      return newSet;
    });
  };

  const handleOpenModal = (report, type) => {
    setSelectedReport(report);
    setModalType(type);
    setStatus(report.status || "PENDING");
    setComments("");
    setPhotos([]);
    setResolutionType("");
    setUpdateMessage(null);
    setIsModalOpen(true);
    if (type === "details") {
      fetchUpdates(report.id);
      // Mark as viewed when details are opened
      if (isNewReport(report)) {
        markReportAsViewed(report.id);
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
  };

  useEffect(() => {
    // cleanup object URLs if created anywhere else
    return () => {
      photos.forEach((p) => URL.revokeObjectURL?.(p));
    };
  }, [photos]);

  // ------- Update submit ----------
  const handleUpdate = async () => {
    if (!selectedReport) return;

    // Validate that a remark is selected
    if (!resolutionType) {
      setUpdateMessage({
        type: "error",
        text: "Please select a remark before updating the report.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("issueId", selectedReport.id);
    formData.append("status", status);
    formData.append("comment", comments);
    formData.append("updatedBy", "admin@au.edu");
    // NEW: resolution type
    formData.append("resolutionType", resolutionType);

    photos.forEach((photo) => formData.append("photos", photo));

    try {
      setIsUpdating(true);
      setUpdateMessage(null);

      const response = await fetch(`${backendUrl}/issues/updates`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed: ${response.status} - ${errorDetails}`);
      }

      const result = await response.json();

      let message = "Report updated successfully";
      if (result.notificationSent) {
        message += ". Push notification sent to user.";
      } else if (result.notificationError) {
        message += `. Warning: Notification failed - ${result.notificationError}`;
      }

      setUpdateMessage({
        type: result.notificationSent ? "success" : "warning",
        text: message,
      });

      // Save the remark to localStorage for display on report cards
      if (resolutionType && selectedReport) {
        saveRemarkToStorage(selectedReport.id, resolutionType);
      }

      setStatus("PENDING");
      setComments("");
      setPhotos([]);
      setIsModalOpen(false);
      fetchReports();

      setTimeout(() => setUpdateMessage(null), 5000);
    } catch (error) {
      console.error("Error updating report:", error);
      setUpdateMessage({
        type: "error",
        text: `Failed to update the report: ${error.message}`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // ------- Filter + Group ----------
  // Hide COMPLETED from the page
  const filteredReports = reports.filter((report) => {
    // Exclude completed reports
    if (report.status === "COMPLETED") return false;
    
    // Apply search filter
    const matchesSearch = !searchQuery || 
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Apply status filter
    if (!statusFilter) return true; // Show all if no status filter
    
    switch (statusFilter) {
      case "PENDING":
        return report.status === "PENDING";
      case "IN_PROGRESS":
        return report.status === "IN PROGRESS"; // Fixed: using space instead of underscore
      case "OK":
        const okRemark = getLatestRemark(report);
        return okRemark === "OK";
      case "RF":
        const rfRemark = getLatestRemark(report);
        return rfRemark === "RF";
      case "PR":
        const prRemark = getLatestRemark(report);
        return prRemark === "PR";
      default:
        return true;
    }
  });

  // Recent reports (last 10 reports, sorted by newest first)
  const recentReports = [...filteredReports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  // Check if report is new (within last 24 hours)
  const isNewReport = (report) => {
    const reportDate = new Date(report.createdAt);
    const now = new Date();
    const diffHours = (now - reportDate) / (1000 * 60 * 60);
    const isWithin24Hours = diffHours <= 24;
    const hasBeenViewed = viewedReports.has(report.id);
    return isWithin24Hours && !hasBeenViewed;
  };

  // Save remark to localStorage
  const saveRemarkToStorage = (reportId, remark) => {
    const updatedRemarks = { ...reportRemarks, [reportId]: remark };
    setReportRemarks(updatedRemarks);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('reportRemarks', JSON.stringify(updatedRemarks));
    }
  };

  // Get the latest remark from stored data or report updates
  const getLatestRemark = (report) => {
    // First check if we have a stored remark for this report
    if (reportRemarks[report.id]) {
      return reportRemarks[report.id];
    }
    
    // Fallback to report updates if available
    if (report.updates && Array.isArray(report.updates) && report.updates.length > 0) {
      // Sort updates by date (most recent first) and find the latest one with a remark
      const sortedUpdates = [...report.updates].sort((a, b) => 
        new Date(b.updateTime || b.createdAt) - new Date(a.updateTime || a.createdAt)
      );
      
      for (const update of sortedUpdates) {
        if (update.resolutionType && ['OK', 'RF', 'PR'].includes(update.resolutionType)) {
          return update.resolutionType;
        }
      }
    }
    
    // If no stored remark and no updates, return null
    return null;
  };

  // Render remark tag with appropriate styling
  const renderRemarkTag = (remark) => {
    if (!remark) return null;

    const remarkStyles = {
      'OK': {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      },
      'RF': {
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800', 
        borderColor: 'border-orange-300',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      },
      'PR': {
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      }
    };

    const style = remarkStyles[remark];
    if (!style) return null;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${style.bgColor} ${style.textColor} border ${style.borderColor} ml-2`}>
        {style.icon}
        {remark}
      </span>
    );
  };

  const groupedReports = filteredReports.reduce((groups, report) => {
    if (!groups[report.category]) groups[report.category] = [];
    groups[report.category].push(report);
    return groups;
  }, {});

  // Toggle category collapse/expand
  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="flex-1 p-6">
      {updateMessage && (
        <UpdateFeedback
          message={updateMessage}
          onClose={() => setUpdateMessage(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6">Assigned Reports</h1>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading assigned reports...</span>
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
          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex gap-3 flex-col sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Status Filter Dropdown */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="OK">OK (Approved)</option>
                  <option value="RF">RF (Requisition Form)</option>
                  <option value="PR">PR (Purchase Request)</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(searchQuery || statusFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>

            {/* Filter Summary */}
            {(searchQuery || statusFilter) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-2 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Status: {
                      statusFilter === "RF" ? "RF (Requisition Form)" : 
                      statusFilter === "PR" ? "PR (Purchase Request)" : 
                      statusFilter === "OK" ? "OK (Approved)" :
                      statusFilter === "IN_PROGRESS" ? "In Progress" :
                      statusFilter
                    }
                    <button
                      onClick={() => setStatusFilter("")}
                      className="ml-2 hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Recent Reports Section */}
          {recentReports.length > 0 && (
            <div className="mb-10">
              <div 
                className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-4 py-3 mb-4 cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md"
                onClick={() => toggleCategory('Recent')}
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800">Recent Reports</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                    {recentReports.length} {recentReports.length === 1 ? 'report' : 'reports'}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                    </svg>
                    Latest
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">
                    {collapsedCategories['Recent'] ? 'Show' : 'Hide'}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                      collapsedCategories['Recent'] ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {!collapsedCategories['Recent'] && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Header with gradient background */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                              {report.description?.substring(0, 45)}...
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">
                              Report #{report.id}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                              report.status === "IN PROGRESS"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                report.status === "IN PROGRESS"
                                  ? "bg-blue-500"
                                  : "bg-red-500"
                              }`}></div>
                              {report.status}
                            </span>
                            {isNewReport(report) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                NEW
                              </span>
                            )}
                            {renderRemarkTag(getLatestRemark(report))}
                          </div>
                        </div>
                      </div>

                      {/* Content section - Same as regular cards */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-2 mb-3">
                          <div className="flex items-center text-sm">
                            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{report.customLocation}</p>
                              <p className="text-gray-500 text-xs">Location</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{report.reportedBy?.username}</p>
                              <p className="text-gray-500 text-xs">Reported by</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{report.assignedTo?.name}</p>
                              <p className="text-gray-500 text-xs">Assigned to</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{new Date(report.createdAt).toLocaleDateString()}</p>
                              <p className="text-gray-500 text-xs">Date reported</p>
                            </div>
                          </div>
                        </div>

                        {/* Media Gallery */}
                        {(report.photoUrls?.length > 0 || report.videoUrls?.length > 0) && (
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-semibold text-gray-700">Media Attachments</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                              {/* Photos */}
                              {report.photoUrls?.slice(0, 3).map((photo, i) => (
                                <div key={`photo-${i}`} className="relative group">
                                  <img
                                    src={toInlineUrl(photo)}
                                    alt={`Photo ${i + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0 cursor-pointer transition-all duration-200 group-hover:border-purple-300 group-hover:shadow-md"
                                    onClick={() => openMediaViewer(photo, "image")}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center pointer-events-none">
                                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                  </div>
                                </div>
                              ))}
                              {/* Videos */}
                              {report.videoUrls?.slice(0, 3).map((video, i) => (
                                <div key={`video-${i}`} className="relative group">
                                  <video
                                    src={toInlineUrl(video, "video")}
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0 cursor-pointer transition-all duration-200 group-hover:border-purple-300 group-hover:shadow-md"
                                    onClick={() => openMediaViewer(video, "video")}
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
                              ))}
                              {/* More items indicator */}
                              {(report.photoUrls?.length > 3 || report.videoUrls?.length > 3) && (
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
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
                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleOpenModal(report, "update")}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Update
                              </div>
                            </button>
                            <button
                              onClick={() => handleOpenModal(report, "details")}
                              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
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
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categorized Groups */}
          {Object.keys(groupedReports).length === 0 && recentReports.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No assigned reports found.</p>
            </div>
          ) : (
            Object.entries(groupedReports)
              .sort(([a], [b]) => a.localeCompare(b)) // Sort categories alphabetically
              .map(([category, reports]) => (
                <div key={category} className="mb-10">
                  <div 
                    className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-green-50 rounded-lg px-4 py-3 mb-4 cursor-pointer hover:from-gray-100 hover:to-green-100 transition-all duration-200 border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-800">{category}</h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
                        {reports.length} {reports.length === 1 ? 'report' : 'reports'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        {collapsedCategories[category] ? 'Show' : 'Hide'}
                      </span>
                      <svg 
                        className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                          collapsedCategories[category] ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {!collapsedCategories[category] && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {/* Header with gradient background */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                                  {report.description?.substring(0, 45)}...
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">
                                  Report #{report.id}
                                </p>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                                  report.status === "IN PROGRESS"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    report.status === "IN PROGRESS"
                                      ? "bg-blue-500"
                                      : "bg-red-500"
                                  }`}></div>
                                  {report.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Content section */}
                          <div className="p-4">
                            <div className="grid grid-cols-1 gap-2 mb-3">
                              <div className="flex items-center text-sm">
                                <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-2">
                                  <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{report.customLocation}</p>
                                  <p className="text-gray-500 text-xs">Location</p>
                                </div>
                              </div>
                              <div className="flex items-center text-sm">
                                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{report.reportedBy?.username}</p>
                                  <p className="text-gray-500 text-xs">Reported by</p>
                                </div>
                              </div>
                              <div className="flex items-center text-sm">
                                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                                  <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{report.assignedTo?.name}</p>
                                  <p className="text-gray-500 text-xs">Assigned to</p>
                                </div>
                              </div>
                              <div className="flex items-center text-sm">
                                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{new Date(report.createdAt).toLocaleDateString()}</p>
                                  <p className="text-gray-500 text-xs">Date reported</p>
                                </div>
                              </div>
                            </div>

                            {/* Media Gallery */}
                            {(report.photoUrls?.length > 0 || report.videoUrls?.length > 0) && (
                              <div className="mb-4">
                                <div className="flex items-center mb-2">
                                  <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm font-semibold text-gray-700">Media Attachments</span>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                  {/* Photos */}
                                  {report.photoUrls?.slice(0, 3).map((photo, i) => (
                                    <div key={`photo-${i}`} className="relative group">
                                      <img
                                        src={toInlineUrl(photo)}
                                        alt={`Photo ${i + 1}`}
                                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0 cursor-pointer transition-all duration-200 group-hover:border-blue-300 group-hover:shadow-md"
                                        onClick={() => openMediaViewer(photo, "image")}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center pointer-events-none">
                                        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                      </div>
                                    </div>
                                  ))}
                                  {/* Videos */}
                                  {report.videoUrls?.slice(0, 3).map((video, i) => (
                                    <div key={`video-${i}`} className="relative group">
                                      <video
                                        src={toInlineUrl(video, "video")}
                                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0 cursor-pointer transition-all duration-200 group-hover:border-blue-300 group-hover:shadow-md"
                                        onClick={() => openMediaViewer(video, "video")}
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
                                  ))}
                                  {/* More items indicator */}
                                  {(report.photoUrls?.length > 3 || report.videoUrls?.length > 3) && (
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
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
                            <div className="border-t border-gray-100 pt-3">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleOpenModal(report, "update")}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Update
                                  </div>
                                </button>
                                <button
                                  onClick={() => handleOpenModal(report, "details")}
                                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-2 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
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
                      ))}
                    </div>
                  )}
                </div>
              ))
          )}
        </>
      )}

      {/* Modal - Hide when using new details modal */}
      {isModalOpen && selectedReport && modalType !== "details" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {modalType === "update" ? "Update Report" : "Report Details"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Report #{selectedReport.id} - {selectedReport.category}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center group backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {modalType === "update" ? (
                  <>
                    {/* UPDATE FORM */}
                    <div className="space-y-6">
                      {/* Status */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <label className="block text-base font-semibold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          Update Status
                        </label>
                        <div className="relative">
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-5 py-4 text-base bg-white border-2 border-gray-300 rounded-xl shadow-sm appearance-none cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium"
                          >
                            <option value="PENDING" className="py-2">Pending</option>
                            <option value="IN PROGRESS" className="py-2">In Progress</option>
                            <option value="COMPLETED" className="py-2">Completed</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <svg className="w-5 h-5 text-blue-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Remark */}
                      <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                        <label className="block text-base font-semibold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                          </div>
                          Remark* <span className="text-red-500 text-sm">(Required)</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          <label className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 ${
                            resolutionType === "OK" 
                              ? "border-green-300 bg-green-50 shadow-md" 
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          }`}>
                            <input
                              type="radio"
                              name="resolutionType"
                              value="OK"
                              checked={resolutionType === "OK"}
                              onChange={(e) => setResolutionType(e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="font-medium text-gray-900">OK</span>
                          </label>
                          <label className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 ${
                            resolutionType === "RF" 
                              ? "border-blue-300 bg-blue-50 shadow-md" 
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          }`}>
                            <input
                              type="radio"
                              name="resolutionType"
                              value="RF"
                              checked={resolutionType === "RF"}
                              onChange={(e) => setResolutionType(e.target.value)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="font-medium text-gray-900">RF</span>
                          </label>
                          <label className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 ${
                            resolutionType === "PR" 
                              ? "border-purple-300 bg-purple-50 shadow-md" 
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          }`}>
                            <input
                              type="radio"
                              name="resolutionType"
                              value="PR"
                              checked={resolutionType === "PR"}
                              onChange={(e) => setResolutionType(e.target.value)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <span className="font-medium text-gray-900">PR</span>
                          </label>
                        </div>
                        <div className="bg-white/70 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-blue-600 min-w-[24px]">RF:</span>
                            <span>Requisition Form - Materials or supplies need to be procured through proper channels</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-purple-600 min-w-[24px]">PR:</span>
                            <span>Purchase Request - External contractor or vendor assistance is required for resolution</span>
                          </div>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <label className="block text-base font-semibold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </div>
                          Comments
                        </label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 resize-none bg-white shadow-sm transition-all duration-200"
                          placeholder="Add detailed comments about the report update..."
                        />
                      </div>

                      {/* Upload Photos */}
                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <label className="block text-base font-semibold text-gray-800 mb-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          Upload Photos <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                        </label>
                        <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 bg-white/50 hover:bg-white/70 transition-colors duration-200">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          />
                          {photos.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {photos.map((photo, i) => (
                                <div
                                  key={i}
                                  className="relative w-20 h-20 rounded overflow-hidden border shadow cursor-pointer"
                                >
                                  <img
                                    src={URL.createObjectURL(photo)}
                                    alt={photo.name}
                                    className="object-cover w-full h-full"
                                    onClick={() => openViewer(URL.createObjectURL(photo))}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                                    }
                                    className="absolute top-0 right-0 bg-black bg-opacity-50 text-white px-1 text-xs rounded-bl hover:bg-red-600"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex gap-4 mt-6">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={isUpdating || !resolutionType}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                          isUpdating || !resolutionType
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105"
                        }`}
                      >
                        {isUpdating ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Updating Report...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Update Report
                          </div>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* DETAILS VIEW */}
                    <div className="space-y-3">
                      <p>
                        <strong>Description:</strong> {selectedReport.description}
                      </p>
                      <p>
                        <strong>Category:</strong> {selectedReport.category}
                      </p>
                      <p>
                        <strong>Location:</strong> {selectedReport.customLocation}
                      </p>
                      <p>
                        <strong>Reported By:</strong>{" "}
                        {selectedReport.reportedBy?.username}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedReport.status}
                      </p>
                      <p>
                        <strong>Assigned To:</strong>{" "}
                        {selectedReport.assignedTo?.name}
                      </p>
                      <p>
                        <strong>Reported At:</strong>{" "}
                        {new Date(selectedReport.createdAt).toLocaleString(
                          "en-GB",
                          { timeZone: "Asia/Bangkok" }
                        )}
                      </p>
                    </div>

                    {selectedReport.photoUrls?.length > 0 && (
                      <div className="mt-4">
                        <strong>Photos:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedReport.photoUrls.map((photo, i) => (
                            <img
                              key={i}
                              src={toInlineUrl(photo)}
                              alt={`Photo ${i + 1}`}
                              className="w-40 h-40 object-cover rounded border shadow cursor-pointer hover:opacity-75"
                              onClick={() => openMediaViewer(photo, "image")}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReport.videoUrls?.length > 0 && (
                      <div className="mt-4">
                        <strong>Videos:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedReport.videoUrls.map((video, i) => (
                            <div key={i} className="relative">
                              <video
                                src={toInlineUrl(video, "video")}
                                className="w-40 h-40 object-cover rounded border shadow cursor-pointer hover:opacity-75"
                                onClick={() => openMediaViewer(video, "video")}
                                onMouseEnter={(e) => e.target.play()}
                                onMouseLeave={(e) => {e.target.pause(); e.target.currentTime = 0;}}
                                muted
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-black/50 rounded-full p-2">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Update history */}
                    <hr className="my-4" />
                    <h3 className="font-semibold mb-2">Update History</h3>
                    {updates.length === 0 ? (
                      <p className="text-gray-500">No updates yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {updates.map((update) => (
                          <div key={update.id} className="border p-3 rounded bg-gray-50">
                            <p>
                              <strong>Comment:</strong> {update.comment}
                            </p>
                            <p>
                              <strong>Status:</strong> {update.status}
                            </p>
                            {/* If backend returns resolutionType in update, show it */}
                            {update.resolutionType && (
                              <p>
                                <strong>Resolution:</strong> {update.resolutionType}
                              </p>
                            )}
                            <p>
                              <strong>Updated At:</strong>{" "}
                              {new Date(update.updateTime).toLocaleString(
                                "en-GB",
                                { timeZone: "Asia/Bangkok" }
                              )}
                            </p>
                            {update.photoUrls?.length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {update.photoUrls.map((photo, i) => (
                                  <img
                                    key={i}
                                    src={toInlineUrl(photo)}
                                    alt={`Update Photo ${i + 1}`}
                                    className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                                    onClick={() => openMediaViewer(photo, "image")}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Beautiful Details Modal - Only for details view */}
      {modalType === "details" && (
        <ReportDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          report={selectedReport}
          sastoken={sastoken}
          onMediaView={(url, type) => openMediaViewer(url, type)}
          showUpdateHistory={true}
          updateHistory={updates}
        />
      )}

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
                src={mediaViewerUrl}
                alt="Preview"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={mediaViewerUrl}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded"
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
              >
                Your browser does not support video playbook.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
}