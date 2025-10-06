import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
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
  Mic,
  Monitor,
  Upload,
  Download,
  Code,
  Calculator,
  Image,
  Volume2,
  Maximize,
  Minimize,
  HelpCircle,
  CheckCircle,
  Circle,
  Square,
  Move,
  RotateCcw,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  id: string;
  type: string;
  title: string;
  content: string;
  points: number;
  timeLimit?: number;
  options?: { id: string; text: string }[];
  metadata?: any;
  answer?: any;
  flagged: boolean;
}

interface ExamState {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  currentQuestion: number;
  timeRemaining: number;
  questions: Question[];
  answers: Record<string, any>;
  flaggedQuestions: string[];
  submitted: boolean;
  proctoring: {
    cameraEnabled: boolean;
    screenShareEnabled: boolean;
    lockdownEnabled: boolean;
  };
}

export function StudentExamInterface({ examId, onComplete }: { examId: string; onComplete: () => void }) {
  const [examState, setExamState] = useState<ExamState>({
    id: examId,
    title: 'Advanced Mathematics Final Exam',
    description: 'Comprehensive examination covering algebra, calculus, and geometry',
    totalQuestions: 15,
    currentQuestion: 0,
    timeRemaining: 5400, // 90 minutes in seconds
    questions: [
      {
        id: '1',
        type: 'mcq-single',
        title: 'Derivative Calculation',
        content: 'What is the derivative of f(x) = x² + 3x - 2?',
        points: 4,
        options: [
          { id: 'a', text: '2x + 3' },
          { id: 'b', text: 'x² + 3' },
          { id: 'c', text: '2x - 2' },
          { id: 'd', text: 'x + 3' }
        ],
        flagged: false
      },
      {
        id: '2',
        type: 'mcq-multiple',
        title: 'Prime Numbers',
        content: 'Which of the following are prime numbers?',
        points: 6,
        options: [
          { id: 'a', text: '17' },
          { id: 'b', text: '21' },
          { id: 'c', text: '23' },
          { id: 'd', text: '25' },
          { id: 'e', text: '29' }
        ],
        flagged: false
      },
      {
        id: '3',
        type: 'true-false',
        title: 'Mathematical Statement',
        content: 'The sum of angles in any triangle is always 180 degrees.',
        points: 2,
        flagged: false
      },
      {
        id: '4',
        type: 'short-answer',
        title: 'Area Calculation',
        content: 'Calculate the area of a circle with radius 5 units. Round to 2 decimal places.',
        points: 5,
        flagged: false
      },
      {
        id: '5',
        type: 'numeric',
        title: 'Equation Solution',
        content: 'Solve for x: 3x + 7 = 22',
        points: 3,
        metadata: { tolerance: 0.1, unit: '' },
        flagged: false
      },
      {
        id: '6',
        type: 'fill-blank',
        title: 'Complete the Formula',
        content: 'The quadratic formula is x = (-b ± √(b² - [blank1])) / [blank2]',
        points: 4,
        metadata: { blanks: 2 },
        flagged: false
      },
      {
        id: '7',
        type: 'matching',
        title: 'Mathematical Concepts',
        content: 'Match the mathematical operation with its symbol:',
        points: 5,
        metadata: {
          leftItems: ['Addition', 'Multiplication', 'Division', 'Square Root'],
          rightItems: ['÷', '√', '+', '×']
        },
        flagged: false
      },
      {
        id: '8',
        type: 'ordering',
        title: 'Steps in Order',
        content: 'Arrange the steps to solve a quadratic equation in the correct order:',
        points: 6,
        metadata: {
          items: [
            'Identify coefficients a, b, and c',
            'Apply the quadratic formula',
            'Simplify the expression under the square root',
            'Calculate the two possible solutions'
          ]
        },
        flagged: false
      },
      {
        id: '9',
        type: 'code-editor',
        title: 'Programming Problem',
        content: 'Write a function to calculate the factorial of a number:',
        points: 10,
        metadata: {
          language: 'python',
          template: 'def factorial(n):\n    # Your code here\n    pass'
        },
        flagged: false
      },
      {
        id: '10',
        type: 'long-answer',
        title: 'Proof Problem',
        content: 'Prove that the square root of 2 is irrational. Provide a complete mathematical proof.',
        points: 15,
        metadata: { minWords: 100, maxWords: 500 },
        flagged: false
      }
    ],
    answers: {},
    flaggedQuestions: [],
    submitted: false,
    proctoring: {
      cameraEnabled: true,
      screenShareEnabled: true,
      lockdownEnabled: true
    }
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [proctoringActive, setProctoringActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setExamState(prev => {
        if (prev.timeRemaining <= 0) {
          clearInterval(timer);
          handleSubmitExam();
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Proctoring setup
  useEffect(() => {
    if (examState.proctoring.cameraEnabled) {
      setupCamera();
    }
    if (examState.proctoring.lockdownEnabled) {
      setupLockdown();
    }
  }, []);

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: examState.proctoring.screenShareEnabled 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setProctoringActive(true);
      }
    } catch (error) {
      console.error('Camera setup failed:', error);
      setWarningMessage('Camera access required for this exam. Please enable camera permissions.');
      setShowWarning(true);
    }
  };

  const setupLockdown = () => {
    // Prevent context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Detect tab switches
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        setWarningMessage('Tab switching detected. Please stay focused on the exam.');
        setShowWarning(true);
      }
    });

    // Prevent copy/paste
    document.addEventListener('copy', (e) => {
      e.preventDefault();
      setWarningMessage('Copying is not allowed during the exam.');
      setShowWarning(true);
    });

    document.addEventListener('paste', (e) => {
      e.preventDefault();
      setWarningMessage('Pasting is not allowed during the exam.');
      setShowWarning(true);
    });

    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = examState.questions[examState.currentQuestion];

  const handleAnswerChange = (questionId: string, answer: any) => {
    setExamState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));
  };

  const handleFlagQuestion = (questionId: string) => {
    setExamState(prev => ({
      ...prev,
      flaggedQuestions: prev.flaggedQuestions.includes(questionId)
        ? prev.flaggedQuestions.filter(id => id !== questionId)
        : [...prev.flaggedQuestions, questionId]
    }));
  };

  const navigateToQuestion = (index: number) => {
    setExamState(prev => ({
      ...prev,
      currentQuestion: Math.max(0, Math.min(index, prev.totalQuestions - 1))
    }));
  };

  const handleSubmitExam = () => {
    setExamState(prev => ({ ...prev, submitted: true }));
    onComplete();
  };

  const renderQuestionContent = () => {
    const answer = examState.answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'mcq-single':
        return (
          <RadioGroup 
            value={answer || ''} 
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'mcq-multiple':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={option.id}
                  checked={(answer || []).includes(option.id)}
                  onCheckedChange={(checked) => {
                    const newAnswer = answer || [];
                    if (checked) {
                      handleAnswerChange(currentQuestion.id, [...newAnswer, option.id]);
                    } else {
                      handleAnswerChange(currentQuestion.id, newAnswer.filter((id: string) => id !== option.id));
                    }
                  }}
                />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <RadioGroup 
            value={answer || ''} 
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
              </div>
            </div>
          </RadioGroup>
        );

      case 'short-answer':
        return (
          <Textarea
            value={answer || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder="Enter your answer here..."
            rows={4}
            className="w-full"
          />
        );

      case 'long-answer':
        return (
          <div className="space-y-4">
            <Textarea
              value={answer || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Enter your detailed answer here..."
              rows={10}
              className="w-full"
            />
            {currentQuestion.metadata?.minWords && (
              <div className="text-sm text-muted-foreground">
                Word count: {(answer || '').split(' ').filter(word => word.length > 0).length} / {currentQuestion.metadata.minWords} minimum
              </div>
            )}
          </div>
        );

      case 'numeric':
        return (
          <div className="space-y-4">
            <Input
              type="number"
              value={answer || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Enter numeric answer"
              className="w-full"
            />
            {currentQuestion.metadata?.unit && (
              <div className="text-sm text-muted-foreground">
                Unit: {currentQuestion.metadata.unit}
              </div>
            )}
          </div>
        );

      case 'fill-blank':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div dangerouslySetInnerHTML={{ 
                __html: currentQuestion.content.replace(/\[blank(\d+)\]/g, 
                  (match, num) => `<input type="text" class="inline-input" placeholder="Answer ${num}" data-blank="${num}" style="border: none; border-bottom: 2px solid #ccc; background: transparent; width: 100px; margin: 0 5px;" />`)
              }} />
            </div>
            <div className="space-y-2">
              {Array.from({ length: currentQuestion.metadata?.blanks || 1 }, (_, i) => (
                <Input
                  key={i}
                  placeholder={`Answer ${i + 1}`}
                  value={(answer || [])[i] || ''}
                  onChange={(e) => {
                    const newAnswer = [...(answer || [])];
                    newAnswer[i] = e.target.value;
                    handleAnswerChange(currentQuestion.id, newAnswer);
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'matching':
        return (
          <MatchingQuestion 
            question={currentQuestion}
            answer={answer}
            onChange={(newAnswer) => handleAnswerChange(currentQuestion.id, newAnswer)}
          />
        );

      case 'ordering':
        return (
          <OrderingQuestion 
            question={currentQuestion}
            answer={answer}
            onChange={(newAnswer) => handleAnswerChange(currentQuestion.id, newAnswer)}
          />
        );

      case 'code-editor':
        return (
          <CodeEditor 
            question={currentQuestion}
            answer={answer}
            onChange={(newAnswer) => handleAnswerChange(currentQuestion.id, newAnswer)}
          />
        );

      default:
        return (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-muted-foreground">Question type not implemented in interface</p>
          </div>
        );
    }
  };

  if (examState.submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Exam Submitted!</h2>
            <p className="text-muted-foreground">
              Your exam has been successfully submitted. You will receive your results shortly.
            </p>
            <Button onClick={onComplete} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Proctoring Video (Hidden but active) */}
      {proctoringActive && (
        <video
          ref={videoRef}
          autoPlay
          muted
          className="fixed top-4 right-4 w-32 h-24 border rounded-lg z-50 opacity-75"
        />
      )}

      {/* Exam Header */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{examState.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {examState.currentQuestion + 1} of {examState.totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className={`font-mono font-bold ${
                  examState.timeRemaining < 300 ? 'text-red-500' : 'text-foreground'
                }`}>
                  {formatTime(examState.timeRemaining)}
                </span>
              </div>
              
              {/* Calculator Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalculator(true)}
              >
                <Calculator className="h-4 w-4" />
              </Button>
              
              {/* Submit Button */}
              <Button
                onClick={handleSubmitExam}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Exam
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <Progress 
              value={(examState.currentQuestion / examState.totalQuestions) * 100} 
              className="h-2"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {examState.questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={examState.currentQuestion === index ? "default" : "outline"}
                      size="sm"
                      className={`relative ${
                        examState.answers[examState.questions[index].id] ? 'border-green-500' : ''
                      } ${
                        examState.flaggedQuestions.includes(examState.questions[index].id) ? 'border-orange-500' : ''
                      }`}
                      onClick={() => navigateToQuestion(index)}
                    >
                      {index + 1}
                      {examState.answers[examState.questions[index].id] && (
                        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-background rounded-full" />
                      )}
                      {examState.flaggedQuestions.includes(examState.questions[index].id) && (
                        <Flag className="absolute -top-1 -right-1 h-3 w-3 text-orange-500 bg-background rounded-full" />
                      )}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Circle className="h-3 w-3 text-muted-foreground" />
                    <span>Not answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="h-3 w-3 text-orange-500" />
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={examState.currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {currentQuestion.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {currentQuestion.points} points
                        </Badge>
                        {currentQuestion.timeLimit && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {currentQuestion.timeLimit}m
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagQuestion(currentQuestion.id)}
                      className={examState.flaggedQuestions.includes(currentQuestion.id) ? 'text-orange-500' : ''}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{currentQuestion.content}</p>
                  </div>
                  
                  {renderQuestionContent()}
                </CardContent>
              </Card>
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => navigateToQuestion(examState.currentQuestion - 1)}
                disabled={examState.currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Save current answer logic here
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                
                <Button
                  onClick={() => navigateToQuestion(examState.currentQuestion + 1)}
                  disabled={examState.currentQuestion === examState.totalQuestions - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <Dialog open={showWarning} onOpenChange={setShowWarning}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Exam Warning
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>{warningMessage}</p>
                <div className="flex justify-end">
                  <Button onClick={() => setShowWarning(false)}>
                    Understood
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Calculator</DialogTitle>
              </DialogHeader>
              <Calculator onClose={() => setShowCalculator(false)} />
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

// Supporting Components
function MatchingQuestion({ question, answer, onChange }: any) {
  const [matches, setMatches] = useState(answer || {});

  const handleMatch = (leftItem: string, rightItem: string) => {
    const newMatches = { ...matches, [leftItem]: rightItem };
    setMatches(newMatches);
    onChange(newMatches);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h4 className="font-medium">Items</h4>
        {question.metadata?.leftItems?.map((item: string, index: number) => (
          <div key={index} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
            {item}
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h4 className="font-medium">Match with</h4>
        {question.metadata?.rightItems?.map((item: string, index: number) => (
          <div key={index} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderingQuestion({ question, answer, onChange }: any) {
  const [items, setItems] = useState(answer || question.metadata?.items || []);

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      {items.map((item: string, index: number) => (
        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveItem(index, index - 1)}
              disabled={index === 0}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveItem(index, index + 1)}
              disabled={index === items.length - 1}
            >
              ↓
            </Button>
          </div>
          <div className="flex-1">{item}</div>
          <div className="text-sm text-muted-foreground">{index + 1}</div>
        </div>
      ))}
    </div>
  );
}

function CodeEditor({ question, answer, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">{question.metadata?.language || 'javascript'}</Badge>
        <Button variant="outline" size="sm">
          <Code className="h-4 w-4 mr-2" />
          Run Code
        </Button>
      </div>
      <Textarea
        value={answer || question.metadata?.template || ''}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-sm"
        rows={15}
        placeholder="Enter your code here..."
      />
    </div>
  );
}

function Calculator({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNext) {
      setDisplay(num);
      setWaitingForNext(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNext(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNext(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNext(false);
  };

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      <div className="col-span-4 p-3 bg-muted rounded-lg text-right text-lg font-mono mb-2">
        {display}
      </div>
      
      <Button variant="outline" onClick={clear}>C</Button>
      <Button variant="outline" onClick={() => setDisplay(display.slice(0, -1) || '0')}>⌫</Button>
      <Button variant="outline" onClick={() => inputOperation('÷')}>÷</Button>
      <Button variant="outline" onClick={() => inputOperation('×')}>×</Button>
      
      <Button variant="outline" onClick={() => inputNumber('7')}>7</Button>
      <Button variant="outline" onClick={() => inputNumber('8')}>8</Button>
      <Button variant="outline" onClick={() => inputNumber('9')}>9</Button>
      <Button variant="outline" onClick={() => inputOperation('-')}>-</Button>
      
      <Button variant="outline" onClick={() => inputNumber('4')}>4</Button>
      <Button variant="outline" onClick={() => inputNumber('5')}>5</Button>
      <Button variant="outline" onClick={() => inputNumber('6')}>6</Button>
      <Button variant="outline" onClick={() => inputOperation('+')}>+</Button>
      
      <Button variant="outline" onClick={() => inputNumber('1')}>1</Button>
      <Button variant="outline" onClick={() => inputNumber('2')}>2</Button>
      <Button variant="outline" onClick={() => inputNumber('3')}>3</Button>
      <Button variant="default" className="row-span-2" onClick={performCalculation}>=</Button>
      
      <Button variant="outline" className="col-span-2" onClick={() => inputNumber('0')}>0</Button>
      <Button variant="outline" onClick={() => inputNumber('.')}>.</Button>
    </div>
  );
}