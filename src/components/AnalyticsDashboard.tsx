import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from './ui/dialog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Award, 
  Clock,
  Target,
  BookOpen,
  Calendar,
  Activity,
  Download,
  Filter,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AlertTriangle,
  CheckCircle,
  Star,
  Globe,
  Shield,
  Zap,
  Brain,
  Search,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from './NotificationProvider';

interface AnalyticsDashboardProps {
  currentEntity?: string;
}

export function AnalyticsDashboard({ currentEntity }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const { showNotification } = useNotifications();

  // Mock data for analytics
  const performanceData = [
    { month: 'Jan', exams: 12, students: 340, avgScore: 78, passRate: 85 },
    { month: 'Feb', exams: 15, students: 420, avgScore: 82, passRate: 88 },
    { month: 'Mar', exams: 18, students: 380, avgScore: 79, passRate: 86 },
    { month: 'Apr', exams: 22, students: 480, avgScore: 85, passRate: 91 },
    { month: 'May', exams: 25, students: 520, avgScore: 87, passRate: 93 },
    { month: 'Jun', exams: 20, students: 450, avgScore: 84, passRate: 89 }
  ];

  const scoreDistribution = [
    { name: 'Excellent (90-100)', value: 25, color: '#10B981' },
    { name: 'Good (80-89)', value: 35, color: '#059669' },
    { name: 'Average (70-79)', value: 25, color: '#F59E0B' },
    { name: 'Below Average (60-69)', value: 10, color: '#EF4444' },
    { name: 'Poor (<60)', value: 5, color: '#DC2626' }
  ];

  const categoryPerformance = [
    { subject: 'Mathematics', avgScore: 85, exams: 15, students: 234 },
    { subject: 'Programming', avgScore: 82, exams: 18, students: 312 },
    { subject: 'Database', avgScore: 78, exams: 12, students: 189 },
    { subject: 'Web Dev', avgScore: 88, exams: 14, students: 267 },
    { subject: 'Algorithms', avgScore: 76, exams: 10, students: 156 },
    { subject: 'Networks', avgScore: 81, exams: 8, students: 134 }
  ];

  const examCompletionTrend = [
    { date: '2024-02-01', completed: 45, started: 52, enrolled: 60 },
    { date: '2024-02-05', completed: 78, started: 85, enrolled: 92 },
    { date: '2024-02-10', completed: 123, started: 134, enrolled: 145 },
    { date: '2024-02-15', completed: 156, started: 168, enrolled: 180 },
    { date: '2024-02-20', completed: 189, started: 203, enrolled: 220 },
    { date: '2024-02-25', completed: 234, started: 245, enrolled: 260 }
  ];

  const difficultyAnalysis = [
    { difficulty: 'Easy', avgScore: 92, passRate: 96, studentCount: 180 },
    { difficulty: 'Medium', avgScore: 78, passRate: 85, studentCount: 240 },
    { difficulty: 'Hard', avgScore: 65, passRate: 72, studentCount: 120 }
  ];

  const timeSpentData = [
    { timeRange: '0-30 min', count: 45, percentage: 15 },
    { timeRange: '30-60 min', count: 120, percentage: 40 },
    { timeRange: '60-90 min', count: 90, percentage: 30 },
    { timeRange: '90-120 min', count: 30, percentage: 10 },
    { timeRange: '120+ min', count: 15, percentage: 5 }
  ];

  const realtimeStats = [
    {
      title: 'Active Exams',
      value: '23',
      change: '+3',
      changeType: 'positive',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Students Online',
      value: '156',
      change: '+12',
      changeType: 'positive',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Avg. Score Today',
      value: '84.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Completion Rate',
      value: '91.5%',
      change: '+1.2%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const generatedInsights = {
      performance: {
        trend: 'positive',
        summary: 'Overall performance has improved by 12% compared to last month',
        details: [
          'Student engagement is highest between 2-4 PM',
          'Programming exams show 15% higher completion rates',
          'Average score improved from 78% to 84% this quarter'
        ]
      },
      recommendations: [
        'Consider scheduling more exams during peak engagement hours (2-4 PM)',
        'Add more intermediate-level questions to bridge the gap between easy and hard difficulties',
        'Implement adaptive questioning to maintain optimal challenge levels',
        'Provide additional study materials for Database and Networks subjects'
      ],
      alerts: [
        'Low completion rate in Advanced Algorithms (65%) - requires attention',
        'Unusual spike in student queries for Database exam #DB-456',
        '3 students with suspected irregular activity patterns'
      ],
      predictions: [
        'Based on current trends, expect 95% completion rate next month',
        'Database subject scores likely to improve by 8% with additional resources',
        'Peak exam activity expected on weekdays between 10 AM - 4 PM'
      ]
    };

    setInsights(generatedInsights);
    setIsGeneratingInsights(false);
    setShowInsightsModal(true);
    showNotification('AI insights generated successfully', 'success');
  };

  const exportReport = () => {
    showNotification('Analytics report exported to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last3months">Last 3 months</SelectItem>
              <SelectItem value="last6months">Last 6 months</SelectItem>
              <SelectItem value="lastyear">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateInsights} disabled={isGeneratingInsights} className="bg-primary hover:bg-primary/90">
            {isGeneratingInsights ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Generate Insights
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {realtimeStats.map((stat, index) => (
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
                    <div className="flex items-center gap-1">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs last period</span>
                    </div>
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

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-primary" />
                  Performance Trend
                </CardTitle>
                <CardDescription>Monthly exam performance and participation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgScore" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="passRate" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Score Distribution
                </CardTitle>
                <CardDescription>Student performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                      labelLine={false}
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {scoreDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Subject Performance
              </CardTitle>
              <CardDescription>Performance analysis by subject category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="subject" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exam Completion Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Trends</CardTitle>
                <CardDescription>Exam enrollment vs completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={examCompletionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="enrolled" 
                      stackId="1" 
                      stroke="hsl(var(--chart-3))" 
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="started" 
                      stackId="2" 
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stackId="3" 
                      stroke="hsl(var(--chart-1))" 
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Difficulty Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Analysis</CardTitle>
                <CardDescription>Performance by exam difficulty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {difficultyAnalysis.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.difficulty}</span>
                        <span className="text-sm text-muted-foreground">{item.studentCount} students</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Average Score</span>
                          <span className="font-medium">{item.avgScore}%</span>
                        </div>
                        <Progress value={item.avgScore} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Pass Rate</span>
                          <span className="font-medium">{item.passRate}%</span>
                        </div>
                        <Progress value={item.passRate} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Spent Analysis</CardTitle>
              <CardDescription>Distribution of time spent on exams</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSpentData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="timeRange" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Advanced analytics and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Generate AI Insights</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Generate Insights" to get AI-powered analysis of your exam data
                </p>
                <Button onClick={generateInsights} disabled={isGeneratingInsights}>
                  {isGeneratingInsights ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingInsights ? 'Analyzing...' : 'Generate Insights'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Center</CardTitle>
              <CardDescription>Download detailed reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Performance Summary', description: 'Overall performance metrics' },
                  { name: 'Student Progress', description: 'Individual student analytics' },
                  { name: 'Exam Analytics', description: 'Detailed exam statistics' },
                  { name: 'Engagement Report', description: 'Student engagement metrics' },
                  { name: 'Comparative Analysis', description: 'Cross-entity comparisons' },
                  { name: 'Custom Report', description: 'Build your own report' }
                ].map((report, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={exportReport}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights Modal */}
      <Dialog open={showInsightsModal} onOpenChange={setShowInsightsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI-Generated Insights
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis and recommendations based on your exam data
            </DialogDescription>
          </DialogHeader>
          {insights && (
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Analysis
                </h4>
                <p className="text-sm mb-3">{insights.performance.summary}</p>
                <ul className="text-sm space-y-1">
                  {insights.performance.details.map((detail: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-success/10 rounded-lg">
                <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="text-sm space-y-2">
                  {insights.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Alerts */}
              <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Action Required
                </h4>
                <ul className="text-sm space-y-2">
                  {insights.alerts.map((alert: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Predictions */}
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Predictions
                </h4>
                <ul className="text-sm space-y-2">
                  {insights.predictions.map((prediction: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      {prediction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInsightsModal(false)}>
              Close
            </Button>
            <Button onClick={() => {
              exportReport();
              setShowInsightsModal(false);
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}