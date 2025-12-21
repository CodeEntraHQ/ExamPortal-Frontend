import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Progress } from '../../../shared/components/ui/progress';
import { Button } from '../../../shared/components/ui/button';
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
  Settings,
  Plus
} from 'lucide-react';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';
import { EnhancedStudentDashboard } from './EnhancedStudentDashboard';
import { InnovativeAdminDashboard } from './InnovativeAdminDashboard';

// Mock data
const examStats = [
  { month: 'Jan', exams: 12, students: 340 },
  { month: 'Feb', exams: 15, students: 420 },
  { month: 'Mar', exams: 18, students: 380 },
  { month: 'Apr', exams: 22, students: 480 },
  { month: 'May', exams: 25, students: 520 },
  { month: 'Jun', exams: 20, students: 450 }
];

const performanceData = [
  { name: 'Excellent', value: 30, color: 'hsl(var(--success))' },
  { name: 'Good', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Average', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Poor', value: 5, color: 'hsl(var(--destructive))' }
];

const upcomingExams = [
  { id: 1, name: 'Mathematics Final', date: '2024-02-15', students: 45, duration: 120 },
  { id: 2, name: 'Physics Quiz', date: '2024-02-18', students: 32, duration: 60 },
  { id: 3, name: 'Chemistry Lab Test', date: '2024-02-20', students: 28, duration: 90 }
];

interface DashboardProps {
  currentEntity?: string;
  onNavigateToAdministration?: () => void;
  onViewExamDetails?: (examId: string, examName: string) => void;
  onStartExam?: (examId: string) => void;
  onViewResults?: (examId: string) => void;
}

