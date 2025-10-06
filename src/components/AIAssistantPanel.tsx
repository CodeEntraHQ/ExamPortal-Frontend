import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Sparkles, 
  FileText, 
  Upload, 
  Wand2, 
  Brain, 
  Target, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
  Download,
  Eye,
  Settings,
  History,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Search,
  Tag,
  Zap,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from './NotificationProvider';

interface GeneratedQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: number;
  tags: string[];
  source: 'ai-generated' | 'enhanced' | 'rewritten';
  confidence: number;
}

interface AITask {
  id: string;
  type: 'generate' | 'enhance' | 'rewrite' | 'analyze';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: string;
  output?: any;
  progress: number;
  timestamp: Date;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  examId?: string;
}

export function AIAssistantPanel({ isOpen, onClose, examId }: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState('generate');
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error, info } = useNotifications();

  // Generate Questions Form State
  const [generateForm, setGenerateForm] = useState({
    topic: '',
    difficulty: '',
    questionType: '',
    count: 5,
    syllabus: '',
    context: ''
  });

  // Enhancement Form State
  const [enhanceForm, setEnhanceForm] = useState({
    questionText: '',
    enhanceType: '',
    targetDifficulty: ''
  });

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const questionTypes = [
    'Multiple Choice (Single)',
    'Multiple Choice (Multiple)',
    'True/False',
    'Short Answer',
    'Long Answer',
    'Fill in the Blank',
    'Matching',
    'Ordering',
    'Numeric'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const enhanceTypes = [
    'Add Distractors',
    'Improve Clarity',
    'Add Explanation',
    'Generate Hints',
    'Suggest Tags',
    'Estimate Difficulty',
    'Check for Bias',
    'Plagiarism Check'
  ];

  const simulateAITask = async (type: AITask['type'], input: string): Promise<any> => {
    const taskId = Date.now().toString();
    const newTask: AITask = {
      id: taskId,
      type,
      status: 'pending',
      input,
      progress: 0,
      timestamp: new Date()
    };

    setTasks(prev => [newTask, ...prev]);

    // Simulate processing
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, progress, status: progress === 100 ? 'completed' : 'processing' }
          : task
      ));
    }

    // Mock AI responses based on type
    let output;
    switch (type) {
      case 'generate':
        output = {
          questions: Array.from({ length: generateForm.count }, (_, i) => ({
            id: `gen-${Date.now()}-${i}`,
            type: generateForm.questionType || 'Multiple Choice (Single)',
            question: `Generated question about ${generateForm.topic} - Question ${i + 1}`,
            options: generateForm.questionType?.includes('Multiple Choice') 
              ? ['Option A', 'Option B', 'Option C', 'Option D']
              : undefined,
            correctAnswer: 'Option A',
            explanation: `This question tests understanding of ${generateForm.topic} concepts.`,
            difficulty: (generateForm.difficulty || 'Medium') as GeneratedQuestion['difficulty'],
            estimatedTime: Math.floor(Math.random() * 5) + 2,
            tags: [generateForm.topic.toLowerCase(), 'ai-generated'],
            source: 'ai-generated' as const,
            confidence: Math.floor(Math.random() * 20) + 80
          }))
        };
        setGeneratedQuestions(prev => [...prev, ...output.questions]);
        break;
      
      case 'enhance':
        output = {
          enhanced: true,
          suggestions: [
            'Added clearer wording to the question stem',
            'Improved distractor quality',
            'Added detailed explanation'
          ]
        };
        break;
      
      case 'analyze':
        output = {
          difficulty: 'Medium',
          estimatedTime: 3,
          suggestedTags: ['physics', 'mechanics', 'kinematics'],
          biasCheck: 'No bias detected',
          clarity: 85
        };
        break;
    }

    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, output } : task
    ));

    return output;
  };

  const handleGenerateQuestions = async () => {
    if (!generateForm.topic.trim()) {
      error('Please enter a topic for question generation');
      return;
    }

    setIsLoading(true);
    try {
      info('Starting AI question generation...');
      await simulateAITask('generate', `Topic: ${generateForm.topic}`);
      success(`Successfully generated ${generateForm.count} questions`);
    } catch (err) {
      error('Failed to generate questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhanceQuestion = async () => {
    if (!enhanceForm.questionText.trim()) {
      error('Please enter a question to enhance');
      return;
    }

    setIsLoading(true);
    try {
      info('Enhancing question with AI...');
      await simulateAITask('enhance', enhanceForm.questionText);
      success('Question enhanced successfully');
    } catch (err) {
      error('Failed to enhance question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    info(`Uploaded ${files.length} file(s) for AI analysis`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="fixed right-0 top-0 h-screen w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Powered by advanced AI</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 m-2">
            <TabsTrigger value="generate" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="enhance" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Enhance
            </TabsTrigger>
            <TabsTrigger value="analyze" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="h-3 w-3 mr-1" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="flex-1 overflow-auto p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Questions
                </CardTitle>
                <CardDescription className="text-xs">
                  AI-powered question generation from topics or content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Topic/Subject *</Label>
                  <Input
                    placeholder="e.g., Quantum Physics, World War II"
                    value={generateForm.topic}
                    onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Question Type</Label>
                    <Select value={generateForm.questionType} onValueChange={(value) => setGenerateForm({ ...generateForm, questionType: value })}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map(type => (
                          <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Difficulty</Label>
                    <Select value={generateForm.difficulty} onValueChange={(value) => setGenerateForm({ ...generateForm, difficulty: value })}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map(diff => (
                          <SelectItem key={diff} value={diff} className="text-xs">{diff}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Number of Questions</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={generateForm.count}
                    onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) || 1 })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Additional Context (Optional)</Label>
                  <Textarea
                    placeholder="Provide syllabus, specific requirements, or context..."
                    value={generateForm.context}
                    onChange={(e) => setGenerateForm({ ...generateForm, context: e.target.value })}
                    rows={3}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Upload Content (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Upload PDFs, documents, or text files</p>
                    </label>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleGenerateQuestions} 
                  disabled={isLoading || !generateForm.topic.trim()}
                  className="w-full text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Questions */}
            {generatedQuestions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Generated Questions ({generatedQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40">
                    <div className="space-y-3">
                      {generatedQuestions.slice(-3).map((question, index) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-xs font-medium">{question.question}</p>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(question.question)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="text-xs">{question.type}</Badge>
                            <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {question.estimatedTime}m
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Target className="h-3 w-3" />
                              {question.confidence}%
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Enhance Tab */}
          <TabsContent value="enhance" className="flex-1 overflow-auto p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Enhance Questions
                </CardTitle>
                <CardDescription className="text-xs">
                  Improve existing questions with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Question Text *</Label>
                  <Textarea
                    placeholder="Paste your question here to enhance..."
                    value={enhanceForm.questionText}
                    onChange={(e) => setEnhanceForm({ ...enhanceForm, questionText: e.target.value })}
                    rows={4}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Enhancement Type</Label>
                  <Select value={enhanceForm.enhanceType} onValueChange={(value) => setEnhanceForm({ ...enhanceForm, enhanceType: value })}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select enhancement" />
                    </SelectTrigger>
                    <SelectContent>
                      {enhanceTypes.map(type => (
                        <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleEnhanceQuestion} 
                  disabled={isLoading || !enhanceForm.questionText.trim()}
                  className="w-full text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 mr-2" />
                      Enhance Question
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="flex-1 overflow-auto p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Question Analysis
                </CardTitle>
                <CardDescription className="text-xs">
                  AI-powered question quality assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Upload questions or exam content for comprehensive analysis including difficulty assessment, bias detection, and quality scoring.
                  </AlertDescription>
                </Alert>
                
                <Button variant="outline" className="w-full text-sm">
                  <Upload className="h-3 w-3 mr-2" />
                  Upload for Analysis
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 overflow-auto p-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  AI Task History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {tasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        No AI tasks yet. Start by generating or enhancing questions.
                      </p>
                    ) : (
                      tasks.map((task) => (
                        <div key={task.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'processing' ? 'bg-blue-500' :
                                task.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                              }`} />
                              <span className="text-xs font-medium capitalize">{task.type}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {task.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{task.input}</p>
                          {task.status === 'processing' && (
                            <Progress value={task.progress} className="h-1" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>AI Assistant v2.0</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}