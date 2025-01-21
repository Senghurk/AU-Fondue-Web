"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  // Mock data for statistics
  const stats = [
    { label: "Total Reports", value: 152, color: "bg-blue-500" },
    { label: "Pending Assignments", value: 34, color: "bg-yellow-500" },
    { label: "Completed Tasks", value: 98, color: "bg-green-500" },
    { label: "Urgent Issues", value: 20, color: "bg-red-500" },
  ];

  // Quick Links Data
  const quickLinks = [
    {
      label: "View All Reports",
      description: "Explore and manage all submitted reports.",
      color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      path: "/reports",
    },
    {
      label: "Assigned Tasks",
      description: "Monitor tasks assigned to team members.",
      color: "bg-green-100 text-green-800 hover:bg-green-200",
      path: "/assignedReports",
    },
    {
      label: "View Updates",
      description: "Stay updated on progress and announcements.",
      color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      path: "/updates",
    },
  ];

  // Navigate Function
  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <div className="flex-1 p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Welcome, Admin 👋</h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of the system. Navigate through reports, assigned tasks, and updates.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-lg shadow-md p-6 text-white ${stat.color}`}
          >
            <h3 className="text-lg font-semibold">{stat.label}</h3>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(link.path)}
              role="button"
              className={`block p-6 rounded-lg shadow-md transition cursor-pointer ${link.color}`}
            >
              <h3 className="text-lg font-semibold">{link.label}</h3>
              <p className="mt-2">{link.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">System Overview</h2>
        <p className="text-gray-600 mb-4">
          The admin dashboard provides a comprehensive overview of tasks, reports, and team
          activities. Here’s what’s happening:
        </p>
        <ul className="list-disc pl-6 text-gray-600">
          <li>Review 34 pending tasks and assign them to team members.</li>
          <li>Follow up on 20 urgent issues requiring immediate attention.</li>
          <li>Analyze trends in reports to identify recurring issues.</li>
          <li>Communicate updates effectively to keep everyone informed.</li>
        </ul>
      </div>
    </div>
  );
}
