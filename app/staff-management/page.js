"use client";

import { useEffect, useState } from "react";
import { getBackendUrl } from "../config/api";
import { useToast } from "../context/ToastContext";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar, 
  Shield, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Key,
  User,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Pencil
} from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseClient";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export default function StaffManagementPage() {
  const backendUrl = getBackendUrl();
  const { toast } = useToast();
  
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    staffId: "",
    name: "",
    email: ""
  });
  const [validationErrors, setValidationErrors] = useState({
    staffId: "",
    email: ""
  });
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [resetPasswordStaffId, setResetPasswordStaffId] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedStaffForReset, setSelectedStaffForReset] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [staffDeletionInfo, setStaffDeletionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isRenamingStaff, setIsRenamingStaff] = useState(false);
  const [staffToRename, setStaffToRename] = useState(null);
  const [newStaffName, setNewStaffName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch staff list
  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/staff`);
      const data = await response.json();
      setStaffList(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to fetch staff list",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Automatically sync with Firebase when page loads
    // This will also fetch staff list after syncing
    syncWithFirebase();
  }, []);

  const filteredStaff = staffList.filter((staff) =>
    staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.staffId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, endIndex);

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Add new staff
  // Check if OM ID already exists
  const checkDuplicateOMID = async (omId) => {
    if (!omId.trim()) return;
    
    setIsCheckingDuplicate(true);
    try {
      // Check if OM ID already exists in current staff list
      const exists = staffList.some(staff => staff.staffId === omId);
      if (exists) {
        setValidationErrors(prev => ({
          ...prev,
          staffId: `OM ID '${omId}' is already exist in the system`
        }));
      } else {
        setValidationErrors(prev => ({ ...prev, staffId: "" }));
      }
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleAddStaff = async () => {
    // Clear previous validation errors
    setValidationErrors({ staffId: "", email: "" });

    if (!newStaff.staffId.trim() || !newStaff.name.trim() || !newStaff.email.trim()) {
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Missing Information
          </div>
        ),
        description: "Please fill in all required fields",
      });
      return;
    }

    // Check for validation errors before submitting
    if (validationErrors.staffId || validationErrors.email) {
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Validation Error
          </div>
        ),
        description: "Please fix the validation errors before submitting",
      });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error types from backend
        if (data.errorType === "DUPLICATE_OM_ID") {
          setValidationErrors(prev => ({ ...prev, staffId: data.message }));
          toast({
            variant: "error",
            title: (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Duplicate OM ID
              </div>
            ),
            description: data.message,
          });
        } else if (data.errorType === "DUPLICATE_EMAIL") {
          setValidationErrors(prev => ({ ...prev, email: data.message }));
          toast({
            variant: "error",
            title: (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Duplicate Email
              </div>
            ),
            description: data.message,
          });
        } else {
          toast({
            variant: "error",
            title: (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Failed to Add Staff
              </div>
            ),
            description: data.message || "Could not add staff member",
          });
        }
        return;
      }

      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Staff Member Added
          </div>
        ),
        description: `${newStaff.name} has been added successfully`,
      });

      fetchStaff();
      setIsAddingStaff(false);
      setNewStaff({ staffId: "", name: "", email: "" });
      setValidationErrors({ staffId: "", email: "" });
    } catch (error) {
      console.error("Failed to add staff:", error);
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed to Add Staff
          </div>
        ),
        description: error.message || "Could not add staff member",
      });
    }
  };

  // Reset staff password
  const handleResetPassword = async (staff) => {
    setIsResetting(true);
    console.log("Starting password reset for:", staff.email);
    
    try {
      // Use Firebase Client SDK to send password reset email
      console.log("Sending password reset email via Firebase...");
      
      // Send password reset email - Firebase will use the URL configured in email template
      // Do NOT use action code settings - let Firebase use the template configuration
      await sendPasswordResetEmail(auth, staff.email);
      
      console.log("Firebase sendPasswordResetEmail completed successfully");

      // Also update backend to track the reset request
      try {
        await fetch(`${backendUrl}/staff/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staffId: staff.id,
            staffEmail: staff.email
          }),
        });
      } catch (backendError) {
        console.error("Failed to update backend:", backendError);
        // Continue even if backend update fails
      }

      // Success toast with professional design
      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Password Reset Email Sent
          </div>
        ),
        description: (
          <div className="space-y-1">
            <p>Reset link sent to <strong>{staff.email}</strong></p>
            <p className="text-sm text-gray-500">The link will expire in 1 hour</p>
          </div>
        ),
        duration: 5000,
      });
    } catch (error) {
      console.error("Password reset failed:", error);
      
      // Handle specific Firebase errors
      let errorMessage = "Failed to send reset email. Please try again.";
      if (error.code === 'auth/user-not-found') {
        // Staff doesn't exist in Firebase yet
        errorMessage = "Staff member not found in authentication system. Use 'Sync with Firebase' first.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many reset attempts. Please try again later.";
      }
      
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Password Reset Failed
          </div>
        ),
        description: errorMessage,
      });
    } finally {
      setIsResetting(false);
      setResetPasswordStaffId(null);
      setResetPasswordDialogOpen(false);
      setSelectedStaffForReset(null);
    }
  };

  // Sync staff with Firebase (silent auto-sync)
  const syncWithFirebase = async () => {
    try {
      const response = await fetch(`${backendUrl}/staff/sync-firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to sync with Firebase");
      }

      // Silent sync - only log to console
      console.log(`Firebase sync complete: ${result.synced || 0} staff members synced`);
      
      // Refresh staff list after sync
      fetchStaff();
    } catch (error) {
      console.error("Firebase sync failed:", error);
      // Only show error if sync fails
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Firebase Sync Error
          </div>
        ),
        description: "Failed to sync with Firebase. Some features may be limited.",
      });
    }
  };

  // Check if staff can be deleted
  const checkStaffDeletion = async (staff) => {
    try {
      const response = await fetch(`${backendUrl}/staff/${staff.id}/can-delete`);
      const data = await response.json();
      
      setStaffDeletionInfo({
        canDelete: data.canDelete,
        incompleteReports: data.incompleteReports || 0
      });
      
      if (data.canDelete) {
        setStaffToDelete(staff);
        setDeleteConfirmOpen(true);
      } else {
        toast({
          variant: "error",
          title: (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Cannot Delete Staff Member
            </div>
          ),
          description: `${staff.name} has ${data.incompleteReports} incomplete assigned report(s). All reports must be marked as 'Completed' before deletion.`,
          duration: 7000,
        });
      }
    } catch (error) {
      console.error("Failed to check deletion eligibility:", error);
      // Fallback to direct deletion attempt
      setStaffToDelete(staff);
      setDeleteConfirmOpen(true);
    }
  };

  // Rename staff
  const handleRenameStaff = async () => {
    if (!staffToRename || !newStaffName.trim()) {
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Invalid Name
          </div>
        ),
        description: "Staff name cannot be empty",
      });
      return;
    }

    // Check if name is the same
    if (newStaffName.trim() === staffToRename.name) {
      setIsRenamingStaff(false);
      setStaffToRename(null);
      setNewStaffName("");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`${backendUrl}/staff/${staffToRename.id}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStaffName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update staff name");
      }

      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Name Updated
          </div>
        ),
        description: `Staff name changed from "${staffToRename.name}" to "${newStaffName.trim()}"`,
        duration: 5000,
      });

      // Refresh staff list
      fetchStaff();
      setIsRenamingStaff(false);
      setStaffToRename(null);
      setNewStaffName("");
    } catch (error) {
      console.error("Failed to update staff name:", error);
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Update Failed
          </div>
        ),
        description: error.message || "Failed to update staff name",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete staff
  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    setIsDeleting(true);

    try {
      const response = await fetch(`${backendUrl}/staff/${staffToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if the error is about incomplete reports
        if (data.message && data.message.includes("assigned report")) {
          toast({
            variant: "error",
            title: (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Cannot Delete Staff Member
              </div>
            ),
            description: data.message,
            duration: 7000,
          });
        } else {
          throw new Error(data.message || "Failed to delete staff");
        }
        return;
      }

      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Staff Member Deleted
          </div>
        ),
        description: `${staffToDelete.name} has been removed from the system`,
      });

      fetchStaff();
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
    } catch (error) {
      console.error("Failed to delete staff:", error);
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Deletion Failed
          </div>
        ),
        description: error.message || "Failed to delete staff member. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-2">
            Manage staff accounts and reset passwords
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Staff
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffList.length}</div>
              <p className="text-xs text-muted-foreground">
                Active staff members
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>
                  Manage staff members who handle maintenance reports
                </CardDescription>
              </div>
              <Button 
                onClick={() => setIsAddingStaff(true)}
                className="bg-black hover:bg-gray-800"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search staff by name, email, or OM ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Staff Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>OM ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No staff members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStaff.map((staff, index) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                        <TableCell>
                          {staff.staffId ? (
                            <div className="inline-flex items-center">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                <span className="font-semibold text-blue-900 tracking-wide text-sm">
                                  {staff.staffId}
                                </span>
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 text-sm">
                              <svg className="w-4 h-4 mr-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Not Assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{staff.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {staff.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setStaffToRename(staff);
                                setNewStaffName(staff.name);
                                setIsRenamingStaff(true);
                              }}
                              className="hover:bg-gray-100"
                              title="Rename staff"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStaffForReset(staff);
                                setResetPasswordDialogOpen(true);
                              }}
                              title="Reset password"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => checkStaffDeletion(staff)}
                              title="Delete staff"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredStaff.length > itemsPerPage && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredStaff.length)} of {filteredStaff.length} staff members
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      const isCurrentPage = pageNum === currentPage;
                      
                      // Show first page, last page, current page, and pages around current
                      const showPage = pageNum === 1 || 
                                      pageNum === totalPages || 
                                      Math.abs(pageNum - currentPage) <= 1;
                      
                      if (!showPage && pageNum === 2 && currentPage > 3) {
                        return <span key={i} className="px-1 text-gray-400">...</span>;
                      }
                      
                      if (!showPage && pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                        return <span key={i} className="px-1 text-gray-400">...</span>;
                      }
                      
                      if (!showPage) return null;
                      
                      return (
                        <Button
                          key={i}
                          variant={isCurrentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={isCurrentPage ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Staff Dialog */}
        <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Enter the details for the new staff member. Default password is OMstaff123.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="staffId">OM ID *</Label>
                <Input
                  id="staffId"
                  placeholder="e.g., OM01"
                  value={newStaff.staffId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewStaff({ ...newStaff, staffId: value });
                    // Check for duplicate on blur or after a delay
                    if (value.trim()) {
                      checkDuplicateOMID(value);
                    } else {
                      setValidationErrors(prev => ({ ...prev, staffId: "" }));
                    }
                  }}
                  onBlur={() => checkDuplicateOMID(newStaff.staffId)}
                  className={validationErrors.staffId ? "border-red-500" : ""}
                />
                {validationErrors.staffId && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.staffId}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter staff member's full name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newStaff.email}
                  onChange={(e) => {
                    setNewStaff({ ...newStaff, email: e.target.value });
                    // Clear email error when user types
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: "" }));
                    }
                  }}
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The staff member will need to change their password on first login.
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => {
                setIsAddingStaff(false);
                setNewStaff({ staffId: "", name: "", email: "" });
                setValidationErrors({ staffId: "", email: "" });
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddStaff} 
                className="bg-black hover:bg-gray-800"
                disabled={isCheckingDuplicate || !!validationErrors.staffId || !!validationErrors.email}
              >
                Add Staff Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Staff Password</DialogTitle>
              <DialogDescription>
                Are you sure you want to reset the password for <strong>{selectedStaffForReset?.name}</strong>?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <div className="bg-amber-50 p-3 rounded-md">
                <p className="text-sm text-amber-800">
                  A password reset link will be sent to:
                </p>
                <p className="font-medium text-amber-900 mt-1">{selectedStaffForReset?.email}</p>
              </div>
              <p className="text-sm text-gray-600">
                The staff member will receive an email with instructions to create a new password.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResetPasswordDialogOpen(false);
                    setSelectedStaffForReset(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleResetPassword(selectedStaffForReset);
                    setResetPasswordDialogOpen(false);
                    setSelectedStaffForReset(null);
                  }}
                  className="bg-black hover:bg-gray-800"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="pt-3">
                <div className="space-y-3">
                  <p>Are you sure you want to delete this staff member?</p>
                  {staffToDelete && (
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Name:</span>
                        <span>{staffToDelete.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">OM ID:</span>
                        {staffToDelete.staffId ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                            <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            <span className="font-semibold text-blue-900 tracking-wide text-xs">
                              {staffToDelete.staffId}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Not Assigned</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <span>{staffToDelete.email}</span>
                      </div>
                    </div>
                  )}
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                    <p className="text-sm text-amber-800">
                      <strong>Warning:</strong> This action cannot be undone. All data associated with this staff member will be permanently deleted.
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setStaffToDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteStaff}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Staff Member"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rename Staff Dialog */}
        <Dialog open={isRenamingStaff} onOpenChange={(open) => {
          if (!open) {
            setIsRenamingStaff(false);
            setStaffToRename(null);
            setNewStaffName("");
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Rename Staff Member
              </DialogTitle>
              <DialogDescription>
                Change the name for {staffToRename?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="newStaffName">New Name</Label>
                <Input
                  id="newStaffName"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Enter new name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isUpdating) {
                      handleRenameStaff();
                    }
                  }}
                />
              </div>
              {staffToRename?.staffId && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>OM ID:</strong> {staffToRename.staffId} (will not change)
                  </p>
                </div>
              )}
              <div className="bg-amber-50 p-3 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> The staff member's name will be updated across all reports and records.
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                variant="outline"
                onClick={() => {
                  setIsRenamingStaff(false);
                  setStaffToRename(null);
                  setNewStaffName("");
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRenameStaff}
                className="bg-black hover:bg-gray-800"
                disabled={isUpdating || !newStaffName.trim() || newStaffName.trim() === staffToRename?.name}
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Update Name
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}