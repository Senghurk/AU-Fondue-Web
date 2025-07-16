"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient"; // adjust path if needed

import {
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function HomePage() {
  const router = useRouter();
  const backendUrl =  "http://localhost:8080/api" //"https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";

  const [userName, setUserName] = useState(null);

  // State
  const [stats, setStats] = useState([
    {
      label: "Total Reports",
      value: 0,
      color: "bg-blue-500",
      icon: <FileText size={32} />,
    },
    {
      label: "Pending Assignments",
      value: 0,
      color: "bg-yellow-500",
      icon: <Clock size={32} />,
    },
    {
      label: "Completed Tasks",
      value: 0,
      color: "bg-green-500",
      icon: <CheckCircle size={32} />,
    },
  ]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [reportsOverTime, setReportsOverTime] = useState([]);

  // Listen to auth changes and get user info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async(user) => {
      if (user) {
      try {
        const email = user.email;
        const res = await fetch(`${backendUrl}/admin/details?email=${email}`);
        const adminData = await res.json();

        setUserName(adminData.username || email);
      } catch (err) {
        console.error("Failed to fetch admin details", err);
        setUserName(user.email);
      }
    } else {
      router.push("/");
    }
  });

    return () => unsubscribe();
  }, [router]);

  // Fetch data
  useEffect(() => {
   

    const fetchStats = async () => {
      try {
        const response = await fetch(`${backendUrl}/issues/stats`);
        const data = await response.json();

        setStats([
          {
            label: "Total Reports",
            value: data.totalIssues,
            color: "bg-blue-500",
            icon: <FileText size={32} />,
          },
          {
            label: "Incomplete Tasks",
            value: data.incompleteIssues,
            color: "bg-yellow-500",
            icon: <Clock size={32} />,
          },
          {
            label: "Completed Tasks",
            value: data.completedIssues,
            color: "bg-green-500",
            icon: <CheckCircle size={32} />,
          },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchCategoryCounts = async () => {
      try {
        const response = await fetch(`${backendUrl}/issues/reports?page=0&size=1000`);
        const allIssues = await response.json();
        console.log(allIssues)
        const counts = allIssues.reduce((acc, issue) => {
          acc[issue.category] = (acc[issue.category] || 0) + 1;
          return acc;
        }, {});
        setCategoryCounts(counts);
      } catch (error) {
        
        console.error("Error fetching issues for categories:", error);
      }
    };

    const fetchReportsOverTime = async () => {
      try {
        const response = await fetch(`${backendUrl}/issues/reports?page=0&size=1000`);
        const allIssues = await response.json();

        const dateCounts = {};

        allIssues.forEach((issue) => {
          const date = new Date(issue.createdAt).toISOString().split("T")[0]; // "YYYY-MM-DD"
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        });

        const formattedData = Object.entries(dateCounts)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, count]) => ({ date, count }));

        setReportsOverTime(formattedData);
      } catch (error) {
        console.error("Error fetching reports over time:", error);
      }
    };

    fetchStats();
    fetchCategoryCounts();
    fetchReportsOverTime();
  }, []);

  // Quick links
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

  const handleNavigate = (path) => {
    router.push(path);
  };

  // Pie Chart Data
  const pieData = Object.entries(categoryCounts).map(([category, count]) => ({
    name: category,
    value: count,
  }));

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#a4de6c",
    "#d0ed57",
    "#8dd1e1",
  ];

  return (
    <div className="flex-1 p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black">
          Welcome Admin{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-gray-600 dark:text-grey-800">
          Manage your reports and tasks efficiently.
        </p>
      </div>

      {/* Stats */}
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

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Line Chart */}
      {reportsOverTime.length > 0 && (
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportsOverTime}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
