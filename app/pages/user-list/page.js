"use client";

import { useState } from "react";

export default function UserListPage() {
  // Mock data for user list
  const users = [
    { email: "alice@university.edu", name: "Alice Johnson", role: "Admin" },
    { email: "bob@university.edu", name: "Bob Smith", role: "Staff" },
    { email: "charlie@university.edu", name: "Charlie Davis", role: "User" },
    { email: "diana@university.edu", name: "Diana Lee", role: "Staff" },
    { email: "ethan@university.edu", name: "Ethan Brown", role: "User" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Handler to update the search query
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handler to filter users by role
  const handleRoleFilter = (event) => {
    setRoleFilter(event.target.value);
  };

  // Filter and search logic combined
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6">User List</h1>
      <p className="text-gray-600 mb-4">View and manage all users in the system.</p>

      {/* Search and Filter Controls */}
      <div className="mb-4 flex items-center space-x-4">
        {/* Search Box */}
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={handleSearch}
          className="border p-2 rounded w-full max-w-sm"
        />

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={handleRoleFilter}
          className="border p-2 rounded"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
          <option value="User">User</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 text-sm font-semibold">Email</th>
              <th className="p-3 text-sm font-semibold">Name</th>
              <th className="p-3 text-sm font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.email}
                className={`border-t ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="p-3 text-sm">{user.email}</td>
                <td className="p-3 text-sm">{user.name}</td>
                <td
                  className={`p-3 text-sm font-semibold ${
                    user.role === "Admin"
                      ? "text-blue-600"
                      : user.role === "Staff"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {user.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No users found.</p>
        )}
      </div>
    </div>
  );
}
