import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  Plus,
  Building,
  BarChart3,
  LineChart,
  Zap,
  Shield,
  Globe,
  Rocket,
  Brain,
  Heart,
  Star,
  ArrowUp,
  ArrowDown,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  MoreVertical,
  ChevronRight,
  Layers,
  Database,
  Monitor
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';

interface InnovativeAdminDashboardProps {
  currentEntity?: string;
  onNavigateToEntities?: () => void;
  onNavigateToExams?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToAnalytics?: () => void;
}

export function InnovativeAdminDashboard({ 
  currentEntity, 
  onNavigateToEntities, 
  onNavigateToExams, 
  onNavigateToUsers, 
  onNavigateToAnalytics 
}: InnovativeAdminDashboardProps) {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Enhanced mock data for admin dashboard
  const systemStats = {
    totalUsers: 1247,
    activeExams: 23,
    completedExams: 156,
    systemUptime: 99.9,
    dataProcessed: 2.4, // GB
    apiRequests: 12450
  };

  const timeFrameData = {
    '24h': [
      { time: '00:00', users: 45, exams: 2, activity: 12 },
      { time: '04:00', users: 23, exams: 1, activity: 5 },
      { time: '08:00', users: 156, exams: 8, activity: 45 },
      { time: '12:00', users: 234, exams: 12, activity: 67 },
      { time: '16:00', users: 189, exams: 15, activity: 78 },
      { time: '20:00', users: 98, exams: 6, activity: 32 }
    ],
    '7d': [
      { time: 'Mon', users: 1156, exams: 23, activity: 234 },
      { time: 'Tue', users: 1234, exams: 28, activity: 267 },
      { time: 'Wed', users: 1189, exams: 31, activity: 245 },
      { time: 'Thu', users: 1298, exams: 27, activity: 298 },
      { time: 'Fri', users: 1367, exams: 35, activity: 334 },
      { time: 'Sat', users: 987, exams: 18, activity: 187 },
      { time: 'Sun', users: 876, exams: 12, activity: 156 }
    ],
    '30d': [
      { time: 'Week 1', users: 8234, exams: 167, activity: 1234 },
      { time: 'Week 2', users: 8567, exams: 189, activity: 1345 },
      { time: 'Week 3', users: 8456, exams: 201, activity: 1298 },
      { time: 'Week 4', users: 8789, exams: 223, activity: 1456 }
    ]
  };

  const entityPerformance = [
    { name: 'University A', students: 1234, exams: 45, avgScore: 87, growth: 12 },
    { name: 'College B', students: 987, exams: 38, avgScore: 84, growth: 8 },
    { name: 'Institute C', students: 756, exams: 29, avgScore: 91, growth: 15 },
    { name: 'Academy D', students: 543, exams: 22, avgScore: 82, growth: -3 },
    { name: 'School E', students: 432, exams: 18, avgScore: 89, growth: 7 }
  ];

  const examTypeDistribution = [
    { name: 'MCQ', value: 45, color: '#10B981' },
    { name: 'Essay', value: 25, color: '#3B82F6' },
    { name: 'Mixed', value: 20, color: '#F59E0B' },
    { name: 'Practical', value: 10, color: '#EF4444' }
  ];

  const recentActivities = [
    { id: 1, type: 'exam_created', user: 'Dr. Smith', entity: 'University A', time: '2 minutes ago', icon: Plus },
    { id: 2, type: 'user_registered', user: 'Jane Doe', entity: 'College B', time: '5 minutes ago', icon: Users },
    { id: 3, type: 'exam_completed', user: 'Mathematics Final', entity: 'Institute C', time: '12 minutes ago', icon: CheckCircle },
    { id: 4, type: 'system_alert', user: 'High CPU Usage', entity: 'System', time: '15 minutes ago', icon: AlertCircle },
    { id: 5, type: 'data_export', user: 'Prof. Johnson', entity: 'Academy D', time: '1 hour ago', icon: Download }
  ];

  const quickActions = [
    { title: 'Create Exam', description: 'Design new examination', icon: Plus, color: 'bg-primary', action: onNavigateToExams },
    { title: 'Manage Users', description: 'User administration', icon: Users, color: 'bg-blue-500', action: onNavigateToUsers },
    { title: 'System Analytics', description: 'Performance insights', icon: BarChart3, color: 'bg-purple-500', action: onNavigateToAnalytics },
    { title: 'Entity Management', description: 'Organization control', icon: Building, color: 'bg-orange-500', action: onNavigateToEntities },
    { title: 'Export Data', description: 'Download reports', icon: Download, color: 'bg-green-500', action: () => {} },
    { title: 'System Settings', description: 'Configure platform', icon: Settings, color: 'bg-gray-500', action: () => {} }
  ].filter(action => {
    // For ADMIN role, hide entity management since they should only see their own entity
    if (user?.role === 'ADMIN' && action.title === 'Entity Management') {
      return false;
    }
    return true;
  });

  const systemHealth = [
    { metric: 'CPU Usage', value: 67, status: 'good', color: 'text-green-600' },
    { metric: 'Memory', value: 45, status: 'good', color: 'text-green-600' },
    { metric: 'Storage', value: 82, status: 'warning', color: 'text-orange-600' },
    { metric: 'Network', value: 23, status: 'excellent', color: 'text-blue-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xl opacity-90 mb-4">
                {user?.role === 'SUPERADMIN' 
                  ? 'Global system administration and oversight' 
                  : `Managing ${user?.entityName || 'your organization'}`}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{systemStats.totalUsers.toLocaleString()} Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>{systemStats.activeExams} Active Exams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{systemStats.systemUptime}% Uptime</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm opacity-75 mb-1">Current Time</div>
              <div className="text-2xl font-bold">{new Date().toLocaleTimeString()}</div>
              <div className="text-sm opacity-75">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-4 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-8 left-20 w-24 h-24 bg-white/5 rounded-full blur-lg" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Frequently used administrative tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer"
                      onClick={() => action.action && action.action()}
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        <CardContent className="p-4 text-center">
                          <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-3`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-medium mb-1">{action.title}</h3>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analytics Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Platform Analytics
                    </CardTitle>
                    <CardDescription>Real-time system performance metrics</CardDescription>
                  </div>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24h</SelectItem>
                      <SelectItem value="7d">7d</SelectItem>
                      <SelectItem value="30d">30d</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeFrameData[selectedTimeframe as keyof typeof timeFrameData]}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="users" stroke="#10B981" fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="exams" stroke="#3B82F6" fillOpacity={1} fill="url(#colorExams)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Entity Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Entity Performance
                </CardTitle>
                <CardDescription>Top performing organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entityPerformance.map((entity, index) => (
                    <motion.div
                      key={entity.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-card to-muted/20 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{entity.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{entity.students.toLocaleString()} students</span>
                            <span>{entity.exams} exams</span>
                            <span>{entity.avgScore}% avg score</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 ${entity.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {entity.growth >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          <span className="text-sm font-medium">{Math.abs(entity.growth)}%</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemHealth.map((item, index) => (
                  <div key={item.metric} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.metric}</span>
                      <span className={`text-sm ${item.color}`}>{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Exam Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Exam Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={examTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {examTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {examTypeDistribution.map((type) => (
                    <div key={type.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-xs">{type.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <activity.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.entity}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Exams</p>
                      <p className="text-2xl font-bold">{systemStats.completedExams}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Data Processed</p>
                      <p className="text-2xl font-bold">{systemStats.dataProcessed}GB</p>
                    </div>
                    <Database className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}