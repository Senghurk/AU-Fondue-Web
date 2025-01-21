"use client";

import { useState } from "react";

export default function AdminListPage() {
  // Mock data for admin list
  const initialAdmins = [
    { id: 1, name: "Alice Johnson", email: "alice@university.edu" },
    { id: 2, name: "Bob Smith", email: "bob@university.edu" },
    { id: 3, name: "Charlie Davis", email: "charlie@university.edu" },
  ];

  // State for admins, search query, and modal visibility
  const [admins, setAdmins] = useState(initialAdmins);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Handler to update the search query
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Show modal for adding a new admin
  const openAddAdminModal = () => {
    setIsAddingAdmin(true);
  };

  // Close modal for adding a new admin
  const closeAddAdminModal = () => {
    setIsAddingAdmin(false);
    setNewAdminEmail("");
  };

  // Handle input for new admin email (demo only)
  const handleNewAdminEmailChange = (event) => {
    setNewAdminEmail(event.target.value);
  };

  // Demo "Add Admin" action (not persistent)
  const handleAddAdmin = () => {
    if (newAdminEmail.trim() === "") return;
    const newAdmin = {
      id: admins.length + 1,
      name: "New Admin", // Placeholder name for demo
      email: newAdminEmail,
    };
    setAdmins([...admins, newAdmin]);
    closeAddAdminModal();
  };

  // Filter admins by search query
  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6">Admin List</h1>
      <p className="text-gray-600 mb-4">View and manage all admins in the system.</p>

      {/* Search and Add Controls */}
      <div className="mb-4 flex items-center space-x-4">
        {/* Search Box */}
        <input
          type="text"
          placeholder="Search admins by name or email..."
          value={searchQuery}
          onChange={handleSearch}
          className="border p-2 rounded w-full max-w-sm"
        />

        {/* Add Admin Button */}
        <button
          onClick={openAddAdminModal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Admin
        </button>
      </div>

      {/* Admin Table */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 text-sm font-semibold">#</th>
              <th className="p-3 text-sm font-semibold">Name</th>
              <th className="p-3 text-sm font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin, index) => (
              <tr
                key={admin.id}
                className={`border-t ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="p-3 text-sm">{index + 1}</td>
                <td className="p-3 text-sm">{admin.name}</td>
                <td className="p-3 text-sm">{admin.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAdmins.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No admins found.</p>
        )}
      </div>

      {/* Add Admin Modal */}
      {isAddingAdmin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
            <input
              type="email"
              placeholder="University email"
              value={newAdminEmail}
              onChange={handleNewAdminEmailChange}
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeAddAdminModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
