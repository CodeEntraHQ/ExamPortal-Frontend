import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Badge } from '../../../shared/components/ui/badge';
import { Progress } from '../../../shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../../shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Textarea } from '../../../shared/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../../shared/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { examApi } from '../../../services/api/exam';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
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
  Filter,
  SortAsc,
  MonitorSpeaker,
  Shield,
  AlertTriangle,
  CheckCircle,
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
  UserPlus
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'active' | 'completed' | 'archived';
  studentsEnrolled: number;
  studentsCompleted: number;
  passRate: number;
  averageScore: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
  isProctored: boolean;
  allowRetakes: boolean;
  maxAttempts: number;
  passingScore: number;
  instructions: string;
  entityId?: string;
}

interface ExamManagementProps {
  currentEntity: string;
  onCreateExam?: () => void;
  onExploreExam?: (examId: string, examName: string) => void;
}

export function ExamManagement({ currentEntity, onCreateExam, onExploreExam }: ExamManagementProps) {
  const { success, error, info } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState<{ exam: Exam | null; show: boolean }>({ exam: null, show: false });
  const [inviteEmails, setInviteEmails] = useState('');

  // Mock exam data
  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      title: 'Advanced JavaScript Programming',
      description: 'Comprehensive assessment of advanced JavaScript concepts including ES6+, async programming, and modern frameworks.',
      duration: 120,
      totalQuestions: 50,
      totalMarks: 100,
      startDate: '2024-02-15T09:00:00',
      endDate: '2024-02-15T11:00:00',
      status: 'active',
      studentsEnrolled: 245,
      studentsCompleted: 180,
      passRate: 78,
      averageScore: 85.5,
      category: 'Programming',
      difficulty: 'Hard',
      tags: ['JavaScript', 'Programming', 'Web Development'],
      createdBy: 'Dr. Sarah Johnson',
      createdDate: '2024-01-01',
      lastModified: '2024-01-10',
      isProctored: true,
      allowRetakes: false,
      maxAttempts: 2,
      passingScore: 70,
      instructions: 'Read all questions carefully. No external resources allowed.',
      entityId: currentEntity
    },
    {
      id: '2',
      title: 'Database Management Systems',
      description: 'Test covering SQL, database design, normalization, and advanced database concepts.',
      duration: 90,
      totalQuestions: 40,
      totalMarks: 80,
      startDate: '2024-02-20T14:00:00',
      endDate: '2024-02-20T15:30:00',
      status: 'published',
      studentsEnrolled: 156,
      studentsCompleted: 0,
      passRate: 0,
      averageScore: 0,
      category: 'Database',
      difficulty: 'Medium',
      tags: ['SQL', 'Database', 'Normalization'],
      createdBy: 'Prof. Michael Chen',
      createdDate: '2024-01-05',
      lastModified: '2024-01-15',
      isProctored: false,
      allowRetakes: true,
      maxAttempts: 3,
      passingScore: 60,
      instructions: 'SQL queries will be evaluated for correctness and efficiency.',
      entityId: currentEntity
    },
    {
      id: '3',
      title: 'Introduction to Python',
      description: 'Basic Python programming concepts for beginners.',
      duration: 60,
      totalQuestions: 25,
      totalMarks: 50,
      startDate: '2024-02-25T10:00:00',
      endDate: '2024-02-25T11:00:00',
      status: 'draft',
      studentsEnrolled: 0,
      studentsCompleted: 0,
      passRate: 0,
      averageScore: 0,
      category: 'Programming',
      difficulty: 'Easy',
      tags: ['Python', 'Basics', 'Programming'],
      createdBy: 'Dr. Emily Rodriguez',
      createdDate: '2024-01-20',
      lastModified: '2024-02-01',
      isProctored: false,
      allowRetakes: true,
      maxAttempts: 5,
      passingScore: 50,
      instructions: 'Focus on basic syntax and fundamental concepts.',
      entityId: currentEntity
    }
  ]);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    const matchesDifficulty = filterDifficulty === 'all' || exam.difficulty === filterDifficulty;
    const matchesTab = activeTab === 'all' || exam.status === activeTab;
    
    return matchesSearch && matchesStatus && matchesDifficulty && matchesTab;
  });

  const sortedExams = [...filteredExams].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'difficulty':
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      case 'students':
        return b.studentsEnrolled - a.studentsEnrolled;
      default:
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    }
  });

  const getStatusBadge = (status: Exam['status']) => {
    const variants = {
      draft: { variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' },
      published: { variant: 'outline' as const, className: 'border-blue-500 text-blue-600 dark:text-blue-400' },
      active: { variant: 'default' as const, className: 'bg-success text-success-foreground' },
      completed: { variant: 'default' as const, className: 'bg-primary text-primary-foreground' },
      archived: { variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' }
    };
    return variants[status];
  };

  const getDifficultyBadge = (difficulty: Exam['difficulty']) => {
    const variants = {
      Easy: { variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      Medium: { variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      Hard: { variant: 'default' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    };
    return variants[difficulty];
  };

  const handleInviteStudents = (exam: Exam) => {
    setShowInviteModal({ exam, show: true });
  };

  const sendInvitations = async () => {
    if (!inviteEmails.trim()) {
      error('Please enter email addresses');
      return;
    }

    if (!showInviteModal.exam) {
      error('No exam selected');
      return;
    }

    const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email);
    if (emails.length === 0) {
      error('Please enter at least one valid email address');
      return;
    }

    const examToInvite = showInviteModal.exam;
    const entityIdToUse = examToInvite.entityId;

    if (!entityIdToUse) {
      error('Entity ID is required to invite students');
      return;
    }

    setShowInviteModal({ exam: null, show: false });
    setInviteEmails('');

    try {
      // Bulk invite all students at once
      const res = await examApi.inviteStudents({
        examId: examToInvite.id,
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
          e.id === examToInvite.id 
            ? { ...e, studentsEnrolled: (e.studentsEnrolled || 0) + totalInvited }
            : e
        ));
      }
    } catch (err: any) {
      console.error('Failed to send invites', err);
      error('Failed to send invitations. Please try again.');
    }
  };
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file

  const handleExamAction = (action: string, exam: Exam) => {
    switch (action) {
      case 'edit':
        setEditingExam(exam);
        break;
      case 'view':
        if (onExploreExam) {
          onExploreExam(exam.id, exam.title);
        }
        break;
      case 'monitor':
        info(`Opening monitoring for "${exam.title}"`);
        break;
      case 'duplicate':
        const duplicatedExam = {
          ...exam,
          id: `${exam.id}-copy-${Date.now()}`,
          title: `${exam.title} (Copy)`,
          status: 'draft' as const,
          studentsEnrolled: 0,
          studentsCompleted: 0,
          createdDate: new Date().toISOString().split('T')[0]
        };
        setExams([...exams, duplicatedExam]);
        success(`"${exam.title}" duplicated successfully`);
        break;
      case 'archive':
        setExams(exams.map(e => e.id === exam.id ? { ...e, status: 'archived' as const } : e));
        success(`"${exam.title}" archived successfully`);
        break;
      case 'delete':
        setExams(exams.filter(e => e.id !== exam.id));
        success(`"${exam.title}" deleted successfully`);
        break;
    }
  };

  const examStats = [
    {
      title: 'Total Exams',
      value: exams.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Active Exams',
      value: exams.filter(e => e.status === 'active').length,
      icon: Play,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Total Students',
      value: exams.reduce((sum, exam) => sum + exam.studentsEnrolled, 0),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Avg. Pass Rate',
      value: `${Math.round(exams.reduce((sum, exam) => sum + exam.passRate, 0) / exams.length)}%`,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

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
              <p className="text-muted-foreground">Create, manage, and monitor examinations</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onCreateExam} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exam Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({exams.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({exams.filter(e => e.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="published">Published ({exams.filter(e => e.status === 'published').length})</TabsTrigger>
          <TabsTrigger value="active">Active ({exams.filter(e => e.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({exams.filter(e => e.status === 'completed').length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({exams.filter(e => e.status === 'archived').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Exams Table */}
          <Card>
            <CardHeader>
              <CardTitle>Exams</CardTitle>
              <CardDescription>Manage your examination content and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedExams.length === sortedExams.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExams(sortedExams.map(exam => exam.id));
                          } else {
                            setSelectedExams([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Exam Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sortedExams.map((exam) => (
                      <motion.tr
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedExams.includes(exam.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExams([...selectedExams, exam.id]);
                              } else {
                                setSelectedExams(selectedExams.filter(id => id !== exam.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{exam.title}</h4>
                              <Badge 
                                variant={getDifficultyBadge(exam.difficulty).variant}
                                className={getDifficultyBadge(exam.difficulty).className}
                              >
                                {exam.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{exam.description}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{exam.totalQuestions} questions</span>
                              <span>•</span>
                              <span>{exam.totalMarks} marks</span>
                              <span>•</span>
                              <span>{exam.category}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadge(exam.status).variant}
                            className={getStatusBadge(exam.status).className}
                          >
                            {exam.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{exam.studentsEnrolled} enrolled</span>
                            </div>
                            {exam.studentsCompleted > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {exam.studentsCompleted} completed
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{exam.duration} min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {exam.studentsCompleted > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{exam.averageScore}% avg</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {exam.passRate}% pass rate
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExamAction('view', exam)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleInviteStudents(exam)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Invite
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExamAction('edit', exam)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExamAction('monitor', exam)}>
                                  <MonitorSpeaker className="h-4 w-4 mr-2" />
                                  Monitor
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExamAction('duplicate', exam)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleExamAction('archive', exam)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleExamAction('delete', exam)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Students Modal */}
      <Dialog open={showInviteModal.show} onOpenChange={(open) => setShowInviteModal({ exam: null, show: open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite Students</DialogTitle>
            <DialogDescription>
              Send exam invitations for "{showInviteModal.exam?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Student Email Addresses</Label>
              <Textarea
                id="emails"
                placeholder="Enter email addresses separated by commas&#10;example: student1@email.com, student2@email.com"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                rows={6}
              />
              <p className="text-sm text-muted-foreground">
                Enter email addresses separated by commas. Students will receive an invitation email with exam details.
              </p>
            </div>
            {showInviteModal.exam && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Exam Details:</strong><br />
                  Duration: {showInviteModal.exam.duration} minutes<br />
                  Questions: {showInviteModal.exam.totalQuestions}<br />
                  Passing Score: {showInviteModal.exam.passingScore}%
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal({ exam: null, show: false })}>
              Cancel
            </Button>
            <Button onClick={sendInvitations} disabled={!inviteEmails.trim()}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}