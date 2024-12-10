"use client";

export default function UpdatesPage() {
  // Mock data for updates
  const updates = [
    {
      id: 1,
      title: "Maintenance Completed",
      description:
        "The leaking pipe in Dorm 3 has been fixed by the maintenance team.",
      date: "2024-12-09",
    },
    {
      id: 2,
      title: "Pending Approval",
      description:
        "The request for fixing the broken window in the library is awaiting approval.",
      date: "2024-12-08",
    },
    {
      id: 3,
      title: "In Progress",
      description:
        "The flickering lights in the science building hallway are being addressed by electricians.",
      date: "2024-12-07",
    },
  ];

  return (
    <div className="flex-1 p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6">Updates</h1>
      <p className="text-gray-600 mb-4">
        Check out the latest updates provided to issue reporters by admins.
      </p>

      {/* Updates List */}
      <div className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{update.title}</h2>
            <p className="text-gray-700">{update.description}</p>
            <p className="text-gray-500 text-sm mt-2">Date: {update.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
