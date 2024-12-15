"use client";
import { useState } from "react";
 
export default function UrgentIssuesPage() {
  // Mock data for tasks
  const allReports = [
    { id: 1, title: "Leaking Pipe in Dorm 3", category: "Plumbing", priority: "High" },
    { id: 2, title: "Gas Leak", category: "Safety", priority: "High" },
    { id: 3, title: "Fire Hazard in Kitchen", category: "Safety", priority: "High" },
    { id: 4, title: "Cracked Floor in Auditorium", category: "Maintenance", priority: "Medium" },
    { id: 5, title: "Blocked Sink in Cafeteria", category: "Plumbing", priority: "Low" },
    { id: 6, title: "Flickering Lights in Hallway", category: "Electrical", priority: "Medium" },
  ];
 
  // Filter to show only tasks with "High" priority
  const urgentReports = allReports.filter((report) => report.priority === "High");
 
  const [locationFilter, setLocationFilter] = useState("");
 
  // Handle filtering by location
  const handleLocationChange = (event) => {
    setLocationFilter(event.target.value);
  };
 
  const filteredReports = urgentReports.filter(
    (report) => !locationFilter || report.category.toLowerCase() === locationFilter.toLowerCase()
  );
 
  return (
<div className="flex-1 bg-blue-50 p-6">
      {/* Header Section */}
<div className="flex justify-between items-center mb-6">
<h1 className="text-3xl font-bold">Urgent Issues</h1>
<div className="flex items-center gap-2">
          {/* Location Filter */}
<select
            value={locationFilter}
            onChange={handleLocationChange}
            className="px-4 py-2 text-sm border rounded"
            aria-label="Filter by location"
>
<option value="">Location</option>
<option value="Plumbing">Plumbing</option>
<option value="Safety">Safety</option>
<option value="Maintenance">Maintenance</option>
</select>
          {/* Filter Button */}
<button
            onClick={() => setLocationFilter("")}
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600"
>
            Clear Filter
</button>
</div>
</div>
 
      {/* Search Bar */}
<div className="mb-6">
<input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
</div>
 
      {/* Cards Grid */}
<div className="grid grid-cols-3 gap-4">
        {filteredReports.map((report) => (
<div
            key={report.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
>
            {/* Report Title */}
<h2 className="text-lg font-semibold mb-2 text-red-500">{report.title}</h2>
            {/* Category */}
<p className="text-sm text-gray-600">Category: {report.category}</p>
            {/* Priority */}
<p className="text-sm font-semibold text-red-600 mt-2">Priority: {report.priority}</p>
            {/* Action Buttons */}
<div className="flex gap-2 mt-4">
<button
                className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600"
>
                Assign
</button>
<button className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600">
                View
</button>
</div>
</div>
        ))}
</div>
</div>
  );
}