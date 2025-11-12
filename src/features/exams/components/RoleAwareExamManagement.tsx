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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../../shared/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { Progress } from '../../../shared/components/ui/progress';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { QuestionManagement } from './QuestionManagement';
import { motion, AnimatePresence } from 'motion/react';
import { examApi, BackendExam } from '../../../services/api/exam';
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
  Activity
} from 'lucide-react';

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
  const { success, info } = useNotifications();
  const { setCurrentExam } = useExamContext();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalExams, setTotalExams] = useState<number>(0);

  // Fetch exams from backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await examApi.getExams(page, limit, user?.role === 'SUPERADMIN' ? currentEntity : undefined);
        setBackendExams(response.payload.exams);
        setTotalPages(response.payload.totalPages);
        setTotalExams(response.payload.total);
      } catch (err) {
        setError('Failed to fetch exams. Please try again later.');
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [page, limit, currentEntity, user?.role]);

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
        if (confirm(`Are you sure you want to delete "${exam.title}"? This action cannot be undone.`)) {
          setExams(exams.filter(e => e.id !== exam.id));
          success(`${exam.title} deleted successfully`);
        }
        break;
    }
  };

  const handleInviteStudents = () => {
    if (!inviteEmails.trim()) {
      // error('Please enter email addresses');
      return;
    }

    const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email);
    if (selectedExam) {
      // Update the exam with new invited count
      setExams(exams.map(e => 
        e.id === selectedExam.id 
          ? { ...e, studentsInvited: e.studentsInvited + emails.length }
          : e
      ));
      success(`Invitations sent to ${emails.length} students for "${selectedExam.title}"`);
    }
    setShowInviteModal(false);
    setInviteEmails('');
    setSelectedExam(null);
  };

  const examStats = [
    {
      title: 'Total Exams',
      value: getFilteredExams().length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Active Exams',
      value: getFilteredExams().filter(e => e.status === 'ACTIVE').length,
      icon: Play,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Total Students',
      value: getFilteredExams().reduce((sum, exam) => sum + exam.studentsInvited, 0),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Avg. Completion',
      value: `${Math.round(
        getFilteredExams().reduce((sum, exam) => 
          sum + (exam.studentsInvited > 0 ? (exam.studentsCompleted / exam.studentsInvited) * 100 : 0), 0
        ) / Math.max(getFilteredExams().length, 1)
      )}%`,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  const canCreateExam = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';
  const canManageAllEntities = user?.role === 'SUPERADMIN';
  const canManageQuestions = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';

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
                        setError(null);
                        const response = await examApi.getExams(page, limit, user?.role === 'SUPERADMIN' ? currentEntity : undefined);
                        setBackendExams(response.payload.exams);
                        setTotalPages(response.payload.totalPages);
                        setTotalExams(response.payload.total);
                        setShowCreateModal(false);
                        success('Exam created successfully!');
                      } catch (err) {
                        setError('Failed to refresh exam list. Please try again.');
                        console.error('Error refreshing exams:', err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    entityId={currentEntity}
                  />
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
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={canManageAllEntities ? 4 : 3} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Loading exams...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={canManageAllEntities ? 4 : 3} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <AlertTriangle className="h-8 w-8 text-destructive" />
                          <p className="text-sm text-destructive">{error}</p>
                          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : getFilteredBackendExams().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManageAllEntities ? 4 : 3} className="text-center py-10">
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
