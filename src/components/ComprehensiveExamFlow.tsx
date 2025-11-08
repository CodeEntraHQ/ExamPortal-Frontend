import React, { useState, useEffect, useRef } from 'react';
import { getExamById, getQuestions, BackendExam } from '../services/api/exam';
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
  CheckCircle,
  Circle,
  Calculator,
  Code,
  Target,
  Award,
  TrendingUp,
  FileText,
  Play,
  Shield,
  Settings,
  Wifi,
  Battery,
  Volume2,
  RefreshCw
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

interface ExamConfiguration {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  duration: number; // in minutes
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  allowCalculator: boolean;
  allowBackNavigation: boolean;
  showResultsImmediately: boolean;
  proctoring: {
    cameraRequired: boolean;
    microphoneRequired: boolean;
    screenLockRequired: boolean;
    tabSwitchDetection: boolean;
  };
  questions: Question[];
}

interface ExamState {
  phase: 'setup' | 'instructions' | '2fa' | 'active' | 'submitted' | 'results';
  currentQuestion: number;
  timeRemaining: number;
  answers: Record<string, any>;
  flaggedQuestions: string[];
  startTime: Date;
  endTime?: Date;
  score?: number;
  passed?: boolean;
  feedback?: string;
}

interface ComprehensiveExamFlowProps {
  examId: string;
  onComplete: () => void;
  onCancel?: () => void;
}

