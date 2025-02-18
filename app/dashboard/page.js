"use client";
 

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, Clock } from 'lucide-react'; // Import icons
 
export default function HomePage() {
  const router = useRouter();
  const backendUrl = "https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
  // Setting data for statistics
  const [stats, setStats] = useState([
    { label: "Total Reports", value: 0, color: "bg-blue-500", icon: <FileText size={32} /> },
    { label: "Pending Assignments", value: 0, color: "bg-yellow-500", icon: <Clock size={32} /> },
    { label: "Completed Tasks", value: 0, color: "bg-green-500", icon: <CheckCircle size={32} /> },
  ]);

  // Fetching data for statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${backendUrl}/issues/stats`); 
        const data = await response.json();

        setStats([
          { label: "Total Reports", value: data.totalIssues, color: "bg-blue-500", icon: <FileText size={32} /> },
          { label: "Pending Assignments", value: data.pendingIssues, color: "bg-yellow-500", icon: <Clock size={32} /> },
          { label: "Completed Tasks", value: data.completedIssues, color: "bg-green-500", icon: <CheckCircle size={32} /> },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

 
  // Quick Links Data
  const quickLinks = [
    {
      label: "View All Reports",
      description: "Explore and manage all submitted reports.",
      color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      path: "/reports",
      icon: <FileText size={28} />,
    },
    {
      label: "Assigned Reports",
      description: "Monitor tasks assigned to team members.",
      color: "bg-green-100 text-green-800 hover:bg-green-200",
      path: "/assignedReports",
      icon: <Clock size={28} />,
    },
    {
      label: "View History",
      description: "Access the history of completed reports.",
      color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      path: "/history",
      icon: <CheckCircle size={28} />,
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
        <h1 className="text-4xl font-bold text-black">Welcome Admin</h1>
        <p className="text-gray-600 dark:text-grey-800">Manage your reports and tasks efficiently.</p>
      </div>
 
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-2xl shadow-lg p-6 text-white flex items-center justify-between ${stat.color} transition-transform transform hover:scale-105`}
          >
            <div>
              <h3 className="text-lg font-semibold">{stat.label}</h3>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>
 
      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(link.path)}
              role="button"
              className={`block p-6 rounded-2xl shadow-lg transition cursor-pointer flex items-start gap-4 ${link.color} hover:shadow-xl`}
            >
              {link.icon}
              <div>
                <h3 className="text-lg font-semibold">{link.label}</h3>
                <p className="mt-2 text-sm">{link.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
 
      {/* System Overview
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">System Overview</h2>
        <p className="text-gray-600  mb-4">
          The admin dashboard provides a comprehensive overview of tasks, reports, and team
          activities. Here’s what’s happening:
        </p>
        <ul className="list-disc pl-6 text-gray-600">
          <li>Review <span className="font-semibold">34 pending tasks</span> and assign them to team members.</li>
          <li>Analyze trends in reports to identify recurring issues.</li>
          <li>Communicate updates effectively to keep everyone informed.</li>
        </ul>
      </div> */}
    </div>
  );
}