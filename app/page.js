"use client";
 
import React, { useState } from "react";
import { Button } from "../app/components/Button";
 
export default function Home() {
  const [lang, setLang] = useState("ENG");
 
  return (
    <main className="min-h-screen bg-[#fdfdfd] text-gray-900">
      {/* Top Navigation Bar */}
      <header className="w-full px-6 py-4 flex justify-between items-center shadow-sm border-b">
        <h1 className="text-2xl font-bold text-red-600">AU Fondue - Admin</h1>
        <div className="space-x-2">
          <Button
            className={`px-4 py-2 rounded-md font-semibold border transition-all duration-200 shadow-sm ${
              lang === "ENG"
                ? "bg-red-100 text-black border-red-400"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => setLang("ENG")}
          >
            ENG
          </Button>
          <Button
            className={`px-4 py-2 rounded-md font-semibold border transition-all duration-200 shadow-sm ${
              lang === "TH"
                ? "bg-red-100 text-black border-red-400"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => setLang("TH")}
          >
            TH
          </Button>
        </div>
      </header>
 
      {/* Header Section with Laptop Screenshot */}
      <div className="max-w-7xl mx-auto px-10 py-24">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Laptop Image with Styling */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4">
              <img
                src="/screen.png"
                alt="AU Fondue Admin Dashboard on Laptop"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          </div>
 
          {/* Text & Buttons */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900">
              Manage campus reports.<br />
              Assign tasks.<br />
              Track everything.
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              AU Fondue Admin is designed to help campus maintenance teams handle incoming reports, assign staff, track progress, and ensure timely resolution of campus issues.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-base rounded-md shadow-md"
                onClick={() => window.location.href = "/Log-in"}
              >
                Log in
              </Button>
              <Button
                className="border border-red-500 text-red-600 hover:bg-red-100 px-8 py-3 text-base rounded-md shadow-md"
                // onClick={() => window.open("https://aufondue.app/android.apk", "_blank")}
              >
                Download Android App
              </Button>
            </div>
          </div>
        </div>
      </div>
 
      {/* What is AU Fondue Admin Section */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">What is AU Fondue Admin?</h2>
          <p className="text-gray-700 text-lg">
            AU Fondue Admin is the backend platform for university staff to handle maintenance issue reports. From assigning tasks to viewing analytics and exporting data, it provides everything needed to streamline campus operations.
          </p>
        </div>
      </section>
 
      {/* Admin Features Section */}
      <section className="bg-[#fef6f6] py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-900">Admin Features</h2>
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
                title: "Mobile Support",
                desc: "Use the Android app to manage tasks on-the-go."
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
                <h3 className="text-lg font-semibold mb-2 text-red-600">{feature.title}</h3>
                <p className="text-sm text-gray-700">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
           {/* AU Fondue Features Section */}
      <section className="bg-[#fef6f6] py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-900">User Features</h2>
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
                <h3 className="text-lg font-semibold mb-2 text-red-600">{feature.title}</h3>
                <p className="text-sm text-gray-700">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}