export function ComprehensiveExamFlow({ examId, onComplete, onCancel }: ComprehensiveExamFlowProps) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [examConfig, setExamConfig] = useState<ExamConfiguration | null>(null);
  const [loadingExam, setLoadingExam] = useState(true);
  const [examError, setExamError] = useState<string | null>(null);
  
  // Initialize examState with default values (will be updated when examConfig loads)
  const [examState, setExamState] = useState<ExamState>({
    phase: 'setup',
    currentQuestion: 0,
    timeRemaining: 3600, // Default 60 minutes, will be updated
    answers: {},
    flaggedQuestions: [],
    startTime: new Date()
  });

  const [systemChecks, setSystemChecks] = useState({
    camera: false,
    microphone: false,
    connection: false,
    screenLock: false
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [proctoringActive, setProctoringActive] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [twoFactorEnabled] = useState(true); // Mock - in real app this would come from user profile
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch exam data from backend
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoadingExam(true);
        setExamError(null);
        
        // Fetch exam details
        const examResponse = await getExamById(examId);
        const exam: BackendExam = examResponse.payload;
        
        // Fetch questions
        const questionsResponse = await getQuestions(examId, 1, 100); // Get all questions
        const questions = questionsResponse.payload.questions;

        // Transform backend data to ExamConfiguration format
        const metadata = exam.metadata || {};
        const instructions = Array.isArray(metadata.instructions) 
          ? metadata.instructions 
          : metadata.instructions 
            ? [metadata.instructions] 
            : ['Please read all instructions carefully before starting the exam.'];

        // Transform questions to match Question interface
        const isMultipleCorrect = metadata.isMultipleCorrect || false;
        const transformedQuestions: Question[] = questions.map((q, index) => {
          const qMetadata = q.metadata || {};
          const options = qMetadata.options || [];
          
          return {
            id: q.id,
            type: q.type === 'MCQ' ? (isMultipleCorrect ? 'mcq-multiple' : 'mcq-single') : 'short-answer',
            title: `Question ${index + 1}`,
            content: q.question_text,
            points: qMetadata.points || 10,
            timeLimit: qMetadata.timeLimit,
            options: options.map((opt: any, optIndex: number) => ({
              id: String.fromCharCode(97 + optIndex), // a, b, c, d, etc.
              text: opt.text || opt.toString(),
            })),
            metadata: qMetadata,
            answer: undefined,
            flagged: false,
          };
        });

        const config: ExamConfiguration = {
          id: exam.id,
          title: exam.title,
          description: metadata.description || exam.title,
          instructions: instructions,
          duration: Math.floor(exam.duration_seconds / 60), // Convert to minutes
          totalQuestions: transformedQuestions.length,
          totalPoints: metadata.totalMarks || transformedQuestions.length * 10,
          passingScore: metadata.passingMarks 
            ? Math.round((metadata.passingMarks / (metadata.totalMarks || 100)) * 100)
            : 70,
          allowCalculator: metadata.allowCalculator !== false, // Default true
          allowBackNavigation: metadata.allowBackNavigation !== false, // Default true
          showResultsImmediately: metadata.showResultsImmediately !== false, // Default true
          proctoring: {
            cameraRequired: metadata.proctoring?.cameraRequired || false,
            microphoneRequired: metadata.proctoring?.microphoneRequired || false,
            screenLockRequired: metadata.proctoring?.screenLockRequired || false,
            tabSwitchDetection: metadata.proctoring?.tabSwitchDetection || false,
          },
          questions: transformedQuestions,
        };

        setExamConfig(config);
      } catch (error: any) {
        console.error('Failed to fetch exam data:', error);
        setExamError(error.message || 'Failed to load exam. Please try again.');
      } finally {
        setLoadingExam(false);
      }
    };

    fetchExamData();
  }, [examId]);

  // Update examState when examConfig is loaded
  useEffect(() => {
    if (examConfig) {
      setExamState(prev => ({
        ...prev,
        timeRemaining: examConfig.duration * 60,
      }));
    }
  }, [examConfig]);

  // Define handlers before useEffect that might use them
  const handleTabSwitch = () => {
    if (document.hidden && examState.phase === 'active') {
      setWarningMessage('Tab switching detected. Please stay focused on the exam.');
      setShowWarning(true);
    }
  };

  const calculateScore = () => {
    if (!examConfig) return 0;
    
    let totalScore = 0;
    let maxScore = 0;

    examConfig.questions.forEach(question => {
      maxScore += question.points;
      const answer = examState.answers[question.id];
      
      if (!answer) return;

      // Simple scoring logic - in real app this would be more sophisticated
      switch (question.type) {
        case 'mcq-single':
        case 'true-false':
          if (answer === 'a' || answer === 'true') { // Mock correct answers
            totalScore += question.points;
          }
          break;
        case 'mcq-multiple':
          if (Array.isArray(answer) && answer.includes('a')) { // Mock partial credit
            totalScore += question.points * 0.8;
          }
          break;
        case 'short-answer':
        case 'long-answer':
        case 'numeric':
          if (answer && answer.length > 0) {
            totalScore += question.points * 0.9; // Mock grading
          }
          break;
        default:
          if (answer) {
            totalScore += question.points * 0.85; // Mock scoring
          }
      }
    });

    return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  };

  const handleSubmitExam = () => {
    if (!examConfig) return;
    
    const score = calculateScore();
    const passed = score >= examConfig.passingScore;
    
    setExamState(prev => ({
      ...prev,
      phase: examConfig.showResultsImmediately ? 'results' : 'submitted',
      endTime: new Date(),
      score,
      passed
    }));

    // Clean up proctoring
    document.removeEventListener('visibilitychange', handleTabSwitch);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Timer effect - only active during exam
  useEffect(() => {
    if (examState.phase !== 'active') return;

    const timer = setInterval(() => {
      setExamState(prev => {
        if (prev.timeRemaining <= 0) {
          clearInterval(timer);
          return { ...prev, phase: 'submitted', endTime: new Date() };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState.phase]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (examState.phase === 'submitted' && !examState.endTime) {
      handleSubmitExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examState.phase]);

  const performSystemChecks = async () => {
    if (!examConfig) return;
    
    // Check internet connection
    setSystemChecks(prev => ({ ...prev, connection: navigator.onLine }));

    // Check camera if required
    if (examConfig.proctoring.cameraRequired) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setSystemChecks(prev => ({ ...prev, camera: true }));
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setProctoringActive(true);
        }
      } catch (error) {
        setSystemChecks(prev => ({ ...prev, camera: false }));
        setWarningMessage('Camera access is required for this exam. Please enable camera permissions.');
        setShowWarning(true);
      }
    } else {
      setSystemChecks(prev => ({ ...prev, camera: true }));
    }

    // Check microphone if required
    if (examConfig.proctoring.microphoneRequired) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setSystemChecks(prev => ({ ...prev, microphone: true }));
      } catch (error) {
        setSystemChecks(prev => ({ ...prev, microphone: false }));
      }
    } else {
      setSystemChecks(prev => ({ ...prev, microphone: true }));
    }

    // Screen lock capability
    setSystemChecks(prev => ({ ...prev, screenLock: !!document.documentElement.requestFullscreen }));
  };

  const startExam = () => {
    // Start exam directly without 2FA
    beginActiveExam();
  };

  const beginActiveExam = () => {
    if (!examConfig) return;
    
    setExamState(prev => ({ 
      ...prev, 
      phase: 'active', 
      startTime: new Date() 
    }));

    // Enable proctoring features
    if (examConfig.proctoring.screenLockRequired) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    }

    if (examConfig.proctoring.tabSwitchDetection) {
      document.addEventListener('visibilitychange', handleTabSwitch);
    }
  };

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
    if (!examConfig) return;
    setExamState(prev => ({
      ...prev,
      currentQuestion: Math.max(0, Math.min(index, examConfig.totalQuestions - 1))
    }));
  };

  const handleCancelExam = () => {
    // Clean up any proctoring
    document.removeEventListener('visibilitychange', handleTabSwitch);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    if (onCancel) {
      onCancel();
    } else {
      onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state - AFTER all hooks
  if (loadingExam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold">Loading Exam...</h2>
            <p className="text-muted-foreground">Please wait while we load the exam details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state - AFTER all hooks
  if (examError || !examConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Error Loading Exam</h2>
            <p className="text-muted-foreground">{examError || 'Exam not found'}</p>
            <div className="flex gap-3 justify-center mt-6">
              <Button onClick={onCancel || onComplete} variant="outline">
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render different phases - examConfig is guaranteed to be non-null here
  if (examState.phase === 'setup') {
    return <ExamSetupPhase 
      examConfig={examConfig}
      systemChecks={systemChecks}
      onSystemCheck={performSystemChecks}
      onProceedToInstructions={() => setExamState(prev => ({ ...prev, phase: 'instructions' }))}
    />;
  }

  if (examState.phase === 'instructions') {
    return <ExamInstructionsPhase 
      examConfig={examConfig}
      onStartExam={startExam}
      onBackToSetup={() => setExamState(prev => ({ ...prev, phase: 'setup' }))}
    />;
  }

  if (examState.phase === 'active') {
    return <ActiveExamPhase 
      examConfig={examConfig}
      examState={examState}
      onAnswerChange={handleAnswerChange}
      onFlagQuestion={handleFlagQuestion}
      onNavigateToQuestion={navigateToQuestion}
      onSubmitExam={handleSubmitExam}
      onCancelExam={() => setShowCancelDialog(true)}
      formatTime={formatTime}
      showCalculator={showCalculator}
      setShowCalculator={setShowCalculator}
      showWarning={showWarning}
      setShowWarning={setShowWarning}
      warningMessage={warningMessage}
      proctoringActive={proctoringActive}
      videoRef={videoRef}
      showCancelDialog={showCancelDialog}
      setShowCancelDialog={setShowCancelDialog}
      onConfirmCancel={handleCancelExam}
    />;
  }

  if (examState.phase === 'submitted') {
    return <ExamSubmittedPhase onComplete={onComplete} />;
  }

  if (examState.phase === 'results') {
    return <ExamResultsPhase 
      examConfig={examConfig}
      examState={examState}
      onComplete={onComplete}
    />;
  }

  return null;
}

// Phase Components
function TwoFactorAuthPhase({ onVerified, onCancel }: any) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Mock verification - in real app this would call backend
    setTimeout(() => {
      if (code === '123456') {
        onVerified();
      } else {
        setError('Invalid verification code. Please try again.');
        setCode('');
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleResendCode = () => {
    // Mock resend functionality
    console.log('Resending 2FA code...');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A verification code has been sent to your registered device. This helps ensure exam security.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="2fa-code">Verification Code</Label>
                <Input
                  id="2fa-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                    setError('');
                  }}
                  placeholder="Enter 6-digit code"
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  className="text-primary hover:text-primary/80"
                >
                  Didn't receive a code? Resend
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={onCancel} variant="outline" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleVerify}
                disabled={code.length !== 6 || isVerifying}
                className="flex-1"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ExamSetupPhase({ examConfig, systemChecks, onSystemCheck, onProceedToInstructions }: any) {
  const allChecksComplete = Object.values(systemChecks).every(check => check === true);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Exam Setup</CardTitle>
            <CardDescription>
              Please complete the system checks before starting your exam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{examConfig.title}</h3>
              <p className="text-muted-foreground">{examConfig.description}</p>
            </div>

            {/* Exam Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{examConfig.duration}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{examConfig.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>

            {/* System Checks */}
            <div className="space-y-4">
              <h4 className="font-medium">System Requirements</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5" />
                    <span>Internet Connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {systemChecks.connection ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {examConfig.proctoring.cameraRequired && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Camera className="h-5 w-5" />
                      <span>Camera Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {systemChecks.camera ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                )}

                {examConfig.proctoring.microphoneRequired && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mic className="h-5 w-5" />
                      <span>Microphone Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {systemChecks.microphone ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5" />
                    <span>Fullscreen Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {systemChecks.screenLock ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={onSystemCheck} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run System Check
                </Button>
                <Button 
                  onClick={onProceedToInstructions}
                  disabled={!allChecksComplete}
                  className="flex-1"
                >
                  Continue to Instructions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ExamInstructionsPhase({ examConfig, onStartExam, onBackToSetup }: any) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-1">Exam Instructions</CardTitle>
            <CardDescription className="text-base">
              Please read all instructions carefully before starting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Exam Title */}
            <div className="text-center pb-4 border-b">
              <h3 className="text-xl font-semibold mb-3">{examConfig.title}</h3>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{examConfig.duration} minutes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">{examConfig.totalQuestions} questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">{examConfig.totalPoints} points</span>
                </div>
              </div>
            </div>

            {/* Instructions List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base">Important Instructions:</h4>
              <div className="space-y-2.5">
                {examConfig.instructions.map((instruction: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed flex-1">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-2 pt-2 pb-1">
              <Checkbox 
                id="agree-terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="agree-terms" className="text-sm leading-relaxed cursor-pointer">
                I have read and understood all the instructions and agree to the exam terms and conditions
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button onClick={onBackToSetup} variant="outline" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={onStartExam}
                disabled={!agreedToTerms}
                className="flex-1 bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ActiveExamPhase({ examConfig, examState, onAnswerChange, onFlagQuestion, onNavigateToQuestion, onSubmitExam, onCancelExam, formatTime, showCalculator, setShowCalculator, showWarning, setShowWarning, warningMessage, proctoringActive, videoRef, showCancelDialog, setShowCancelDialog, onConfirmCancel }: any) {
  const currentQuestion = examConfig.questions[examState.currentQuestion];

  const renderQuestionContent = () => {
    const answer = examState.answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'mcq-single':
        return (
          <RadioGroup 
            value={answer || ''} 
            onValueChange={(value) => onAnswerChange(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {currentQuestion.options?.map((option: any) => (
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
            {currentQuestion.options?.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={option.id}
                  checked={(answer || []).includes(option.id)}
                  onCheckedChange={(checked) => {
                    const newAnswer = answer || [];
                    if (checked) {
                      onAnswerChange(currentQuestion.id, [...newAnswer, option.id]);
                    } else {
                      onAnswerChange(currentQuestion.id, newAnswer.filter((id: string) => id !== option.id));
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
            onValueChange={(value) => onAnswerChange(currentQuestion.id, value)}
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
            onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
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
              onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Enter your detailed answer here..."
              rows={10}
              className="w-full"
            />
            {currentQuestion.metadata?.minWords && (
              <div className="text-sm text-muted-foreground">
                Word count: {(answer || '').split(' ').filter((word: string) => word.length > 0).length} / {currentQuestion.metadata.minWords} minimum
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
              onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
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
                  (match: string, num: string) => `<span class="inline-block w-32 border-b-2 border-primary mx-2 text-center font-medium">___${num}___</span>`
                )
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
                    onAnswerChange(currentQuestion.id, newAnswer);
                  }}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-muted-foreground">Question type: {currentQuestion.type}</p>
            <Textarea
              value={answer || ''}
              onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Enter your answer here..."
              rows={4}
              className="w-full mt-4"
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Proctoring Video */}
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
              <h1 className="text-xl font-bold">{examConfig.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {examState.currentQuestion + 1} of {examConfig.totalQuestions}
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
              {examConfig.allowCalculator && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCalculator(true)}
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              )}
              
              {/* Cancel Button */}
              <Button
                onClick={onCancelExam}
                variant="outline"
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Cancel Exam
              </Button>

              {/* Submit Button */}
              <Button
                onClick={onSubmitExam}
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
              value={(examState.currentQuestion / examConfig.totalQuestions) * 100} 
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
                  {examConfig.questions.map((_: any, index: number) => (
                    <Button
                      key={index}
                      variant={examState.currentQuestion === index ? "default" : "outline"}
                      size="sm"
                      className={`relative ${
                        examState.answers[examConfig.questions[index].id] ? 'border-green-500' : ''
                      } ${
                        examState.flaggedQuestions.includes(examConfig.questions[index].id) ? 'border-orange-500' : ''
                      }`}
                      onClick={() => onNavigateToQuestion(index)}
                    >
                      {index + 1}
                      {examState.answers[examConfig.questions[index].id] && (
                        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-background rounded-full" />
                      )}
                      {examState.flaggedQuestions.includes(examConfig.questions[index].id) && (
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
                      onClick={() => onFlagQuestion(currentQuestion.id)}
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
                onClick={() => onNavigateToQuestion(examState.currentQuestion - 1)}
                disabled={examState.currentQuestion === 0 || !examConfig.allowBackNavigation}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Auto-save logic here
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                
                <Button
                  onClick={() => onNavigateToQuestion(examState.currentQuestion + 1)}
                  disabled={examState.currentQuestion === examConfig.totalQuestions - 1}
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
              <ExamCalculator onClose={() => setShowCalculator(false)} />
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Dialog */}
      <AnimatePresence>
        {showCancelDialog && (
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Cancel Exam
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to cancel this exam?</p>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> Canceling will forfeit your exam attempt. Your current progress will not be saved and this attempt will be recorded as incomplete.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Continue Exam
                  </Button>
                  <Button variant="destructive" onClick={onConfirmCancel}>
                    Yes, Cancel Exam
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExamSubmittedPhase({ onComplete }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Send className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Exam Submitted!</h2>
          <p className="text-muted-foreground">
            Your exam has been successfully submitted. Your instructor will review your answers and provide results soon.
          </p>
          <Button onClick={onComplete} className="w-full">
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ExamResultsPhase({ examConfig, examState, onComplete }: any) {
  const scorePercentage = examState.score || 0;
  const gradeLevel = scorePercentage >= 90 ? 'Excellent' : 
                    scorePercentage >= 80 ? 'Good' : 
                    scorePercentage >= 70 ? 'Average' : 'Needs Improvement';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              examState.passed ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              {examState.passed ? (
                <CheckCircle className="h-10 w-10 text-success" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-destructive" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {examState.passed ? 'Congratulations!' : 'Exam Complete'}
            </h1>
            <p className="text-muted-foreground">
              You have completed {examConfig.title}
            </p>
          </CardContent>
        </Card>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {scorePercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className={`text-3xl font-bold mb-2 ${
                examState.passed ? 'text-success' : 'text-destructive'
              }`}>
                {examState.passed ? 'PASSED' : 'FAILED'}
              </div>
              <p className="text-sm text-muted-foreground">
                Required: {examConfig.passingScore}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {gradeLevel}
              </div>
              <p className="text-sm text-muted-foreground">Performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Summary</CardTitle>
            <CardDescription>
              Review your performance on this exam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold">{examConfig.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {Object.keys(examState.answers).length}
                </div>
                <div className="text-sm text-muted-foreground">Attempted</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {examState.flaggedQuestions.length}
                </div>
                <div className="text-sm text-muted-foreground">Flagged</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {Math.floor((examConfig.duration * 60 - examState.timeRemaining) / 60)}m
                </div>
                <div className="text-sm text-muted-foreground">Time Used</div>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium">Performance by Question Type</h4>
              <div className="space-y-3">
                {['mcq-single', 'mcq-multiple', 'short-answer', 'true-false'].map(type => {
                  const questionsOfType = examConfig.questions.filter((q: Question) => q.type === type);
                  const answeredOfType = questionsOfType.filter((q: Question) => examState.answers[q.id]);
                  
                  if (questionsOfType.length === 0) return null;
                  
                  return (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">
                          {type.replace('-', ' ').replace('mcq', 'Multiple Choice')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {answeredOfType.length} of {questionsOfType.length} answered
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {((answeredOfType.length / questionsOfType.length) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {scorePercentage < 70 && (
                  <>
                    <li>• Review the exam material and practice similar questions</li>
                    <li>• Consider scheduling a study session with your instructor</li>
                  </>
                )}
                {examState.flaggedQuestions.length > 0 && (
                  <li>• You flagged {examState.flaggedQuestions.length} questions - review these topics</li>
                )}
                {scorePercentage >= 80 && (
                  <li>• Great performance! Continue with your current study approach</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button onClick={onComplete} size="lg">
            Return to Dashboard
          </Button>
          <Button variant="outline" size="lg">
            Download Results
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Simple Calculator Component
function ExamCalculator({ onClose }: { onClose: () => void }) {
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