"use client";

import React, { useState } from "react";
import { Button } from "../app/components/Button";

export default function Home() {
  const [lang, setLang] = useState("ENG");

  return (
    <main className="min-h-screen bg-[#fdfdfd] text-gray-900">
      {/* Top Navigation Bar */}
      <header className="w-full px-6 py-4 flex justify-between items-center shadow-sm border-b">
        <h1 className="text-2xl font-bold text-red-600">AU Fondue</h1>
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

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden shadow-md border border-red-100">
          {/* Left side - mockup */}
          <div className="flex justify-center items-center bg-[#fef6f6] p-14">
            <img
              src="/Homescreen.png"
              alt="AU Fondue App Screenshot"
              className="w-[220px] md:w-[280px] rounded-xl shadow-xl"
            />
          </div>

          {/* Right side - heading & button */}
          <div className="bg-white p-14">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900">
              Report campus issues.<br />
              Stay informed.<br />
              Be the change.
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              AU Fondue makes reporting maintenance problems easy. Whether you're a student or staff, stay updated on what's fixed and what's pending.
            </p>

            <div className="mt-4">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-base rounded-md shadow-md"
                onClick={() => window.location.href = "/Log-in"}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* What is AU Fondue Section */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">What is AU Fondue?</h2>
          <p className="text-gray-700 text-lg">
            AU Fondue is a digital platform built for Assumption University students and staff to easily report, track, and manage maintenance issues across the campus. From broken lights to facility concerns, it streamlines communication and speeds up resolution.
          </p>
        </div>
      </section>

      {/* AU Fondue Features Section */}
      <section className="bg-[#fef6f6] py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-900">Key Features</h2>
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
