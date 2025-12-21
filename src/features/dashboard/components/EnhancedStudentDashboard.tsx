import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Progress } from '../../../shared/components/ui/progress';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Clock,
  Award,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  Search,
  Play,
  Star,
  Download,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { getStudentEnrollments, StudentEnrollment, examApi } from '../../../services/api/exam';
import { getResumptionRequest, requestResumption, GetResumptionRequestResponse } from '../../../services/api/resumptionRequest';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'motion/react';

interface StudentDashboardProps {
  onStartExam?: (examId: string) => void;
  onViewResults?: (examId: string) => void;
}

export function EnhancedStudentDashboard({ onStartExam, onViewResults }: StudentDashboardProps) {
  const { user } = useAuth();
  const { success, error: showError } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentTab, setEnrollmentTab] = useState<'ongoing' | 'upcoming' | 'completed'>('ongoing');
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [resumptionRequests, setResumptionRequests] = useState<Record<string, GetResumptionRequestResponse['payload']>>({});
  const [requestingResumption, setRequestingResumption] = useState<Record<string, boolean>>({});

  // Fetch enrollments on component mount
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await getStudentEnrollments();
        if (response.payload && response.payload.all) {
          setEnrollments(response.payload.all);
          
          // Fetch question counts for exams without results
          const examsWithoutResults = response.payload.all.filter(
            (enrollment) => !enrollment.result || !enrollment.result.metadata?.total_questions
          );
          
          const counts: Record<string, number> = {};
          await Promise.all(
            examsWithoutResults.map(async (enrollment) => {
              try {
                const questionsResponse = await examApi.getQuestions(enrollment.exam.id, 1, 1);
                counts[enrollment.exam.id] = questionsResponse.payload.total || 0;
              } catch (error) {
                console.error(`Failed to fetch question count for exam ${enrollment.exam.id}:`, error);
                counts[enrollment.exam.id] = 0;
              }
            })
          );
          setQuestionCounts(counts);
        }
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // Fetch resumption requests for ongoing enrollments
  useEffect(() => {
    const fetchResumptionRequests = async () => {
      const ongoingEnrollments = enrollments.filter(
        (e) => e.status && e.status.toUpperCase() === 'ONGOING'
      );

      const requests: Record<string, GetResumptionRequestResponse['payload']> = {};
      await Promise.all(
        ongoingEnrollments.map(async (enrollment) => {
          try {
            const response = await getResumptionRequest(enrollment.id);
            requests[enrollment.id] = response.payload;
          } catch (err) {
            console.error(`Failed to fetch resumption request for enrollment ${enrollment.id}:`, err);
            requests[enrollment.id] = { has_request: false };
          }
        })
      );
      setResumptionRequests(requests);
    };

    if (enrollments.length > 0) {
      fetchResumptionRequests();
    }
  }, [enrollments]);

  // Handle requesting resumption
  const handleRequestResumption = async (enrollmentId: string) => {
    setRequestingResumption(prev => ({ ...prev, [enrollmentId]: true }));
    try {
      await requestResumption(enrollmentId);
      success('Resumption request submitted. Waiting for admin approval.');
      // Refresh resumption request status
      const response = await getResumptionRequest(enrollmentId);
      setResumptionRequests(prev => ({
        ...prev,
        [enrollmentId]: response.payload,
      }));
    } catch (err: any) {
      showError(err?.message || 'Failed to submit resumption request. Please try again.');
    } finally {
      setRequestingResumption(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  // Transform enrollment data to match existing exam structure
  const transformEnrollmentToExam = (enrollment: StudentEnrollment) => {
    const exam = enrollment.exam;
    const metadata = exam.metadata || {};
    const result = enrollment.result;
    
    // Get totalQuestions from result metadata if available, otherwise from fetched question counts, otherwise try exam metadata, otherwise 0
    const totalQuestions = result?.metadata?.total_questions 
      || questionCounts[exam.id]
      || metadata.totalQuestions 
      || 0;
    
    return {
      id: exam.id,
      enrollmentId: enrollment.id, // Add enrollment ID for resumption requests
      name: exam.title,
      date: metadata.startDate || exam.created_at,
      duration: Math.floor(exam.duration_seconds / 60),
      status: enrollment.status.toLowerCase(),
      subject: metadata.subject || 'General',
      instructor: metadata.instructor || 'Instructor',
      difficulty: metadata.difficulty || 'Medium',
      totalQuestions: totalQuestions,
      passingScore: metadata.passingMarks ? Math.round((metadata.passingMarks / (metadata.totalMarks || 100)) * 100) : 70,
      score: result ? (metadata.totalMarks ? Math.round((result.score / metadata.totalMarks) * 100) : result.score) : undefined,
      timeSpent: result?.metadata?.timeSpent ? Math.floor(result.metadata.timeSpent / 60) : undefined,
      correctAnswers: result?.metadata?.correct_answer || undefined,
      resultsVisible: exam.results_visible ?? false,
      enrollment: enrollment, // Keep full enrollment for access to result data
    };
  };

  // Enhanced mock data (kept for backward compatibility with other tabs)
  const mockStudentExams = [
    { 
      id: 1, 
      name: 'Mathematics Final Exam', 
      date: '2024-02-15', 
      duration: 120, 
      status: 'upcoming',
      subject: 'Mathematics',
      instructor: 'Dr. Smith',
      difficulty: 'Hard',
      totalQuestions: 50,
      passingScore: 70
    },
    { 
      id: 2, 
      name: 'Physics Quiz', 
      date: '2024-02-18', 
      duration: 60, 
      status: 'upcoming',
      subject: 'Physics',
      instructor: 'Prof. Johnson',
      difficulty: 'Medium',
      totalQuestions: 25,
      passingScore: 75
    },
    { 
      id: 3, 
      name: 'Chemistry Lab Test', 
      date: '2024-01-20', 
      duration: 90, 
      status: 'completed',
      subject: 'Chemistry',
      score: 85,
      instructor: 'Dr. Davis',
      difficulty: 'Medium',
      totalQuestions: 30,
      passingScore: 70,
      timeSpent: 82,
      correctAnswers: 26
    },
    { 
      id: 4, 
      name: 'Biology Midterm', 
      date: '2024-01-15', 
      duration: 120, 
      status: 'completed',
      subject: 'Biology',
      score: 92,
      instructor: 'Prof. Wilson',
      difficulty: 'Hard',
      totalQuestions: 40,
      passingScore: 75,
      timeSpent: 105,
      correctAnswers: 37
    },
    { 
      id: 5, 
      name: 'Computer Science Algorithm Test', 
      date: '2024-01-10', 
      duration: 90, 
      status: 'completed',
      subject: 'Computer Science',
      score: 78,
      instructor: 'Dr. Tech',
      difficulty: 'Hard',
      totalQuestions: 20,
      passingScore: 70,
      timeSpent: 88,
      correctAnswers: 16
    },
    { 
      id: 6, 
      name: 'English Literature Essay', 
      date: '2024-01-08', 
      duration: 150, 
      status: 'completed',
      subject: 'English',
      score: 88,
      instructor: 'Prof. Word',
      difficulty: 'Medium',
      totalQuestions: 5,
      passingScore: 65,
      timeSpent: 142,
      correctAnswers: 4
    }
  ];

  // Use fetched enrollments for "My Exams" tab, mock data for other tabs
  const studentExams = enrollments.map(transformEnrollmentToExam);
  
  // Filter enrollments by status - ensure we use the actual enrollment status
  // Only mark as COMPLETED if status is explicitly COMPLETED (not just if result exists)
  const ongoingExams = enrollments
    .filter(e => e.status && e.status.toUpperCase() === 'ONGOING')
    .map(transformEnrollmentToExam);
  const upcomingExams = enrollments
    .filter(e => e.status && e.status.toUpperCase() === 'UPCOMING')
    .map(transformEnrollmentToExam);
  const completedExams = enrollments
    .filter(e => e.status && e.status.toUpperCase() === 'COMPLETED')
    .map(transformEnrollmentToExam);
  
  const averageScore = completedExams.length > 0
    ? completedExams.reduce((sum, exam) => sum + (exam.score || 0), 0) / completedExams.length
    : 0;

  // Performance data for charts
  const performanceData = completedExams.map(exam => ({
    name: exam.name.split(' ')[0],
    score: exam.score,
    timeEfficiency: ((exam.duration - (exam.timeSpent || exam.duration)) / exam.duration) * 100,
    accuracy: ((exam.correctAnswers || 0) / exam.totalQuestions) * 100
  }));

  const subjectPerformance = [
    { subject: 'Mathematics', score: 85, exams: 3 },
    { subject: 'Physics', score: 82, exams: 2 },
    { subject: 'Chemistry', score: 85, exams: 1 },
    { subject: 'Biology', score: 92, exams: 1 },
    { subject: 'Computer Science', score: 78, exams: 1 },
    { subject: 'English', score: 88, exams: 1 }
  ];

  const difficultyBreakdown = [
    { name: 'Easy', value: 20, color: '#10B981' },
    { name: 'Medium', value: 50, color: '#F59E0B' },
    { name: 'Hard', value: 30, color: '#EF4444' }
  ];

  const radarData = [
    { subject: 'Math', A: averageScore, fullMark: 100 },
    { subject: 'Physics', A: 82, fullMark: 100 },
    { subject: 'Chemistry', A: 85, fullMark: 100 },
    { subject: 'Biology', A: 92, fullMark: 100 },
    { subject: 'CS', A: 78, fullMark: 100 },
    { subject: 'English', A: 88, fullMark: 100 }
  ];

  // Filter functions for "My Exams" tab
  const filteredExams = studentExams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    const matchesSubject = selectedSubject === 'all' || exam.subject === selectedSubject;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Filter by enrollment tab
  const getEnrollmentsByTab = () => {
    switch (enrollmentTab) {
      case 'ongoing':
        return ongoingExams.filter(exam => {
          const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               exam.instructor.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesSubject = selectedSubject === 'all' || exam.subject === selectedSubject;
          return matchesSearch && matchesSubject;
        });
      case 'upcoming':
        return upcomingExams.filter(exam => {
          const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               exam.instructor.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesSubject = selectedSubject === 'all' || exam.subject === selectedSubject;
          return matchesSearch && matchesSubject;
        });
      case 'completed':
        return completedExams.filter(exam => {
          const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               exam.instructor.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesSubject = selectedSubject === 'all' || exam.subject === selectedSubject;
          return matchesSearch && matchesSubject;
        });
      default:
        return [];
    }
  };

  const filteredByTab = getEnrollmentsByTab();

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (score >= 70) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground mt-1">
              Track your exam progress and performance analytics
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Today</div>
            <div className="text-2xl font-bold text-primary">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Exams Completed</CardTitle>
                <div className="p-2 rounded-full bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{completedExams.length}</div>
                {/* This semester text - commented out
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">This semester</span>
                </p>
                */}
              </CardContent>
            </Card>
          </motion.div>

          {/* Average Score - Commented out */}
          {/* 
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <div className="p-2 rounded-full bg-success/10">
                  <Target className="h-4 w-4 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{averageScore.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">+5.1%</span> improvement
                </p>
              </CardContent>
            </Card>
          </motion.div>
          */}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <div className="p-2 rounded-full bg-secondary/10">
                  <Calendar className="h-4 w-4 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{upcomingExams.length}</div>
                {/* Next 7 days text - commented out
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">Next 7 days</span>
                </p>
                */}
              </CardContent>
            </Card>
          </motion.div>

          {/* Class Rank - Commented out */}
          {/* 
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">#7</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">Out of 45</span> students
                </p>
              </CardContent>
            </Card>
          </motion.div>
          */}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">My Exams</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Performance Trend</CardTitle>
                <CardDescription>Your exam scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">Next Exam</h3>
                      {upcomingExams.length > 0 ? (
                        <>
                          <p className="text-sm text-muted-foreground truncate">{upcomingExams[0].name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(upcomingExams[0].date).toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not Available</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-success/10">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">Best Exam</h3>
                      {(() => {
                        // Find exam with max marks from completed exams with results_visible enabled
                        const examsWithScores = completedExams.filter(exam => 
                          exam.score !== undefined && exam.resultsVisible && exam.enrollment?.result
                        );
                        if (examsWithScores.length === 0) {
                          return <p className="text-sm text-muted-foreground">Not Available</p>;
                        }
                        const bestExam = examsWithScores.reduce((best, current) => 
                          (current.score || 0) > (best.score || 0) ? current : best
                        );
                        return (
                          <>
                            <p className="text-sm text-muted-foreground truncate">{bestExam.name}</p>
                            <p className="text-xs text-muted-foreground">{bestExam.score?.toFixed(1)}%</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">Study Focus</h3>
                      {(() => {
                        // Find exams with marks below 60% and results_visible enabled
                        const lowScoreExams = completedExams.filter(exam => 
                          exam.score !== undefined && 
                          exam.score < 60 && 
                          exam.resultsVisible && 
                          exam.enrollment?.result
                        );
                        if (lowScoreExams.length === 0) {
                          return <p className="text-sm text-muted-foreground">Not Available</p>;
                        }
                        // Show the exam with the lowest score
                        const focusExam = lowScoreExams.reduce((lowest, current) => 
                          (current.score || 0) < (lowest.score || 0) ? current : lowest
                        );
                        return (
                          <>
                            <p className="text-sm text-muted-foreground truncate">{focusExam.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Score: {focusExam.score?.toFixed(1)}% - Needs attention
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            {/* Search and Filter Bar */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search exams, subjects, or instructors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Tabs */}
            <Tabs value={enrollmentTab} onValueChange={(v) => setEnrollmentTab(v as 'ongoing' | 'upcoming' | 'completed')} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ongoing">Ongoing ({ongoingExams.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming ({upcomingExams.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedExams.length})</TabsTrigger>
              </TabsList>

              {/* Ongoing Exams */}
              <TabsContent value="ongoing">
                {loading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">Loading exams...</p>
                    </CardContent>
                  </Card>
                ) : filteredByTab.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        Ongoing Exams ({filteredByTab.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredByTab.map((exam) => (
                          <motion.div 
                            key={exam.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-foreground">{exam.name}</h4>
                                <Badge className={getDifficultyBadgeColor(exam.difficulty)}>
                                  {exam.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(exam.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {exam.duration} minutes
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  {exam.subject}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {exam.instructor}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{exam.totalQuestions} questions</span>
                                <span>Passing: {exam.passingScore}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                Ongoing
                              </Badge>
                              {(() => {
                                const enrollmentId = (exam as any).enrollmentId;
                                const resumptionRequest = enrollmentId ? resumptionRequests[enrollmentId] : null;
                                const isRequesting = enrollmentId ? requestingResumption[enrollmentId] : false;
                                
                                // Check if resumption is approved
                                if (resumptionRequest?.has_request && resumptionRequest.status === 'APPROVED') {
                                  return (
                                    <Button 
                                      size="sm"
                                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                      onClick={() => onStartExam?.(exam.id.toString())}
                                    >
                                      <Play className="h-4 w-4 mr-1" />
                                      Continue Exam
                                    </Button>
                                  );
                                }
                                
                                // Check if request is pending
                                if (resumptionRequest?.has_request && resumptionRequest.status === 'PENDING') {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Waiting for Approval
                                      </Badge>
                                    </div>
                                  );
                                }
                                
                                // Check if request was rejected
                                if (resumptionRequest?.has_request && resumptionRequest.status === 'REJECTED') {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                        onClick={() => enrollmentId && handleRequestResumption(enrollmentId)}
                                        disabled={isRequesting}
                                      >
                                        {isRequesting ? (
                                          <>
                                            <Clock className="h-4 w-4 mr-1 animate-spin" />
                                            Requesting...
                                          </>
                                        ) : (
                                          <>
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            Request Approval Again
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  );
                                }
                                
                                // No request yet - show request approval button
                                return (
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary/10"
                                    onClick={() => enrollmentId && handleRequestResumption(enrollmentId)}
                                    disabled={isRequesting}
                                  >
                                    {isRequesting ? (
                                      <>
                                        <Clock className="h-4 w-4 mr-1 animate-spin" />
                                        Requesting...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Request Approval
                                      </>
                                    )}
                                  </Button>
                                );
                              })()}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No ongoing exams</h3>
                      <p className="text-muted-foreground">You don't have any ongoing exams at the moment</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Upcoming Exams */}
              <TabsContent value="upcoming">
                {loading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">Loading exams...</p>
                    </CardContent>
                  </Card>
                ) : filteredByTab.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Upcoming Exams ({filteredByTab.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredByTab.map((exam) => (
                          <motion.div 
                            key={exam.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-foreground">{exam.name}</h4>
                                <Badge className={getDifficultyBadgeColor(exam.difficulty)}>
                                  {exam.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(exam.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {exam.duration} minutes
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  {exam.subject}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {exam.instructor}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{exam.totalQuestions} questions</span>
                                <span>Passing: {exam.passingScore}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="default" className="bg-primary text-primary-foreground">
                                Upcoming
                              </Badge>
                              <Button 
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={() => onStartExam?.(exam.id.toString())}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start Exam
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No upcoming exams</h3>
                    <p className="text-muted-foreground">You don't have any upcoming exams</p>
                  </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Completed Exams */}
              <TabsContent value="completed">
                {loading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">Loading exams...</p>
                    </CardContent>
                  </Card>
                ) : filteredByTab.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                        Completed Exams ({filteredByTab.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredByTab.map((exam) => (
                          <motion.div 
                            key={exam.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-foreground">{exam.name}</h4>
                                <Badge className={getDifficultyBadgeColor(exam.difficulty)}>
                                  {exam.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(exam.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {exam.timeSpent || exam.duration} / {exam.duration} minutes
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  {exam.subject}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {exam.instructor}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{exam.correctAnswers || 0}/{exam.totalQuestions} correct</span>
                                <span>Passing: {exam.passingScore}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {exam.score !== undefined && (
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-foreground">{exam.score}%</div>
                                  <Badge className={getScoreBadgeColor(exam.score)}>
                                    {exam.score >= 90 ? 'Excellent' : 
                                     exam.score >= 80 ? 'Good' :
                                     exam.score >= 70 ? 'Average' : 'Poor'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No completed exams</h3>
                      <p className="text-muted-foreground">You haven't completed any exams yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {!loading && filteredExams.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No exams found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Commented out original performance content */}
            {/* 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Average scores by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exam Difficulty Distribution</CardTitle>
                  <CardDescription>Breakdown of completed exams by difficulty</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={difficultyBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {difficultyBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="A"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            */}

            {/* Show only exams with results_visible enabled */}
            {(() => {
              // Filter completed exams that have results_visible enabled and have results
              const visibleResults = completedExams.filter(
                exam => exam.resultsVisible && exam.enrollment?.result
              );

              if (visibleResults.length === 0) {
                return (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No Results Available</h3>
                      <p className="text-muted-foreground">
                        Results for your completed exams will appear here once they are made visible by your instructor.
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Results</CardTitle>
                    <CardDescription>View and download your exam results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {visibleResults.map((exam) => {
                        const enrollment = exam.enrollment as StudentEnrollment;
                        const result = enrollment.result;
                        const metadata = enrollment.exam.metadata || {};
                        const totalMarks = metadata.totalMarks || 100;
                        const passingMarks = metadata.passingMarks || 0;
                        const score = result?.score || 0;
                        const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
                        const passed = score >= passingMarks;
                        const resultMetadata = result?.metadata || {};
                        const correctAnswers = resultMetadata.correct_answer || 0;
                        const incorrectAnswers = resultMetadata.incorrect_answer || 0;
                        const noAnswers = resultMetadata.no_answers || 0;
                        const totalQuestions = resultMetadata.total_questions || 0;

                        const handleDownload = () => {
                          // Create HTML content for PDF
                          const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Exam Results - ${exam.name}</title>
  <style>
    @media print {
      @page {
        margin: 1cm;
      }
      body {
        margin: 0;
        padding: 20px;
      }
    }
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    .brand-header {
      text-align: center;
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 25px 20px;
      margin: -20px -20px 30px -20px;
      border-radius: 0;
    }
    .brand-header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
      color: white;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .brand-header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.95;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h2 {
      color: #059669;
      margin: 0;
      font-size: 24px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 15px;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ecf0f1;
    }
    .info-label {
      font-weight: 600;
      color: #7f8c8d;
    }
    .info-value {
      color: #2c3e50;
    }
    .status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .status.passed {
      background-color: #27ae60;
      color: white;
    }
    .status.failed {
      background-color: #e74c3c;
      color: white;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    .stat-box {
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-box.correct {
      background-color: #d5f4e6;
      border: 2px solid #27ae60;
    }
    .stat-box.incorrect {
      background-color: #fadbd8;
      border: 2px solid #e74c3c;
    }
    .stat-box.unanswered {
      background-color: #ebedef;
      border: 2px solid #95a5a6;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 14px;
      color: #7f8c8d;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
      text-align: center;
      font-size: 12px;
      color: #95a5a6;
    }
    .brand-footer {
      margin-top: 40px;
      padding: 20px;
      background-color: #f8f9fa;
      border-top: 3px solid #10b981;
      text-align: center;
      font-size: 11px;
      color: #7f8c8d;
    }
    .brand-footer strong {
      color: #059669;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="brand-header">
    <h1>ExamEntra</h1>
    <p>Secure Online Examination Platform</p>
    ${user?.entity_name || user?.entityName ? `<p style="margin-top: 10px; font-size: 16px; font-weight: 500;">${user.entity_name || user.entityName}</p>` : ''}
  </div>
  
  <div class="header">
    <h2>EXAM RESULTS REPORT</h2>
  </div>

  <div class="section">
    <div class="section-title">Exam Information</div>
    ${user?.entity_name || user?.entityName ? `
    <div class="info-row">
      <span class="info-label">Entity:</span>
      <span class="info-value">${user.entity_name || user.entityName}</span>
    </div>
    ` : ''}
    <div class="info-row">
      <span class="info-label">Exam Name:</span>
      <span class="info-value">${exam.name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Date:</span>
      <span class="info-value">${new Date(exam.date).toLocaleDateString()}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Duration:</span>
      <span class="info-value">${exam.duration} minutes</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Score Summary</div>
    <div class="info-row">
      <span class="info-label">Total Score:</span>
      <span class="info-value"><strong>${score.toFixed(2)} / ${totalMarks}</strong></span>
    </div>
    <div class="info-row">
      <span class="info-label">Percentage:</span>
      <span class="info-value"><strong>${percentage}%</strong></span>
    </div>
    <div class="info-row">
      <span class="info-label">Status:</span>
      <span class="info-value">
        <span class="status ${passed ? 'passed' : 'failed'}">
          ${passed ? 'PASSED' : 'FAILED'}
        </span>
      </span>
    </div>
    <div class="info-row">
      <span class="info-label">Passing Marks:</span>
      <span class="info-value">${passingMarks} / ${totalMarks}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Question Breakdown</div>
    <div class="info-row">
      <span class="info-label">Total Questions:</span>
      <span class="info-value"><strong>${totalQuestions}</strong></span>
    </div>
    <div class="stats-grid">
      <div class="stat-box correct">
        <div class="stat-value" style="color: #27ae60;">${correctAnswers}</div>
        <div class="stat-label">Correct Answers</div>
      </div>
      <div class="stat-box incorrect">
        <div class="stat-value" style="color: #e74c3c;">${incorrectAnswers}</div>
        <div class="stat-label">Incorrect Answers</div>
      </div>
      <div class="stat-box unanswered">
        <div class="stat-value" style="color: #95a5a6;">${noAnswers}</div>
        <div class="stat-label">Unanswered</div>
      </div>
      <div class="stat-box" style="background-color: #d1fae5; border: 2px solid #10b981;">
        <div class="stat-value" style="color: #059669;">${totalQuestions}</div>
        <div class="stat-label">Total Questions</div>
      </div>
    </div>
  </div>

  <div class="brand-footer">
    <div style="margin-bottom: 10px;">
      <strong>ExamEntra</strong> - A secure and modern platform for conducting scholarship exams online
    </div>
    <div>
      Generated on: ${new Date().toLocaleString()} | This is an official document generated by ExamEntra Platform
    </div>
  </div>
</body>
</html>
                          `;

                          // Create a new window with the HTML content
                          const printWindow = window.open('', '_blank');
                          if (!printWindow) {
                            alert('Please allow popups to download the PDF');
                            return;
                          }

                          printWindow.document.write(htmlContent);
                          printWindow.document.close();

                          // Wait for content to load, then trigger print dialog
                          printWindow.onload = () => {
                            setTimeout(() => {
                              printWindow.print();
                            }, 250);
                          };
                        };

                        return (
                          <div
                            key={exam.id}
                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg">{exam.name}</h3>
                                  <Badge variant={passed ? "default" : "destructive"}>
                                    {passed ? 'Passed' : 'Failed'}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Score</p>
                                    <p className="text-lg font-semibold">
                                      {score.toFixed(2)} / {totalMarks}
                                    </p>
                                    <p className="text-sm text-muted-foreground">({percentage}%)</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Correct</p>
                                    <p className="text-lg font-semibold text-green-600">
                                      {correctAnswers} / {totalQuestions}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Incorrect</p>
                                    <p className="text-lg font-semibold text-red-600">
                                      {incorrectAnswers}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Unanswered</p>
                                    <p className="text-lg font-semibold text-muted-foreground">
                                      {noAnswers}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <p className="text-sm text-muted-foreground">
                                    Completed: {new Date(result?.created_at || exam.date).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="ml-4"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>

        </Tabs>
      </motion.div>
    </div>
  );
}