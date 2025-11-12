import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../shared/components/ui/card';
import { Button } from '../../../../shared/components/ui/button';
import { Progress } from '../../../../shared/components/ui/progress';
import { Alert, AlertDescription } from '../../../../shared/components/ui/alert';
import { Badge } from '../../../../shared/components/ui/badge';
import { Input } from '../../../../shared/components/ui/input';
import { Textarea } from '../../../../shared/components/ui/textarea';
import { Checkbox } from '../../../../shared/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../../../shared/components/ui/radio-group';
import { Label } from '../../../../shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../shared/components/ui/tabs';
import { useNotifications } from '../../../../shared/providers/NotificationProvider';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock,
  Eye,
  Flag,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  AlertTriangle,
  Camera,
  Monitor,
  Upload,
  Code,
  Calculator,
  Maximize,
  Minimize,
  HelpCircle,
  CheckCircle,
  Circle,
  Move,
  RotateCcw,
  Target,
  BookOpen,
  Timer,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Info,
  Shield,
  X,
  Check
} from 'lucide-react';

interface Question {
  id: string;
  type: 'MCQ' | 'ONE_WORD' | 'DESCRIPTIVE' | 'TRUE_FALSE' | 'CODE' | 'NUMERIC' | 'FILL_BLANK' | 'MATCHING' | 'ORDERING';
  title: string;
  content: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  options?: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer?: string | number;
  metadata?: any;
  hint?: string;
  explanation?: string;
  createdAt: string;
  lastModified: string;
}

interface ExamSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  currentQuestion: number;
  timeRemaining: number; // in seconds
  questions: Question[];
  answers: Record<string, any>;
  flaggedQuestions: string[];
  submitted: boolean;
  allowReview: boolean;
  showQuestionNumbers: boolean;
  preventCopyPaste: boolean;
  negativeMarking: boolean;
  negativeMarkingValue: number;
  randomizeQuestions: boolean;
  proctoring: {
    cameraEnabled: boolean;
    screenShareEnabled: boolean;
    lockdownEnabled: boolean;
  };
}

interface ComprehensiveStudentExamInterfaceProps {
  examId: string;
  onComplete: (results: any) => void;
}

