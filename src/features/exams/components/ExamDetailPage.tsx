import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Progress } from '../../../shared/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../../shared/components/ui/dialog';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
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
  Search,
  Globe,
  Maximize,
  Camera,
  AlertTriangle,
  Mic,
  Trash2
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
import { getPendingResumptionRequests, approveResumption, rejectResumption, ResumptionRequest } from '../../../services/api/resumptionRequest';
import { admissionFormApi } from '../../../services/api/admissionForm';
import { getUsers, ApiUser } from '../../../services/api/user';
import { getMonitoringByExam, ExamMonitoringData, deleteMonitoringByEnrollment } from '../../../services/api/examMonitoring';
import { getApiUrl } from '../../../services/api/core';
import { getEntityById } from '../../../services/api/entity';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../shared/components/ui/tooltip';
import { Switch } from '../../../shared/components/ui/switch';
import { SquarePen, FilePlus2, Share2, Check, MessageSquare } from 'lucide-react';

// Component to display authenticated media images
function AuthenticatedImage({ mediaId, alt, className, onError }: { mediaId: string; alt: string; className?: string; onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void }) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);
        const { authenticatedFetch } = await import('../../../services/api/core');
        const response = await authenticatedFetch(getApiUrl(`/v1/medias?id=${mediaId}`));
        const data = await response.json();
        
        if (data.payload?.media) {
          // Handle buffer data - convert to blob URL
          let blob: Blob;
          if (data.payload.media instanceof Array || (typeof data.payload.media === 'object' && data.payload.media.type === 'Buffer')) {
            // It's a buffer array
            const buffer = data.payload.media.data || data.payload.media;
            const uint8Array = new Uint8Array(buffer);
            blob = new Blob([uint8Array], { type: 'image/jpeg' });
          } else if (typeof data.payload.media === 'string') {
            // It's base64 string
            const base64Data = data.payload.media.replace(/^data:image\/\w+;base64,/, '');
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            blob = new Blob([bytes], { type: 'image/jpeg' });
          } else {
            throw new Error('Unknown media format');
          }
          
          const blobUrl = URL.createObjectURL(blob);
          setImageSrc(blobUrl);
        } else {
          throw new Error('No media data');
        }
      } catch (err) {
        console.error('Failed to load image:', err);
        setError(true);
        if (onError) {
          onError({} as React.SyntheticEvent<HTMLImageElement, Event>);
        }
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    // Cleanup blob URL on unmount or when mediaId changes
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [mediaId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error || !imageSrc) {
    return (
      <div className={`${className} bg-muted rounded-lg border-2 border-dashed flex items-center justify-center`}>
        <div className="text-center text-muted-foreground">
          <Camera className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">Failed to load</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${className} bg-muted rounded-lg border-2 border-dashed flex items-center justify-center`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={onError}
    />
  );
}

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
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const { info, success, error } = useNotifications();
  const { user } = useAuth();
  const { currentExam, setCurrentExam } = useExamContext();
  const navigate = useNavigate();
  
  // Monitoring data state
  const [monitoringData, setMonitoringData] = useState<ExamMonitoringData[]>([]);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);
  const [monitoringError, setMonitoringError] = useState<string | null>(null);
  const [entityMonitoringEnabled, setEntityMonitoringEnabled] = useState<boolean>(true);
  const [examMonitoringEnabled, setExamMonitoringEnabled] = useState<boolean>(true);
  const [loadingEntityMonitoring, setLoadingEntityMonitoring] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<string | null>(null);
  const [resumptionRequests, setResumptionRequests] = useState<ResumptionRequest[]>([]);
  const [loadingResumptionRequests, setLoadingResumptionRequests] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  
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
  
  // State for score distribution
  const [scoreDistribution, setScoreDistribution] = useState<Array<{
    range: string;
    count: number;
    percentage: number;
    color?: string;
  }>>([
    { range: '90-100', count: 0, percentage: 0, color: 'hsl(var(--success))' },
    { range: '80-89', count: 0, percentage: 0, color: 'hsl(var(--primary))' },
    { range: '70-79', count: 0, percentage: 0, color: 'hsl(var(--chart-3))' },
    { range: '60-69', count: 0, percentage: 0, color: 'hsl(var(--chart-4))' },
    { range: '<60', count: 0, percentage: 0, color: 'hsl(var(--destructive))' }
  ]);
  const [scoreDistributionLoading, setScoreDistributionLoading] = useState<boolean>(false);
  const [enrolledStudents, setEnrolledStudents] = useState<ExamEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState<boolean>(false);
  const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);
  const [deEnrollInFlight, setDeEnrollInFlight] = useState<string | null>(null);
  const [resultsVisible, setResultsVisible] = useState<boolean>(false);
  const [updatingResultsVisible, setUpdatingResultsVisible] = useState<boolean>(false);
  
  // Score summary state
  const [scoreSummary, setScoreSummary] = useState<{
    highestScore: number;
    lowestScore: number;
    averageScore: number;
    passRate: number;
    totalAttempts: number;
  }>({
    highestScore: 0,
    lowestScore: 0,
    averageScore: 0,
    passRate: 0,
    totalAttempts: 0,
  });

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

  // Calculate participation status from enrollment data
  const participationStatus = useMemo(() => {
    const completed = studentEnrollments.filter(s => s.status === 'COMPLETED').length;
    const inProgress = studentEnrollments.filter(s => s.status === 'ONGOING').length;
    const pending = studentEnrollments.filter(s => s.status === 'UPCOMING').length;
    const total = studentEnrollments.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      inProgress,
      pending,
      total,
      completionRate
    };
  }, [studentEnrollments]);

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

  // Fetch entity monitoring status
  useEffect(() => {
    const fetchEntityMonitoringStatus = async () => {
      if (entityId) {
        setLoadingEntityMonitoring(true);
        try {
          const response = await getEntityById(entityId);
          if (response?.payload) {
            setEntityMonitoringEnabled(response.payload.monitoring_enabled !== false);
          }
        } catch (err) {
          console.error('Failed to fetch entity monitoring status:', err);
          // Default to enabled if fetch fails
          setEntityMonitoringEnabled(true);
        } finally {
          setLoadingEntityMonitoring(false);
        }
      }
    };

    fetchEntityMonitoringStatus();
  }, [entityId]);

  // Show notification when admin tries to access monitoring tab if disabled
  useEffect(() => {
    if (entityMonitoringEnabled === false && activeTab === 'monitoring' && user?.role === 'ADMIN') {
      info('You don\'t have rights to see that. Monitoring has been disabled.');
    }
  }, [entityMonitoringEnabled, activeTab, user?.role, info]);

  // Fetch exam monitoring status
  useEffect(() => {
    const fetchExamMonitoringStatus = async () => {
      if (!effectiveExamId) return;
      
      try {
        const response = await examApi.getExamById(effectiveExamId);
        if (response?.payload) {
          setExamMonitoringEnabled(response.payload.monitoring_enabled !== false);
        }
      } catch (err) {
        console.error('Failed to fetch exam monitoring status:', err);
        // Default to enabled if fetch fails
        setExamMonitoringEnabled(true);
      }
    };

    fetchExamMonitoringStatus();
  }, [effectiveExamId]);

  // Fetch monitoring data when monitoring tab is active (only if monitoring is enabled)
  useEffect(() => {
    const fetchMonitoringData = async () => {
      // Only fetch if monitoring is enabled and user has access
      const isMonitoringDisabled = entityMonitoringEnabled === false && user?.role === 'ADMIN';
      
      // Don't fetch if exam monitoring is disabled
      if (examMonitoringEnabled === false) {
        setMonitoringData([]);
        setMonitoringError(null);
        return;
      }
      
      if (activeTab === 'monitoring' && effectiveExamId && !isMonitoringDisabled) {
        setLoadingMonitoring(true);
        setMonitoringError(null);
        try {
          const response = await getMonitoringByExam(effectiveExamId);
          setMonitoringData(response.payload.enrollments || []);
        } catch (err: any) {
          console.error('Failed to fetch monitoring data:', err);
          setMonitoringError(err.message || 'Failed to load monitoring data');
          setMonitoringData([]);
        } finally {
          setLoadingMonitoring(false);
        }
      } else if (activeTab === 'monitoring' && isMonitoringDisabled) {
        // Clear data if monitoring is disabled
        setMonitoringData([]);
        setMonitoringError(null);
      }
    };

    fetchMonitoringData();
  }, [activeTab, effectiveExamId, entityMonitoringEnabled, examMonitoringEnabled, user?.role]);

  // Fetch resumption requests when resumptions tab is active
  useEffect(() => {
    const fetchResumptionRequests = async () => {
      if (activeTab === 'resumptions' && effectiveExamId && canManageQuestions) {
        setLoadingResumptionRequests(true);
        try {
          const response = await getPendingResumptionRequests(effectiveExamId);
          setResumptionRequests(response.payload.requests);
        } catch (err) {
          console.error('Failed to fetch resumption requests:', err);
        } finally {
          setLoadingResumptionRequests(false);
        }
      }
    };

    fetchResumptionRequests();
  }, [activeTab, effectiveExamId, canManageQuestions]);

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
          // Only fetch representatives from the same entity as the exam
          const allRepresentatives: ApiUser[] = [];
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const response = await getUsers({ 
              role: 'REPRESENTATIVE',
              entity_id: entityId, // Only fetch representatives from the exam's entity
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

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      error('Failed to copy URL. Please try again.');
    }
  };

  const handleShareWhatsApp = () => {
    const examTitle = currentExam?.title || examName;
    const message = encodeURIComponent(`Fill out the admission form for ${examTitle}: ${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareEmail = () => {
    const examTitle = currentExam?.title || examName;
    const subject = encodeURIComponent(`Admission Form for ${examTitle}`);
    const body = encodeURIComponent(`Please fill out the admission form for ${examTitle}:\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  
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


  // Function to generate and download PDF with all students exam score data using browser's print-to-PDF
  const downloadLeaderboardPDF = () => {
    try {
      // Calculate summary statistics
      const totalStudents = leaderboard.length;
      const passedStudents = leaderboard.filter(e => e.passed).length;
      const failedStudents = totalStudents - passedStudents;
      const avgScore = leaderboard.length > 0 
        ? (leaderboard.reduce((sum, e) => sum + e.score, 0) / leaderboard.length).toFixed(2)
        : '0.00';

      // Create HTML content for printing
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Exam Results Report - ${examName}</title>
            <style>
              @media print {
                @page {
                  margin: 1cm;
                  size: A4;
                }
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                }
              }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                margin: 0 0 10px 0;
                font-size: 24px;
                color: #333;
              }
              .header h2 {
                margin: 5px 0;
                font-size: 18px;
                color: #666;
                font-weight: normal;
              }
              .header p {
                margin: 5px 0;
                font-size: 12px;
                color: #999;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                font-size: 11px;
              }
              th {
                background-color: #10b981;
                color: white;
                border: 1px solid #059669;
                padding: 10px 8px;
                text-align: left;
                font-weight: bold;
              }
              td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .score {
                font-weight: bold;
                color: #333;
              }
              .pass {
                color: #22c55e;
                font-weight: bold;
              }
              .fail {
                color: #ef4444;
                font-weight: bold;
              }
              .summary {
                margin-top: 30px;
                padding: 15px;
                background-color: #d1fae5;
                border: 2px solid #10b981;
                border-radius: 5px;
              }
              .summary h3 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #059669;
                font-weight: bold;
              }
              .summary p {
                margin: 5px 0;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header" style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); color: white; padding: 25px 20px; margin: -20px -20px 30px -20px; border-radius: 8px;">
              <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">ExamEntra</h1>
              <h2 style="color: white; margin: 5px 0; font-size: 20px; font-weight: 500;">${examName}</h2>
              ${entityName ? `<p style="color: rgba(255,255,255,0.95); margin: 10px 0 5px 0; font-size: 16px; font-weight: 500;">${entityName}</p>` : ''}
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 12px;">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            
            ${entityName ? `
            <div style="margin-bottom: 20px; padding: 10px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #059669; font-weight: 600;">Entity: ${entityName}</p>
            </div>
            ` : ''}
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Correct Answers</th>
                </tr>
              </thead>
              <tbody>
                ${leaderboard.map((entry, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${entry.name || entry.email}</td>
                    <td>${entry.email}</td>
                    <td class="score">${entry.score.toFixed(2)}</td>
                    <td class="${entry.passed ? 'pass' : 'fail'}">${entry.passed ? 'Pass' : 'Fail'}</td>
                    <td>${entry.correctAnswers}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="summary">
              <h3>Summary</h3>
              <p><strong>Total Students:</strong> ${totalStudents}</p>
              <p><strong>Passed:</strong> ${passedStudents}</p>
              <p><strong>Failed:</strong> ${failedStudents}</p>
              <p><strong>Average Score:</strong> ${avgScore}</p>
            </div>
          </body>
        </html>
      `;

      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        error('Please allow popups to download the PDF');
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          success('PDF download dialog opened. Select "Save as PDF" in the print dialog.');
        }, 250);
      };
    } catch (err) {
      console.error('Error generating PDF:', err);
      error('Failed to generate PDF report');
    }
  };

  // Fetch score distribution from backend
  useEffect(() => {
    const fetchScoreDistribution = async () => {
      if (!canManageQuestions || !effectiveExamId) return;
      
      try {
        setScoreDistributionLoading(true);
        const response = await examApi.getExamScoreDistribution(effectiveExamId);
        if (response.payload?.distribution) {
          // Map backend data to include colors for chart
          const colors = [
            'hsl(var(--success))',
            'hsl(var(--primary))',
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))',
            'hsl(var(--destructive))'
          ];
          const distributionWithColors = response.payload.distribution.map((item, index) => ({
            ...item,
            color: colors[index] || 'hsl(var(--primary))'
          }));
          setScoreDistribution(distributionWithColors);
        }
        
        // Update score summary from the response
        if (response.payload?.summary) {
          setScoreSummary({
            highestScore: response.payload.summary.highestScore,
            lowestScore: response.payload.summary.lowestScore,
            averageScore: response.payload.summary.averageScore,
            passRate: response.payload.summary.passRate,
            totalAttempts: response.payload.summary.totalAttempts,
          });
        }
      } catch (err) {
        console.error('Error fetching score distribution:', err);
      } finally {
        setScoreDistributionLoading(false);
      }
    };

    fetchScoreDistribution();
  }, [effectiveExamId, canManageQuestions]);

  // Initialize resultsVisible from currentExam
  useEffect(() => {
    if (currentExam) {
      setResultsVisible(currentExam.results_visible ?? false);
    } else {
      setResultsVisible(false);
    }
  }, [currentExam]);

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
  // Score summary data is now fetched from backend
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
    averageScore: scoreSummary.averageScore,
    passRate: scoreSummary.passRate,
    highestScore: scoreSummary.highestScore,
    lowestScore: scoreSummary.lowestScore
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
      value: scoreDistributionLoading ? '...' : `${examDetails.averageScore.toFixed(1)}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      subtext: scoreDistributionLoading ? 'Loading...' : `${examDetails.passRate.toFixed(1)}% pass rate`
    },
    {
      title: 'Completion Rate',
      value: statisticsLoading ? '...' : `${statistics.completionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      subtext: `${statistics.totalStudentsInvited} total students`
    }
  ];

  // Commented out - using backend data now
  // const scoreDistribution = [
  //   { range: '90-100', count: 45, color: 'hsl(var(--success))' },
  //   { range: '80-89', count: 67, color: 'hsl(var(--primary))' },
  //   { range: '70-79', count: 52, color: 'hsl(var(--chart-3))' },
  //   { range: '60-69', count: 18, color: 'hsl(var(--chart-4))' },
  //   { range: '<60', count: 12, color: 'hsl(var(--destructive))' }
  // ];

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

  // Handle results visibility toggle
  const handleResultsVisibilityToggle = async (checked: boolean) => {
    if (!effectiveExamId || !canManageQuestions) return;

    setUpdatingResultsVisible(true);
    try {
      // Update exam via API
      const response = await examApi.updateExam(effectiveExamId, {
        results_visible: checked,
      });

      // Update local state
      setResultsVisible(checked);
      
      // Update currentExam in context if available
      if (setCurrentExam && response.payload) {
        setCurrentExam(response.payload);
      }

      success(checked ? 'Results are now visible to students' : 'Results are now hidden from students');
    } catch (err: any) {
      console.error('Error updating results visibility:', err);
      error(err?.message || 'Failed to update results visibility. Please try again.');
      // Revert local state on error
      setResultsVisible(!checked);
    } finally {
      setUpdatingResultsVisible(false);
    }
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
                            disabled={!hasAdmissionForm}
                            onClick={async () => {
                              try {
                                // Fetch public token for this exam
                                const tokenResponse = await admissionFormApi.getPublicToken(effectiveExamId);
                                const publicToken = tokenResponse.payload.public_token;
                                
                                const baseUrl = window.location.origin;
                                const shareUrlPath = `/public/admission-form/${publicToken}`;
                                setShareUrl(`${baseUrl}${shareUrlPath}`);
                                setShowShareLinkModal(true);
                              } catch (err: any) {
                                error(err?.message || 'Failed to generate public link. Please try again.');
                              }
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Public Link
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasAdmissionForm 
                            ? 'Share public link for admission form' 
                            : 'Create admission form first'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <TabsList className={`grid w-full ${canManageQuestions ? 'grid-cols-6' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Monitor
            </TabsTrigger>
            {canManageQuestions && (
              <TabsTrigger value="resumptions" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Resumptions
              </TabsTrigger>
            )}
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
                      {enrollmentsLoading ? '...' : `${participationStatus.completed}/${participationStatus.total}`}
                    </span>
                  </div>
                  <Progress 
                    value={enrollmentsLoading ? 0 : participationStatus.completionRate} 
                    className="h-2"
                  />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">
                          {enrollmentsLoading ? '...' : participationStatus.completed}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Play className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {enrollmentsLoading ? '...' : participationStatus.inProgress}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {enrollmentsLoading ? '...' : participationStatus.pending}
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
                  {scoreDistributionLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading score summary...</p>
                    </div>
                  ) : (scoreSummary.totalAttempts === 0 && statistics.totalAttempts === 0) ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No attempts yet</p>
                    </div>
                  ) : scoreSummary.totalAttempts === 0 && statistics.totalAttempts > 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Calculating scores...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-success/10 rounded-lg">
                          <div className="text-2xl font-bold text-success">{scoreSummary.highestScore.toFixed(1)}%</div>
                          <p className="text-sm text-muted-foreground">Highest Score</p>
                        </div>
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{scoreSummary.averageScore.toFixed(1)}%</div>
                          <p className="text-sm text-muted-foreground">Average Score</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-destructive/10 rounded-lg">
                          <div className="text-2xl font-bold text-destructive">{scoreSummary.lowestScore.toFixed(1)}%</div>
                          <p className="text-sm text-muted-foreground">Lowest Score</p>
                        </div>
                        <div className="text-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{scoreSummary.passRate.toFixed(1)}%</div>
                          <p className="text-sm text-muted-foreground">Pass Rate</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Visibility Settings - Admin Only */}
            {canManageQuestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Results Visibility
                  </CardTitle>
                  <CardDescription>
                    Control whether students can view their exam results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-1">
                      <Label htmlFor="results-visible-toggle" className="text-base font-medium">
                        Enable Results Visibility
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {resultsVisible 
                          ? 'Students can currently view their exam results'
                          : 'Results are currently hidden from students'}
                      </p>
                    </div>
                    <Switch
                      id="results-visible-toggle"
                      checked={resultsVisible}
                      onCheckedChange={handleResultsVisibilityToggle}
                      disabled={updatingResultsVisible}
                    />
                  </div>
                  {updatingResultsVisible && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
            <TabsContent value="resumptions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Resumption Requests</CardTitle>
                      <CardDescription>Approve or reject student requests to resume ongoing exams</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (effectiveExamId) {
                          setLoadingResumptionRequests(true);
                          try {
                            const response = await getPendingResumptionRequests(effectiveExamId);
                            setResumptionRequests(response.payload.requests);
                            success('Resumption requests refreshed');
                          } catch (err) {
                            error('Failed to refresh resumption requests');
                          } finally {
                            setLoadingResumptionRequests(false);
                          }
                        }
                      }}
                      disabled={loadingResumptionRequests}
                    >
                      <RefreshCcw className={`h-4 w-4 mr-2 ${loadingResumptionRequests ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingResumptionRequests ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : resumptionRequests.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No pending resumption requests</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Requested At</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resumptionRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{request.user?.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">{request.user?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.requested_at ? new Date(request.requested_at).toLocaleString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                Pending
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={async () => {
                                    try {
                                      await approveResumption(request.id);
                                      success('Resumption request approved');
                                      // Refresh requests
                                      if (effectiveExamId) {
                                        const response = await getPendingResumptionRequests(effectiveExamId);
                                        setResumptionRequests(response.payload.requests);
                                      }
                                    } catch (err: any) {
                                      error(err.message || 'Failed to approve request');
                                    }
                                  }}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setShowRejectDialog(request.id)}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {canManageQuestions && (
            <TabsContent value="questions" className="space-y-6">
              <QuestionManagement 
                examId={currentExam?.id || examId}
                examTitle={currentExam?.title || examName}
              />
            </TabsContent>
          )}

          <TabsContent value="monitoring" className="space-y-6">
            {entityMonitoringEnabled === false && user?.role === 'ADMIN' ? (
              <Card>
                <CardContent className="pt-6">
                  <Alert variant="destructive" className="border-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-base font-semibold">
                      You don't have rights to view this feature.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : entityMonitoringEnabled === true && examMonitoringEnabled === false ? (
              <Card>
                <CardContent className="pt-6">
                  <Alert variant="destructive" className="border-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-base font-semibold">
                      Monitoring is disabled for this exam.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* COMMENTED OUT: Previous implementation with mock data */}
            {/* 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            */}

            {/* NEW: Real monitoring data from database */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Exam Monitoring Data</CardTitle>
                    <CardDescription>All enrollment monitoring data with categorized snapshots</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (effectiveExamId) {
                        setLoadingMonitoring(true);
                        try {
                          const response = await getMonitoringByExam(effectiveExamId);
                          setMonitoringData(response.payload.enrollments || []);
                        } catch (err: any) {
                          setMonitoringError(err.message || 'Failed to refresh monitoring data');
                        } finally {
                          setLoadingMonitoring(false);
                        }
                      }
                    }}
                    disabled={loadingMonitoring}
                  >
                    <RefreshCcw className={`h-4 w-4 mr-2 ${loadingMonitoring ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingMonitoring ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Loading monitoring data...</p>
                  </div>
                ) : monitoringError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{monitoringError}</AlertDescription>
                  </Alert>
                ) : monitoringData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No monitoring data available for this exam.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monitoringData
                      .filter((enrollmentData) => {
                        // Only show students with monitoring data present in the monitoring table
                        // monitoring.id exists only when there's an actual record in the monitoring table
                        return enrollmentData.monitoring?.id !== undefined && enrollmentData.monitoring.id !== null;
                      })
                      .map((enrollmentData) => {
                      // Check if student has any violations
                      const hasViolations = 
                        enrollmentData.monitoring.tab_switch_count > 0 ||
                        enrollmentData.monitoring.fullscreen_exit_count > 0 ||
                        (enrollmentData.monitoring.voice_detection_count || 0) > 0 ||
                        (enrollmentData.monitoring.metadata.snapshots.multiple_face_detection?.length || 0) > 0 ||
                        (enrollmentData.monitoring.metadata.snapshots.no_face_detection?.length || 0) > 0;

                      return (
                        <Card 
                          key={enrollmentData.enrollment_id} 
                          className={`border-2 transition-all hover:shadow-lg ${
                            hasViolations 
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                              : 'border-border'
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base mb-1">
                                  {enrollmentData.user?.name || 'Unknown Student'}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {enrollmentData.user?.email || 'No email'}
                                </CardDescription>
                                {enrollmentData.user?.roll_number && (
                                  <CardDescription className="text-xs mt-0.5">
                                    Roll: {enrollmentData.user.roll_number}
                                  </CardDescription>
                                )}
                              </div>
                              {hasViolations && (
                                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-3">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                              <Badge variant={enrollmentData.enrollment_status === 'ONGOING' ? 'default' : 'secondary'} className="text-xs">
                                {enrollmentData.enrollment_status || 'N/A'}
                              </Badge>
                              {hasViolations && (
                                <Badge variant="destructive" className="text-xs">
                                  Violations Detected
                                </Badge>
                              )}
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-2 bg-muted/50 rounded text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Globe className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Tab Switches</span>
                                </div>
                                <p className="text-lg font-bold">{enrollmentData.monitoring.tab_switch_count}</p>
                              </div>
                              <div className="p-2 bg-muted/50 rounded text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Maximize className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Screen Exits</span>
                                </div>
                                <p className="text-lg font-bold">{enrollmentData.monitoring.fullscreen_exit_count}</p>
                              </div>
                              <div className="p-2 bg-muted/50 rounded text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Mic className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Voice Detections</span>
                                </div>
                                <p className="text-lg font-bold">{enrollmentData.monitoring.voice_detection_count || 0}</p>
                              </div>
                            </div>

                            {/* Violation Indicators */}
                            {hasViolations && (
                              <div className="space-y-1">
                                {enrollmentData.monitoring.tab_switch_count > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-red-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>{enrollmentData.monitoring.tab_switch_count} tab switch(es)</span>
                                  </div>
                                )}
                                {enrollmentData.monitoring.fullscreen_exit_count > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-red-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>{enrollmentData.monitoring.fullscreen_exit_count} screen exit(s)</span>
                                  </div>
                                )}
                                {(enrollmentData.monitoring.voice_detection_count || 0) > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-red-600">
                                    <Mic className="h-3 w-3" />
                                    <span>{enrollmentData.monitoring.voice_detection_count} voice detection(s)</span>
                                  </div>
                                )}
                                {(enrollmentData.monitoring.metadata.snapshots.multiple_face_detection?.length || 0) > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-red-600">
                                    <Users className="h-3 w-3" />
                                    <span>{enrollmentData.monitoring.metadata.snapshots.multiple_face_detection.length} multiple face detection(s)</span>
                                  </div>
                                )}
                                {(enrollmentData.monitoring.metadata.snapshots.no_face_detection?.length || 0) > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-red-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>{enrollmentData.monitoring.metadata.snapshots.no_face_detection.length} no face detection(s)</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* View Details Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => setSelectedStudentForDetails(enrollmentData.enrollment_id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Full Screen Details Dialog */}
                {selectedStudentForDetails && (() => {
                  const enrollmentData = monitoringData.find(
                    (data) => data.enrollment_id === selectedStudentForDetails
                  );
                  if (!enrollmentData) return null;

                  return (
                    <Dialog 
                      open={!!selectedStudentForDetails} 
                      onOpenChange={() => setSelectedStudentForDetails(null)}
                    >
                      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-6 flex flex-col overflow-hidden">
                        <DialogHeader className="flex-shrink-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <DialogTitle className="text-2xl">
                                Monitoring Details - {enrollmentData.user?.name || 'Unknown Student'}
                              </DialogTitle>
                              <DialogDescription>
                                {enrollmentData.user?.email || 'No email'}
                                {enrollmentData.user?.roll_number && ` • Roll: ${enrollmentData.user.roll_number}`}
                              </DialogDescription>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete all monitoring data and associated media for this student? This action cannot be undone.')) {
                                  try {
                                    await deleteMonitoringByEnrollment(enrollmentData.enrollment_id);
                                    // Refresh monitoring data
                                    const response = await getMonitoringByExam(examId);
                                    setMonitoringData(response.payload.enrollments);
                                    // Close the dialog
                                    setSelectedStudentForDetails(null);
                                    // Show success notification
                                    if (notifications) {
                                      notifications.success('Monitoring data deleted successfully');
                                    }
                                  } catch (error: any) {
                                    console.error('Failed to delete monitoring data:', error);
                                    if (notifications) {
                                      notifications.error(error.message || 'Failed to delete monitoring data');
                                    }
                                  }
                                }
                              }}
                              className="ml-4"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear Data
                            </Button>
                          </div>
                        </DialogHeader>
                        
                        <div className="flex-1 overflow-y-auto mt-4 pr-2" style={{ maxHeight: 'calc(95vh - 120px)' }}>
                          <div className="space-y-6">
                          {/* Monitoring Counts */}
                          <div className="grid grid-cols-2 gap-4">
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Globe className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-sm font-medium">Tab Switches</span>
                                </div>
                                <p className="text-3xl font-bold">{enrollmentData.monitoring.tab_switch_count}</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Maximize className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-sm font-medium">Fullscreen Exits</span>
                                </div>
                                <p className="text-3xl font-bold">{enrollmentData.monitoring.fullscreen_exit_count}</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Mic className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-sm font-medium">Voice Detections</span>
                                </div>
                                <p className="text-3xl font-bold">{enrollmentData.monitoring.voice_detection_count || 0}</p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            <Badge variant={enrollmentData.enrollment_status === 'ONGOING' ? 'default' : 'secondary'}>
                              Status: {enrollmentData.enrollment_status || 'N/A'}
                            </Badge>
                            {(enrollmentData.monitoring.tab_switch_count > 0 ||
                              enrollmentData.monitoring.fullscreen_exit_count > 0 ||
                              (enrollmentData.monitoring.voice_detection_count || 0) > 0 ||
                              (enrollmentData.monitoring.metadata.snapshots.multiple_face_detection?.length || 0) > 0 ||
                              (enrollmentData.monitoring.metadata.snapshots.no_face_detection?.length || 0) > 0) && (
                              <Badge variant="destructive">
                                Violations Detected
                              </Badge>
                            )}
                          </div>

                          {/* Snapshots by Category */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg">Snapshots by Category</h4>
                            
                            {/* Exam Start Snapshot */}
                            {enrollmentData.monitoring.metadata.snapshots.exam_start && (
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Play className="h-4 w-4 text-primary" />
                                  <span className="font-medium">Exam Start Snapshot</span>
                                </div>
                                <div className="relative group">
                                  <AuthenticatedImage
                                    mediaId={enrollmentData.monitoring.metadata.snapshots.exam_start}
                                    alt="Exam Start Snapshot"
                                    className="w-full max-w-md aspect-video object-cover rounded-lg border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer"
                                  />
                                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    Exam Start
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Regular Interval Snapshots */}
                            {enrollmentData.monitoring.metadata.snapshots.regular_interval?.length > 0 && (
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">Regular Interval Snapshots</span>
                                  <Badge variant="outline">{enrollmentData.monitoring.metadata.snapshots.regular_interval.length} snapshots</Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {enrollmentData.monitoring.metadata.snapshots.regular_interval.map((mediaId, idx) => (
                                    <div key={idx} className="relative group">
                                      <AuthenticatedImage
                                        mediaId={mediaId}
                                        alt={`Regular Interval Snapshot ${idx + 1}`}
                                        className="w-full aspect-video object-cover rounded-lg border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                                        Snapshot {idx + 1}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Multiple Face Detection Snapshots */}
                            {enrollmentData.monitoring.metadata.snapshots.multiple_face_detection?.length > 0 && (
                              <div className="p-4 border rounded-lg border-orange-200 dark:border-orange-900">
                                <div className="flex items-center gap-2 mb-3">
                                  <Users className="h-4 w-4 text-orange-500" />
                                  <span className="font-medium">Multiple Face Detection Snapshots</span>
                                  <Badge variant="outline" className="text-orange-600">{enrollmentData.monitoring.metadata.snapshots.multiple_face_detection.length} snapshots</Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {enrollmentData.monitoring.metadata.snapshots.multiple_face_detection.map((mediaId, idx) => (
                                    <div key={idx} className="relative group">
                                      <AuthenticatedImage
                                        mediaId={mediaId}
                                        alt={`Multiple Face Detection Snapshot ${idx + 1}`}
                                        className="w-full aspect-video object-cover rounded-lg border-2 border-orange-300 dark:border-orange-700 hover:border-orange-500 transition-colors cursor-pointer"
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-orange-600/90 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                                        Multiple Faces {idx + 1}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* No Face Detection Snapshots */}
                            {enrollmentData.monitoring.metadata.snapshots.no_face_detection?.length > 0 && (
                              <div className="p-4 border rounded-lg border-red-200 dark:border-red-900">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                  <span className="font-medium">No Face Detection Snapshots</span>
                                  <Badge variant="outline" className="text-red-600">{enrollmentData.monitoring.metadata.snapshots.no_face_detection.length} snapshots</Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {enrollmentData.monitoring.metadata.snapshots.no_face_detection.map((mediaId, idx) => (
                                    <div key={idx} className="relative group">
                                      <AuthenticatedImage
                                        mediaId={mediaId}
                                        alt={`No Face Detection Snapshot ${idx + 1}`}
                                        className="w-full aspect-video object-cover rounded-lg border-2 border-red-300 dark:border-red-700 hover:border-red-500 transition-colors cursor-pointer"
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                                        No Face {idx + 1}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Show message if no snapshots */}
                            {!enrollmentData.monitoring.metadata.snapshots.exam_start &&
                             (!enrollmentData.monitoring.metadata.snapshots.regular_interval || enrollmentData.monitoring.metadata.snapshots.regular_interval.length === 0) &&
                             (!enrollmentData.monitoring.metadata.snapshots.multiple_face_detection || enrollmentData.monitoring.metadata.snapshots.multiple_face_detection.length === 0) &&
                             (!enrollmentData.monitoring.metadata.snapshots.no_face_detection || enrollmentData.monitoring.metadata.snapshots.no_face_detection.length === 0) && (
                              <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                                <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No snapshots captured yet</p>
                              </div>
                            )}
                          </div>

                          {/* Metadata Info */}
                          {enrollmentData.monitoring.created_at && (
                            <div className="pt-4 border-t text-sm text-muted-foreground">
                              <p>Monitoring created: {new Date(enrollmentData.monitoring.created_at).toLocaleString()}</p>
                              {enrollmentData.monitoring.updated_at && (
                                <p>Last updated: {new Date(enrollmentData.monitoring.updated_at).toLocaleString()}</p>
                              )}
                            </div>
                          )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })()}
              </>
            )}
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
                  {scoreDistributionLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading score distribution...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={scoreDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis 
                          label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${value}% (${props.payload.count} students)`,
                            'Percentage'
                          ]}
                        />
                        <Bar dataKey="percentage" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Performance Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Breakdown</CardTitle>
                  <CardDescription>Pass/Fail distribution based on actual results</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboardLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading performance data...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { 
                              name: 'Pass', 
                              value: leaderboard.filter(e => e.passed).length, 
                              color: 'hsl(var(--success))' 
                            },
                            { 
                              name: 'Fail', 
                              value: leaderboard.filter(e => !e.passed).length, 
                              color: 'hsl(var(--destructive))' 
                            }
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
                  )}
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
                <CardDescription>Top performers ranked by score</CardDescription>
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
                            <div className="flex items-center gap-2 justify-end mb-1">
                              <p className="text-lg font-bold text-primary">{entry.score.toFixed(2)}</p>
                              {entry.passed ? (
                                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                  Pass
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                                  Fail
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{entry.correctAnswers} correct answers</p>
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
                <CardDescription>Download all students exam score data in PDF format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 min-w-[200px]"
                    onClick={downloadLeaderboardPDF}
                    disabled={leaderboard.length === 0 || leaderboardLoading}
                  >
                    <FileText className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Download Exam Results</div>
                      <div className="text-xs text-muted-foreground">PDF Format</div>
                    </div>
                  </Button>
                </div>
                
                {/* Commented out other download options */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
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
                      success('Student list CSV download started');
                    }}
                  >
                    <Users className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">Student List</div>
                      <div className="text-xs text-muted-foreground">CSV Format</div>
                    </div>
                  </Button>
                </div> */}
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

        {/* Share Public Link Modal */}
        <Dialog open={showShareLinkModal} onOpenChange={setShowShareLinkModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Share Public Link</DialogTitle>
              <DialogDescription>
                Share the admission form link for "{currentExam?.title || examName}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Form URL</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyUrl}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleShareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Share on WhatsApp
                </Button>
                <Button onClick={handleShareEmail} variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Resumption Request Dialog */}
        <Dialog open={showRejectDialog !== null} onOpenChange={(open) => !open && setShowRejectDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Resumption Request</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this resumption request (optional)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-reason">Rejection Reason</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Enter reason for rejection (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowRejectDialog(null);
                setRejectReason('');
              }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!showRejectDialog) return;
                  try {
                    await rejectResumption(showRejectDialog, rejectReason || undefined);
                    success('Resumption request rejected');
                    setShowRejectDialog(null);
                    setRejectReason('');
                    if (effectiveExamId) {
                      const response = await getPendingResumptionRequests(effectiveExamId);
                      setResumptionRequests(response.payload.requests);
                    }
                  } catch (err: any) {
                    error(err.message || 'Failed to reject request');
                  }
                }}
              >
                Reject
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