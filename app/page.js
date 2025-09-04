"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "../app/components/Button";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userCurrentSlide, setUserCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const totalSlides = 2;
  const userTotalSlides = 2;

  // Handle hydration mismatch by setting client flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000); // Auto-swipe every 4 seconds

    return () => clearInterval(interval);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const userInterval = setInterval(() => {
      setUserCurrentSlide((prev) => (prev + 1) % userTotalSlides);
    }, 5000); // Auto-swipe every 5 seconds (different timing)

    return () => clearInterval(userInterval);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const carousel = document.getElementById('carousel');
    if (carousel) {
      carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }, [currentSlide, isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const userCarousel = document.getElementById('user-carousel');
    if (userCarousel) {
      userCarousel.style.transform = `translateX(-${userCurrentSlide * 100}%)`;
    }
  }, [userCurrentSlide, isClient]);

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const goToUserSlide = (slideIndex) => {
    setUserCurrentSlide(slideIndex);
  };

  return (
    <main className="min-h-screen bg-[#fdfdfd] text-gray-900">
      {/* Top Navigation Bar */}
      <header className="w-full px-8 py-5 flex justify-between items-center bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            AU Fondue
            <span className="text-red-600 font-normal"> Admin</span>
          </h1>
        </div>
        <nav className="flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Features
          </a>
          <a
            href="#about"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            About
          </a>
          <Button
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-sm transition-all duration-200"
            onClick={() => (window.location.href = "/Log-in")}
          >
            Login
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-10 py-20 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-medium mb-6">
            Campus Management Made Simple
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-gray-900 tracking-tight">
            Streamline Your
            <span className="text-red-600 block">Campus Operations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Transform how your university handles maintenance reports. From
            instant issue tracking to advanced analytics, AU Fondue Admin
            empowers your staff to resolve campus issues faster than ever
            before.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={() =>
              window.open(
                "https://play.google.com/store/apps/details?id=com.yourapp.au_fondue",
                "_blank"
              )
            }
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            Download
          </Button>

          <Button
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 px-8 py-4 text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => (window.location.href = "/Log-in")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Demo
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-red-600 mb-2">50%</div>
            <div className="text-gray-600">Faster Resolution Time</div>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-red-600 mb-2">Next-Gen</div>
            <div className="text-gray-600">Campus Management</div>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-red-600 mb-2">24/7</div>
            <div className="text-gray-600">Real-time Monitoring</div>
          </div>
        </div>
      </div>

      {/* What is AU Fondue Admin Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
            Powerful Campus Management
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            What is AU Fondue Admin?
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
            AU Fondue Admin is the comprehensive backend platform designed
            specifically for university's Operation & Maintenance's  Admin and staff
            to efficiently manage maintenance issue reports. From intelligent
            task assignment and real-time tracking to advanced analytics and
            seamless data export, our platform provides everything you need to
            revolutionize your campus operations and deliver exceptional service
            to your community.
          </p>
        </div>
      </section>

      {/* Admin Features Section */}
      <section
        id="features"
        className="bg-gradient-to-br from-gray-50 to-white py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-medium mb-6">
              For Administrators
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Powerful Admin Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage campus operations efficiently and
              effectively
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <div
              id="carousel"
              className="flex transition-transform duration-500 ease-in-out"
            >
              {[
                [
                  {
                    title: "Report Overview",
                    desc: "View all maintenance reports with real-time status updates and comprehensive filtering options.",
                  },
                  {
                    title: "Smart Task Assignment",
                    desc: "Intelligently assign issues to the most suitable maintenance staff based on expertise and availability.",
                  },
                  {
                    title: "Excel Report Export",
                    desc: "Download detailed reports and logs in Excel format for comprehensive record keeping and analysis.",
                  },
                ],
                [
                  {
                    title: "Visual Stats & Charts",
                    desc: "Monitor trends and performance data through beautiful, interactive charts and dashboards.",
                  },
                  {
                    title: "Performance Analytics",
                    desc: "Track staff performance, repair times, and efficiency metrics with detailed analytics and insights.",
                  },
                  {
                    title: "Smart Notifications",
                    desc: "Receive instant alerts and notifications when reports are submitted, updated, or completed.",
                  },
                ],
              ].map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {slide.map((feature, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                          {/* Dynamic icon based on feature title */}
                          {feature.title === "Report Overview" && (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          {feature.title === "Smart Task Assignment" && (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                          {feature.title === "Excel Report Export" && (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          {feature.title === "Visual Stats & Charts" && (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          )}
                          {feature.title === "Performance Analytics" && (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          )}
                          {feature.title === "Smart Notifications" && (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.46 3.46M12 10c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zM10 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            </svg>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div
              className="flex justify-center mt-8 gap-2"
              suppressHydrationWarning={true}
            >
              {[0, 1].map((slideIndex) => (
                <button
                  key={slideIndex}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    currentSlide === slideIndex
                      ? "bg-red-600"
                      : "bg-gray-300 hover:bg-red-400"
                  }`}
                  onClick={() => goToSlide(slideIndex)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Features Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              For Students & Staff
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Effortless User Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, intuitive tools that make reporting and tracking campus
              issues a breeze
            </p>
          </div>

          {/* User Carousel Container */}
          <div className="relative overflow-hidden">
            <div
              id="user-carousel"
              className="flex transition-transform duration-500 ease-in-out"
            >
              {[
                [
                  {
                    title: "Lightning-Fast Reporting",
                    desc: "Submit maintenance issues from your phone in under 30 seconds with our streamlined interface.",
                  },
                  {
                    title: "Live Progress Tracking",
                    desc: "Get real-time updates on your report status and know exactly when issues are being resolved.",
                  },
                ],
                [
                  {
                    title: "Comprehensive History",
                    desc: "Access your complete report history and download detailed records whenever you need them.",
                  },
                  {
                    title: "Intuitive Design",
                    desc: "Beautifully crafted interface that's so simple, anyone can use it without training or tutorials.",
                  },
                ],
              ].map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {slide.map((feature, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                          {/* Dynamic icon based on feature title */}
                          {feature.title === "Lightning-Fast Reporting" && (
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                          {feature.title === "Live Progress Tracking" && (
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          )}
                          {feature.title === "Comprehensive History" && (
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {feature.title === "Intuitive Design" && (
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* User Navigation Dots */}
            <div
              className="flex justify-center mt-8 gap-2"
              suppressHydrationWarning={true}
            >
              {[0, 1].map((slideIndex) => (
                <button
                  key={slideIndex}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    userCurrentSlide === slideIndex
                      ? "bg-blue-600"
                      : "bg-gray-300 hover:bg-blue-400"
                  }`}
                  onClick={() => goToUserSlide(slideIndex)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-6">
              About AU Fondue
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Our Story & Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering Assumption University with next-generation campus management solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Built for Assumption University
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                AU Fondue was created specifically to address the unique challenges faced by 
                Assumption University's Operations & Maintenance department. Our comprehensive 
                platform streamlines the entire maintenance workflow, from initial issue reporting 
                to final resolution tracking.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                By combining cutting-edge technology with deep understanding of campus operations, 
                we've built a solution that not only improves efficiency but also enhances the 
                overall campus experience for students, faculty, and staff.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Innovation First</h4>
                  <p className="text-sm text-gray-600">Leveraging modern technology for campus excellence</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-blue-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">2024</div>
                  <div className="text-gray-600 text-sm">Year Developed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                  <div className="text-gray-600 text-sm">AU Focused</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                  <div className="text-gray-600 text-sm">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                  <div className="text-gray-600 text-sm">Possibilities</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Technology Stack
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Built with modern, reliable technologies to ensure scalability, security, and performance
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12" viewBox="0 0 256 256" fill="none">
                    <circle cx="128" cy="128" r="3" fill="#61DAFB"/>
                    <ellipse cx="128" cy="128" rx="95" ry="35" stroke="#61DAFB" strokeWidth="8" fill="none"/>
                    <ellipse cx="128" cy="128" rx="95" ry="35" stroke="#61DAFB" strokeWidth="8" fill="none" transform="rotate(60 128 128)"/>
                    <ellipse cx="128" cy="128" rx="95" ry="35" stroke="#61DAFB" strokeWidth="8" fill="none" transform="rotate(120 128 128)"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Frontend</h4>
                <p className="text-sm text-gray-600">Next.js & React</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12" viewBox="0 0 256 256" fill="none">
                    <circle cx="128" cy="128" r="128" fill="#68bd45"/>
                    <path d="M128 64c-35.35 0-64 28.65-64 64 0 35.35 28.65 64 64 64 35.35 0 64-28.65 64-64 0-35.35-28.65-64-64-64z" fill="white"/>
                    <path d="M200 128c0-39.76-32.24-72-72-72s-72 32.24-72 72 32.24 72 72 72 72-32.24 72-72z" fill="none" stroke="white" strokeWidth="4"/>
                    <path d="M128 96c-17.67 0-32 14.33-32 32s14.33 32 32 32 32-14.33 32-32-14.33-32-32-32z" fill="#68bd45"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Backend</h4>
                <p className="text-sm text-gray-600">Spring Boot</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12" viewBox="0 0 256 256" fill="none">
                    <path d="M230 128c0 17-8 33-22 43l-12-8c10-7 16-19 16-31 0-22-18-40-40-40-11 0-21 4-28 12l-8-6c10-11 24-18 40-18 29 0 54 23 54 52z" fill="#336791"/>
                    <ellipse cx="100" cy="100" rx="8" ry="12" fill="#336791" transform="rotate(-15 100 100)"/>
                    <ellipse cx="156" cy="100" rx="8" ry="12" fill="#336791" transform="rotate(15 156 100)"/>
                    <path d="M128 200c-39 0-72-31-72-72 0-20 8-38 22-51l8 6c-11 10-18 25-18 41 0 33 27 60 60 60s60-27 60-60c0-16-7-31-18-41l8-6c14 13 22 31 22 51 0 41-33 72-72 72z" fill="#336791"/>
                    <circle cx="128" cy="180" r="6" fill="#336791"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Database</h4>
                <p className="text-sm text-gray-600">PostgreSQL</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12" viewBox="0 0 256 256" fill="none">
                    <path d="M80 80h96l16 32-16 32H80L64 112z" fill="#0078d4"/>
                    <path d="M176 80h32l16 32-16 32h-32l-16-32z" fill="#40e0d0"/>
                    <path d="M48 144h96l16 32-16 32H48l-16-32z" fill="#0078d4"/>
                    <path d="M144 144h64l16 32-16 32h-64l-16-32z" fill="#40e0d0"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Cloud</h4>
                <p className="text-sm text-gray-600">Microsoft Azure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-20 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Campus?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join us and try using AU Fondue today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-white hover:bg-gray-100 text-red-600 px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              onClick={() => (window.location.href = "/Log-in")}
            >
              Get Started Today
            </Button>
            <Button
              className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 font-semibold"
              onClick={() =>
                window.open(
                  "https://play.google.com/store/apps/details?id=com.yourapp.au_fondue",
                  "_blank"
                )
              }
            >
              Download App
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
