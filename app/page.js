"use client";

import React from "react";
import { Button } from "../app/components/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fdfdfd] text-gray-900">
      {/* Top Navigation Bar */}
      <header className="w-full px-6 py-4 flex justify-between items-center shadow-sm border-b">
        <h1 className="text-2xl font-bold text-red-600">AU Fondue - Admin</h1>
        <Button
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold shadow-md"
          onClick={() => (window.location.href = "/Log-in")}
        >
          Log in
        </Button>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-10 py-5 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-gray-900">
          Manage campus reports, assign tasks, and track everything easily.
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-4">
          AU Fondue Admin helps campus staff handle reports, assign staff, track
          progress, and make sure issues are solved quickly and efficiently.
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg rounded-md shadow-md"
            onClick={() =>
              window.open(
                "https://play.google.com/store/apps/details?id=com.yourapp.au_fondue", // Replace with your real Play Store URL
                "_blank"
              )
            }
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
              className="h-6"
            />
            Download User App
          </Button>
        </div>
      </div>

      {/* What is AU Fondue Admin Section */}
      <section className="bg-white py-5 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            What is AU Fondue Admin?
          </h2>
          <p className="text-gray-700 text-lg">
            AU Fondue Admin is the backend platform for university staff to
            handle maintenance issue reports. From assigning tasks to viewing
            analytics and exporting data, it provides everything needed to
            streamline campus operations.
          </p>
        </div>
      </section>

      {/* Admin Features Section */}
      <section className="bg-[#fef6f6] py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-900">
            Admin Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title: "Report Overview",
                desc: "View all maintenance reports with real-time status updates."
              },
              {
                title: "Task Assignment",
                desc: "Assign issues directly to responsible maintenance staff."
              },
              {
                title: "Excel Report Export",
                desc: "Download all reports and logs in Excel format for record keeping."
              },
              {
                title: "Visual Stats & Charts",
                desc: "Monitor trends and report data visually through interactive charts."
              },
              {
                title: "Performance Analytics",
                desc: "Track staff performance and repair times with detailed metrics."
              },
              {
                title: "Notification System",
                desc: "Get alerts when a new report is submitted or completed."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold mb-2 text-red-600">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-700">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Features Section */}
      <section className="bg-[#fef6f6] py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-900">
            User Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quick Issue Reporting",
                desc: "Easily submit problems from your phone in seconds."
              },
              {
                title: "Real-time Tracking",
                desc: "Know exactly when your issue is being handled or resolved."
              },
              {
                title: "Accurate Location Tagging",
                desc: "Automatically records the location to speed up response time."
              },
              {
                title: "Excel Export",
                desc: "Admins can download full reports in Excel format for records."
              },
              {
                title: "Smart Notifications",
                desc: "Stay updated with push alerts when the issue status changes."
              },
              {
                title: "User-Friendly Design",
                desc: "Simple, intuitive interface for all students and staff."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold mb-2 text-red-600">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-700">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
