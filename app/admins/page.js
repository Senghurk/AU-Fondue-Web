"use client";

import { useEffect, useState } from "react";
import { getBackendUrl } from "../config/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { 
  Shield, 
  UserPlus, 
  Mail, 
  User,
  Search,
  Trash2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar
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
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export default function AdminManagementPage() {
  const backendUrl = getBackendUrl();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [adminList, setAdminList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: ""
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch admin list
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/admin`);
      const data = await response.json();
      
      // Debug log to check if createdAt is being received
      console.log('Fetched admins:', data);
      if (data && data.length > 0) {
        console.log('Sample admin data:', {
          username: data[0].username,
          email: data[0].email,
          createdAt: data[0].createdAt
        });
      }
      
      setAdminList(data);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to fetch admin list",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = adminList.filter((admin) =>
    admin.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, endIndex);

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Validate email format
  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!email.toLowerCase().endsWith("@au.edu")) {
      return "Admin email must be an @au.edu address";
    }
    return null;
  };

  // Add new admin
  const handleAddAdmin = async () => {
    if (!newAdmin.email.trim()) {
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Missing Information
          </div>
        ),
        description: "Please enter the admin's email address",
      });
      return;
    }

    // Validate email format
    const emailError = validateEmail(newAdmin.email);
    if (emailError) {
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Invalid Email Format
          </div>
        ),
        description: emailError,
      });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to add admin");
      }

      const addedAdmin = await response.json();
      
      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Admin Added Successfully
          </div>
        ),
        description: `Admin with email ${addedAdmin.email} has been added`,
      });

      // Reset form and refresh list
      setNewAdmin({
        email: ""
      });
      setIsAddingAdmin(false);
      fetchAdmins();
    } catch (error) {
      console.error("Failed to add admin:", error);
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to add admin",
      });
    }
  };

  // Delete admin
  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    setIsDeleting(true);

    try {
      const response = await fetch(`${backendUrl}/admin/${adminToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to delete admin");
      }

      const result = await response.json();
      
      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Admin Deleted Successfully
          </div>
        ),
        description: (
          <div className="space-y-1">
            <p>{result.deletedAdmin || adminToDelete.username} has been removed from administrators</p>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        ),
        duration: 5000,
      });

      // Refresh list
      fetchAdmins();
      setDeleteConfirmOpen(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error("Failed to delete admin:", error);
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Delete Failed
          </div>
        ),
        description: error.message || "Failed to delete admin",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation
  const confirmDelete = (admin) => {
    // Prevent self-deletion
    if (user && user.email === admin.email) {
      toast({
        variant: "error",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Action Not Allowed
          </div>
        ),
        description: "You cannot delete your own administrator account while logged in.",
        duration: 5000,
      });
      return;
    }
    
    setAdminToDelete(admin);
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600 mt-2">
            Manage system administrators with AU accounts (@au.edu)
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminList.length}</div>
              <p className="text-xs text-muted-foreground">
                Active administrators
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Add Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Administrator List</CardTitle>
                <CardDescription>
                  Manage administrators who have access to the system
                </CardDescription>
              </div>
              <Button 
                onClick={() => setIsAddingAdmin(true)}
                className="bg-black hover:bg-gray-800"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Admin
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
                  placeholder="Search admins by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Admin Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No administrators found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAdmins.map((admin, index) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{admin.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {admin.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {admin.createdAt ? (
                              new Date(admin.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {user && user.email === admin.email ? (
                            <div className="relative inline-block group">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
                                title="You cannot delete your own account"
                              >
                                <X className="h-4 w-4 text-gray-400" />
                              </Button>
                              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap invisible group-hover:visible transition-all duration-200 z-50">
                                <div className="relative">
                                  Cannot delete your own account
                                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => confirmDelete(admin)}
                              disabled={adminList.length <= 1}
                              title={adminList.length <= 1 ? "Cannot delete the last admin" : "Delete admin"}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredAdmins.length > itemsPerPage && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAdmins.length)} of {filteredAdmins.length} admins
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
                      
                      if (!showPage) {
                        // Show ellipsis for gaps
                        if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={`ellipsis-${pageNum}`} className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={isCurrentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={isCurrentPage ? "bg-black hover:bg-gray-800" : ""}
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
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={isAddingAdmin} onOpenChange={setIsAddingAdmin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Add New Administrator
            </DialogTitle>
            <DialogDescription>
              Add a new administrator with an AU Microsoft account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Admin Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="username@au.edu"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                className="mt-1"
              />
              {newAdmin.email && !newAdmin.email.toLowerCase().endsWith("@au.edu") && (
                <p className="text-sm text-red-500 mt-1">
                  Email must be an @au.edu address
                </p>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-blue-900">Microsoft Authentication</p>
                  <p className="text-blue-800">
                    The admin's display name will be automatically fetched from their Microsoft account when they first log in.
                  </p>
                  <p className="text-blue-700 text-xs">
                    Example: "SAI OAN HSENG HURK -" for u6440041@au.edu
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingAdmin(false);
                setNewAdmin({ email: "" });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddAdmin}
              className="bg-black hover:bg-gray-800"
              disabled={!newAdmin.email || !newAdmin.email.toLowerCase().endsWith("@au.edu")}
            >
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Delete Admin
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>Are you sure you want to delete this administrator?</p>
              {adminToDelete && (
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <p className="font-semibold">{adminToDelete.username}</p>
                  <p className="text-sm text-gray-600">{adminToDelete.email}</p>
                </div>
              )}
              <p className="text-sm text-red-600 font-medium pt-2">
                This action cannot be undone!
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setAdminToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAdmin}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Delete Admin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}