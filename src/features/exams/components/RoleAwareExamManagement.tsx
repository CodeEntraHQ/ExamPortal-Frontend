import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../../shared/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../../shared/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { Progress } from '../../../shared/components/ui/progress';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { QuestionManagement } from './QuestionManagement';
import { motion, AnimatePresence } from 'motion/react';
import { examApi, BackendExam, BackendQuestion, CreateQuestionPayload } from '../../../services/api/exam';
import { getUsers, ApiUser } from '../../../services/api/user';
import { admissionFormApi } from '../../../services/api/admissionForm';
import { getEntityById } from '../../../services/api/entity';
import { Switch } from '../../../shared/components/ui/switch';
import { CreateExamModal } from './CreateExamModal';
import { useExamContext } from '../providers/ExamContextProvider';
import { 
  Plus, 
  Search, 
  Filter,
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  Calendar,
  FileText,
  BarChart3,
  Eye,
  Copy,
  Archive,
  Settings,
  Download,
  Upload,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  BookOpen,
  Target,
  Timer,
  TrendingUp,
  Award,
  Mail,
  UserPlus,
  Shield,
  AlertTriangle,
  CheckCircle,
  MonitorSpeaker,
  Layers,
  PlusCircle,
  MessageSquare,
  Activity,
  SquarePen,
  FilePlus2,
  Share2,
  Check
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../shared/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  type: 'MCQ' | 'ONE_WORD' | 'DESCRIPTIVE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MATCHING' | 'ORDERING' | 'CODE' | 'NUMERIC';
  title: string;
  content: string;
  points: number;
  options?: { id: string; text: string; isCorrect?: boolean }[];
  correctAnswer?: string | string[] | number;
  metadata?: any;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  createdAt: string;
  lastModified: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  entityId: string;
  entityName: string;
  type: 'MCQ' | 'ONE_WORD' | 'DESCRIPTIVE' | 'HYBRID';
  duration: number; // in minutes
  startDate: string;
  endDate: string;
  totalMarks: number;
  passingMarks: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  questions: Question[];
  studentsInvited: number;
  studentsCompleted: number;
  averageScore?: number;
  passRate?: number;
  active: boolean;
  allowRetake: boolean;
  randomizeQuestions: boolean;
  showResultsImmediately: boolean;
  proctoring: boolean;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

interface RoleAwareExamManagementProps {
  currentEntity?: string;
  onCreateExam?: () => void;
  onViewExamDetails?: (examId: string, examName: string) => void;
  onEditExamDetails?: (examId: string, examName: string) => void;
}

export function RoleAwareExamManagement({ 
  currentEntity, 
  onCreateExam, 
  onViewExamDetails,
  onEditExamDetails 
}: RoleAwareExamManagementProps) {
  const { user } = useAuth();
  const { success, info, error } = useNotifications();
  const { setCurrentExam } = useExamContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [showInviteRepresentativeModal, setShowInviteRepresentativeModal] = useState(false);
  const [selectedExamForInvite, setSelectedExamForInvite] = useState<BackendExam | null>(null);
  const [invitingRepresentatives, setInvitingRepresentatives] = useState(false);
  const [representatives, setRepresentatives] = useState<Array<{id: string; name: string | null; email: string; status: string}>>([]);
  const [selectedRepresentativeIds, setSelectedRepresentativeIds] = useState<Set<string>>(new Set());
  const [loadingRepresentatives, setLoadingRepresentatives] = useState(false);
  const [representativeSearchTerm, setRepresentativeSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [selectedExamForShare, setSelectedExamForShare] = useState<BackendExam | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [entityMonitoringEnabled, setEntityMonitoringEnabled] = useState<boolean>(true);
  const [togglingMonitoring, setTogglingMonitoring] = useState<Set<string>>(new Set());
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [examToCopy, setExamToCopy] = useState<BackendExam | null>(null);
  const [copyingExam, setCopyingExam] = useState(false);
  const [examCopyData, setExamCopyData] = useState<{
    title?: string;
    type?: 'QUIZ' | 'OTHER';
    duration_seconds?: number;
    scheduled_at?: string | null;
    metadata?: {
      totalMarks?: number;
      passingMarks?: number;
      instructions?: string[];
    };
  } | null>(null);
  const [copiedQuestions, setCopiedQuestions] = useState<BackendQuestion[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [examToDelete, setExamToDelete] = useState<BackendExam | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingExam, setDeletingExam] = useState(false);

  // Mock exam data based on user role
  // Keep the original exams for reference (as requested)
  const [exams, setExams] = useState<Exam[]>([
    {
      id: 'exam-1',
      title: 'Advanced JavaScript Programming',
      description: 'Comprehensive assessment of advanced JavaScript concepts including ES6+, async programming, and modern frameworks.',
      entityId: 'entity-1',
      entityName: 'Springfield High School',
      type: 'MCQ',
      duration: 120,
      startDate: '2024-02-15T09:00:00',
      endDate: '2024-02-15T11:00:00',
      totalMarks: 100,
      passingMarks: 70,
      status: 'ACTIVE',
      questions: [],
      studentsInvited: 245,
      studentsCompleted: 180,
      averageScore: 85.5,
      passRate: 78,
      active: true,
      allowRetake: false,
      randomizeQuestions: true,
      showResultsImmediately: true,
      proctoring: true,
      createdBy: 'Dr. Sarah Johnson',
      createdAt: '2024-01-01',
      lastModified: '2024-01-10'
    },
    {
      id: 'exam-2',
      title: 'Database Management Systems',
      description: 'Test covering SQL, database design, normalization, and advanced database concepts.',
      entityId: 'entity-2',
      entityName: 'Riverside College',
      type: 'HYBRID',
      duration: 90,
      startDate: '2024-02-20T14:00:00',
      endDate: '2024-02-20T15:30:00',
      totalMarks: 80,
      passingMarks: 60,
      status: 'PUBLISHED',
      questions: [],
      studentsInvited: 156,
      studentsCompleted: 0,
      averageScore: 0,
      passRate: 0,
      active: true,
      allowRetake: true,
      randomizeQuestions: false,
      showResultsImmediately: false,
      proctoring: false,
      createdBy: 'Prof. Michael Chen',
      createdAt: '2024-01-05',
      lastModified: '2024-01-15'
    },
    {
      id: 'exam-3',
      title: 'Introduction to Python',
      description: 'Basic Python programming concepts for beginners.',
      entityId: 'entity-3',
      entityName: 'Tech University',
      type: 'ONE_WORD',
      duration: 60,
      startDate: '2024-02-25T10:00:00',
      endDate: '2024-02-25T11:00:00',
      totalMarks: 50,
      passingMarks: 35,
      status: 'DRAFT',
      questions: [],
      studentsInvited: 0,
      studentsCompleted: 0,
      averageScore: 0,
      passRate: 0,
      active: false,
      allowRetake: true,
      randomizeQuestions: true,
      showResultsImmediately: true,
      proctoring: false,
      createdBy: 'Dr. Emily Rodriguez',
      createdAt: '2024-01-20',
      lastModified: '2024-02-01'
    }
  ]);
  
  // New state for backend exams
  const [backendExams, setBackendExams] = useState<BackendExam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalExams, setTotalExams] = useState<number>(0);
  
  // Statistics state
  const [statistics, setStatistics] = useState<{
    totalExams: number;
    activeExams: number;
    totalStudents: number;
    averageCompletion: number;
  }>({
    totalExams: 0,
    activeExams: 0,
    totalStudents: 0,
    averageCompletion: 0,
  });
  const [statisticsLoading, setStatisticsLoading] = useState<boolean>(false);

  // Fetch exams from backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const response = await examApi.getExams(page, limit, user?.role === 'SUPERADMIN' ? currentEntity : undefined);
        setBackendExams(response.payload.exams);
        setTotalPages(response.payload.totalPages);
        setTotalExams(response.payload.total);
      } catch (err) {
        setFetchError('Failed to fetch exams. Please try again later.');
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [page, limit, currentEntity, user?.role]);

  // Fetch entity monitoring status
  useEffect(() => {
    const fetchEntityMonitoringStatus = async () => {
      if (currentEntity) {
        try {
          const response = await getEntityById(currentEntity);
          if (response?.payload) {
            setEntityMonitoringEnabled(response.payload.monitoring_enabled !== false);
          }
        } catch (err) {
          console.error('Failed to fetch entity monitoring status:', err);
          // Default to enabled if fetch fails
          setEntityMonitoringEnabled(true);
        }
      }
    };

    fetchEntityMonitoringStatus();
  }, [currentEntity]);

  // Fetch statistics from backend
  useEffect(() => {
    const fetchStatistics = async () => {
      // Only fetch statistics for ADMIN and SUPERADMIN
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
        return;
      }

      try {
        setStatisticsLoading(true);
        const response = await examApi.getExamStatistics(
          user?.role === 'SUPERADMIN' ? currentEntity : undefined
        );
        setStatistics({
          totalExams: response.payload.totalExams,
          activeExams: response.payload.activeExams,
          totalStudents: response.payload.totalStudentsInvited,
          averageCompletion: response.payload.averageCompletion,
        });
      } catch (err) {
        console.error('Error fetching statistics:', err);
        // Don't show error to user, just use default values
      } finally {
        setStatisticsLoading(false);
      }
    };

    fetchStatistics();
  }, [currentEntity, user?.role]);

  // Filter exams based on user role
  const getFilteredExams = () => {
    let filteredExams = exams;

    // Role-based filtering
    if (user?.role === 'ADMIN') {
      // Admin can only see their entity's exams
      filteredExams = filteredExams.filter(exam => 
        exam.entityId === user.entityId || exam.entityId === currentEntity
      );
    } else if (user?.role === 'STUDENT') {
      // Students can only see exams they're invited to (for now show all for demo)
      filteredExams = filteredExams.filter(exam => 
        exam.status === 'ACTIVE' || exam.status === 'PUBLISHED'
      );
    }

    // Apply search and filters
    return filteredExams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEntity = filterEntity === 'all' || exam.entityId === filterEntity;
      const matchesType = filterType === 'all' || exam.type === filterType;
      const matchesTab = activeTab === 'all' || exam.status.toLowerCase() === activeTab;
      
      return matchesSearch && matchesEntity && matchesType && matchesTab;
    });
  };
  
  // Filter backend exams
  const getFilteredBackendExams = () => {
    if (!backendExams.length) return [];
    
    return backendExams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || exam.type === filterType;
      return matchesSearch && matchesType;
    });
  };

  const getStatusBadge = (status: Exam['status']) => {
    const variants = {
      DRAFT: { variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' },
      PUBLISHED: { variant: 'outline' as const, className: 'border-blue-500 text-blue-600 dark:text-blue-400' },
      ACTIVE: { variant: 'default' as const, className: 'bg-success text-success-foreground' },
      COMPLETED: { variant: 'default' as const, className: 'bg-primary text-primary-foreground' },
      ARCHIVED: { variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' }
    };
    return variants[status];
  };

  const getTypeBadge = (type: BackendExam['type'] | Exam['type']) => {
    const variants: Record<string, { className: string }> = {
      MCQ: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      ONE_WORD: { className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      DESCRIPTIVE: { className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      HYBRID: { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' }
    };
    return type ? (variants[type] || { className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' }) : { className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' };
  };

  const formatDuration = (durationSeconds: number | undefined) => {
    if (!durationSeconds) return '—';
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleExamAction = (action: string, exam: Exam) => {
    switch (action) {
      case 'view':
        setSelectedExam(exam);
        if (onViewExamDetails) {
          onViewExamDetails(exam.id, exam.title);
        }
        break;
      case 'edit':
        info(`Editing exam: ${exam.title}`);
        break;
      case 'questions':
        setSelectedExam(exam);
        setShowQuestionModal(true);
        break;
      case 'invite':
        setSelectedExam(exam);
        setShowInviteModal(true);
        break;
      case 'monitor':
        info(`Opening monitoring for: ${exam.title}`);
        break;
      case 'activate':
        setExams(exams.map(e => 
          e.id === exam.id ? { ...e, status: 'ACTIVE' as const, active: true } : e
        ));
        success(`${exam.title} activated successfully`);
        break;
      case 'deactivate':
        setExams(exams.map(e => 
          e.id === exam.id ? { ...e, status: 'DRAFT' as const, active: false } : e
        ));
        info(`${exam.title} deactivated successfully`);
        break;
      case 'duplicate':
        const duplicatedExam = {
          ...exam,
          id: `${exam.id}-copy-${Date.now()}`,
          title: `${exam.title} (Copy)`,
          status: 'DRAFT' as const,
          studentsInvited: 0,
          studentsCompleted: 0,
          createdAt: new Date().toISOString()
        };
        setExams([...exams, duplicatedExam]);
        success(`${exam.title} duplicated successfully`);
        break;
      case 'archive':
        setExams(exams.map(e => 
          e.id === exam.id ? { ...e, status: 'ARCHIVED' as const } : e
        ));
        success(`${exam.title} archived successfully`);
        break;
      case 'delete':
        setExamToDelete(exam);
        setDeleteConfirmText('');
        setShowDeleteDialog(true);
        break;
    }
  };

  // Handler for copying exam
  const handleCopyExam = async (exam: BackendExam) => {
    console.log('handleCopyExam called for exam:', exam.id);
    try {
      setCopyingExam(true);
      
      // Fetch exam details
      const examResponse = await examApi.getExamById(exam.id);
      const examData = examResponse.payload;
      
      // Fetch all questions (with pagination)
      const allQuestions: BackendQuestion[] = [];
      let currentPage = 1;
      let totalPages = 1;
      const QUESTIONS_PAGE_SIZE = 9;
      
      while (currentPage <= totalPages) {
        const questionsResponse = await examApi.getQuestions(exam.id, currentPage, QUESTIONS_PAGE_SIZE);
        const { questions, totalPages: serverTotalPages, total, limit } = questionsResponse.payload;
        
        allQuestions.push(...questions);
        
        const effectiveLimit = limit ?? QUESTIONS_PAGE_SIZE;
        if (serverTotalPages) {
          totalPages = serverTotalPages;
        } else if (typeof total === 'number' && effectiveLimit > 0) {
          totalPages = Math.max(1, Math.ceil(total / effectiveLimit));
        } else if (questions.length < effectiveLimit) {
          break;
        }
        
        if (questions.length < effectiveLimit) {
          break;
        }
        
        currentPage += 1;
      }
      
      // Store questions for later copying
      setCopiedQuestions(allQuestions);
      
      // Prepare initial data for the modal
      const metadata = examData.metadata || {};
      setExamCopyData({
        title: `${examData.title} (Copy)`,
        type: examData.type as 'QUIZ' | 'OTHER',
        duration_seconds: examData.duration_seconds,
        scheduled_at: examData.scheduled_at || null,
        metadata: {
          totalMarks: metadata.totalMarks,
          passingMarks: metadata.passingMarks,
          instructions: Array.isArray(metadata.instructions) 
            ? metadata.instructions 
            : (metadata.instructions ? [metadata.instructions] : [])
        }
      });
      
      setExamToCopy(exam);
      console.log('Setting showCopyModal to true, examCopyData:', examCopyData);
      setShowCopyModal(true);
    } catch (err: any) {
      console.error('Error in handleCopyExam:', err);
      error(err?.message || 'Failed to fetch exam details. Please try again.');
    } finally {
      setCopyingExam(false);
    }
  };

  // Handler for deleting exam
  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    
    if (deleteConfirmText.toLowerCase() !== 'confirm') {
      error('Please type "confirm" to delete the exam');
      return;
    }

    try {
      setDeletingExam(true);
      await examApi.deleteExam(examToDelete.id);
      
      // Remove from local state
      setBackendExams(backendExams.filter(e => e.id !== examToDelete.id));
      setTotalExams(totalExams - 1);
      
      success(`Exam "${examToDelete.title}" deleted successfully`);
      setShowDeleteDialog(false);
      setExamToDelete(null);
      setDeleteConfirmText('');
    } catch (err: any) {
      console.error('Failed to delete exam:', err);
      error(err?.message || 'Failed to delete exam. Please try again.');
    } finally {
      setDeletingExam(false);
    }
  };

  // Handler for when copy modal succeeds
  const handleCopyExamSuccess = async (newExamId: string) => {
    if (!newExamId) {
      error('Failed to create exam copy. Please try again.');
      return;
    }

    if (copiedQuestions.length === 0) {
      success('Exam copied successfully (no questions to copy).');
      setShowCopyModal(false);
      setExamCopyData(null);
      setCopiedQuestions([]);
      setExamToCopy(null);
      // Refresh exams list
      try {
        const response = await examApi.getExams(page, limit, user?.role === 'SUPERADMIN' ? currentEntity : undefined);
        setBackendExams(response.payload.exams);
        setTotalPages(response.payload.totalPages);
        setTotalExams(response.payload.total);
      } catch (err) {
        console.error('Failed to refresh exams list:', err);
      }
      return;
    }
    
    try {
      // Copy all questions to the new exam
      let successCount = 0;
      let failCount = 0;
      
      for (const question of copiedQuestions) {
        try {
          // Prepare question metadata - remove image_url fields (they're just for display)
          // and keep only the structure the backend expects
          const metadata = question.metadata ? { ...question.metadata } : {};
          
          // Remove image_url from options if present (backend only needs image_id)
          if (metadata.options && Array.isArray(metadata.options)) {
            metadata.options = metadata.options.map((option: any) => {
              const { image_url, ...rest } = option;
              return rest;
            });
          }
          
          // Prepare question payload - backend expects everything in metadata
          const questionPayload: CreateQuestionPayload = {
            exam_id: newExamId,
            question_text: question.question_text,
            type: question.type,
            metadata: metadata,
          };
          
          await examApi.createQuestion(questionPayload);
          successCount++;
        } catch (err: any) {
          console.error('Failed to copy question:', err);
          console.error('Question data:', JSON.stringify(question, null, 2));
          console.error('Error details:', err?.message || err);
          failCount++;
        }
      }
      
      if (failCount === 0) {
        success(`Exam copied successfully with ${successCount} question(s).`);
      } else {
        success(`Exam copied with ${successCount} question(s). ${failCount} question(s) failed to copy.`);
      }
      
      setShowCopyModal(false);
      setExamCopyData(null);
      setCopiedQuestions([]);
      setExamToCopy(null);
      
      // Refresh exams list
      try {
        const response = await examApi.getExams(page, limit, user?.role === 'SUPERADMIN' ? currentEntity : undefined);
        setBackendExams(response.payload.exams);
        setTotalPages(response.payload.totalPages);
        setTotalExams(response.payload.total);
      } catch (err) {
        console.error('Failed to refresh exams list:', err);
      }
    } catch (err: any) {
      error(err?.message || 'Failed to copy questions. Please try again.');
    }
  };

  const handleToggleMonitoring = async (exam: BackendExam) => {
    if (!entityMonitoringEnabled) {
      error('Monitoring is disabled at the entity level. Please enable it in entity settings first.');
      return;
    }

    const currentMonitoringEnabled = exam.monitoring_enabled === true || exam.monitoring_enabled === undefined || exam.monitoring_enabled === null;
    const newMonitoringEnabled = !currentMonitoringEnabled;
    setTogglingMonitoring(prev => new Set(prev).add(exam.id));

    try {
      await examApi.updateExam(exam.id, {
        monitoring_enabled: newMonitoringEnabled,
      });

      // Update local state
      setBackendExams(prevExams =>
        prevExams.map(e =>
          e.id === exam.id
            ? { ...e, monitoring_enabled: newMonitoringEnabled }
            : e
        )
      );

      success(`Monitoring ${newMonitoringEnabled ? 'enabled' : 'disabled'} for ${exam.title}`);
    } catch (err: any) {
      error(err?.message || 'Failed to update monitoring status. Please try again.');
    } finally {
      setTogglingMonitoring(prev => {
        const newSet = new Set(prev);
        newSet.delete(exam.id);
        return newSet;
      });
    }
  };

  const handleInviteStudents = async () => {
    if (!inviteEmails.trim()) {
      return;
    }

    if (!selectedExam) {
      return;
    }

    const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email);
    if (emails.length === 0) {
      return;
    }

    const entityIdToUse = selectedExam.entityId;

    if (!entityIdToUse) {
      error('Entity ID is required to invite students');
      return;
    }

    setShowInviteModal(false);
    setInviteEmails('');
    const examToUpdate = selectedExam;
    setSelectedExam(null);

    try {
      // Bulk invite all students at once
      const res = await examApi.inviteStudents({
        examId: examToUpdate.id,
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

      // Update local exam state if needed
      if (totalInvited > 0) {
        setExams(exams.map(e => 
          e.id === examToUpdate.id 
            ? { ...e, studentsInvited: (e.studentsInvited || 0) + totalInvited }
            : e
        ));
      }
    } catch (err: any) {
      console.error('Failed to send invites', err);
      error('Failed to send invitations. Please try again.');
    }
  };

  // Fetch representatives when modal opens
  useEffect(() => {
    const fetchRepresentatives = async () => {
      if (showInviteRepresentativeModal && selectedExamForInvite) {
        setLoadingRepresentatives(true);
        try {
          // First, fetch enrollments for this exam to get already invited representatives
          let enrolledUserIds = new Set<string>();
          try {
            const enrollmentsResponse = await examApi.getExamEnrollments(selectedExamForInvite.id);
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
              entity_id: selectedExamForInvite.entity_id, // Only fetch representatives from the exam's entity
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
  }, [showInviteRepresentativeModal, selectedExamForInvite, error]);

  const handleInviteRepresentatives = async () => {
    if (selectedRepresentativeIds.size === 0) {
      error('Please select at least one representative');
      return;
    }

    if (!selectedExamForInvite) {
      return;
    }

    setInvitingRepresentatives(true);

    try {
      const res = await examApi.inviteRepresentatives({
        examId: selectedExamForInvite.id,
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
      setSelectedExamForInvite(null);
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
    const examTitle = selectedExamForShare?.title || 'the exam';
    const message = encodeURIComponent(`Fill out the admission form for ${examTitle}: ${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareEmail = () => {
    const examTitle = selectedExamForShare?.title || 'the exam';
    const subject = encodeURIComponent(`Admission Form for ${examTitle}`);
    const body = encodeURIComponent(`Please fill out the admission form for ${examTitle}:\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const examStats = [
    {
      title: 'Total Exams',
      value: statisticsLoading ? '...' : statistics.totalExams,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Active Exams',
      value: statisticsLoading ? '...' : statistics.activeExams,
      icon: Play,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Total Students',
      value: statisticsLoading ? '...' : statistics.totalStudents,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Avg. Completion',
      value: statisticsLoading ? '...' : `${statistics.averageCompletion}%`,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  const canCreateExam = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';
  const canManageAllEntities = user?.role === 'SUPERADMIN';
  const canManageQuestions = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';
  const examTableColumnCount = 11; // Name, Type, Duration, Admission Form, Public Link, Invite Representative, Monitoring, Copy, Actions, Status, Created At

  if (user?.role === 'STUDENT') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Exams
            </CardTitle>
            <CardDescription>
              Access your assigned exams and track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {getFilteredExams().map((exam) => (
                <Card key={exam.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{exam.title}</h4>
                          <Badge className={getStatusBadge(exam.status).className}>
                            {exam.status}
                          </Badge>
                          <Badge variant="outline" className={getTypeBadge(exam.type).className}>
                            {exam.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exam.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {exam.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {exam.totalMarks} marks
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(exam.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exam.status === 'ACTIVE' ? (
                          <Button className="bg-primary hover:bg-primary/90">
                            <Play className="h-4 w-4 mr-2" />
                            Start Exam
                          </Button>
                        ) : exam.status === 'PUBLISHED' ? (
                          <Button variant="outline">
                            <Clock className="h-4 w-4 mr-2" />
                            Scheduled
                          </Button>
                        ) : (
                          <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {examStats.map((stat, index) => (
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

      {/* Header and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">Exam Management</h2>
              <p className="text-muted-foreground">
                {canManageAllEntities 
                  ? 'Create, manage, and monitor examinations across all entities'
                  : 'Create, manage, and monitor examinations for your entity'
                }
              </p>
            </div>
            <div className="flex gap-2">
              {canCreateExam && (
                <>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exam
                  </Button>
                  <CreateExamModal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={async () => {
                      try {
                        setLoading(true);
                        setFetchError(null);
                        const response = await examApi.getExams(page, limit, user?.role === 'SUPERADMIN' ? currentEntity : undefined);
                        setBackendExams(response.payload.exams);
                        setTotalPages(response.payload.totalPages);
                        setTotalExams(response.payload.total);
                        setShowCreateModal(false);
                        success('Exam created successfully!');
                      } catch (err) {
                        setFetchError('Failed to refresh exam list. Please try again.');
                        console.error('Error refreshing exams:', err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    entityId={currentEntity}
                  />
                  {/* Copy Exam Modal */}
                  <CreateExamModal
                    open={showCopyModal}
                    onClose={() => {
                      setShowCopyModal(false);
                      setExamCopyData(null);
                      setCopiedQuestions([]);
                      setExamToCopy(null);
                    }}
                    onSuccess={async (newExamId) => {
                      if (newExamId) {
                        await handleCopyExamSuccess(newExamId);
                      }
                    }}
                    entityId={currentEntity}
                    initialData={examCopyData || undefined}
                  />

      {/* Delete Exam Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{examToDelete?.title}</strong>"? This action cannot be undone.
              <br /><br />
              This will permanently delete the exam, all its questions, enrollments, submissions, and results.
              <br /><br />
              Type <strong>confirm</strong> to proceed:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type 'confirm' to delete"
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteDialog(false);
                setExamToDelete(null);
                setDeleteConfirmText('');
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExam}
              disabled={deleteConfirmText.toLowerCase() !== 'confirm' || deletingExam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingExam ? 'Deleting...' : 'Delete Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Exams
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Bulk Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exam Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsContent value={activeTab} className="space-y-6">
          {/* Exams Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <CardTitle>Exams</CardTitle>
                  <CardDescription>Manage your examination content and settings</CardDescription>
                </div>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-[400px]"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="MCQ">MCQ</SelectItem>
                      <SelectItem value="ONE_WORD">One Word</SelectItem>
                      <SelectItem value="DESCRIPTIVE">Descriptive</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-center">Admission Form</TableHead>
                    <TableHead className="text-center">Public Link</TableHead>
                    <TableHead className="text-center">Invite Representative</TableHead>
                    <TableHead className="text-center">Monitoring</TableHead>
                    <TableHead className="text-center">Copy</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={examTableColumnCount} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Loading exams...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : fetchError ? (
                    <TableRow>
                      <TableCell colSpan={examTableColumnCount} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <AlertTriangle className="h-8 w-8 text-destructive" />
                          <p className="text-sm text-destructive">{fetchError}</p>
                          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : getFilteredBackendExams().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={examTableColumnCount} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No exams found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredBackendExams().map((exam) => (
                      <TableRow 
                        key={exam.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          // Store exam in context before navigation
                          setCurrentExam(exam);
                          if (onViewExamDetails) {
                            onViewExamDetails(exam.id, exam.title);
                          }
                        }}
                      >
                        <TableCell>
                          <div className="font-medium">{exam.title}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeBadge(exam.type).className}>
                            {exam.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDuration(exam.duration_seconds)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={exam.has_admission_form ? 'Edit admission form' : 'Create admission form'}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      const basePath = user?.role === 'SUPERADMIN' ? '/superadmin' : '/admin';
                                      navigate(`${basePath}/exam/${exam.id}/admission-form`);
                                    }}
                                  >
                                    {exam.has_admission_form ? (
                                      <SquarePen className="h-4 w-4" />
                                    ) : (
                                      <FilePlus2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {exam.has_admission_form ? 'Edit admission form' : 'Create admission form'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Share public link"
                                    disabled={!exam.has_admission_form}
                                    onClick={async (event) => {
                                      event.stopPropagation();
                                      event.preventDefault();
                                      try {
                                        // Fetch public token for this exam
                                        const tokenResponse = await admissionFormApi.getPublicToken(exam.id);
                                        const publicToken = tokenResponse.payload.public_token;
                                        
                                        const baseUrl = window.location.origin;
                                        const shareUrlPath = `/public/admission-form/${publicToken}`;
                                        setShareUrl(`${baseUrl}${shareUrlPath}`);
                                        setSelectedExamForShare(exam);
                                        setShowShareLinkModal(true);
                                      } catch (err: any) {
                                        error(err?.message || 'Failed to generate public link. Please try again.');
                                      }
                                    }}
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {exam.has_admission_form 
                                    ? 'Share public link' 
                                    : 'Create admission form first'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Invite representative"
                                    disabled={!exam.has_admission_form}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      event.preventDefault();
                                      setSelectedExamForInvite(exam);
                                      setSelectedRepresentativeIds(new Set());
                                      setRepresentativeSearchTerm('');
                                      setShowInviteRepresentativeModal(true);
                                    }}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {exam.has_admission_form 
                                    ? 'Invite representative' 
                                    : 'Create admission form first'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center">
                            {!entityMonitoringEnabled ? (
                              <div className="flex flex-col items-center gap-1">
                                <Switch
                                  checked={false}
                                  disabled={true}
                                />
                                <span className="text-xs text-muted-foreground">Monitoring is disabled</span>
                              </div>
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={exam.monitoring_enabled === true || exam.monitoring_enabled === undefined || exam.monitoring_enabled === null}
                                        onCheckedChange={() => handleToggleMonitoring(exam)}
                                        disabled={togglingMonitoring.has(exam.id)}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {(exam.monitoring_enabled === true || exam.monitoring_enabled === undefined || exam.monitoring_enabled === null)
                                      ? 'Disable monitoring'
                                      : 'Enable monitoring'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Copy exam"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      event.preventDefault();
                                      handleCopyExam(exam);
                                    }}
                                    disabled={copyingExam}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy exam with all questions</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Delete exam"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      event.preventDefault();
                                      handleExamAction('delete', exam as any);
                                    }}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete exam</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={exam.active ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                            {exam.active ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {exam.created_at ? new Date(exam.created_at).toLocaleString() : 'N/A'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination Controls */}
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 ml-auto">
                  <div className="text-sm text-muted-foreground">
                    Page <span className="font-medium">{Math.max(page, 1)}</span> of <span className="font-medium">{Math.max(totalPages, 1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Students Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite Students</DialogTitle>
            <DialogDescription>
              Send exam invitations for "{selectedExam?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Student Email Addresses</Label>
              <textarea
                id="emails"
                placeholder="Enter email addresses separated by commas example: student1@email.com, student2@email.com"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                rows={6}
                className="w-full p-3 border rounded-md resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Enter email addresses separated by commas. Students will receive an invitation email with exam details.
              </p>
            </div>
            {selectedExam && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Exam Details:</strong><br />
                  Duration: {selectedExam.duration} minutes<br />
                  Questions: {selectedExam.questions.length}<br />
                  Passing Score: {selectedExam.passingMarks}/{selectedExam.totalMarks}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteStudents} className="bg-primary hover:bg-primary/90">
              <Mail className="h-4 w-4 mr-2" />
              Send Invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                setSelectedExamForInvite(null);
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
              Share the admission form link for "{selectedExamForShare?.title}"
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

      {/* Create Exam Modal is now handled by CreateExamModal component */}

      {/* Question Management Modal */}
      <Dialog open={showQuestionModal} onOpenChange={setShowQuestionModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Question Management - {selectedExam?.title}</DialogTitle>
            <DialogDescription>
              Manage questions for this exam. Add, edit, or remove questions to customize the assessment.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedExam && (
              <QuestionManagement 
                examId={selectedExam.id}
                examTitle={selectedExam.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
