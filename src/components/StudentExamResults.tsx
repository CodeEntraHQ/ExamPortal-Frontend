import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { 
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  Download,
  Share,
  Star,
  Users,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface StudentExamResultsProps {
  examId: string;
  onBack: () => void;
}

export function StudentExamResults({ examId, onBack }: StudentExamResultsProps) {
  // Mock exam results data - in real app this would be fetched from backend
  const examResults = {
    id: examId,
    examName: 'Advanced Mathematics Final Exam',
    subject: 'Mathematics',
    instructor: 'Dr. Smith',
    date: '2024-02-15',
    duration: 120,
    timeSpent: 105,
    totalQuestions: 50,
    answeredQuestions: 48,
    correctAnswers: 42,
    score: 84,
    maxScore: 100,
    passingScore: 70,
    percentile: 78,
    classAverage: 76.5,
    status: 'passed',
    submittedAt: '2024-02-15T14:30:00Z',
    feedback: 'Good performance overall. Strong understanding of calculus concepts. Consider reviewing algebraic manipulations for improvement.',
    
    // Question-wise breakdown
    questionBreakdown: [
      { category: 'Algebra', total: 15, correct: 13, percentage: 87 },
      { category: 'Calculus', total: 20, correct: 18, percentage: 90 },
      { category: 'Geometry', total: 10, correct: 8, percentage: 80 },
      { category: 'Statistics', total: 5, correct: 3, percentage: 60 }
    ],
    
    // Time analysis
    timeAnalysis: [
      { section: 'Section A', timeSpent: 25, timeAllowed: 30, efficiency: 83 },
      { section: 'Section B', timeSpent: 45, timeAllowed: 45, efficiency: 100 },
      { section: 'Section C', timeSpent: 35, timeAllowed: 45, efficiency: 78 }
    ],
    
    // Detailed question results
    detailedResults: [
      { questionNumber: 1, category: 'Algebra', difficulty: 'Easy', correct: true, timeSpent: 45, points: 2, maxPoints: 2 },
      { questionNumber: 2, category: 'Calculus', difficulty: 'Medium', correct: true, timeSpent: 120, points: 3, maxPoints: 3 },
      { questionNumber: 3, category: 'Geometry', difficulty: 'Hard', correct: false, timeSpent: 180, points: 0, maxPoints: 5 },
      // ... more questions would be here
    ],
    
    // Performance insights
    insights: [
      { type: 'strength', message: 'Excellent performance in Calculus questions', icon: CheckCircle },
      { type: 'improvement', message: 'Consider practicing more Statistics problems', icon: TrendingUp },
      { type: 'warning', message: 'Time management could be improved in complex problems', icon: Clock },
      { type: 'tip', message: 'Your algebra skills are strong - build on this foundation', icon: Star }
    ]
  };

  const difficultyDistribution = [
    { name: 'Easy', correct: 12, total: 15, color: '#10B981' },
    { name: 'Medium', correct: 20, total: 25, color: '#F59E0B' },
    { name: 'Hard', correct: 10, total: 10, color: '#EF4444' }
  ];

  const radarData = examResults.questionBreakdown.map(item => ({
    subject: item.category,
    score: item.percentage,
    classAvg: Math.random() * 20 + 70, // Mock class average
    fullMark: 100
  }));

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= passingScore) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    if (score >= 80) return { text: 'Good', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    if (score >= 70) return { text: 'Average', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };
    return { text: 'Needs Improvement', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  };

  const performanceBadge = getPerformanceBadge(examResults.score);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Exam Results</h1>
                <p className="text-muted-foreground mt-1">{examResults.examName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(examResults.score, examResults.passingScore)}`}>
                    {examResults.score}%
                  </div>
                  <Badge className={performanceBadge.class} variant="secondary">
                    {performanceBadge.text}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">Your Score</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{examResults.percentile}th</div>
                  <div className="text-sm text-muted-foreground">Percentile</div>
                  <p className="text-xs text-muted-foreground mt-1">Better than {examResults.percentile}% of students</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{examResults.classAverage}%</div>
                  <div className="text-sm text-muted-foreground">Class Average</div>
                  <div className={`text-xs mt-1 ${examResults.score > examResults.classAverage ? 'text-green-600' : 'text-red-600'}`}>
                    {examResults.score > examResults.classAverage ? '+' : ''}{(examResults.score - examResults.classAverage).toFixed(1)} vs average
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {examResults.correctAnswers}/{examResults.totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct Answers</div>
                  <p className="text-xs text-muted-foreground mt-1">{examResults.answeredQuestions} attempted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance by Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Performance by Category
                  </CardTitle>
                  <CardDescription>Breakdown of your performance across different topics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={examResults.questionBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          `${value}%`, 
                          name === 'percentage' ? 'Score' : name
                        ]}
                      />
                      <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Detailed Category Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Detailed Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {examResults.questionBreakdown.map((category, index) => (
                      <motion.div
                        key={category.category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{category.category}</h4>
                          <Badge variant="outline">{category.correct}/{category.total}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Accuracy</span>
                            <span className="font-medium">{category.percentage}%</span>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Time Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Time Management Analysis
                  </CardTitle>
                  <CardDescription>How efficiently you used your time during the exam</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{examResults.timeSpent}m</div>
                      <div className="text-sm text-muted-foreground">Time Used</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{examResults.duration}m</div>
                      <div className="text-sm text-muted-foreground">Total Time</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{Math.round((examResults.timeSpent / examResults.duration) * 100)}%</div>
                      <div className="text-sm text-muted-foreground">Efficiency</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {examResults.timeAnalysis.map((section, index) => (
                      <div key={section.section} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h5 className="font-medium">{section.section}</h5>
                          <p className="text-sm text-muted-foreground">
                            {section.timeSpent}m / {section.timeAllowed}m allowed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{section.efficiency}%</div>
                          <div className="text-xs text-muted-foreground">Efficiency</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exam Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Exam Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Subject</div>
                      <div className="font-medium">{examResults.subject}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Instructor</div>
                      <div className="font-medium">{examResults.instructor}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Date</div>
                      <div className="font-medium">{new Date(examResults.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <Badge className={examResults.status === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}>
                        {examResults.status === 'passed' ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Radar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Performance Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Your Score"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Class Average"
                        dataKey="classAvg"
                        stroke="hsl(var(--muted-foreground))"
                        fill="hsl(var(--muted-foreground))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Insights & Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examResults.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          insight.type === 'strength' ? 'bg-green-50 dark:bg-green-900/20' :
                          insight.type === 'improvement' ? 'bg-blue-50 dark:bg-blue-900/20' :
                          insight.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20' :
                          'bg-purple-50 dark:bg-purple-900/20'
                        }`}
                      >
                        <insight.icon className={`h-5 w-5 mt-0.5 ${
                          insight.type === 'strength' ? 'text-green-600' :
                          insight.type === 'improvement' ? 'text-blue-600' :
                          insight.type === 'warning' ? 'text-orange-600' :
                          'text-purple-600'
                        }`} />
                        <p className="text-sm">{insight.message}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Instructor Feedback */}
            {examResults.feedback && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Instructor Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{examResults.feedback}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}