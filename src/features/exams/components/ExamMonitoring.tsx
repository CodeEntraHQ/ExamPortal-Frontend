import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Progress } from '../../../shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/components/ui/dialog';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { 
  Camera,
  Monitor,
  AlertTriangle,
  Eye,
  Users,
  Clock,
  Activity,
  Wifi,
  Battery,
  Volume2,
  Maximize,
  Shield,
  Target,
  TrendingUp,
  MessageSquare,
  Ban,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Student {
  id: string;
  name: string;
  examId: string;
  examTitle: string;
  startTime: string;
  progress: number;
  timeRemaining: number;
  status: 'active' | 'flagged' | 'completed' | 'disconnected';
  flaggedIncidents: ProctoringIncident[];
  deviceInfo: {
    browser: string;
    os: string;
    screenResolution: string;
    batteryLevel?: number;
    networkStrength: number;
  };
  behaviorMetrics: {
    tabSwitches: number;
    copyAttempts: number;
    rightClicks: number;
    fullscreenExits: number;
    inactiveTime: number;
    keystrokePattern: string;
  };
  videoStatus: {
    connected: boolean;
    quality: 'good' | 'fair' | 'poor';
    faceDetected: boolean;
    multipleFaces: boolean;
    lookingAway: number;
  };
  audioStatus: {
    connected: boolean;
    level: number;
    backgroundNoise: boolean;
    voiceDetected: boolean;
  };
}

interface ProctoringIncident {
  id: string;
  type: 'tab_switch' | 'copy_attempt' | 'multiple_faces' | 'face_not_detected' | 'suspicious_audio' | 'network_issue' | 'fullscreen_exit' | 'right_click' | 'prolonged_inactivity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  evidenceUrl?: string;
  resolved: boolean;
  actionTaken?: string;
}

interface ExamSession {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  flaggedStudents: number;
  averageProgress: number;
  incidents: ProctoringIncident[];
}

export function ExamMonitoring() {
  const [selectedExam, setSelectedExam] = useState<string>('1');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ProctoringIncident | null>(null);

  // Mock data
  const [examSessions] = useState<ExamSession[]>([
    {
      id: '1',
      title: 'Advanced Mathematics Final',
      startTime: '2024-01-15T10:00:00',
      duration: 180,
      totalStudents: 45,
      activeStudents: 42,
      completedStudents: 2,
      flaggedStudents: 8,
      averageProgress: 65,
      incidents: []
    },
    {
      id: '2',
      title: 'Physics Midterm',
      startTime: '2024-01-15T14:00:00',
      duration: 120,
      totalStudents: 32,
      activeStudents: 30,
      completedStudents: 1,
      flaggedStudents: 3,
      averageProgress: 45,
      incidents: []
    }
  ]);

  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'John Smith',
      examId: '1',
      examTitle: 'Advanced Mathematics Final',
      startTime: '2024-01-15T10:05:00',
      progress: 75,
      timeRemaining: 45,
      status: 'active',
      flaggedIncidents: [
        {
          id: '1',
          type: 'tab_switch',
          severity: 'medium',
          timestamp: '2024-01-15T10:25:00',
          description: 'Student switched tabs 3 times in quick succession',
          resolved: false
        }
      ],
      deviceInfo: {
        browser: 'Chrome 120.0',
        os: 'Windows 11',
        screenResolution: '1920x1080',
        batteryLevel: 85,
        networkStrength: 95
      },
      behaviorMetrics: {
        tabSwitches: 3,
        copyAttempts: 0,
        rightClicks: 1,
        fullscreenExits: 0,
        inactiveTime: 2,
        keystrokePattern: 'normal'
      },
      videoStatus: {
        connected: true,
        quality: 'good',
        faceDetected: true,
        multipleFaces: false,
        lookingAway: 5
      },
      audioStatus: {
        connected: true,
        level: 45,
        backgroundNoise: false,
        voiceDetected: false
      }
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      examId: '1',
      examTitle: 'Advanced Mathematics Final',
      startTime: '2024-01-15T10:03:00',
      progress: 68,
      timeRemaining: 47,
      status: 'flagged',
      flaggedIncidents: [
        {
          id: '2',
          type: 'multiple_faces',
          severity: 'high',
          timestamp: '2024-01-15T10:30:00',
          description: 'Multiple faces detected in video feed',
          resolved: false
        },
        {
          id: '3',
          type: 'copy_attempt',
          severity: 'critical',
          timestamp: '2024-01-15T10:35:00',
          description: 'Attempted to copy text from exam question',
          resolved: false
        }
      ],
      deviceInfo: {
        browser: 'Firefox 121.0',
        os: 'macOS 14',
        screenResolution: '2560x1440',
        batteryLevel: 65,
        networkStrength: 80
      },
      behaviorMetrics: {
        tabSwitches: 7,
        copyAttempts: 2,
        rightClicks: 4,
        fullscreenExits: 1,
        inactiveTime: 8,
        keystrokePattern: 'irregular'
      },
      videoStatus: {
        connected: true,
        quality: 'fair',
        faceDetected: true,
        multipleFaces: true,
        lookingAway: 15
      },
      audioStatus: {
        connected: true,
        level: 60,
        backgroundNoise: true,
        voiceDetected: true
      }
    },
    {
      id: '3',
      name: 'Mike Chen',
      examId: '1',
      examTitle: 'Advanced Mathematics Final',
      startTime: '2024-01-15T10:01:00',
      progress: 82,
      timeRemaining: 49,
      status: 'active',
      flaggedIncidents: [],
      deviceInfo: {
        browser: 'Safari 17.1',
        os: 'macOS 14',
        screenResolution: '1440x900',
        batteryLevel: 45,
        networkStrength: 70
      },
      behaviorMetrics: {
        tabSwitches: 0,
        copyAttempts: 0,
        rightClicks: 0,
        fullscreenExits: 0,
        inactiveTime: 1,
        keystrokePattern: 'normal'
      },
      videoStatus: {
        connected: true,
        quality: 'good',
        faceDetected: true,
        multipleFaces: false,
        lookingAway: 2
      },
      audioStatus: {
        connected: true,
        level: 30,
        backgroundNoise: false,
        voiceDetected: false
      }
    }
  ]);

  const currentExam = examSessions.find(exam => exam.id === selectedExam);
  const examStudents = students.filter(student => student.examId === selectedExam);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'flagged':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'disconnected':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'tab_switch':
        return <Globe className="h-4 w-4" />;
      case 'copy_attempt':
        return <Ban className="h-4 w-4" />;
      case 'multiple_faces':
        return <Users className="h-4 w-4" />;
      case 'face_not_detected':
        return <Eye className="h-4 w-4" />;
      case 'suspicious_audio':
        return <Volume2 className="h-4 w-4" />;
      case 'network_issue':
        return <Wifi className="h-4 w-4" />;
      case 'fullscreen_exit':
        return <Maximize className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        console.log('Refreshing monitoring data...');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleViewIncident = (incident: ProctoringIncident) => {
    setSelectedIncident(incident);
    setShowIncidentModal(true);
  };

  const handleSendMessage = (studentId: string) => {
    console.log('Sending message to student:', studentId);
    // Implement messaging functionality
  };

  const handleTerminateExam = (studentId: string) => {
    console.log('Terminating exam for student:', studentId);
    // Implement exam termination
  };

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
          <h1 className="text-3xl font-bold text-foreground">Live Exam Monitoring</h1>
          <p className="text-muted-foreground mt-1">Real-time proctoring and student activity monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Pause' : 'Resume'} Live Updates
          </Button>
        </div>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Active Exam:</label>
            <select 
              value={selectedExam} 
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              {examSessions.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Exam Overview Stats */}
      {currentExam && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { 
              label: 'Total Students', 
              value: currentExam.totalStudents, 
              icon: Users, 
              color: 'text-blue-600',
              bgColor: 'bg-blue-100 dark:bg-blue-900/30' 
            },
            { 
              label: 'Active', 
              value: currentExam.activeStudents, 
              icon: Activity, 
              color: 'text-green-600',
              bgColor: 'bg-green-100 dark:bg-green-900/30' 
            },
            { 
              label: 'Completed', 
              value: currentExam.completedStudents, 
              icon: CheckCircle, 
              color: 'text-purple-600',
              bgColor: 'bg-purple-100 dark:bg-purple-900/30' 
            },
            { 
              label: 'Flagged', 
              value: currentExam.flaggedStudents, 
              icon: AlertTriangle, 
              color: 'text-red-600',
              bgColor: 'bg-red-100 dark:bg-red-900/30' 
            },
            { 
              label: 'Avg Progress', 
              value: `${currentExam.averageProgress}%`, 
              icon: TrendingUp, 
              color: 'text-orange-600',
              bgColor: 'bg-orange-100 dark:bg-orange-900/30' 
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Monitoring Interface */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">Student Monitoring</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Student Activity</CardTitle>
              <CardDescription>Monitor student behavior and exam progress in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Time Left</TableHead>
                      <TableHead>Video</TableHead>
                      <TableHead>Audio</TableHead>
                      <TableHead>Behavior</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examStudents.map((student) => (
                      <TableRow key={student.id} className={student.status === 'flagged' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              student.status === 'active' ? 'bg-green-500' :
                              student.status === 'flagged' ? 'bg-red-500' :
                              student.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                            }`} />
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.deviceInfo.browser}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-20">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{student.progress}%</span>
                            </div>
                            <Progress value={student.progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{student.timeRemaining}m</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Camera className={`h-4 w-4 ${
                              student.videoStatus.connected ? 'text-green-500' : 'text-red-500'
                            }`} />
                            <span className={`text-xs ${
                              student.videoStatus.quality === 'good' ? 'text-green-600' :
                              student.videoStatus.quality === 'fair' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {student.videoStatus.quality}
                            </span>
                          </div>
                          {student.videoStatus.multipleFaces && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              <span className="text-xs text-red-600">Multiple</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Volume2 className={`h-4 w-4 ${
                              student.audioStatus.connected ? 'text-green-500' : 'text-red-500'
                            }`} />
                            <div className="w-8 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${student.audioStatus.level}%` }}
                              />
                            </div>
                          </div>
                          {student.audioStatus.backgroundNoise && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-yellow-600">Noise</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.behaviorMetrics.tabSwitches > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {student.behaviorMetrics.tabSwitches} tabs
                              </Badge>
                            )}
                            {student.behaviorMetrics.copyAttempts > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {student.behaviorMetrics.copyAttempts} copy
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </Badge>
                          {student.flaggedIncidents.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              <span className="text-xs text-red-600">
                                {student.flaggedIncidents.length} incidents
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewStudent(student)}
                              title="View Details"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendMessage(student.id)}
                              title="Send Message"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            {student.status === 'flagged' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTerminateExam(student.id)}
                                title="Terminate Exam"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Ban className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Incidents</CardTitle>
              <CardDescription>Flagged activities and potential academic dishonesty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examStudents.flatMap(student => 
                  student.flaggedIncidents.map(incident => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-l-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        incident.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                        incident.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' :
                        incident.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                      }`}
                      onClick={() => handleViewIncident(incident)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            incident.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                            incident.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                            incident.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {getIncidentIcon(incident.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{student.name}</h4>
                              <Badge className={getSeverityColor(incident.severity)}>
                                {incident.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {incident.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(incident.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!incident.resolved && (
                            <Badge variant="destructive" className="text-xs">
                              Unresolved
                            </Badge>
                          )}
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proctoring Analytics</CardTitle>
              <CardDescription>Statistical overview of monitoring data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Incident Distribution</h4>
                  <div className="space-y-2">
                    {['tab_switch', 'copy_attempt', 'multiple_faces', 'suspicious_audio'].map(type => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                        <Badge variant="outline">
                          {examStudents.reduce((count, student) => 
                            count + student.flaggedIncidents.filter(i => i.type === type).length, 0
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Device Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Chrome Users</span>
                      <Badge variant="outline">
                        {examStudents.filter(s => s.deviceInfo.browser.includes('Chrome')).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mobile Devices</span>
                      <Badge variant="outline">
                        {examStudents.filter(s => s.deviceInfo.screenResolution.includes('mobile')).length}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Connection Quality</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Good Connection</span>
                      <Badge variant="outline" className="text-green-600">
                        {examStudents.filter(s => s.deviceInfo.networkStrength > 80).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Poor Connection</span>
                      <Badge variant="outline" className="text-red-600">
                        {examStudents.filter(s => s.deviceInfo.networkStrength < 50).length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Settings</CardTitle>
              <CardDescription>Configure proctoring sensitivity and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Alert Thresholds</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm">Tab Switches (per 10 min)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 border rounded-lg" defaultValue="3" />
                      </div>
                      <div>
                        <label className="text-sm">Looking Away Duration (seconds)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 border rounded-lg" defaultValue="30" />
                      </div>
                      <div>
                        <label className="text-sm">Inactivity Threshold (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 border rounded-lg" defaultValue="5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Monitoring Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Face Detection</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Audio Monitoring</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Screen Recording</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Keystroke Analysis</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {selectedStudent.name} - Detailed Monitoring
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Live Video Feed Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Live Video Feed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Live video feed would appear here</p>
                        <Badge className={selectedStudent.videoStatus.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {selectedStudent.videoStatus.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Behavior Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Tab Switches</span>
                        <Badge variant="outline">{selectedStudent.behaviorMetrics.tabSwitches}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Copy Attempts</span>
                        <Badge variant="outline">{selectedStudent.behaviorMetrics.copyAttempts}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Right Clicks</span>
                        <Badge variant="outline">{selectedStudent.behaviorMetrics.rightClicks}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Fullscreen Exits</span>
                        <Badge variant="outline">{selectedStudent.behaviorMetrics.fullscreenExits}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Inactive Time</span>
                        <Badge variant="outline">{selectedStudent.behaviorMetrics.inactiveTime}m</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Device Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Battery Level</span>
                        <div className="flex items-center gap-2">
                          <Battery className="h-4 w-4" />
                          <span>{selectedStudent.deviceInfo.batteryLevel}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Network Strength</span>
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4" />
                          <span>{selectedStudent.deviceInfo.networkStrength}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Browser</span>
                        <span className="text-sm text-muted-foreground">{selectedStudent.deviceInfo.browser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operating System</span>
                        <span className="text-sm text-muted-foreground">{selectedStudent.deviceInfo.os}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Screen Resolution</span>
                        <span className="text-sm text-muted-foreground">{selectedStudent.deviceInfo.screenResolution}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Incident Detail Modal */}
      <AnimatePresence>
        {showIncidentModal && selectedIncident && (
          <Dialog open={showIncidentModal} onOpenChange={setShowIncidentModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getIncidentIcon(selectedIncident.type)}
                  Incident Details
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedIncident.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Severity</label>
                    <Badge className={getSeverityColor(selectedIncident.severity)}>
                      {selectedIncident.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedIncident.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedIncident.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowIncidentModal(false)}>
                    Close
                  </Button>
                  <Button>
                    Mark as Resolved
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}