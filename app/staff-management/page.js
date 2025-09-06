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
  X
} from "lucide-react";
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
  DialogTrigger,
} from "../../components/ui/dialog";

export default function StaffManagementPage() {
  const backendUrl = getBackendUrl();
  const { toast } = useToast();
  
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    staffId: "",
    name: "",
    email: "",
    dateAdded: new Date().toISOString().split('T')[0]
  });
  const [resetPasswordStaffId, setResetPasswordStaffId] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch staff list
  const fetchStaff = async () => {
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
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staffList.filter((staff) =>
    staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.staffId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new staff
  const handleAddStaff = async () => {
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

    try {
      const response = await fetch(`${backendUrl}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const addedStaff = await response.json();
      
      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Staff Added Successfully
          </div>
        ),
        description: `${addedStaff.name} has been added with default password: OMstaff123`,
      });

      // Reset form and refresh list
      setNewStaff({
        staffId: "",
        name: "",
        email: "",
        dateAdded: new Date().toISOString().split('T')[0]
      });
      setIsAddingStaff(false);
      fetchStaff();
    } catch (error) {
      console.error("Failed to add staff:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to add staff member: " + error.message,
      });
    }
  };

  // Reset staff password
  const handleResetPassword = async (staff) => {
    setIsResetting(true);
    
    try {
      const response = await fetch(`${backendUrl}/staff/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: staff.id,
          staffEmail: staff.email
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Success toast with professional design
        toast({
          variant: "success",
          title: (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Password Reset Link Sent
            </div>
          ),
          description: (
            <div className="space-y-1">
              <p>A password reset link has been sent to:</p>
              <p className="font-medium">{staff.email}</p>
              <p className="text-sm text-gray-500">The link will expire in 24 hours</p>
            </div>
          ),
          duration: 5000,
        });

        // Update staff list to show reset was requested
        fetchStaff();
      } else {
        throw new Error(result.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Password Reset Failed
          </div>
        ),
        description: error.message || "Failed to send password reset link",
      });
    } finally {
      setIsResetting(false);
      setResetPasswordStaffId(null);
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

      if (!response.ok) throw new Error("Failed to delete staff");

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
        description: "Failed to delete staff member. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
        <p className="text-gray-600">Manage staff accounts and reset passwords</p>
      </div>

      {/* Search and Add Staff */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search staff by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new staff account. They will receive the default password: OMstaff123
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="staffId">Staff ID (e.g., OM01)</Label>
                <Input
                  id="staffId"
                  value={newStaff.staffId}
                  onChange={(e) => setNewStaff({ ...newStaff, staffId: e.target.value })}
                  placeholder="OM01"
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <Label htmlFor="dateAdded">Date Added</Label>
                <Input
                  id="dateAdded"
                  type="date"
                  value={newStaff.dateAdded}
                  onChange={(e) => setNewStaff({ ...newStaff, dateAdded: e.target.value })}
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The staff member will login with their Staff ID and the default password <code className="bg-blue-100 px-1 rounded">OMstaff123</code>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingStaff(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStaff}>
                  Add Staff Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff List */}
      <div className="grid gap-4">
        {filteredStaff.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No staff members found</p>
            </CardContent>
          </Card>
        ) : (
          filteredStaff.map((staff) => (
            <Card key={staff.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-semibold">{staff.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            ID: {staff.staffId || 'N/A'}
                          </span>
                          {staff.firstLogin && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                              First Login Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Added: {new Date(staff.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      {staff.passwordResetRequestedAt && (
                        <div className="text-orange-600">
                          <span>Password reset requested: {new Date(staff.passwordResetRequestedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={isResetting && resetPasswordStaffId === staff.id}
                        >
                          {isResetting && resetPasswordStaffId === staff.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4" />
                              Reset Password
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset Staff Password</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to reset the password for <strong>{staff.name}</strong>?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 mt-4">
                          <div className="bg-amber-50 p-3 rounded-md">
                            <p className="text-sm text-amber-800">
                              A password reset link will be sent to:
                            </p>
                            <p className="font-medium text-amber-900 mt-1">{staff.email}</p>
                          </div>
                          <p className="text-sm text-gray-600">
                            The staff member will receive an email with instructions to create a new password.
                          </p>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => {}}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => {
                                setResetPasswordStaffId(staff.id);
                                handleResetPassword(staff);
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Send Reset Link
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        setStaffToDelete(staff);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
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
                      <span className="font-medium">Staff ID:</span>
                      <span>{staffToDelete.staffId || 'N/A'}</span>
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
    </div>
  );
}