"use client";

export default function AssignedReportsPage() {
  // Mock data for assigned reports
  const assignedReports = [
    {
      id: 1,
      title: "Leaking Pipe in Dorm 3",
      assignedTo: "John Doe",
      dueDate: "2024-12-12",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Broken Window in Library",
      assignedTo: "Jane Smith",
      dueDate: "2024-12-15",
      status: "Pending",
    },
    {
      id: 3,
      title: "Flickering Lights in Hallway",
      assignedTo: "Michael Brown",
      dueDate: "2024-12-10",
      status: "Completed",
    },
  ];

  return (
    <div className="flex-1 p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6">Assigned Reports</h1>
      <p className="text-gray-600 mb-4">
        Manage and view reports assigned to team members.
      </p>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 text-sm font-semibold">#</th>
              <th className="p-3 text-sm font-semibold">Title</th>
              <th className="p-3 text-sm font-semibold">Assigned To</th>
              <th className="p-3 text-sm font-semibold">Due Date</th>
              <th className="p-3 text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {assignedReports.map((report, index) => (
              <tr
                key={report.id}
                className={`border-t ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="p-3 text-sm">{index + 1}</td>
                <td className="p-3 text-sm">{report.title}</td>
                <td className="p-3 text-sm">{report.assignedTo}</td>
                <td className="p-3 text-sm">{report.dueDate}</td>
                <td
                  className={`p-3 text-sm font-semibold ${
                    report.status === "Completed"
                      ? "text-green-600"
                      : report.status === "In Progress"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {report.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
