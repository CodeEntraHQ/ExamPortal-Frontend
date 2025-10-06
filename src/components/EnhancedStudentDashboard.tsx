import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Clock,
  Award,
  Target,
  Activity,
  FileText,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Play,
  BarChart3,
  PieChart,
  TrendingDown,
  Star
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'motion/react';

interface StudentDashboardProps {
  onStartExam?: (examId: string) => void;
  onViewResults?: (examId: string) => void;
}

export function EnhancedStudentDashboard({ onStartExam, onViewResults }: StudentDashboardProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Enhanced mock data
  const studentExams = [
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

  const upcomingExams = studentExams.filter(exam => exam.status === 'upcoming');
  const completedExams = studentExams.filter(exam => exam.status === 'completed');
  const averageScore = completedExams.reduce((sum, exam) => sum + (exam.score || 0), 0) / completedExams.length;

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

  // Filter functions
  const filteredExams = studentExams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    const matchesSubject = selectedSubject === 'all' || exam.subject === selectedSubject;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const filteredUpcoming = filteredExams.filter(exam => exam.status === 'upcoming');
  const filteredCompleted = filteredExams.filter(exam => exam.status === 'completed');

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">This semester</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

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
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">Next 7 days</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

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
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">My Exams</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                    <div>
                      <h3 className="font-medium">Next Exam</h3>
                      <p className="text-sm text-muted-foreground">Mathematics Final</p>
                      <p className="text-xs text-muted-foreground">Feb 15, 2024</p>
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
                    <div>
                      <h3 className="font-medium">Best Subject</h3>
                      <p className="text-sm text-muted-foreground">Biology</p>
                      <p className="text-xs text-muted-foreground">92% average</p>
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
                    <div>
                      <h3 className="font-medium">Study Focus</h3>
                      <p className="text-sm text-muted-foreground">Computer Science</p>
                      <p className="text-xs text-muted-foreground">Needs attention</p>
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
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
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
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Exams */}
            {filteredUpcoming.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Exams ({filteredUpcoming.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUpcoming.map((exam) => (
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
            )}

            {/* Completed Exams */}
            {filteredCompleted.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Completed Exams ({filteredCompleted.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredCompleted.map((exam) => (
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
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">{exam.score}%</div>
                            <Badge className={getScoreBadgeColor(exam.score!)}>
                              {exam.score! >= 90 ? 'Excellent' : 
                               exam.score! >= 80 ? 'Good' :
                               exam.score! >= 70 ? 'Average' : 'Poor'}
                            </Badge>
                          </div>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => onViewResults?.(exam.id.toString())}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Results
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredExams.length === 0 && (
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
            {/* Subject Performance */}
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

            {/* Performance Metrics */}
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Study Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">87%</div>
                  <p className="text-sm text-muted-foreground">Time utilization rate</p>
                  <Progress value={87} className="mt-3" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Improvement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success mb-2">+12%</div>
                  <p className="text-sm text-muted-foreground">Over last 5 exams</p>
                  <div className="flex items-center mt-3 text-success">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">Trending up</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600 mb-2">±8%</div>
                  <p className="text-sm text-muted-foreground">Score variation</p>
                  <div className="flex items-center mt-3 text-orange-600">
                    <Activity className="h-4 w-4 mr-1" />
                    <span className="text-sm">Moderate</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Performance Metrics</CardTitle>
                <CardDescription>Comprehensive analysis of your exam performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" name="Score %" />
                    <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--chart-2))" name="Accuracy %" />
                    <Line type="monotone" dataKey="timeEfficiency" stroke="hsl(var(--chart-3))" name="Time Efficiency %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-400">Strong Performance</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You're excelling in Biology and English. Keep up the excellent work!
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 dark:text-orange-400">Area for Improvement</h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Consider spending more time on Computer Science topics. Practice coding problems regularly.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-400">Study Tip</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your time management is excellent! Continue reviewing flagged questions before exams.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}