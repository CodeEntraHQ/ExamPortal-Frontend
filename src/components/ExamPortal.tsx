import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Clock, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Users,
  Target,
  BookOpen,
  Timer,
  Award,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';

interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  status: 'upcoming' | 'active' | 'completed' | 'missed';
  scheduledDate: string;
  timeRemaining?: string;
  score?: number;
  maxScore: number;
  attempts: number;
  maxAttempts: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructor: string;
  description: string;
}

interface Result {
  id: string;
  examTitle: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  completedDate: string;
  timeTaken: number;
  rank: number;
  totalStudents: number;
}

export function ExamPortal() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingExams: Exam[] = [
    {
      id: '1',
      title: 'Data Structures and Algorithms',
      subject: 'Computer Science',
      duration: 180,
      totalQuestions: 50,
      status: 'upcoming',
      scheduledDate: '2024-01-15T10:00:00',
      maxScore: 100,
      attempts: 0,
      maxAttempts: 1,
      difficulty: 'Hard',
      instructor: 'Dr. Sarah Johnson',
      description: 'Comprehensive assessment covering arrays, linked lists, trees, and sorting algorithms.'
    },
    {
      id: '2',
      title: 'Database Management Systems',
      subject: 'Computer Science',
      duration: 120,
      totalQuestions: 40,
      status: 'active',
      scheduledDate: '2024-01-12T14:00:00',
      timeRemaining: '2h 45m',
      maxScore: 80,
      attempts: 0,
      maxAttempts: 2,
      difficulty: 'Medium',
      instructor: 'Prof. Michael Chen',
      description: 'SQL queries, normalization, indexing, and transaction management.'
    },
    {
      id: '3',
      title: 'Web Development Fundamentals',
      subject: 'Computer Science',
      duration: 90,
      totalQuestions: 30,
      status: 'upcoming',
      scheduledDate: '2024-01-18T09:00:00',
      maxScore: 60,
      attempts: 0,
      maxAttempts: 3,
      difficulty: 'Easy',
      instructor: 'Ms. Emily Davis',
      description: 'HTML, CSS, JavaScript basics and responsive design principles.'
    }
  ];

  const completedExams: Exam[] = [
    {
      id: '4',
      title: 'Object-Oriented Programming',
      subject: 'Computer Science',
      duration: 150,
      totalQuestions: 45,
      status: 'completed',
      scheduledDate: '2024-01-08T11:00:00',
      score: 88,
      maxScore: 100,
      attempts: 1,
      maxAttempts: 2,
      difficulty: 'Medium',
      instructor: 'Dr. Robert Wilson',
      description: 'Classes, inheritance, polymorphism, and design patterns.'
    }
  ];

  const results: Result[] = [
    {
      id: '1',
      examTitle: 'Object-Oriented Programming',
      subject: 'Computer Science',
      score: 88,
      maxScore: 100,
      percentage: 88,
      grade: 'A-',
      completedDate: '2024-01-08T13:30:00',
      timeTaken: 135,
      rank: 3,
      totalStudents: 45
    },
    {
      id: '2',
      examTitle: 'Software Engineering Principles',
      subject: 'Computer Science',
      score: 92,
      maxScore: 100,
      percentage: 92,
      grade: 'A',
      completedDate: '2024-01-05T15:45:00',
      timeTaken: 142,
      rank: 1,
      totalStudents: 38
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      case 'missed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 dark:text-green-400';
    if (grade.startsWith('B')) return 'text-blue-600 dark:text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-600 dark:text-yellow-400';
    if (grade.startsWith('D')) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const ExamCard = ({ exam, isCompleted = false }: { exam: Exam; isCompleted?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg">{exam.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {exam.subject} • {exam.instructor}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getStatusColor(exam.status)}>
                {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
              </Badge>
              <Badge variant="outline" className={getDifficultyColor(exam.difficulty)}>
                {exam.difficulty}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{exam.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDuration(exam.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{exam.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{exam.maxScore} points</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{exam.attempts}/{exam.maxAttempts} attempts</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(exam.scheduledDate)}
            </div>
            <div className="flex items-center gap-2">
              {exam.status === 'active' && exam.timeRemaining && (
                <Alert className="inline-flex items-center p-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="ml-2 text-xs text-orange-600">
                    {exam.timeRemaining} remaining
                  </AlertDescription>
                </Alert>
              )}
              {exam.status === 'active' ? (
                <Button className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105">
                  <Play className="h-4 w-4 mr-2" />
                  Start Exam
                </Button>
              ) : exam.status === 'upcoming' ? (
                <Button variant="outline" disabled>
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

          {isCompleted && exam.score !== undefined && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Score</span>
                <span className="text-lg font-bold text-primary">{exam.score}/{exam.maxScore}</span>
              </div>
              <Progress value={(exam.score / exam.maxScore) * 100} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{Math.round((exam.score / exam.maxScore) * 100)}% achieved</span>
                <span>Grade: {exam.score >= 90 ? 'A' : exam.score >= 80 ? 'B' : exam.score >= 70 ? 'C' : 'D'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const ResultCard = ({ result }: { result: Result }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{result.examTitle}</CardTitle>
              <CardDescription>{result.subject}</CardDescription>
            </div>
            <Badge variant="outline" className={`font-bold ${getGradeColor(result.grade)}`}>
              {result.grade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{result.score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{result.percentage}%</div>
              <div className="text-xs text-muted-foreground">Percentage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">#{result.rank}</div>
              <div className="text-xs text-muted-foreground">Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatDuration(result.timeTaken)}</div>
              <div className="text-xs text-muted-foreground">Time Taken</div>
            </div>
          </div>

          <Progress value={result.percentage} className="h-3" />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(result.completedDate)}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top {Math.round((result.rank / result.totalStudents) * 100)}%
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Certificate
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
          <h1 className="text-3xl font-bold text-foreground">Exam Portal</h1>
          <p className="text-muted-foreground mt-1">Access your exams and track your progress</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Next Exam</div>
            <div className="font-semibold">Tomorrow 10:00 AM</div>
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Timer className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Exams', value: '2', icon: FileText, color: 'text-blue-600' },
          { label: 'Completed', value: '12', icon: CheckCircle, color: 'text-green-600' },
          { label: 'Average Score', value: '87%', icon: TrendingUp, color: 'text-purple-600' },
          { label: 'Certificates', value: '8', icon: Award, color: 'text-orange-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">My Exams</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid gap-6">
            {upcomingExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-6">
            {completedExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} isCompleted />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="grid gap-6">
            {results.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}