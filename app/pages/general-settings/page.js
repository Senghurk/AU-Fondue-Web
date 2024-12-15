"use client";

import { useState } from "react";

export default function GeneralSettingsPage() {
  const [autoAssignReports, setAutoAssignReports] = useState(false);
  const [defaultDueDate, setDefaultDueDate] = useState(7); // default to 7 days

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold mb-6">General Settings</h1>
      <p className="text-gray-600 mb-4">Configure application settings for managing reports.</p>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Auto-assign Reports Setting */}
        <div className="flex items-center justify-between">
          <label htmlFor="auto-assign" className="text-sm font-medium">
            Automatically Assign Reports to Staff
          </label>
          <input
            id="auto-assign"
            type="checkbox"
            checked={autoAssignReports}
            onChange={(e) => setAutoAssignReports(e.target.checked)}
            className="h-5 w-5"
          />
        </div>

        {/* Default Due Date Setting */}
        <div className="flex items-center justify-between">
          <label htmlFor="default-due-date" className="text-sm font-medium">
            Default Report Due Date (in days)
          </label>
          <input
            id="default-due-date"
            type="number"
            min="1"
            value={defaultDueDate}
            onChange={(e) => setDefaultDueDate(parseInt(e.target.value, 10))}
            className="border rounded p-2 w-20 text-center"
          />
        </div>

        
      </div>
    </div>
  );
}
