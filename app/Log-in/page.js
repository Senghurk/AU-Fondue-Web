"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getBackendUrl } from "../config/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Shield, Users, ArrowLeft, AlertCircle, X, CheckCircle } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { setLightTheme } = useTheme();
  const { toast, clearAllToasts } = useToast();
  const [loginType, setLoginType] = useState(null); // null, 'admin', 'staff'
  const [staffCredentials, setStaffCredentials] = useState({
    omId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // System developer accounts are now handled automatically by the backend

  const handleMicrosoftLoginPopup = async () => {
    setIsLoading(true);

    try {
      // Bypass Microsoft OAuth - directly call backend API for admin authentication
      console.log("Bypassing admin authentication");
      
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: "admin@au.edu",
          accessToken: "bypass-token"
        })
      });

      const backendResult = await response.json();
      
      if (!response.ok || !backendResult.success) {
        console.log("Admin authentication failed:", backendResult.message);
        toast({
          variant: "error",
          title: "Access Denied",
          description: backendResult.message || "Admin authentication failed.",
        });
        setIsLoading(false);
        return;
      }

      console.log("Admin authentication successful:", backendResult.data);
      
      // Extract user data from backend response
      const { userType, userId, name, email, firstLogin, token } = backendResult.data;
      
      // Clear any existing toasts on successful login
      clearAllToasts();
      
      // Show success toast
      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Login Successful!
          </div>
        ),
        description: `Welcome back, ${name}!`,
      });
      
      // Update auth context with user data from backend
      const userData = {
        userId: userId,
        email: email,
        name: name,
        role: 'ADMIN',
        userType: 'admin',
        token: token
      };
      login(userData);

      // Set theme to light for admin users
      setLightTheme();

      // Success — redirect to dashboard (with slight delay for toast visibility)
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Login failed:", error);
      
      let errorMessage = "Login failed: ";
      if (error.message.includes('Failed to fetch')) {
        errorMessage += "Cannot connect to server. Please check your internet connection or contact support.";
      } else if (error.message.includes('Backend check failed')) {
        errorMessage += "Server authentication error. Please try again or contact support.";
      } else {
        errorMessage += error.message;
      }
      
      toast({
        variant: "error",
        title: "Login Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async () => {
    setIsLoading(true);
    
    try {
      if (!staffCredentials.omId.trim()) {
        toast({
          variant: "error",
          title: (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Missing Information
            </div>
          ),
          description: "Please enter an OM ID.",
        });
        setIsLoading(false);
        return;
      }

      // Bypass credential validation - directly call backend API for staff authentication
      console.log("Bypassing staff authentication for:", staffCredentials.omId);
      
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/auth/staff/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          omId: staffCredentials.omId,
          password: "bypass-password"
        })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        toast({
          variant: "error",
          title: (
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Login Failed
            </div>
          ),
          description: result.message || "Staff login failed.",
        });
        setIsLoading(false);
        return;
      }

      // Extract user data from backend response
      const { userType, userId, name, email, firstLogin, token } = result.data;
      
      const userData = {
        userId: userId,
        omId: staffCredentials.omId,
        name: name || `Staff ${staffCredentials.omId}`,
        email: email,
        role: 'OM_STAFF',
        userType: 'staff',
        firstLogin: firstLogin,
        token: token
      };
      
      // Clear any existing toasts on successful login
      clearAllToasts();
      
      // Show success toast
      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Login Successful!
          </div>
        ),
        description: `Welcome back, ${userData.name}!`,
      });
      
      login(userData);

      // Set theme to light for staff users
      setLightTheme();
      
      // If it's first login, might want to redirect to password change page
      if (firstLogin) {
        // You can add a password change flow here if needed
        console.log("First login detected for staff:", staffCredentials.omId);
      }
      
      // Redirect OM Staff to Unassigned Reports instead of dashboard (with slight delay for toast visibility)
      setTimeout(() => {
        router.push("/reports");
      }, 1500);
      
    } catch (error) {
      console.error("Staff login failed:", error);
      toast({
        variant: "error",
        title: "Connection Error",
        description: "Login failed: " + (error.message || "Unable to connect to server"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login type selection screen
  if (!loginType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-lg mx-auto">
            {/* Logo/Brand Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent mb-3">
                AU Fondue
              </h1>
              <p className="text-gray-600 text-lg">
                Maintenance Management System
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Choose your access level to continue
              </p>
            </div>

            {/* Login Options Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {/* Admin Login Option */}
                  <div 
                    onClick={() => setLoginType('admin')}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl p-6 transition-all duration-300 transform group-hover:scale-[1.02]">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Shield className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">Administrator</h3>
                            <p className="text-blue-100 text-sm">Full system access & management</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Staff Login Option */}
                  <div 
                    onClick={() => setLoginType('staff')}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gray-100 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl p-6 transition-all duration-300 transform group-hover:scale-[1.02] group-hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <Users className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">OM Staff</h3>
                            <p className="text-gray-600 text-sm">Operational maintenance tasks</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secured by enterprise-grade authentication</span>
                  </div>
                  <div className="text-center mt-3">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      By accessing this system, you agree to our{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Terms of Service</a>
                      {" "}and{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Privacy Policy</a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Assumption University © 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin login screen
  if (loginType === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Full Screen Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">Logging in as Admin...</p>
                <p className="text-sm text-gray-600 mt-1">Authenticating your credentials</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-lg mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setLoginType(null)}
              className="mb-6 p-2 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to login options
            </Button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-3">
                Administrator Login
              </h1>
              <p className="text-gray-600 text-lg">
                Access the management dashboard
              </p>
            </div>

            {/* Login Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Microsoft Login Button */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-75"></div>
                    <Button
                      onClick={handleMicrosoftLoginPopup}
                      disabled={isLoading}
                      className="relative w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] min-h-[64px]"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <Shield className="h-6 w-6 mr-3 flex-shrink-0" />
                          Continue as Administrator
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Development Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-blue-800 font-semibold text-sm">Development Mode</h4>
                        <p className="text-blue-700 text-sm mt-1">
                          Authentication is bypassed for development. Click the button above to access the admin dashboard.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600">Secure Access</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600">Enterprise Grade</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Assumption University © 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Staff login screen
  if (loginType === 'staff') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Full Screen Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-transparent absolute top-0"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">Logging in as Staff...</p>
                <p className="text-sm text-gray-600 mt-1">Verifying OM ID: {staffCredentials.omId}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-lg mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setLoginType(null)}
              className="mb-6 p-2 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to login options
            </Button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl shadow-xl mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-3">
                Staff Login
              </h1>
              <p className="text-gray-600 text-lg">
                Access operational maintenance tasks
              </p>
            </div>

            {/* Login Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="omId" className="text-sm font-semibold text-gray-700">
                        OM ID
                      </Label>
                      <div className="relative">
                        <Input
                          id="omId"
                          type="text"
                          placeholder="Enter your OM ID (e.g., OM1, OM12)"
                          value={staffCredentials.omId}
                          onChange={(e) => setStaffCredentials({ ...staffCredentials, omId: e.target.value })}
                          className="text-lg py-4 pl-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type="password"
                          placeholder="Password not required (development mode)"
                          value={staffCredentials.password}
                          onChange={(e) => setStaffCredentials({ ...staffCredentials, password: e.target.value })}
                          className="text-lg py-4 pl-12 bg-gray-100 border-gray-200 cursor-not-allowed"
                          disabled
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Login Button */}
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-xl blur opacity-75 ${
                      staffCredentials.omId.trim() ? 'bg-gradient-to-r from-gray-500 to-gray-600' : 'bg-gray-300'
                    }`}></div>
                    <Button
                      onClick={handleStaffLogin}
                      disabled={isLoading || !staffCredentials.omId.trim()}
                      className={`relative w-full text-white py-6 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] min-h-[64px] ${
                        staffCredentials.omId.trim() 
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700' 
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <Users className="h-5 w-5 mr-3 flex-shrink-0" />
                          Continue as OM Staff
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Development Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-amber-800 font-semibold text-sm">Development Mode</h4>
                        <p className="text-amber-700 text-sm mt-1">
                          Enter any OM ID (e.g., OM1, OM2, OM12). Password validation is bypassed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600">Task Management</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600">Real-time Updates</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Assumption University © 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
