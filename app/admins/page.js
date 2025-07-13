"use client";

import { useEffect, useState } from "react";

export default function AdminListPage() {
  const backendUrl = "https://aufondue-webtest.kindisland-399ef298.southeastasia.azurecontainerapps.io/api"; // Change to your Azure URL if needed

  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminUsername, setNewAdminUsername] = useState("");

  // Fetch admin list from backend
  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${backendUrl}/admin`);
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Search filtering
  const filteredAdmins = admins.filter((admin) =>
    admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim() || !newAdminUsername.trim()) return;

    try {
      const res = await fetch(`${backendUrl}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail,
          username: newAdminUsername,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to add admin: ${res.status} - ${text}`);
      }

      await fetchAdmins(); // Refresh list
      setNewAdminEmail("");
      setNewAdminUsername("");
      setIsAddingAdmin(false);
    } catch (error) {
      alert("Error adding admin: " + error.message);
    }
  };

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin List</h1>
      <p className="text-gray-600 mb-4">View and manage all admins in the system.</p>

      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search admins by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full max-w-sm"
        />

        <button
          onClick={() => setIsAddingAdmin(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Admin
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 text-sm font-semibold">#</th>
              <th className="p-3 text-sm font-semibold">Username</th>
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
                <td className="p-3 text-sm">{admin.username}</td>
                <td className="p-3 text-sm">{admin.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAdmins.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No admins found.</p>
        )}
      </div>

      {isAddingAdmin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
            <input
              type="text"
              placeholder="Admin Username"
              value={newAdminUsername}
              onChange={(e) => setNewAdminUsername(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />
            <input
              type="email"
              placeholder="Admin Email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingAdmin(false)}
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
