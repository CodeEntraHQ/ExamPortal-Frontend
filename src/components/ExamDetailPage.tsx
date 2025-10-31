import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { Breadcrumb } from './Breadcrumb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useNotifications } from './NotificationProvider';
import { QuestionManagement } from './QuestionManagement';
import { useAuth } from './AuthProvider';
import { useExamContext } from './ExamContextProvider';
import { EditExamModal } from './EditExamModal';

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
  const { info, success, error } = useNotifications();
  const { user } = useAuth();
  const { currentExam, setCurrentExam } = useExamContext();

  // Role-based access control
  const canManageQuestions = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';

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

  const breadcrumbItems = [
    { label: 'Dashboard', onClick: onBackToDashboard },
    { label: 'Administration', onClick: onBackToEntities },
    { label: entityName, onClick: onBackToEntity },
    { label: examName, isActive: true }
  ];

  const stats = [
    {
      title: 'Total Attempts',
      value: examDetails.completedAttempts.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      subtext: `${examDetails.activeAttempts} active`
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
      value: `${Math.round((examDetails.completedAttempts / examDetails.totalStudents) * 100)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      subtext: `${examDetails.totalStudents - examDetails.completedAttempts} remaining`
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

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      
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
                      <Badge variant="outline" className={getTypeBadge(examHeaderData.type).className}>
                        {examHeaderData.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{examHeaderData.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(examHeaderData.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {canManageQuestions && (
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
                          <p><span className="font-medium">Created:</span> {new Date(examHeaderData.createdAt).toLocaleDateString()}</p>
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
                      <Button onClick={() => {
                        const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email);
                        if (emails.length === 0) {
                          error('Please enter at least one email address');
                          return;
                        }
                        console.log('Sending invitations to:', emails);
                        setShowInviteModal(false);
                        setInviteEmails('');
                        success(`Invitations sent to ${emails.length} student(s)`);
                      }} className="bg-primary hover:bg-primary/90">
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
                    <span className="text-sm font-medium">{examDetails.completedAttempts}/{examDetails.totalStudents}</span>
                  </div>
                  <Progress 
                    value={(examDetails.completedAttempts / examDetails.totalStudents) * 100} 
                    className="h-2"
                  />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">{examDetails.completedAttempts}</span>
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
                        <span className="text-sm font-medium">{examDetails.totalStudents - examDetails.completedAttempts - examDetails.activeAttempts}</span>
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
                      <Tooltip />
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
                      <Tooltip />
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
                          { name: 'Pass', value: Math.round(examDetails.completedAttempts * (examDetails.passRate / 100)), color: 'hsl(var(--success))' },
                          { name: 'Fail', value: examDetails.completedAttempts - Math.round(examDetails.completedAttempts * (examDetails.passRate / 100)), color: 'hsl(var(--destructive))' }
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
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
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