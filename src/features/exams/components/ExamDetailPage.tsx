import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Progress } from '../../../shared/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../../shared/components/ui/dialog';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { 
  FileText, 
  Users, 
  Clock, 
  Target,
  Calendar,
  Edit,
  Copy,
  Archive,
  Monitor,
  Download,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  BarChart3,
  Mail,
  UserPlus,
  Layers,
  Trophy,
  Medal,
  Award,
  UserMinus,
  Loader2,
  RefreshCcw,
  Search
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { QuestionManagement } from './QuestionManagement';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { useExamContext } from '../providers/ExamContextProvider';
import { EditExamModal } from './EditExamModal';
import { examApi, LeaderboardEntry, ExamEnrollment } from '../../../services/api/exam';
import { admissionFormApi } from '../../../services/api/admissionForm';
import { getUsers, ApiUser } from '../../../services/api/user';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../shared/components/ui/tooltip';
import { SquarePen, FilePlus2 } from 'lucide-react';

interface ExamDetailPageProps {
  examId: string;
  examName: string;
  entityId: string;
  entityName: string;
  editMode?: boolean;
  onBackToEntity: () => void;
  onBackToEntities: () => void;
  onBackToDashboard: () => void;
}

export function ExamDetailPage({ 
  examId, 
  examName, 
  entityId,
  entityName,
  onBackToEntity,
  onBackToEntities,
  onBackToDashboard 
}: ExamDetailPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [showInviteRepresentativeModal, setShowInviteRepresentativeModal] = useState(false);
  const [hasAdmissionForm, setHasAdmissionForm] = useState(false);
  const [checkingAdmissionForm, setCheckingAdmissionForm] = useState(false);
  const [representatives, setRepresentatives] = useState<Array<{id: string; name: string | null; email: string; status: string}>>([]);
  const [selectedRepresentativeIds, setSelectedRepresentativeIds] = useState<Set<string>>(new Set());
  const [loadingRepresentatives, setLoadingRepresentatives] = useState(false);
  const [representativeSearchTerm, setRepresentativeSearchTerm] = useState('');
  const [invitingRepresentatives, setInvitingRepresentatives] = useState(false);
  const { info, success, error } = useNotifications();
  const { user } = useAuth();
  const { currentExam, setCurrentExam } = useExamContext();
  const navigate = useNavigate();
  
  // Statistics state
  const [statistics, setStatistics] = useState<{
    totalAttempts: number;
    totalStudentsInvited: number;
    completionRate: number;
  }>({
    totalAttempts: 0,
    totalStudentsInvited: 0,
    completionRate: 0,
  });
  const [statisticsLoading, setStatisticsLoading] = useState<boolean>(false);
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(false);
  const [enrolledStudents, setEnrolledStudents] = useState<ExamEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState<boolean>(false);
  const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);
  const [deEnrollInFlight, setDeEnrollInFlight] = useState<string | null>(null);

  const { students: studentEnrollments, representatives: representativeEnrollments } = useMemo(() => {
    return enrolledStudents.reduce(
      (acc, enrollment) => {
        if (enrollment.status === 'ASSIGNED') {
          acc.representatives.push(enrollment);
        } else {
          acc.students.push(enrollment);
        }
        return acc;
      },
      { students: [] as ExamEnrollment[], representatives: [] as ExamEnrollment[] }
    );
  }, [enrolledStudents]);

  // Role-based access control
  const canManageQuestions = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';
  const effectiveExamId = currentExam?.id || examId;
  
  // Check if admission form exists
  useEffect(() => {
    const checkAdmissionForm = async () => {
      if (!effectiveExamId || !canManageQuestions) return;
      
      setCheckingAdmissionForm(true);
      try {
        await admissionFormApi.getAdmissionForm(effectiveExamId);
        setHasAdmissionForm(true);
      } catch (err: any) {
        const errorMessage = String(err?.message || '').toLowerCase();
        const isNotFoundError =
          errorMessage.includes('404') ||
          errorMessage.includes('not_found') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('admission form not found');
        
        if (isNotFoundError) {
          setHasAdmissionForm(false);
        } else {
          console.warn('Error checking admission form:', err);
        }
      } finally {
        setCheckingAdmissionForm(false);
      }
    };

    checkAdmissionForm();
  }, [effectiveExamId, canManageQuestions]);

  // Fetch representatives when modal opens
  useEffect(() => {
    const fetchRepresentatives = async () => {
      if (showInviteRepresentativeModal && effectiveExamId) {
        setLoadingRepresentatives(true);
        try {
          // First, fetch enrollments for this exam to get already invited representatives
          let enrolledUserIds = new Set<string>();
          try {
            const enrollmentsResponse = await examApi.getExamEnrollments(effectiveExamId);
            enrolledUserIds = new Set(
              (enrollmentsResponse.payload.enrollments || []).map((e: any) => e.user_id)
            );
          } catch (err) {
            console.warn('Failed to fetch enrollments, proceeding without filter:', err);
          }

          // Fetch representatives in batches (backend limit is 10)
          const allRepresentatives: ApiUser[] = [];
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const response = await getUsers({ 
              role: 'REPRESENTATIVE',
              limit: 10,
              page: page
            });
            
            const users = response.payload.users || [];
            allRepresentatives.push(...users);
            
            // Check if there are more pages
            hasMore = page < response.payload.totalPages;
            page++;
          }

          // Filter active representatives and exclude already invited ones
          const activeRepresentatives = allRepresentatives.filter(
            (user: ApiUser) => user.status === 'ACTIVE' && !enrolledUserIds.has(user.id)
          );
          setRepresentatives(activeRepresentatives.map((user: ApiUser) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
          })));
        } catch (err: any) {
          console.error('Failed to fetch representatives', err);
          error('Failed to load representatives. Please try again.');
        } finally {
          setLoadingRepresentatives(false);
        }
      }
    };

    fetchRepresentatives();
  }, [showInviteRepresentativeModal, effectiveExamId, error]);

  const handleInviteRepresentatives = async () => {
    if (selectedRepresentativeIds.size === 0) {
      error('Please select at least one representative');
      return;
    }

    if (!effectiveExamId) {
      return;
    }

    setInvitingRepresentatives(true);

    try {
      const res = await examApi.inviteRepresentatives({
        examId: effectiveExamId,
        user_ids: Array.from(selectedRepresentativeIds),
      });

      const enrolledCount = res?.payload?.enrolledCount || 0;

      if (enrolledCount > 0) {
        success(`Successfully invited ${enrolledCount} representative(s) to the exam`);
      } else {
        error('No representatives were invited. They may already be enrolled.');
      }

      setShowInviteRepresentativeModal(false);
      setSelectedRepresentativeIds(new Set());
      setRepresentativeSearchTerm('');
    } catch (err: any) {
      console.error('Failed to invite representatives', err);
      error(err?.message || 'Failed to invite representatives. Please try again.');
    } finally {
      setInvitingRepresentatives(false);
    }
  };

  const toggleRepresentativeSelection = (representativeId: string) => {
    const newSelection = new Set(selectedRepresentativeIds);
    if (newSelection.has(representativeId)) {
      newSelection.delete(representativeId);
    } else {
      newSelection.add(representativeId);
    }
    setSelectedRepresentativeIds(newSelection);
  };

  const filteredRepresentatives = representatives.filter(rep => {
    const searchLower = representativeSearchTerm.toLowerCase();
    return (
      rep.name?.toLowerCase().includes(searchLower) ||
      rep.email.toLowerCase().includes(searchLower)
    );
  });
  
  // Fetch statistics from backend
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!canManageQuestions) return;
      
      try {
        setStatisticsLoading(true);
        const response = await examApi.getExamDetailStatistics(examId);
        setStatistics({
          totalAttempts: response.payload.totalAttempts,
          totalStudentsInvited: response.payload.totalStudentsInvited,
          completionRate: response.payload.completionRate,
        });
      } catch (err) {
        console.error('Error fetching exam statistics:', err);
      } finally {
        setStatisticsLoading(false);
      }
    };

    fetchStatistics();
  }, [examId, canManageQuestions]);
  
  // Fetch leaderboard from backend
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!canManageQuestions) return;
      
      try {
        setLeaderboardLoading(true);
        const response = await examApi.getExamLeaderboard(examId);
        setLeaderboard(response.payload.leaderboard);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
  }, [examId, canManageQuestions]);

  // Helper function to format duration from seconds to minutes
  const formatDurationFromSeconds = (seconds?: number): number => {
    if (!seconds) return 0;
    return Math.floor(seconds / 60);
  };

  // Helper function to get status from active boolean
  const getStatusFromActive = (active?: boolean): string => {
    if (active === undefined) return 'draft';
    return active ? 'active' : 'draft';
  };


  // Note: Questions are now fetched by QuestionManagement component from backend

  // Header data - ONLY use fields from BackendExam model (no metadata)
  // BackendExam fields: id, title, type, active, created_at, duration_seconds, user_id, entity_id
  const examHeaderData = currentExam ? {
    id: currentExam.id,
    name: currentExam.title,
    type: currentExam.type,
    duration: formatDurationFromSeconds(currentExam.duration_seconds),
    status: getStatusFromActive(currentExam.active),
    createdAt: currentExam.created_at,
  } : {
    id: examId,
    name: examName,
    type: 'Final Exam',
    duration: 120,
    status: 'active',
    createdAt: '2024-01-15',
  };

  // Keep separate examDetails with mock data for other parts of the page (stats, analytics, etc.)
  // This maintains backward compatibility with existing components
  const examDetails = {
    id: examId,
    name: examName,
    type: 'Final Exam',
    duration: 120,
    totalQuestions: 50,
    maxAttempts: 1,
    passingScore: 70,
    status: 'active',
    createdAt: '2024-01-15',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    totalStudents: 245,
    completedAttempts: 189,
    activeAttempts: 12,
    averageScore: 78.5,
    passRate: 87.3,
    highestScore: 98,
    lowestScore: 45
  };

  const stats = [
    {
      title: 'Total Attempts',
      value: statisticsLoading ? '...' : statistics.totalAttempts.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      subtext: `${statistics.totalStudentsInvited - statistics.totalAttempts} remaining`
    },
    {
      title: 'Average Score',
      value: `${examDetails.averageScore}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      subtext: `${examDetails.passRate}% pass rate`
    },
    {
      title: 'Completion Rate',
      value: statisticsLoading ? '...' : `${statistics.completionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      subtext: `${statistics.totalStudentsInvited} total students`
    },
    {
      title: 'Live Sessions',
      value: examDetails.activeAttempts.toString(),
      icon: Monitor,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      subtext: 'Currently active'
    }
  ];

  const scoreDistribution = [
    { range: '90-100', count: 45, color: 'hsl(var(--success))' },
    { range: '80-89', count: 67, color: 'hsl(var(--primary))' },
    { range: '70-79', count: 52, color: 'hsl(var(--chart-3))' },
    { range: '60-69', count: 18, color: 'hsl(var(--chart-4))' },
    { range: '0-59', count: 7, color: 'hsl(var(--destructive))' }
  ];

  const timelineData = [
    { time: '09:00', attempts: 5 },
    { time: '10:00', attempts: 12 },
    { time: '11:00', attempts: 23 },
    { time: '12:00', attempts: 18 },
    { time: '13:00', attempts: 15 },
    { time: '14:00', attempts: 28 },
    { time: '15:00', attempts: 35 },
    { time: '16:00', attempts: 22 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'scheduled':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'draft':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { className: string }> = {
      MCQ: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      ONE_WORD: { className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      DESCRIPTIVE: { className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      HYBRID: { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' }
    };
    return variants[type] || { className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' };
  };

  // Extracted send invitations logic into a separate function so it can be unit-tested
  const sendInvitations = async () => {
    const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) {
      error('Please enter at least one email address');
      return;
    }

    const examIdToUse = (currentExam && (currentExam as any).id) || examId;
    const entityIdToUse = (currentExam && (currentExam as any).entity_id) || entityId;

    if (!entityIdToUse) {
      error('Entity ID is required to invite students');
      return;
    }

    setShowInviteModal(false);
    setInviteEmails('');

    try {
      // Bulk invite all students at once
      const res = await examApi.inviteStudents({
        examId: examIdToUse,
        entityId: entityIdToUse,
        emails, // All emails in one request
      });

      const results = res?.payload?.results || [];
      let totalInvited = 0;

      // Show individual notification for each result
      results.forEach((result: { email: string; success: boolean; reason: string }) => {
        if (result.success) {
          totalInvited++;
          success(`✓ Invitation sent to ${result.email}`);
        } else {
          error(`✗ Failed to invite ${result.email} - ${result.reason}`);
        }
      });

      // Update exam state with total invited count
      if (totalInvited > 0 && currentExam && setCurrentExam) {
        try {
          setCurrentExam({ ...(currentExam as any), studentsInvited: ((currentExam as any).studentsInvited || 0) + totalInvited });
        } catch (err) {
          // ignore context update errors
        }
      }
    } catch (err: any) {
      console.error('Failed to send invites', err);
      error('Failed to send invitations. Please try again.');
    }
  };

  const fetchExamEnrollments = useCallback(async () => {
    if (!canManageQuestions || !effectiveExamId) return;

    try {
      setEnrollmentsLoading(true);
      setEnrollmentsError(null);
      const response = await examApi.getExamEnrollments(effectiveExamId);
      setEnrolledStudents(response.payload.enrollments || []);
    } catch (err: any) {
      console.error('Error fetching exam enrollments:', err);
      const message = err?.message || 'Failed to load enrolled students';
      setEnrollmentsError(message);
      error(message);
    } finally {
      setEnrollmentsLoading(false);
    }
  }, [canManageQuestions, effectiveExamId, error]);

  useEffect(() => {
    fetchExamEnrollments();
  }, [fetchExamEnrollments]);

  const handleDeEnrollStudent = async (enrollmentId: string) => {
    if (!canManageQuestions || !effectiveExamId) {
      error('You do not have permission to update enrollments');
      return;
    }

    try {
      setDeEnrollInFlight(enrollmentId);
      await examApi.deleteExamEnrollment(effectiveExamId, enrollmentId);
      setEnrolledStudents((prev) => prev.filter((student) => student.id !== enrollmentId));
      success('Student de-enrolled successfully');

      // Update statistics locally to keep counts aligned
      setStatistics((prev) => {
        const nextTotalStudents = Math.max(prev.totalStudentsInvited - 1, 0);
        const nextTotalAttempts = Math.min(prev.totalAttempts, nextTotalStudents);
        return {
          ...prev,
          totalStudentsInvited: nextTotalStudents,
          totalAttempts: nextTotalAttempts,
        };
      });
    } catch (err: any) {
      console.error('Failed to de-enroll student:', err);
      const message = err?.message || 'Failed to de-enroll student';
      error(message);
    } finally {
      setDeEnrollInFlight(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Exam Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">{examHeaderData.name}</h1>
                    <Badge className={getStatusColor(examHeaderData.status)}>
                      {examHeaderData.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={getTypeBadge(examHeaderData.type || 'OTHER').className}>
                        {examHeaderData.type || 'OTHER'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{examHeaderData.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {examHeaderData.createdAt ? new Date(examHeaderData.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {canManageQuestions && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const basePath = user?.role === 'SUPERADMIN' ? '/superadmin' : '/admin';
                              navigate(`${basePath}/exam/${effectiveExamId}/admission-form`);
                            }}
                          >
                            {hasAdmissionForm ? (
                              <SquarePen className="h-4 w-4 mr-2" />
                            ) : (
                              <FilePlus2 className="h-4 w-4 mr-2" />
                            )}
                            {hasAdmissionForm ? 'Edit Admission Form' : 'Create Admission Form'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasAdmissionForm ? 'Edit admission form' : 'Create admission form'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={!hasAdmissionForm}
                            onClick={() => {
                              setSelectedRepresentativeIds(new Set());
                              setRepresentativeSearchTerm('');
                              setShowInviteRepresentativeModal(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Representative
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasAdmissionForm 
                            ? 'Invite representative' 
                            : 'Create admission form first'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (currentExam) {
                          setShowEditModal(true);
                        } else {
                          error('Exam data not available. Please refresh the page.');
                        }
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Exam
                    </Button>
                  </>
                )}
                <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Students
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Invite Students to Exam</DialogTitle>
                      <DialogDescription>
                        Send invitations for "{examName}" to students
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Exam Details</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Title:</span> {examHeaderData.name}</p>
                          <p><span className="font-medium">Type:</span> {examHeaderData.type}</p>
                          <p><span className="font-medium">Duration:</span> {examHeaderData.duration} minutes</p>
                          <p><span className="font-medium">Status:</span> {examHeaderData.status}</p>
                          <p><span className="font-medium">Created:</span> {examHeaderData.createdAt ? new Date(examHeaderData.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="invite-emails">Student Email Addresses</Label>
                        <Textarea
                          id="invite-emails"
                          placeholder="Enter email addresses separated by commas (e.g., student1@example.com, student2@example.com)"
                          value={inviteEmails}
                          onChange={(e) => setInviteEmails(e.target.value)}
                          rows={6}
                        />
                        <p className="text-xs text-muted-foreground">
                          Separate multiple email addresses with commas. Students will receive an invitation with exam details and access link.
                        </p>
                      </div>
                    </div>
                    
                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={sendInvitations} className="bg-primary hover:bg-primary/90">
                                        <Mail className="h-4 w-4 mr-2" />
                                        Send Invitations
                                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    console.log('Monitoring exam:', examName);
                    info('Exam monitoring dashboard would open here');
                  }}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Monitor Exam
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.subtext}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Monitoring */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${canManageQuestions ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Live Monitor
            </TabsTrigger>
            {canManageQuestions && (
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Questions
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Responses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Completion Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Completion Progress</CardTitle>
                  <CardDescription>Student participation status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-sm font-medium">
                      {statisticsLoading ? '...' : `${statistics.totalAttempts}/${statistics.totalStudentsInvited}`}
                    </span>
                  </div>
                  <Progress 
                    value={statisticsLoading ? 0 : statistics.completionRate} 
                    className="h-2"
                  />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">
                          {statisticsLoading ? '...' : statistics.totalAttempts}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Play className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{examDetails.activeAttempts}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {statisticsLoading ? '...' : statistics.totalStudentsInvited - statistics.totalAttempts - examDetails.activeAttempts}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Summary</CardTitle>
                  <CardDescription>Performance overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-success/10 rounded-lg">
                      <div className="text-2xl font-bold text-success">{examDetails.highestScore}%</div>
                      <p className="text-sm text-muted-foreground">Highest Score</p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{examDetails.averageScore}%</div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-destructive/10 rounded-lg">
                      <div className="text-2xl font-bold text-destructive">{examDetails.lowestScore}%</div>
                      <p className="text-sm text-muted-foreground">Lowest Score</p>
                    </div>
                    <div className="text-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{examDetails.passRate}%</div>
                      <p className="text-sm text-muted-foreground">Pass Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {canManageQuestions && (
              <>
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Enrolled Students
                      </CardTitle>
                      <CardDescription className="whitespace-nowrap">
                        Current roster for this exam. Remove access when a student should not participate.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 justify-end w-full lg:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchExamEnrollments}
                        disabled={enrollmentsLoading}
                      >
                        {enrollmentsLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Refreshing...
                          </>
                        ) : (
                          <>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Refresh
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInviteModal(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite More
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {enrollmentsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : enrollmentsError ? (
                    <Alert variant="destructive">
                      <AlertDescription>{enrollmentsError}</AlertDescription>
                    </Alert>
                  ) : studentEnrollments.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No students are enrolled yet.</p>
                      <p className="text-sm">Invite students to see them listed here.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Enrolled</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentEnrollments.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                  {student.name || 'Unknown Student'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {student.email || 'No email'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {student.status.toLowerCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {student.enrolled_at
                                ? new Date(student.enrolled_at).toLocaleString()
                                : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeEnrollStudent(student.id)}
                                disabled={deEnrollInFlight === student.id}
                                className="text-destructive hover:text-destructive"
                              >
                                {deEnrollInFlight === student.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Removing...
                                  </>
                                ) : (
                                  <>
                                    <UserMinus className="h-4 w-4 mr-1" />
                                    De-enroll
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Assigned Representatives
                      </CardTitle>
                      <CardDescription className="whitespace-nowrap">
                        Representatives assigned to this exam to manage admission forms.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 justify-end w-full lg:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchExamEnrollments}
                        disabled={enrollmentsLoading}
                      >
                        {enrollmentsLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Refreshing...
                          </>
                        ) : (
                          <>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Refresh
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasAdmissionForm}
                        onClick={() => {
                          setSelectedRepresentativeIds(new Set());
                          setRepresentativeSearchTerm('');
                          setShowInviteRepresentativeModal(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Representative
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {enrollmentsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : enrollmentsError ? (
                    <Alert variant="destructive">
                      <AlertDescription>{enrollmentsError}</AlertDescription>
                    </Alert>
                  ) : representativeEnrollments.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No representatives are assigned yet.</p>
                      <p className="text-sm">Invite representatives to see them listed here.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Representative</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {representativeEnrollments.map((representative) => (
                          <TableRow key={representative.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                  {representative.name || 'Unknown Representative'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {representative.email || 'No email'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {representative.status.toLowerCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {representative.enrolled_at
                                ? new Date(representative.enrolled_at).toLocaleString()
                                : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeEnrollStudent(representative.id)}
                                disabled={deEnrollInFlight === representative.id}
                                className="text-destructive hover:text-destructive"
                              >
                                {deEnrollInFlight === representative.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Removing...
                                  </>
                                ) : (
                                  <>
                                    <UserMinus className="h-4 w-4 mr-1" />
                                    Remove
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
              </>
            )}
          </TabsContent>

          {canManageQuestions && (
            <TabsContent value="questions" className="space-y-6">
              <QuestionManagement 
                examId={currentExam?.id || examId}
                examTitle={currentExam?.title || examName}
              />
            </TabsContent>
          )}

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Exam attempts throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="attempts" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Current Active Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    Active Sessions ({examDetails.activeAttempts})
                  </CardTitle>
                  <CardDescription>Students currently taking the exam</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Student {index + 1}</p>
                            <p className="text-xs text-muted-foreground">Started 25 min ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Q {15 + index}/50</p>
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${((15 + index) / 50) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>Breakdown of student performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Breakdown</CardTitle>
                  <CardDescription>Pass/Fail distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pass', value: Math.round(statistics.totalAttempts * (examDetails.passRate / 100)), color: 'hsl(var(--success))' },
                          { name: 'Fail', value: statistics.totalAttempts - Math.round(statistics.totalAttempts * (examDetails.passRate / 100)), color: 'hsl(var(--destructive))' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        <Cell fill="hsl(var(--success))" />
                        <Cell fill="hsl(var(--destructive))" />
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Leaderboard
                </CardTitle>
                <CardDescription>Top performers ranked by correct answers</CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No completed attempts yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => {
                      const getRankIcon = () => {
                        if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
                        if (index === 1) return <Medal className="h-5 w-5 text-gray-400 dark:text-gray-300" />;
                        if (index === 2) return <Award className="h-5 w-5 text-orange-500 dark:text-orange-400" />;
                        return <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-foreground">{index + 1}</span>;
                      };
                      
                      const getRankColor = () => {
                        if (index === 0) return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700';
                        if (index === 1) return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
                        if (index === 2) return 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700';
                        return 'bg-muted/50 dark:bg-muted border-border';
                      };
                      
                      return (
                        <div
                          key={entry.userId}
                          className={`flex items-center justify-between p-4 rounded-lg border ${getRankColor()}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10">
                              {getRankIcon()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{entry.name || entry.email}</p>
                              <p className="text-sm text-muted-foreground">{entry.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{entry.correctAnswers}</p>
                            <p className="text-xs text-muted-foreground">correct answers</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(entry.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export & Download</CardTitle>
                <CardDescription>Download exam responses and reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      console.log('Downloading all responses for:', examName);
                      success('All responses CSV download started');
                    }}
                  >
                    <Download className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">All Responses</div>
                      <div className="text-xs text-muted-foreground">CSV Format</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      console.log('Downloading detailed report for:', examName);
                      success('Detailed PDF report download started');
                    }}
                  >
                    <FileText className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Detailed Report</div>
                      <div className="text-xs text-muted-foreground">PDF Format</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      console.log('Downloading analytics report for:', examName);
                      success('Analytics Excel report download started');
                    }}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Analytics Report</div>
                      <div className="text-xs text-muted-foreground">Excel Format</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      console.log('Downloading student list for:', examName);
                      success('Student list CSV download started');
                    }}
                  >
                    <Users className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Student List</div>
                      <div className="text-xs text-muted-foreground">CSV Format</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invite Representatives Modal */}
        <Dialog open={showInviteRepresentativeModal} onOpenChange={setShowInviteRepresentativeModal}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Invite Representatives</DialogTitle>
              <DialogDescription>
                Select representatives to invite
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={representativeSearchTerm}
                    onChange={(e) => setRepresentativeSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Representatives List */}
              <div className="flex-1 overflow-y-auto border rounded-md">
                {loadingRepresentatives ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredRepresentatives.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">
                      {representativeSearchTerm ? 'No representatives found' : 'No representatives available'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredRepresentatives.map((representative) => (
                      <div
                        key={representative.id}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => toggleRepresentativeSelection(representative.id)}
                      >
                        <Checkbox
                          checked={selectedRepresentativeIds.has(representative.id)}
                          onCheckedChange={() => toggleRepresentativeSelection(representative.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {representative.name || 'No Name'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate flex-shrink-0">
                            {representative.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowInviteRepresentativeModal(false);
                  setSelectedRepresentativeIds(new Set());
                  setRepresentativeSearchTerm('');
                }}
                disabled={invitingRepresentatives}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleInviteRepresentatives} 
                className="bg-primary hover:bg-primary/90"
                disabled={invitingRepresentatives || selectedRepresentativeIds.size === 0}
              >
                <Mail className="h-4 w-4 mr-2" />
                {invitingRepresentatives 
                  ? 'Sending...' 
                  : `Invite ${selectedRepresentativeIds.size > 0 ? `(${selectedRepresentativeIds.size})` : ''}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Exam Modal */}
        {currentExam && (
          <EditExamModal
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={(updatedExam) => {
              try {
                // Update context with the updated exam data
                if (updatedExam) {
                  setCurrentExam(updatedExam);
                }
                success('Exam updated successfully!');
                setShowEditModal(false);
              } catch (err) {
                error('Failed to refresh exam data');
              }
            }}
            exam={currentExam}
          />
        )}
      </motion.div>
    </div>
  );
}
``