export function Dashboard({ currentEntity, onNavigateToAdministration, onViewExamDetails, onStartExam, onViewResults }: DashboardProps) {
  const { user } = useAuth();
  const role = user?.role;
  const headerSubtitle = role === 'SUPERADMIN'
    ? 'System overview and management'
    : `Managing ${user?.entityName || 'your system'}`;

  // Redirect ADMIN users to their entity management page (fallback for manual navigation)
  React.useEffect(() => {
    if (role === 'ADMIN' && user?.entityId && onNavigateToAdministration) {
      // Small delay to ensure navigation state is ready
      const timer = setTimeout(() => {
        onNavigateToAdministration();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user?.role, user?.id, user?.entityId, onNavigateToAdministration]);

  if (role === 'STUDENT') {
    return <EnhancedStudentDashboard onStartExam={onStartExam} onViewResults={onViewResults} />;
  }

  // Only SUPERADMIN should see the innovative dashboard
  if (role === 'SUPERADMIN') {
    return (
      <InnovativeAdminDashboard 
        currentEntity={currentEntity}
        onNavigateToEntities={onNavigateToAdministration}
        onNavigateToExams={() => {
          onNavigateToAdministration && onNavigateToAdministration();
        }}
        onNavigateToUsers={() => {
          // Navigate to user management
          onNavigateToAdministration && onNavigateToAdministration();
        }}
        onNavigateToAnalytics={() => {
          // Navigate to analytics
          onNavigateToAdministration && onNavigateToAdministration();
        }}
      />
    );
  }

  // For ADMIN, show a loading state while redirecting
  if (role === 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your entity management...</p>
        </div>
      </div>
    );
  }

  return (
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
            {headerSubtitle}
            {currentEntity && (
              <span className="ml-2 text-primary">
                • {currentEntity}
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Today</div>
          <div className="text-2xl font-bold text-primary">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">2,543</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">+12%</span> from last month
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
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
              <div className="p-2 rounded-full bg-secondary/10">
                <BookOpen className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">147</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">+8%</span> from last month
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
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <div className="p-2 rounded-full bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">89.5%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">+2.1%</span> from last month
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
              <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">78.2%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">+3.2%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions - Only show for Admin roles */}
      {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your system efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={onNavigateToAdministration}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Settings className="h-4 w-4" />
                Go to Administration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Exam Activity</CardTitle>
            <CardDescription>Monthly exam and student participation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={examStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="exams" fill="hsl(var(--chart-1))" />
                <Bar dataKey="students" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>Student performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Exams</CardTitle>
          <CardDescription>Scheduled examinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{exam.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(exam.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {exam.students} students
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {exam.duration} min
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (onViewExamDetails) {
                      onViewExamDetails(exam.id.toString(), exam.name);
                    } else if (onNavigateToAdministration) {
                      onNavigateToAdministration();
                    }
                  }}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StudentDashboard({ onStartExam }: { onStartExam?: (examId: string) => void }) {
  const { user } = useAuth();

  // Mock data for student
  const studentExams = [
    { 
      id: 1, 
      name: 'Mathematics Final', 
      date: '2024-02-15', 
      duration: 120, 
      status: 'upcoming',
      subject: 'Mathematics',
      instructor: 'Dr. Smith' 
    },
    { 
      id: 2, 
      name: 'Physics Quiz', 
      date: '2024-02-18', 
      duration: 60, 
      status: 'upcoming',
      subject: 'Physics',
      instructor: 'Prof. Johnson' 
    },
    { 
      id: 3, 
      name: 'Chemistry Lab Test', 
      date: '2024-01-20', 
      duration: 90, 
      status: 'completed',
      subject: 'Chemistry',
      score: 85,
      instructor: 'Dr. Davis' 
    },
    { 
      id: 4, 
      name: 'Biology Midterm', 
      date: '2024-01-15', 
      duration: 120, 
      status: 'completed',
      subject: 'Biology',
      score: 92,
      instructor: 'Prof. Wilson' 
    }
  ];

  const upcomingExams = studentExams.filter(exam => exam.status === 'upcoming');
  const completedExams = studentExams.filter(exam => exam.status === 'completed');
  const averageScore = completedExams.reduce((sum, exam) => sum + (exam.score || 0), 0) / completedExams.length;
  
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
              Track your exam progress and upcoming assessments
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Today</div>
            <div className="text-2xl font-bold text-primary">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Exams Taken</CardTitle>
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
                {/* Next 7 days text - commented out
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary font-medium">Next 7 days</span>
                </p>
                */}
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

      {/* Recent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
          <CardDescription>Your exam scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { exam: 'Math Quiz 1', score: 78 },
              { exam: 'Physics Test', score: 82 },
              { exam: 'Chemistry Lab', score: 89 },
              { exam: 'Math Quiz 2', score: 85 },
              { exam: 'Biology Test', score: 91 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exam" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

        {/* Upcoming Exams Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Exams
            </CardTitle>
            <CardDescription>Your scheduled examinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => (
                  <motion.div 
                    key={exam.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">{exam.name}</h4>
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
                      </div>
                      <p className="text-xs text-muted-foreground">Instructor: {exam.instructor}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-primary text-primary-foreground">
                        Upcoming
                      </Badge>
                      <Button 
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => {
                          if (onStartExam) {
                            onStartExam(exam.id.toString());
                          } else {
                            // Fallback - would navigate to exam interface
                          }
                        }}
                      >
                        Start Exam
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming exams</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Exams Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Completed Exams
            </CardTitle>
            <CardDescription>Your exam results and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedExams.length > 0 ? (
                completedExams.map((exam) => (
                  <motion.div 
                    key={exam.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">{exam.name}</h4>
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
                      </div>
                      <p className="text-xs text-muted-foreground">Instructor: {exam.instructor}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{exam.score}%</div>
                        <Badge 
                          variant="secondary" 
                          className={exam.score! >= 90 ? "bg-success text-success-foreground" : 
                                   exam.score! >= 80 ? "bg-primary text-primary-foreground" :
                                   exam.score! >= 70 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" :
                                   "bg-destructive text-destructive-foreground"}
                        >
                          {exam.score! >= 90 ? "Excellent" : 
                           exam.score! >= 80 ? "Good" :
                           exam.score! >= 70 ? "Average" : "Poor"}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed exams yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Summary
            </CardTitle>
            <CardDescription>Your overall academic progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 rounded-lg bg-accent">
                  <div className="text-lg font-bold text-foreground">A-</div>
                  <div className="text-xs text-muted-foreground">Current Grade</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-accent">
                  <div className="text-lg font-bold text-foreground">92%</div>
                  <div className="text-xs text-muted-foreground">Attendance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </motion.div>
    </div>
  );
}