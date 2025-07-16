"use client";

import { useState, useEffect } from "react";

export default function ReportsPage() {
  const backendUrl = "http://localhost:8080/api"; //test link
  //const backendUrl = "https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
  const sastoken = "?sv=2024-11-04&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2027-07-16T22:11:38Z&st=2025-07-16T13:56:38Z&spr=https,http&sig=5xb1czmfngshEckXBdlhtw%2BVe%2B5htYpCnXyhPw9tnHk%3D";

  const [reports, setReports] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [priority, setPriority] = useState({}); // State to hold priority for {each report} it will hold all the priorities

  useEffect(() => {
    fetchReports();
    fetchStaffMembers();
  }, []);

  const fetchReports = () => {
    fetch(`${backendUrl}/issues/unassigned`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setReports(data);
        setAssignments(data.reduce((acc, r) => ({ ...acc, [r.id]: "" }), {}));
        setPriority(data.reduce((acc, r) => ({ ...acc, [r.id]: "" }), {})); // this set the priority state as empty first
      });
    
  };

  const fetchStaffMembers = () => {
    fetch(`${backendUrl}/staff`)
      .then((res) => res.json())
      .then(setStaffMembers);
  };

  const handleAssignStaff = (id, staffId) => {
    setAssignments((prev) => ({ ...prev, [id]: staffId }));
  };

  const handleConfirmAssign = (id) => {
    if (!assignments[id]) return alert("Please select a staff member.");
    if (!priority[id]) return alert("Please select a priority.");
    fetch(`${backendUrl}/issues/${id}/assign?staffId=${assignments[id]}&priority=${priority[id]}`, {method: "POST",})
      .then((res) => {
        if (res.ok) {
          alert("Assigned successfully.");
          fetchReports();
        } else alert("Failed to assign.");
      });
  };

  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const filteredReports = reports.filter(
    (r) =>
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedReports = filteredReports.reduce((groups, r) => {
    if (!groups[r.category]) groups[r.category] = [];
    groups[r.category].push(r);
    return groups;
  }, {});

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reported Issues</h1>
        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by description or category..."
          className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {Object.entries(groupedReports).map(([category, reports]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-bold mb-4">{category}</h2>
          <div className="grid grid-cols-3 gap-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <h2 className="text-lg font-semibold mb-2">{report.description}</h2>
                <p className="text-sm text-gray-600">Category: {report.category}</p>

                <div className="mt-4 flex items-center gap-2">
                  <label className="text-sm font-semibold">Priority</label>
                  <select
                    
                    value={priority[report.id] || ""}
                    onChange={(e) =>
                      setPriority((prev) => ({
                        ...prev,
                        [report.id]: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="" disabled hidden>Set Priority</option>
                    <option value="LOW">Low</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-semibold block mb-2">Assign Staff Member</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={assignments[report.id] || ""}
                    onChange={(e) => handleAssignStaff(report.id, e.target.value)}
                  >
                    <option value="" disabled hidden>Select Staff Member</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleOpenModal(report)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleConfirmAssign(report.id)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal with click-outside-to-close */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-1/3 h-4/5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100% - 20px)" }}>
              <h2 className="text-xl font-bold mb-4">Report Details</h2>
              <p><strong>Description:</strong> {selectedReport.description}</p>
              <p><strong>Category:</strong> {selectedReport.category}</p>
              {selectedReport.usingCustomLocation === true && (
                <p><strong>Location:</strong> {selectedReport.customLocation}</p>
              )}
              
              {selectedReport.usingCustomLocation === false && (
                <p><strong>Location:</strong> Some sort of location info</p>
              )}
              <p><strong>Reported By:</strong> {selectedReport.reportedBy?.username}</p>
              <p><strong>Reported Date:</strong> {new Date(selectedReport.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Bangkok" })}</p>

              {selectedReport.photoUrls?.length > 0 ? (
                <div className="mt-3">
                  <strong>Report Photo:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedReport.photoUrls.map((photo, i) => (
                      <img
                        key={i}
                        src={photo + sastoken}
                        alt={`Report Photo ${i + 1}`}
                        className="w-60 h-60 object-cover rounded-md border shadow"
                        onError={(e) => (e.target.src = "/placeholder.jpg")}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2"><strong>Report Photo:</strong> No photos</p>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-sm rounded hover:bg-gray-400"
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
            width: 6px;
          }
          .flex-1::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
          }
          .flex-1::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
      </style>
    </div>
  );
}
