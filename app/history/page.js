"use client";

export default function HistoryPage() {
  // Mock data for completed reports
  const completedReports = [
    {
      id: 1,
      title: "Leaking Pipe in Dorm 3",
      assignedTo: "John Doe",
      reportedDate: "2024-12-10",
      completionDate: "2024-12-13",
    },
    {
      id: 2,
      title: "Broken Window in Library",
      assignedTo: "Jane Smith",
      reportedDate: "2024-12-12",
      completionDate: "2024-12-16",
    },
    {
      id: 3,
      title: "Flickering Lights in Hallway",
      assignedTo: "Michael Brown",
      reportedDate: "2024-12-09",
      completionDate: "2024-12-11",
    },
  ];

  return (
    <div className="flex-1 p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6">Report History</h1>
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
                <td className="p-3 text-sm">{report.title}</td>
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
