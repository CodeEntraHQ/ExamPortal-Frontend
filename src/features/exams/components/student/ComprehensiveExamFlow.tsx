import React, { useState, useEffect, useRef } from 'react';
import { getExamById, getQuestions, BackendExam, BackendQuestion, startExam, saveAnswer, deleteAnswer, submitExam, getSubmissions } from '../../../../services/api/exam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../shared/components/ui/card';
import { Button } from '../../../../shared/components/ui/button';
import { Progress } from '../../../../shared/components/ui/progress';
import { Alert, AlertDescription } from '../../../../shared/components/ui/alert';
import { Badge } from '../../../../shared/components/ui/badge';
import { Input } from '../../../../shared/components/ui/input';
import { Textarea } from '../../../../shared/components/ui/textarea';
import { Checkbox } from '../../../../shared/components/ui/checkbox';
import { Label } from '../../../../shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../shared/components/ui/dialog';
import { ImageWithFallback } from '../../../../shared/components/common/ImageWithFallback';
import { Image as ImageIcon } from 'lucide-react';
import { authenticatedFetch, getApiUrl } from '../../../../services/api/core';
import { 
  Clock,
  Eye,
  Flag,
  ChevronLeft,
  ChevronRight,
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

const QUESTIONS_PAGE_SIZE = 10;

interface Question {
  id: string;
  type: string;
  title: string;
  content: string;
  points: number;
  timeLimit?: number;
  options?: { id: string; text?: string; image_id?: string; image_url?: string }[];
  question_image_id?: string | null;
  question_image_url?: string | null;
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
  startTime: Date | null; // Store the actual started_at from backend
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
    startTime: null // Will be set from backend when exam starts
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
  const [twoFactorEnabled] = useState(true); // Mock - in real app this would come from user profile
  const [showFullscreenExitWarning, setShowFullscreenExitWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchAllExamQuestions = async (examId: string) => {
    const aggregatedQuestions: BackendQuestion[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
      const response = await getQuestions(examId, currentPage, QUESTIONS_PAGE_SIZE);
      const { questions = [], totalPages: serverTotalPages, total, limit } = response.payload;

      aggregatedQuestions.push(...questions);

      const effectiveLimit = limit ?? QUESTIONS_PAGE_SIZE;
      if (serverTotalPages) {
        totalPages = serverTotalPages;
      } else if (typeof total === 'number' && effectiveLimit > 0) {
        totalPages = Math.max(1, Math.ceil(total / effectiveLimit));
      } else if (questions.length < effectiveLimit) {
        break;
      }

      if (questions.length < effectiveLimit) {
        break;
      }

      currentPage += 1;
    }

    return aggregatedQuestions;
  };

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
        const questions = await fetchAllExamQuestions(examId);

        // Check for existing submissions (session management)
        let existingSubmissions: any = {};
        let enrollmentStatus = 'UPCOMING';
        let startedAt: Date | null = null;
        
        try {
          const submissionsResponse = await getSubmissions(examId);
          enrollmentStatus = submissionsResponse.payload.enrollment_status;
          if (submissionsResponse.payload.started_at) {
            startedAt = new Date(submissionsResponse.payload.started_at);
          }
          
          // Restore answers from submissions
          // Note: Answers are stored as text, we'll convert back to IDs for display after questions are transformed
          submissionsResponse.payload.submissions.forEach((sub: any) => {
            existingSubmissions[sub.question_id] = sub.answer;
          });
        } catch (err) {
          // If no submissions exist, that's fine - exam hasn't started yet
        }

        // Transform backend data to ExamConfiguration format
        const metadata = exam.metadata || {};
        const instructions = Array.isArray(metadata.instructions) 
          ? metadata.instructions 
          : metadata.instructions 
            ? [metadata.instructions] 
            : ['Please read all instructions carefully before starting the exam.'];

        // Transform questions to match Question interface
        const transformedQuestions: Question[] = questions.map((q, index) => {
          const qMetadata = q.metadata || {};
          const options = qMetadata.options || [];
          
          // Map backend question types to frontend types
          let questionType: string;
          if (q.type === 'MCQ_SINGLE') {
            questionType = 'mcq-single';
          } else if (q.type === 'MCQ_MULTIPLE') {
            questionType = 'mcq-multiple';
          } else if (q.type === 'SINGLE_WORD') {
            questionType = 'single-word';
          } else {
            // Fallback for any other types
            questionType = 'short-answer';
          }
          
          return {
            id: q.id,
            type: questionType,
            title: `Question ${index + 1}`,
            content: q.question_text,
            points: qMetadata.points || 10,
            timeLimit: qMetadata.timeLimit,
            question_image_id: q.question_image_id || null,
            question_image_url: q.question_image_id || null, // Backend returns URL in question_image_id field
            options: options.map((opt: any, optIndex: number) => ({
              id: String.fromCharCode(65 + optIndex), // A, B, C, D, etc. (uppercase)
              text: opt.text,
              image_id: opt.image_id,
              image_url: opt.image_url,
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
        
        // Convert saved answers (indices/strings) back to IDs for display
        const restoredAnswers: Record<string, any> = {};
        Object.keys(existingSubmissions).forEach(questionId => {
          const question = config.questions.find(q => q.id === questionId);
          if (question) {
            const savedAnswer = existingSubmissions[questionId];
            
            // For MCQ questions, convert index (number) back to ID (A, B, C, D) for display
            if (question.type === 'mcq-single') {
              if (typeof savedAnswer === 'number') {
                // Backend saved as index (0, 1, 2, 3) - convert to ID (A, B, C, D)
                const optionId = String.fromCharCode(65 + savedAnswer); // 0 -> 'A', 1 -> 'B', etc.
                restoredAnswers[questionId] = optionId;
              } else if (typeof savedAnswer === 'string') {
                // Backend might have saved as text (for backward compatibility) or already as ID
                // Try to find option by text first
                const option = question.options?.find(opt => opt.text === savedAnswer);
                if (option) {
                  restoredAnswers[questionId] = option.id;
                } else if (savedAnswer.length === 1 && savedAnswer >= 'A' && savedAnswer <= 'Z') {
                  // Already an ID
                  restoredAnswers[questionId] = savedAnswer;
                } else {
                  restoredAnswers[questionId] = savedAnswer;
                }
              } else {
                restoredAnswers[questionId] = savedAnswer;
              }
            } else if (question.type === 'mcq-multiple') {
              // For multiple choice, convert array of indices to array of IDs
              if (Array.isArray(savedAnswer)) {
                const ids = savedAnswer.map((ans: any) => {
                  if (typeof ans === 'number') {
                    // Backend saved as index - convert to ID
                    return String.fromCharCode(65 + ans);
                  } else if (typeof ans === 'string') {
                    // Backend might have saved as text - try to find option
                    const option = question.options?.find(opt => opt.text === ans);
                    if (option) {
                      return option.id;
                    } else if (ans.length === 1 && ans >= 'A' && ans <= 'Z') {
                      // Already an ID
                      return ans;
                    }
                  }
                  return ans;
                }).filter(id => id !== undefined);
                restoredAnswers[questionId] = ids;
              } else {
                restoredAnswers[questionId] = savedAnswer;
              }
            } else if (question.type === 'single-word') {
              // For SINGLE_WORD, keep as string
              restoredAnswers[questionId] = savedAnswer;
            } else {
              // For other question types (short-answer, true-false, etc.), use as-is
              restoredAnswers[questionId] = savedAnswer;
            }
          } else {
            restoredAnswers[questionId] = existingSubmissions[questionId];
          }
        });
        
        // If exam is ongoing, restore state
        if (enrollmentStatus === 'ONGOING' && startedAt) {
          // Calculate remaining time dynamically from started_at and exam duration
          const now = new Date();
          const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
          const remainingTime = Math.max(0, config.duration * 60 - elapsedSeconds);
          
          setExamState(prev => ({
            ...prev,
            phase: remainingTime > 0 ? 'active' : 'results',
            timeRemaining: remainingTime,
            answers: restoredAnswers, // Use converted answers (IDs for display)
            startTime: startedAt,
          }));
        }
      } catch (error: any) {
        console.error('Failed to fetch exam data:', error);
        setExamError(error.message || 'Failed to load exam. Please try again.');
      } finally {
        setLoadingExam(false);
      }
    };

    fetchExamData();
  }, [examId]);

  // Define handlers before useEffect that might use them
  const handleTabSwitch = () => {
    if (document.hidden && examState.phase === 'active') {
      setWarningMessage('Tab switching detected. Please stay focused on the exam.');
      setShowWarning(true);
    }
  };

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        // Safari support
        await (document.documentElement as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if ((document.documentElement as any).mozRequestFullScreen) {
        // Firefox support
        await (document.documentElement as any).mozRequestFullScreen();
        setIsFullscreen(true);
      } else if ((document.documentElement as any).msRequestFullscreen) {
        // IE/Edge support
        await (document.documentElement as any).msRequestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error);
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

  const handleFullscreenGoBack = async () => {
    setShowFullscreenExitWarning(false);
    await enterFullscreen();
  };

  const handleFullscreenExit = async () => {
    setShowFullscreenExitWarning(false);
    await handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (!examConfig) return;
    
    try {
      // Submit exam to backend
      const submitResponse = await submitExam(examId);
      
      const score = calculateScore();
      const passed = score >= examConfig.passingScore;
      
      setExamState(prev => ({
        ...prev,
        phase: 'results',
        endTime: new Date(),
        score,
        passed
      }));

      // Clean up proctoring
      document.removeEventListener('visibilitychange', handleTabSwitch);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (error: any) {
      console.error('Failed to submit exam:', error);
      setWarningMessage(error.message || 'Failed to submit exam. Please try again.');
      setShowWarning(true);
    }
  };

  // Enter fullscreen when exam becomes active
  useEffect(() => {
    if (examState.phase === 'active' && !isFullscreen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [examState.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fullscreen change listener - only active during exam
  useEffect(() => {
    if (examState.phase !== 'active') return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      // Check if we were in fullscreen and now we're not
      const wasFullscreen = isFullscreen;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && wasFullscreen) {
        // User exited fullscreen - show warning
        setShowFullscreenExitWarning(true);
      }
    };

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [examState.phase, isFullscreen]);

  // Timer effect - only active during exam, calculates remaining time from started_at
  useEffect(() => {
    if (examState.phase !== 'active' || !examConfig || !examState.startTime) return;

    const timer = setInterval(() => {
      // Calculate remaining time dynamically from started_at (from enrollment metadata) and current time
      const now = new Date();
      const startedAt = examState.startTime!;
      const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      const remainingTime = Math.max(0, examConfig.duration * 60 - elapsedSeconds);
      
      if (remainingTime <= 0) {
        clearInterval(timer);
        // Auto-submit when time runs out
        handleSubmitExam();
        setExamState(prev => ({
          ...prev,
          phase: 'results',
          endTime: new Date(),
          timeRemaining: 0
        }));
      } else {
        setExamState(prev => ({
          ...prev,
          timeRemaining: remainingTime
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examState.phase, examState.startTime, examConfig]);

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

  const handleStartExam = async () => {
    if (!examConfig) return;
    
    try {
      // Call backend to start exam and update enrollment status
      const startResponse = await startExam(examId);
      
      // Use the started_at from backend response
      const startedAt = startResponse.payload.started_at 
        ? new Date(startResponse.payload.started_at)
        : new Date();
      
      // Start exam locally with the actual started_at from backend
      beginActiveExam(startedAt);
    } catch (error: any) {
      console.error('Failed to start exam:', error);
      setWarningMessage(error.message || 'Failed to start exam. Please try again.');
      setShowWarning(true);
    }
  };

  const beginActiveExam = (startedAt: Date) => {
    if (!examConfig) return;
    
    // Calculate initial remaining time based on started_at and current time
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
    const initialRemainingTime = Math.max(0, examConfig.duration * 60 - elapsedSeconds);
    
    setExamState(prev => ({ 
      ...prev, 
      phase: initialRemainingTime > 0 ? 'active' : 'results',
      startTime: startedAt,
      timeRemaining: initialRemainingTime
    }));

    // Always enter fullscreen mode when exam starts
    enterFullscreen();

    if (examConfig.proctoring.tabSwitchDetection) {
      document.addEventListener('visibilitychange', handleTabSwitch);
    }
  };

  // Helper function to convert option ID to option text
  const getOptionTextById = (questionId: string, optionId: string): string | null => {
    if (!examConfig) return null;
    const question = examConfig.questions.find(q => q.id === questionId);
    if (!question) return null;
    const option = question.options?.find(opt => opt.id === optionId);
    return option?.text || null;
  };

  // Helper function to convert option text to option ID (for display)
  const getOptionIdByText = (questionId: string, optionText: string): string | null => {
    if (!examConfig) return null;
    const question = examConfig.questions.find(q => q.id === questionId);
    if (!question) return null;
    const option = question.options?.find(opt => opt.text === optionText);
    return option?.id || null;
  };

  // Helper function to convert answer (ID or array of IDs) to text (or array of texts)
  const convertAnswerToIndex = (questionId: string, answer: any): any => {
    if (!answer) return answer;
    
    const question = examConfig?.questions.find(q => q.id === questionId);
    if (!question) return answer;
    
    // For SINGLE_WORD type, return as-is (it's already a string)
    if (question.type === 'single-word') {
      return answer;
    }
    
    // For multiple choice (array of IDs like ['A', 'B'])
    if (Array.isArray(answer)) {
      return answer.map(id => {
        // Convert option ID (A, B, C, D) to index (0, 1, 2, 3)
        const index = id.charCodeAt(0) - 65; // 'A' = 65, so A -> 0, B -> 1, etc.
        return index;
      }).filter(index => index >= 0 && index < (question.options?.length || 0));
    }
    
    // For single choice MCQ, convert ID (A, B, C, D) to index (0, 1, 2, 3)
    if (typeof answer === 'string' && answer.length === 1) {
      const index = answer.charCodeAt(0) - 65; // 'A' = 65, so A -> 0, B -> 1, etc.
      if (index >= 0 && index < (question.options?.length || 0)) {
        return index;
      }
    }
    
    // For true/false, keep as is (it's already text)
    if (answer === 'true' || answer === 'false') {
      return answer;
    }
    
    // Fallback to original if conversion fails
    return answer;
  };


  const handleAnswerChange = async (questionId: string, answer: any) => {
    // Find the question to determine its type
    const question = examConfig?.questions.find(q => q.id === questionId);
    if (!question) return;

    // Check if answer is being deselected (empty string or empty array)
    const isDeselecting = answer === '' || answer === null || answer === undefined || 
                         (Array.isArray(answer) && answer.length === 0);

    // Update local state with the ID (for display purposes)
    // We keep IDs in local state for UI, but save text to backend
    setExamState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));

    // Auto-save to backend if exam is active
    if (examConfig && examState.phase === 'active') {
      try {
        if (isDeselecting) {
          // Delete the submission if answer is being deselected
          await deleteAnswer(examId, questionId);
        } else {
          // Convert answer from ID to index for saving (backend expects indices for MCQ questions)
          const answerToSave = convertAnswerToIndex(questionId, answer);
          await saveAnswer(examId, questionId, answerToSave);
        }
      } catch (error) {
        console.error('Failed to save/delete answer:', error);
        // Don't show error to user for auto-save failures
      }
    }
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
      onStartExam={handleStartExam}
      onBackToSetup={() => setExamState(prev => ({ ...prev, phase: 'setup' }))}
    />;
  }

  if (examState.phase === 'active') {
    return (
      <>
        <ActiveExamPhase 
          examConfig={examConfig}
          examState={examState}
          onAnswerChange={handleAnswerChange}
          onFlagQuestion={handleFlagQuestion}
          onNavigateToQuestion={navigateToQuestion}
          onSubmitExam={handleSubmitExam}
          formatTime={formatTime}
          showCalculator={showCalculator}
          setShowCalculator={setShowCalculator}
          showWarning={showWarning}
          setShowWarning={setShowWarning}
          warningMessage={warningMessage}
          proctoringActive={proctoringActive}
          videoRef={videoRef}
        />
        {/* Fullscreen Exit Warning Dialog */}
        <Dialog open={showFullscreenExitWarning} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Fullscreen Mode Required
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                You have exited fullscreen mode. The exam requires fullscreen mode to be active at all times.
              </p>
              <p className="text-sm font-medium">
                Please choose an option:
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleFullscreenGoBack}
                  className="w-full"
                >
                  Go Back to Fullscreen
                </Button>
                <Button 
                  onClick={handleFullscreenExit}
                  variant="destructive"
                  className="w-full"
                >
                  Exit and Submit Exam
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (examState.phase === 'submitted') {
    return <ExamSubmittedPhase onComplete={onComplete} />;
  }

  if (examState.phase === 'results') {
    return <ExamResultsPhase 
      examConfig={examConfig}
      examState={examState}
      examId={examId}
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

function ActiveExamPhase({ examConfig, examState, onAnswerChange, onFlagQuestion, onNavigateToQuestion, onSubmitExam, formatTime, showCalculator, setShowCalculator, showWarning, setShowWarning, warningMessage, proctoringActive, videoRef }: any) {
  const currentQuestion = examConfig.questions[examState.currentQuestion];

  const renderQuestionContent = () => {
    const answer = examState.answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'mcq-single':
        return (
          <div className="space-y-6">
            {currentQuestion.options?.map((option: any) => {
              const isSelected = answer === option.id;
              return (
                <div 
                  key={option.id} 
                  className={`
                    relative flex items-center gap-6 p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
                    }
                  `}
                  onClick={() => {
                    // Toggle: if already selected, deselect; otherwise select
                    if (isSelected) {
                      onAnswerChange(currentQuestion.id, '');
                    } else {
                      onAnswerChange(currentQuestion.id, option.id);
                    }
                  }}
                >
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    ${isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {option.id}
                  </div>
                  <div className="flex-1 cursor-pointer min-w-0">
                    {option.image_id || option.image_url ? (
                      <div className="w-full rounded-xl border border-border overflow-hidden bg-muted/10">
                        <div className="aspect-video w-full flex items-center justify-center">
                          <ImageWithFallback
                            src={option.image_url || option.image_id}
                            fallback={<ImageIcon className="h-20 w-20 text-muted-foreground" />}
                            alt={`Option ${option.id}`}
                            className="w-full h-full object-contain max-w-full max-h-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-lg leading-relaxed font-medium">{option.text}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'mcq-multiple':
        return (
          <div className="space-y-6">
            {currentQuestion.options?.map((option: any) => {
              // Check if this option ID is in the answer array
              const isChecked = Array.isArray(answer) && answer.includes(option.id);
              return (
                <div 
                  key={option.id} 
                  className={`
                    relative flex items-center gap-6 p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                    ${isChecked 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
                    }
                  `}
                  onClick={() => {
                    const newAnswer = answer || [];
                    if (isChecked) {
                      onAnswerChange(currentQuestion.id, newAnswer.filter((id: string) => id !== option.id));
                    } else {
                      onAnswerChange(currentQuestion.id, [...newAnswer, option.id]);
                    }
                  }}
                >
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    ${isChecked 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {option.id}
                  </div>
                  <div className="flex-1 cursor-pointer min-w-0">
                    {option.image_id || option.image_url ? (
                      <div className="w-full rounded-xl border border-border overflow-hidden bg-muted/10">
                        <div className="aspect-video w-full flex items-center justify-center">
                          <ImageWithFallback
                            src={option.image_url || option.image_id}
                            fallback={<ImageIcon className="h-20 w-20 text-muted-foreground" />}
                            alt={`Option ${option.id}`}
                            className="w-full h-full object-contain max-w-full max-h-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-lg leading-relaxed font-medium">{option.text}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-6">
            {['true', 'false'].map((value) => {
              const isSelected = answer === value;
              return (
                <div 
                  key={value}
                  className={`
                    relative flex items-center gap-6 p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
                    }
                  `}
                  onClick={() => {
                    // Toggle: if already selected, deselect; otherwise select
                    if (isSelected) {
                      onAnswerChange(currentQuestion.id, '');
                    } else {
                      onAnswerChange(currentQuestion.id, value);
                    }
                  }}
                >
                  <div className="flex-1 cursor-pointer text-lg font-medium">
                    {value === 'true' ? 'True' : 'False'}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'single-word':
        return (
          <div className="space-y-3">
            <Input
              value={answer || ''}
              onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full h-14 text-lg border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-6"
            />
          </div>
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
              <Card className="shadow-sm border border-border/50 bg-card/50">
                <CardHeader className="pb-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold">
                      {currentQuestion.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFlagQuestion(currentQuestion.id)}
                      className={`
                        ${examState.flaggedQuestions.includes(currentQuestion.id) 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-muted-foreground'
                        }
                      `}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-10 py-8">
                  <div className="space-y-6">
                    {currentQuestion.content && (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-xl leading-relaxed text-foreground font-medium">{currentQuestion.content}</p>
                      </div>
                    )}
                    {currentQuestion.question_image_id || currentQuestion.question_image_url ? (
                      <div className="w-full rounded-2xl border border-border/50 overflow-hidden bg-muted/10">
                        <div className="aspect-video w-full flex items-center justify-center">
                          <ImageWithFallback
                            src={currentQuestion.question_image_url || currentQuestion.question_image_id}
                            fallback={<ImageIcon className="h-20 w-20 text-muted-foreground" />}
                            alt="Question"
                            className="w-full h-full object-contain max-w-full max-h-full"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="pt-4">
                    {renderQuestionContent()}
                  </div>
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

function ExamResultsPhase({ examConfig, examState, onComplete, examId }: any) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  // Fetch actual submissions from backend to get accurate counts
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const submissionsResponse = await getSubmissions(examId);
        setSubmissions(submissionsResponse.payload.submissions || []);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [examId]);

  // Calculate attempted questions based on actual submissions (not local state)
  // Only count questions with valid, non-empty answers
  const attempted = submissions.filter((sub: any) => {
    const answer = sub.answer;
    // Check if answer is valid (not empty, null, undefined, or empty array)
    if (answer === null || answer === undefined) return false;
    if (typeof answer === 'string' && answer.trim().length === 0) return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    return true;
  }).length;

  const skipped = examConfig.totalQuestions - attempted;
  const timeTaken = examState.endTime && examState.startTime
    ? Math.floor((examState.endTime.getTime() - examState.startTime.getTime()) / 1000)
    : 0;
  const timeTakenMinutes = Math.floor(timeTaken / 60);
  const timeTakenSeconds = timeTaken % 60;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Exam Submitted Successfully</h1>
            <p className="text-muted-foreground">
              {examConfig.title}
            </p>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{examConfig.totalQuestions}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Questions</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {loadingSubmissions ? '...' : attempted}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Attempted</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {loadingSubmissions ? '...' : skipped}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Skipped</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{examState.flaggedQuestions.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Marked</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-muted-foreground mb-2">Time Taken</div>
                <div className="text-3xl font-bold">
                  {timeTakenMinutes}m {timeTakenSeconds}s
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action */}
        <div className="flex justify-center">
          <Button onClick={onComplete} size="lg" className="w-full md:w-auto">
            Return to Dashboard
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