export function ComprehensiveStudentExamInterface({ 
  examId, 
  onComplete 
}: ComprehensiveStudentExamInterfaceProps) {
  const { success, error, warning, info } = useNotifications();
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const examContainerRef = useRef<HTMLDivElement>(null);

  // Mock exam data - in real app this would come from API
  const mockExam: ExamSession = {
    id: examId,
    title: 'Advanced JavaScript Programming Assessment',
    description: 'Comprehensive test covering ES6+, async programming, and modern frameworks',
    duration: 90,
    totalQuestions: 10,
    totalMarks: 100,
    passingMarks: 70,
    currentQuestion: 0,
    timeRemaining: 90 * 60, // 90 minutes in seconds
    answers: {},
    flaggedQuestions: [],
    submitted: false,
    allowReview: true,
    showQuestionNumbers: true,
    preventCopyPaste: true,
    negativeMarking: true,
    negativeMarkingValue: 0.25,
    randomizeQuestions: false,
    proctoring: {
      cameraEnabled: true,
      screenShareEnabled: false,
      lockdownEnabled: true
    },
    questions: [
      {
        id: 'q1',
        type: 'MCQ',
        title: 'Array Methods in JavaScript',
        content: 'Which array method returns a new array with all elements that pass a test implemented by the provided function?',
        points: 10,
        difficulty: 'Medium',
        tags: ['JavaScript', 'Arrays'],
        options: [
          { id: 'a', text: 'map()', isCorrect: false },
          { id: 'b', text: 'filter()', isCorrect: true },
          { id: 'c', text: 'reduce()', isCorrect: false },
          { id: 'd', text: 'forEach()', isCorrect: false }
        ],
        hint: 'Think about which method creates a new array based on a condition',
        explanation: 'The filter() method creates a new array with all elements that pass the test implemented by the provided function.',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      },
      {
        id: 'q2',
        type: 'ONE_WORD',
        title: 'JavaScript Keywords',
        content: 'What keyword is used to declare a constant in JavaScript?',
        points: 5,
        difficulty: 'Easy',
        tags: ['JavaScript', 'Variables'],
        correctAnswer: 'const',
        hint: 'It\'s a 5-letter keyword introduced in ES6',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      },
      {
        id: 'q3',
        type: 'DESCRIPTIVE',
        title: 'Async/Await vs Promises',
        content: 'Explain the advantages of using async/await over traditional Promise chains. Provide a code example demonstrating the difference.',
        points: 15,
        difficulty: 'Hard',
        tags: ['JavaScript', 'Async'],
        metadata: {
          minLength: 50,
          maxLength: 300
        },
        hint: 'Consider readability, error handling, and debugging aspects',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      },
      {
        id: 'q4',
        type: 'TRUE_FALSE',
        title: 'JavaScript Hoisting',
        content: 'Variable declarations with `let` and `const` are hoisted to the top of their block scope.',
        points: 5,
        difficulty: 'Medium',
        tags: ['JavaScript', 'Hoisting'],
        correctAnswer: 'true',
        hint: 'Think about the temporal dead zone',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      },
      {
        id: 'q5',
        type: 'CODE',
        title: 'Function Implementation',
        content: 'Write a JavaScript function called `debounce` that delays invoking a function until after `delay` milliseconds have elapsed since the last time the debounced function was invoked.',
        points: 20,
        difficulty: 'Hard',
        tags: ['JavaScript', 'Functions'],
        metadata: {
          language: 'javascript',
          template: 'function debounce(func, delay) {\n  // Your implementation here\n}'
        },
        hint: 'Use setTimeout and clearTimeout',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      },
      {
        id: 'q6',
        type: 'NUMERIC',
        title: 'Time Complexity',
        content: 'What is the time complexity of binary search in Big O notation? (Enter as a number where O(n) = 1, O(log n) = 0.5, O(n²) = 2)',
        points: 10,
        difficulty: 'Medium',
        tags: ['Algorithms', 'Complexity'],
        correctAnswer: 0.5,
        metadata: {
          precision: 1,
          unit: 'complexity factor'
        },
        hint: 'Binary search halves the search space each time',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      },
      {
        id: 'q7',
        type: 'FILL_BLANK',
        title: 'JavaScript Syntax',
        content: 'Complete the code: const result = array.___(item => item > 5).___(item => item * 2);',
        points: 10,
        difficulty: 'Medium',
        tags: ['JavaScript', 'Array Methods'],
        metadata: {
          blanks: ['filter', 'map']
        },
        hint: 'First method filters, second method transforms',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      },
      {
        id: 'q8',
        type: 'MATCHING',
        title: 'JavaScript Concepts',
        content: 'Match the JavaScript concepts with their descriptions:',
        points: 15,
        difficulty: 'Medium',
        tags: ['JavaScript', 'Concepts'],
        metadata: {
          leftItems: ['Closure', 'Hoisting', 'Prototype', 'Event Loop'],
          rightItems: [
            'Function access to outer scope variables',
            'Moving declarations to top of scope',
            'Object inheritance mechanism',
            'Handles asynchronous operations'
          ]
        },
        hint: 'Think about fundamental JavaScript mechanisms',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      },
      {
        id: 'q9',
        type: 'ORDERING',
        title: 'JavaScript Execution Order',
        content: 'Arrange the following code execution steps in the correct order:',
        points: 10,
        difficulty: 'Hard',
        tags: ['JavaScript', 'Execution'],
        metadata: {
          items: [
            'console.log("3")',
            'setTimeout(() => console.log("4"), 0)',
            'Promise.resolve().then(() => console.log("2"))',
            'console.log("1")'
          ]
        },
        hint: 'Consider the event loop and microtask queue',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      },
      {
        id: 'q10',
        type: 'MCQ',
        title: 'React Hooks',
        content: 'Which React hook should you use to perform side effects in function components?',
        points: 10,
        difficulty: 'Medium',
        tags: ['React', 'Hooks'],
        options: [
          { id: 'a', text: 'useState', isCorrect: false },
          { id: 'b', text: 'useEffect', isCorrect: true },
          { id: 'c', text: 'useContext', isCorrect: false },
          { id: 'd', text: 'useMemo', isCorrect: false }
        ],
        hint: 'Think about lifecycle methods equivalent',
        createdAt: '2024-01-01',
        lastModified: '2024-01-01'
      }
    ]
  };

  useEffect(() => {
    // Initialize exam session
    setExamSession(mockExam);
    setIsLoading(false);

    // Set up event listeners for proctoring if enabled
    if (mockExam.proctoring.lockdownEnabled) {
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent F12, Ctrl+Shift+I, etc.
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'u')) {
          e.preventDefault();
          warning('Developer tools are disabled during the exam');
        }
      };
      
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  useEffect(() => {
    if (examStarted && examSession && !examSession.submitted) {
      timerRef.current = setInterval(() => {
        setExamSession(prev => {
          if (!prev) return null;
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            handleAutoSubmit();
            return { ...prev, timeRemaining: 0, submitted: true };
          }
          
          // Show warnings at specific intervals
          if (newTimeRemaining === 300) { // 5 minutes
            warning('5 minutes remaining!');
          } else if (newTimeRemaining === 60) { // 1 minute
            error('1 minute remaining!');
          }
          
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examStarted, examSession?.submitted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setShowInstructions(false);
    success('Exam started! Good luck!');
    
    if (examSession?.proctoring.lockdownEnabled) {
      enterFullscreen();
    }
  };

  const enterFullscreen = () => {
    if (examContainerRef.current && examContainerRef.current.requestFullscreen) {
      examContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    if (!examSession) return;
    
    setExamSession(prev => ({
      ...prev!,
      answers: {
        ...prev!.answers,
        [questionId]: answer
      }
    }));
  };

  const handleFlagQuestion = (questionId: string) => {
    if (!examSession) return;
    
    setExamSession(prev => {
      const flagged = prev!.flaggedQuestions.includes(questionId);
      return {
        ...prev!,
        flaggedQuestions: flagged 
          ? prev!.flaggedQuestions.filter(id => id !== questionId)
          : [...prev!.flaggedQuestions, questionId]
      };
    });
  };

  const navigateToQuestion = (index: number) => {
    if (!examSession) return;
    
    setExamSession(prev => ({
      ...prev!,
      currentQuestion: Math.max(0, Math.min(index, prev!.questions.length - 1))
    }));
  };

  const handleAutoSubmit = () => {
    if (!examSession) return;
    
    info('Time is up! Exam submitted automatically.');
    submitExam();
  };

  const submitExam = () => {
    if (!examSession) return;
    
    const results = calculateResults();
    setExamSession(prev => ({ ...prev!, submitted: true }));
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (isFullscreen) {
      exitFullscreen();
    }
    
    setTimeout(() => {
      onComplete(results);
    }, 2000);
  };

  const calculateResults = () => {
    if (!examSession) return null;
    
    let totalScore = 0;
    let correctAnswers = 0;
    const questionResults: any[] = [];

    examSession.questions.forEach(question => {
      const userAnswer = examSession.answers[question.id];
      let isCorrect = false;
      let pointsEarned = 0;

      switch (question.type) {
        case 'MCQ':
          const correctOption = question.options?.find(opt => opt.isCorrect);
          isCorrect = userAnswer === correctOption?.id;
          break;
        case 'ONE_WORD':
          isCorrect = userAnswer?.toLowerCase() === question.correctAnswer?.toString().toLowerCase();
          break;
        case 'TRUE_FALSE':
          isCorrect = userAnswer === question.correctAnswer;
          break;
        case 'NUMERIC':
          const numAnswer = parseFloat(userAnswer);
          const correctNum = parseFloat(question.correctAnswer as string);
          isCorrect = Math.abs(numAnswer - correctNum) < 0.01;
          break;
        case 'DESCRIPTIVE':
        case 'CODE':
          // For descriptive and code questions, assume partial credit
          isCorrect = userAnswer && userAnswer.trim().length > 0;
          pointsEarned = isCorrect ? question.points * 0.7 : 0; // 70% credit for attempt
          break;
        default:
          isCorrect = false;
      }

      if (question.type !== 'DESCRIPTIVE' && question.type !== 'CODE') {
        pointsEarned = isCorrect ? question.points : 
          (examSession.negativeMarking && userAnswer ? -question.points * examSession.negativeMarkingValue : 0);
      }

      if (isCorrect) correctAnswers++;
      totalScore += pointsEarned;

      questionResults.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        pointsEarned,
        maxPoints: question.points
      });
    });

    const percentage = Math.max(0, (totalScore / examSession.totalMarks) * 100);
    const passed = totalScore >= examSession.passingMarks;

    return {
      totalScore: Math.max(0, totalScore),
      totalMarks: examSession.totalMarks,
      percentage: Math.round(percentage * 100) / 100,
      correctAnswers,
      totalQuestions: examSession.questions.length,
      passed,
      timeTaken: examSession.duration * 60 - examSession.timeRemaining,
      questionResults
    };
  };

  const renderQuestionContent = (question: Question) => {
    const userAnswer = examSession?.answers[question.id];

    switch (question.type) {
      case 'MCQ':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={userAnswer || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options?.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'ONE_WORD':
        return (
          <div className="space-y-4">
            <Input
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer"
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Enter a single word or short phrase
            </p>
          </div>
        );

      case 'DESCRIPTIVE':
        return (
          <div className="space-y-4">
            <Textarea
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Write your detailed answer here..."
              rows={8}
              className="resize-none"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Word count: {userAnswer ? userAnswer.split(' ').filter((w: string) => w.length > 0).length : 0}
              </span>
              {question.metadata?.minLength && (
                <span>
                  Minimum: {question.metadata.minLength} words
                </span>
              )}
              {question.metadata?.maxLength && (
                <span>
                  Maximum: {question.metadata.maxLength} words
                </span>
              )}
            </div>
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={userAnswer || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="flex-1 cursor-pointer font-medium">
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="flex-1 cursor-pointer font-medium">
                  False
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'CODE':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {question.metadata?.language || 'javascript'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </Button>
            </div>
            <Textarea
              value={userAnswer || question.metadata?.template || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="font-mono text-sm"
              rows={12}
              placeholder="Write your code here..."
            />
          </div>
        );

      case 'NUMERIC':
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                step="any"
                value={userAnswer || ''}
                onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value) || '')}
                placeholder="Enter numerical answer"
                className="text-lg"
              />
              {question.metadata?.unit && (
                <Badge variant="outline" className="px-3 py-2">
                  {question.metadata.unit}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {question.metadata?.precision && `Precision: ${question.metadata.precision} decimal places`}
            </p>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Question type not supported
          </div>
        );
    }
  };

  if (isLoading || !examSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {examSession.title}
            </CardTitle>
            <CardDescription>{examSession.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Timer className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="font-semibold">{examSession.duration} min</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="font-semibold">{examSession.totalQuestions}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="font-semibold">{examSession.totalMarks}</div>
                <div className="text-xs text-muted-foreground">Total Marks</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Flag className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="font-semibold">{examSession.passingMarks}</div>
                <div className="text-xs text-muted-foreground">Passing Marks</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Important Instructions:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-orange-500" />
                  You have {examSession.duration} minutes to complete {examSession.totalQuestions} questions
                </li>
                <li className="flex items-start gap-2">
                  <Save className="h-4 w-4 mt-0.5 text-blue-500" />
                  Your answers are automatically saved as you type
                </li>
                {examSession.negativeMarking && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500" />
                    Negative marking: -{examSession.negativeMarkingValue} marks for wrong answers
                  </li>
                )}
                {examSession.allowReview && (
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 mt-0.5 text-green-500" />
                    You can review and change answers before final submission
                  </li>
                )}
                {examSession.proctoring.lockdownEnabled && (
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 mt-0.5 text-purple-500" />
                    Exam is proctored - switching tabs or applications is monitored
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-500" />
                  Click on question numbers to navigate between questions
                </li>
              </ul>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Once you start the exam, the timer will begin and cannot be paused. Make sure you have a stable internet connection.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button 
                onClick={handleStartExam}
                className="bg-primary hover:bg-primary/90 px-8 py-3"
                size="lg"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (examSession.submitted) {
    const results = calculateResults();
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center">
              <CheckCircle className="h-6 w-6 text-success" />
              Exam Submitted Successfully!
            </CardTitle>
            <CardDescription className="text-center">
              Your responses have been recorded and your results are being processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {results && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{results.totalScore}</div>
                  <div className="text-sm text-muted-foreground">Score / {results.totalMarks}</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{results.percentage}%</div>
                  <div className="text-sm text-muted-foreground">Percentage</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{results.correctAnswers}</div>
                  <div className="text-sm text-muted-foreground">Correct / {results.totalQuestions}</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{formatTime(results.timeTaken)}</div>
                  <div className="text-sm text-muted-foreground">Time Taken</div>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <Badge 
                variant={results?.passed ? 'default' : 'destructive'} 
                className={`px-4 py-2 text-lg ${results?.passed ? 'bg-success' : ''}`}
              >
                {results?.passed ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>

            <p className="text-center text-muted-foreground">
              You will be redirected to the results page shortly...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = examSession.questions[examSession.currentQuestion];
  const isLastQuestion = examSession.currentQuestion === examSession.questions.length - 1;
  const progress = ((examSession.currentQuestion + 1) / examSession.questions.length) * 100;

  return (
    <div ref={examContainerRef} className="min-h-screen bg-background">
      {/* Exam Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold">{examSession.title}</h1>
            <Badge variant="outline">
              Question {examSession.currentQuestion + 1} of {examSession.totalQuestions}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-1 text-xs ${
              connectionStatus === 'connected' ? 'text-success' : 
              connectionStatus === 'reconnecting' ? 'text-orange-500' : 'text-destructive'
            }`}>
              <Circle className={`h-2 w-2 ${connectionStatus === 'connected' ? 'fill-current' : ''}`} />
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              examSession.timeRemaining <= 300 ? 'bg-destructive/10 text-destructive' : 
              examSession.timeRemaining <= 900 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
              'bg-muted'
            }`}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-semibold">
                {formatTime(examSession.timeRemaining)}
              </span>
            </div>

            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => isFullscreen ? exitFullscreen() : enterFullscreen()}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex">
        {/* Question Navigation Sidebar */}
        <div className="w-64 border-r bg-muted/30 p-4 space-y-4">
          <h3 className="font-medium">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {examSession.questions.map((_, index) => {
              const isAnswered = examSession.answers[examSession.questions[index].id] !== undefined;
              const isFlagged = examSession.flaggedQuestions.includes(examSession.questions[index].id);
              const isCurrent = index === examSession.currentQuestion;
              
              return (
                <Button
                  key={index}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className={`relative ${
                    isAnswered ? 'bg-success/10 border-success' : ''
                  } ${isCurrent ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => navigateToQuestion(index)}
                >
                  {index + 1}
                  {isFlagged && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-orange-500 fill-current" />
                  )}
                </Button>
              );
            })}
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success/10 border border-success rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border rounded"></div>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-orange-500 fill-current" />
              <span>Flagged</span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Answered: {Object.keys(examSession.answers).length}/{examSession.questions.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Flagged: {examSession.flaggedQuestions.length}
            </div>
          </div>
        </div>

        {/* Main Question Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{currentQuestion.type}</Badge>
                      <Badge variant="outline">{currentQuestion.points} points</Badge>
                      <Badge variant="outline" className={
                        currentQuestion.difficulty === 'Easy' ? 'text-green-600' :
                        currentQuestion.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlagQuestion(currentQuestion.id)}
                    className={examSession.flaggedQuestions.includes(currentQuestion.id) ? 'text-orange-500' : ''}
                  >
                    <Flag className={`h-4 w-4 ${examSession.flaggedQuestions.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm max-w-none">
                  <p>{currentQuestion.content}</p>
                </div>

                {currentQuestion.hint && (
                  <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Hint:</strong> {currentQuestion.hint}
                    </AlertDescription>
                  </Alert>
                )}

                {renderQuestionContent(currentQuestion)}
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigateToQuestion(examSession.currentQuestion - 1)}
                disabled={examSession.currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {examSession.allowReview && (
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review Answers
                  </Button>
                )}
                
                {isLastQuestion ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Exam
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigateToQuestion(examSession.currentQuestion + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to submit your exam? This action cannot be undone.</p>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="font-semibold">Answered Questions</div>
                <div className="text-2xl font-bold text-primary">
                  {Object.keys(examSession.answers).length}/{examSession.questions.length}
                </div>
              </div>
              <div>
                <div className="font-semibold">Time Remaining</div>
                <div className="text-2xl font-bold text-primary">
                  {formatTime(examSession.timeRemaining)}
                </div>
              </div>
            </div>
            
            {Object.keys(examSession.answers).length < examSession.questions.length && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have {examSession.questions.length - Object.keys(examSession.answers).length} unanswered questions.
                  {examSession.negativeMarking && " Unanswered questions won't receive negative marks."}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitExam} className="bg-primary hover:bg-primary/90">
              Yes, Submit Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-64">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Calculator</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCalculator(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple calculator implementation */}
              <div className="text-right p-2 bg-muted rounded mb-2 font-mono">
                0
              </div>
              <div className="grid grid-cols-4 gap-1">
                {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((key) => (
                  <Button key={key} variant="outline" size="sm" className="h-8">
                    {key}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}