import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { 
  Loader2, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { admissionFormApi, AdmissionFormSubmissionListItem, GetAdmissionFormSubmissionsParams } from '../../../services/api/admissionForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../shared/components/ui/dialog';

interface SubmissionsManagementProps {
  currentEntity: string;
}

export function SubmissionsManagement({ currentEntity }: SubmissionsManagementProps) {
  const { error: showError, success: showSuccess } = useNotifications();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  
  // State for each tab
  const [pendingSubmissions, setPendingSubmissions] = useState<AdmissionFormSubmissionListItem[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<AdmissionFormSubmissionListItem[]>([]);
  const [rejectedSubmissions, setRejectedSubmissions] = useState<AdmissionFormSubmissionListItem[]>([]);
  
  // Loading states for each tab
  const [pendingLoading, setPendingLoading] = useState(true);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);
  
  // Pagination states for each tab
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [approvedTotalPages, setApprovedTotalPages] = useState(1);
  const [rejectedTotalPages, setRejectedTotalPages] = useState(1);
  
  const [pendingTotal, setPendingTotal] = useState(0);
  const [approvedTotal, setApprovedTotal] = useState(0);
  const [rejectedTotal, setRejectedTotal] = useState(0);
  
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<AdmissionFormSubmissionListItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const limit = 10;
  
  // Check if user is admin or super admin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const requiresEntityFilter = user?.role === 'SUPERADMIN';

  const buildQueryParams = useCallback((status: 'PENDING' | 'APPROVED' | 'REJECTED', page: number) => {
    const params: GetAdmissionFormSubmissionsParams = {
      page,
      limit,
      status,
    };

    if (requiresEntityFilter) {
      params.entity_id = currentEntity;
    }

    return params;
  }, [currentEntity, requiresEntityFilter]);

  const fetchPendingSubmissions = useCallback(async () => {
    if (requiresEntityFilter && !currentEntity) {
      return;
    }
    setPendingLoading(true);
    setError(null);
    try {
      const response = await admissionFormApi.getAdmissionFormSubmissions(
        buildQueryParams('PENDING', pendingPage)
      );
      
      setPendingSubmissions(response.payload.submissions);
      setPendingTotal(response.payload.total);
      setPendingTotalPages(response.payload.totalPages);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch pending submissions';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setPendingLoading(false);
    }
  }, [buildQueryParams, currentEntity, pendingPage, requiresEntityFilter, showError]);

  const fetchApprovedSubmissions = useCallback(async () => {
    if (requiresEntityFilter && !currentEntity) {
      return;
    }
    setApprovedLoading(true);
    try {
      const response = await admissionFormApi.getAdmissionFormSubmissions(
        buildQueryParams('APPROVED', approvedPage)
      );
      
      setApprovedSubmissions(response.payload.submissions);
      setApprovedTotal(response.payload.total);
      setApprovedTotalPages(response.payload.totalPages);
    } catch (err: any) {
      console.error('Failed to fetch approved submissions:', err);
    } finally {
      setApprovedLoading(false);
    }
  }, [approvedPage, buildQueryParams, currentEntity, requiresEntityFilter]);

  const fetchRejectedSubmissions = useCallback(async () => {
    if (requiresEntityFilter && !currentEntity) {
      return;
    }
    setRejectedLoading(true);
    try {
      const response = await admissionFormApi.getAdmissionFormSubmissions(
        buildQueryParams('REJECTED', rejectedPage)
      );
      
      setRejectedSubmissions(response.payload.submissions);
      setRejectedTotal(response.payload.total);
      setRejectedTotalPages(response.payload.totalPages);
    } catch (err: any) {
      console.error('Failed to fetch rejected submissions:', err);
    } finally {
      setRejectedLoading(false);
    }
  }, [buildQueryParams, currentEntity, rejectedPage, requiresEntityFilter]);

  // Fetch data when tab changes or pagination changes
  useEffect(() => {
    fetchPendingSubmissions();
  }, [fetchPendingSubmissions]);

  useEffect(() => {
    if (activeTab === 'approved') {
      fetchApprovedSubmissions();
    }
  }, [activeTab, fetchApprovedSubmissions]);

  useEffect(() => {
    if (activeTab === 'rejected') {
      fetchRejectedSubmissions();
    }
  }, [activeTab, fetchRejectedSubmissions]);

  const handleViewDetails = (submission: AdmissionFormSubmissionListItem) => {
    setSelectedSubmission(submission);
    setIsDetailDialogOpen(true);
    setShowPasswordInput(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleApproveClick = () => {
    if (!selectedSubmission) return;
    // Only show password input if submission is NOT from a representative
    const isFromRepresentative = selectedSubmission.representative_id !== null;
    if (!isFromRepresentative) {
      setShowPasswordInput(true);
    } else {
      // If from representative, approve directly without password
      handleApprove();
    }
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    
    const isFromRepresentative = selectedSubmission.representative_id !== null;
    
    // Validate password only if NOT from representative
    if (!isFromRepresentative) {
      if (!password || password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
      }
      
      if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
      }
    }
    
    setIsProcessing(true);
    try {
      const payload: { action: 'approve'; password?: string } = {
        action: 'approve',
      };
      
      // Only include password if NOT from representative
      if (!isFromRepresentative && password) {
        payload.password = password;
      }
      
      await admissionFormApi.updateSubmissionStatus(selectedSubmission.id, payload);
      
      const successMessage = isFromRepresentative
        ? 'Submission approved successfully. User account created and password setup link sent via email.'
        : 'Submission approved successfully. User account created and invitation sent.';
      
      showSuccess(successMessage);
      setIsDetailDialogOpen(false);
      setShowPasswordInput(false);
      setPassword('');
      setConfirmPassword('');
      // Refresh all lists
      fetchPendingSubmissions();
      if (activeTab === 'approved') {
        fetchApprovedSubmissions();
      }
      if (activeTab === 'rejected') {
        fetchRejectedSubmissions();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to approve submission';
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    
    setIsProcessing(true);
    try {
      await admissionFormApi.updateSubmissionStatus(selectedSubmission.id, {
        action: 'reject',
      });
      
      showSuccess('Submission rejected successfully.');
      setIsDetailDialogOpen(false);
      // Refresh all lists
      fetchPendingSubmissions();
      if (activeTab === 'approved') {
        fetchApprovedSubmissions();
      }
      if (activeTab === 'rejected') {
        fetchRejectedSubmissions();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reject submission';
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: 'default',
      APPROVED: 'secondary',
      REJECTED: 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  // Helper function to render a submissions table
  const renderSubmissionsTable = (
    submissions: AdmissionFormSubmissionListItem[],
    loading: boolean,
    page: number,
    totalPages: number,
    total: number,
    setPage: (page: number | ((p: number) => number)) => void,
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
  ) => {
    if (loading && submissions.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (submissions.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No {status.toLowerCase()} submissions found</p>
        </div>
      );
    }

    return (
      <>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Representative</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{submission.exam_title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{submission.representative_name}</span>
                      <span className="text-sm text-muted-foreground">{submission.representative_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(submission.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(submission.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(submission)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} submissions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Submissions
              </CardTitle>
              <CardDescription>
                Manage and review pending admission form submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSubmissionsTable(
                pendingSubmissions,
                pendingLoading,
                pendingPage,
                pendingTotalPages,
                pendingTotal,
                setPendingPage,
                'PENDING'
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Approved Submissions
              </CardTitle>
              <CardDescription>
                Submissions that have been approved and users have been invited
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSubmissionsTable(
                approvedSubmissions,
                approvedLoading,
                approvedPage,
                approvedTotalPages,
                approvedTotal,
                setApprovedPage,
                'APPROVED'
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Rejected Submissions
              </CardTitle>
              <CardDescription>
                Submissions that have been rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSubmissionsTable(
                rejectedSubmissions,
                rejectedLoading,
                rejectedPage,
                rejectedTotalPages,
                rejectedTotal,
                setRejectedPage,
                'REJECTED'
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              View the complete admission form submission
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Submission Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Exam</label>
                  <p className="text-sm font-medium">{selectedSubmission.exam_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedSubmission.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Representative</label>
                  <p className="text-sm">{selectedSubmission.representative_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedSubmission.representative_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                  <p className="text-sm">{formatDate(selectedSubmission.created_at)}</p>
                </div>
              </div>

              {/* Form Responses */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Form Responses</label>
                <div className="space-y-3 border rounded-md p-4">
                  {Object.entries(selectedSubmission.form_responses).map(([key, value]) => (
                    <div key={key} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <label className="text-sm font-medium text-muted-foreground">{key}</label>
                      <p className="text-sm mt-1">{value || <span className="text-muted-foreground italic">Not provided</span>}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {isAdmin && selectedSubmission?.status === 'PENDING' && (
            <>
              {showPasswordInput && selectedSubmission.representative_id === null && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password for User Account</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (min 6 characters)"
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              )}
              {selectedSubmission.representative_id !== null && (
                <div className="border-t pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This submission was added by a representative. 
                      When approved, the user will receive an email with a password setup link 
                      and exam details.
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2">
                {showPasswordInput && selectedSubmission.representative_id === null ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordInput(false);
                        setPassword('');
                        setConfirmPassword('');
                      }}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve & Create Account
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={handleApproveClick}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

