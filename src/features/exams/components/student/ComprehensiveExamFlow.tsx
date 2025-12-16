import React, { useState, useEffect, useRef } from 'react';
import { getExamById, getQuestions, BackendExam, BackendQuestion, startExam, saveAnswer, deleteAnswer, submitExam, getSubmissions } from '../../../../services/api/exam';
import { useFaceDetection } from '../../../../hooks/useFaceDetection';
import { useAudioDetection } from '../../../../hooks/useAudioDetection';
import { updateMonitoring } from '../../../../services/api/examMonitoring';
import { uploadMedia } from '../../../../services/api/media';
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
  const [examMonitoringEnabled, setExamMonitoringEnabled] = useState<boolean>(true); // Track if monitoring is enabled for this exam
  const [twoFactorEnabled] = useState(true); // Mock - in real app this would come from user profile
  const [showFullscreenExitWarning, setShowFullscreenExitWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [voiceDetectionCount, setVoiceDetectionCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [faceDetectionWarning, setFaceDetectionWarning] = useState<string | null>(null);
  const [voiceWarning, setVoiceWarning] = useState<string | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [pendingPhotoMediaId, setPendingPhotoMediaId] = useState<string | null>(null);
  const snapshotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const regularSnapshotIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        
        // Check if monitoring is enabled for this exam
        const monitoringEnabled = exam.monitoring_enabled !== false && exam.monitoring_enabled !== undefined;
        setExamMonitoringEnabled(monitoringEnabled);
        
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
          
          // Set enrollmentId from submissions response (needed for monitoring when resuming)
          if (submissionsResponse.payload.enrollment_id) {
            setEnrollmentId(submissionsResponse.payload.enrollment_id);
            console.log('Set enrollmentId from submissions:', submissionsResponse.payload.enrollment_id);
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
            question_image_id: (q as any).question_image_id || q.metadata?.question_image_id || null,
            question_image_url: (q as any).question_image_id || q.metadata?.question_image_id || null, // Backend returns URL in question_image_id field
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

  // Aggressive tab switching prevention - multiple layers of protection
  useEffect(() => {
    if (examState.phase !== 'active' || !isFullscreen || !enrollmentId) return;

    let lastTabSwitchTime = 0;
    const TAB_SWITCH_DEBOUNCE_MS = 1000; // Prevent counting same switch multiple times
    let visibilityCheckInterval: ReturnType<typeof setInterval> | null = null;
    
    // Helper function to handle tab switch detection
    const handleTabSwitchDetection = () => {
      const now = Date.now();
      // Debounce: only count if it's been more than 1 second since last detection
      if (now - lastTabSwitchTime < TAB_SWITCH_DEBOUNCE_MS) {
        return;
      }
      lastTabSwitchTime = now;
      
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        
        // Save to backend immediately - enrollmentId is guaranteed to be available here
        sendMonitoringUpdate({ tab_switch_count: newCount }).catch((err) => {
          console.error('Failed to update tab switch count:', err);
        });
        
        // If 3 or more switches, show warning and auto-submit
        if (newCount >= 3) {
          if (newCount === 3) {
            // First time reaching 3, show final warning
            setWarningMessage(`WARNING: Tab switching detected ${newCount} times. If you switch tabs one more time, the exam will be automatically submitted.`);
            setShowWarning(true);
          } else if (newCount > 3) {
            // More than 3 times, auto-submit
            setWarningMessage(`Tab switching detected ${newCount} times. The exam is being automatically submitted.`);
            setShowWarning(true);
            // Auto-submit the exam
            setTimeout(() => {
              handleSubmitExam();
            }, 1000);
          }
        } else {
          // Less than 3, show regular warning
          setWarningMessage(`Tab/window switching detected (${newCount} time${newCount > 1 ? 's' : ''}). Please stay focused on the exam. ${3 - newCount} warning${3 - newCount > 1 ? 's' : ''} remaining before auto-submit.`);
          setShowWarning(true);
        }
        
        return newCount;
      });
    };

    // Comprehensive keyboard shortcut blocking
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent all tab switching keyboard shortcuts
      if ((e.ctrlKey && e.key === 'Tab') ||
          (e.ctrlKey && e.key === 'PageUp') ||
          (e.ctrlKey && e.key === 'PageDown') ||
          (e.ctrlKey && e.shiftKey && e.key === 'Tab') ||
          (e.ctrlKey && e.key === '1') ||
          (e.ctrlKey && e.key === '2') ||
          (e.ctrlKey && e.key === '3') ||
          (e.ctrlKey && e.key === '4') ||
          (e.ctrlKey && e.key === '5') ||
          (e.ctrlKey && e.key === '6') ||
          (e.ctrlKey && e.key === '7') ||
          (e.ctrlKey && e.key === '8') ||
          (e.ctrlKey && e.key === '9')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setWarningMessage('Tab switching is not allowed during the exam');
        setShowWarning(true);
        return false;
      }
      
      // Prevent Alt+Tab and other OS-level shortcuts
      if (e.altKey && (e.key === 'Tab' || e.key === 'F4')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setWarningMessage('Switching applications is not allowed during the exam');
        setShowWarning(true);
        return false;
      }

      // Prevent Windows key shortcuts
      if (e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Window blur/focus handlers - detect when window loses focus
    const handleWindowBlur = () => {
      if (examState.phase === 'active') {
        handleTabSwitchDetection();
        
        // Try to refocus the window after a short delay
        setTimeout(() => {
          if (window.focus) {
            window.focus();
          }
        }, 100);
      }
    };

    const handleWindowFocus = () => {
      // When window regains focus, check if we're still in fullscreen
      if (examState.phase === 'active') {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
        
        if (!isCurrentlyFullscreen) {
          setShowFullscreenExitWarning(true);
        }
      }
    };

    // Enhanced visibility change detection
    const handleVisibilityChange = () => {
      if (document.hidden && examState.phase === 'active') {
        handleTabSwitchDetection();
        
        // Try to refocus immediately
        setTimeout(() => {
          if (window.focus) {
            window.focus();
          }
          // Try to re-enter fullscreen if we lost it
          if (!document.fullscreenElement) {
            enterFullscreen();
          }
        }, 100);
      }
    };

    // Continuous visibility monitoring (polling as backup)
    const startVisibilityMonitoring = () => {
      visibilityCheckInterval = setInterval(() => {
        if (examState.phase === 'active' && document.hidden) {
          handleTabSwitchDetection();
          
          // Aggressively try to refocus
          if (window.focus) {
            window.focus();
          }
          
          // Try to re-enter fullscreen
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {
              // If fullscreen fails, user might have disabled it
            });
          }
        }
      }, 500); // Check every 500ms
    };

    // Prevent touch gestures that might switch tabs (four-finger swipe)
    let touchCount = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchCount = e.touches.length;
      
      // Prevent multi-finger gestures (3+ fingers typically used for tab switching)
      if (e.touches.length >= 3) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setWarningMessage('Multi-finger gestures are disabled during the exam');
        setShowWarning(true);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (touchCount >= 3) {
        // Prevent multi-finger swipe gestures
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchCount >= 3) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
      touchCount = 0;
    };

    // Prevent mouse leaving window (might indicate tab switch)
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse actually leaves the window (not just moving within)
      if (e.clientY <= 0 || e.clientX <= 0 || 
          e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        // This might indicate user is trying to switch tabs
        // We'll monitor visibility instead
      }
    };

    // Add all event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Start continuous monitoring
    startVisibilityMonitoring();

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseleave', handleMouseLeave);
      
      if (visibilityCheckInterval) {
        clearInterval(visibilityCheckInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examState.phase, isFullscreen, enrollmentId]);

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

      // Clean up proctoring and camera
      document.removeEventListener('visibilitychange', handleTabSwitch);
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setProctoringActive(false);
      
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (error: any) {
      console.error('Failed to submit exam:', error);
      setWarningMessage(error.message || 'Failed to submit exam. Please try again.');
      setShowWarning(true);
    }
  };

  // Enter fullscreen and enable camera when exam becomes active
  useEffect(() => {
    if (examState.phase === 'active' && !isFullscreen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [examState.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enable camera when exam phase becomes active (backup in case beginActiveExam didn't trigger it)
  // But only if not already active and before fullscreen to avoid warnings
  // Only enable if monitoring is enabled for this exam
  useEffect(() => {
    if (examState.phase === 'active' && !proctoringActive && !isFullscreen && examMonitoringEnabled) {
      // Enable camera when exam is active but BEFORE fullscreen to avoid browser warnings
      enableCamera();
    }
  }, [examState.phase, proctoringActive, isFullscreen, examMonitoringEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup camera stream when component unmounts or exam phase changes away from active
  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Stop camera when exam phase is no longer active
  useEffect(() => {
    if (examState.phase !== 'active' && proctoringActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setProctoringActive(false);
      
      // Clear snapshot interval
      if (regularSnapshotIntervalRef.current) {
        clearInterval(regularSnapshotIntervalRef.current);
        regularSnapshotIntervalRef.current = null;
      }
    }
  }, [examState.phase, proctoringActive]);

  // Set up regular interval snapshots when exam is active
  useEffect(() => {
    if (examState.phase === 'active' && proctoringActive && enrollmentId && examMonitoringEnabled && examConfig) {
      // Calculate interval as total exam timing / 8
      // examConfig.duration is in minutes, so convert to seconds, divide by 8, then convert to milliseconds
      const totalSeconds = examConfig.duration * 60; // Total exam duration in seconds
      const intervalSeconds = totalSeconds / 8; // Divide by 8 as requested
      const intervalMs = intervalSeconds * 1000; // Convert to milliseconds
      
      console.log(`Setting regular snapshot interval: ${intervalSeconds} seconds (${intervalMs}ms) for exam duration: ${examConfig.duration} minutes`);
      
      regularSnapshotIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          console.log('Capturing regular interval snapshot...');
          await captureSnapshot('regular_interval');
        }
      }, intervalMs);

      return () => {
        if (regularSnapshotIntervalRef.current) {
          clearInterval(regularSnapshotIntervalRef.current);
          regularSnapshotIntervalRef.current = null;
        }
      };
    }
  }, [examState.phase, proctoringActive, enrollmentId, examMonitoringEnabled, examConfig]);

  // Capture snapshot from video
  const captureSnapshot = async (snapshotType: 'regular_interval' | 'multiple_face_detection' | 'no_face_detection' | 'exam_start'): Promise<string | null> => {
    if (!videoRef.current || !proctoringActive || !examMonitoringEnabled) return null;

    try {
      // Create canvas if it doesn't exist
      if (!snapshotCanvasRef.current) {
        const canvas = document.createElement('canvas');
        snapshotCanvasRef.current = canvas;
      }

      const canvas = snapshotCanvasRef.current;
      const video = videoRef.current;

      // Check if video is ready
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        console.warn('Video not ready for snapshot');
        return null;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        return null;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob || !enrollmentId) {
            resolve(null);
            return;
          }

          try {
            // Upload snapshot to media table
            console.log(`Uploading ${snapshotType} snapshot...`);
            const mediaResponse = await uploadMedia(blob);
            const mediaId = mediaResponse.id;
            console.log(`Snapshot uploaded with media ID: ${mediaId}`);

            // Update monitoring record with snapshot
            console.log(`Updating monitoring with snapshot: ${snapshotType}, media_id: ${mediaId}`);
            await updateMonitoring({
              enrollment_id: enrollmentId,
              snapshot_media_id: mediaId,
              snapshot_type: snapshotType,
              // Preserve current counts
              tab_switch_count: tabSwitchCount,
              fullscreen_exit_count: fullscreenExitCount,
              voice_detection_count: voiceDetectionCount,
            });
            console.log(`Monitoring updated successfully with ${snapshotType} snapshot`);

            resolve(mediaId);
          } catch (error) {
            console.error(`Failed to upload/update ${snapshotType} snapshot:`, error);
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      });
    } catch (error) {
      console.error('Error capturing snapshot:', error);
      return null;
    }
  };

  // Send monitoring update to backend
  const sendMonitoringUpdate = async (updates: { tab_switch_count?: number; fullscreen_exit_count?: number; voice_detection_count?: number }) => {
    if (!enrollmentId || !examMonitoringEnabled) {
      console.warn('Cannot update monitoring: enrollmentId not set or monitoring is disabled');
      return;
    }

    try {
      console.log('Sending monitoring update:', { enrollment_id: enrollmentId, ...updates });
      const response = await updateMonitoring({
        enrollment_id: enrollmentId,
        ...updates,
      });
      console.log('Monitoring update successful:', response);
    } catch (error) {
      console.error('Failed to update monitoring:', error);
    }
  };

  // Face detection monitoring - MUST be called before any conditional returns
  const faceDetection = useFaceDetection({
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    enabled: examState.phase === 'active' && proctoringActive && examMonitoringEnabled,
    onFaceDetectionChange: async (result) => {
      if (result.faceCount === 0) {
        setFaceDetectionWarning('No face detected. Please ensure you are visible in the camera.');
        // Capture snapshot for no face detection
        if (enrollmentId) {
          await captureSnapshot('no_face_detection');
        }
      } else if (result.hasMultipleFaces) {
        setFaceDetectionWarning('Multiple faces detected. Please ensure you are alone during the exam.');
        // Capture snapshot for multiple face detection
        if (enrollmentId) {
          await captureSnapshot('multiple_face_detection');
        }
      } else {
        setFaceDetectionWarning(null);
      }
    },
    detectionInterval: 2000,
  });

  // Audio detection monitoring - MUST be called before any conditional returns
  const audioDetection = useAudioDetection({
    enabled: examState.phase === 'active' && examMonitoringEnabled,
    onVoiceDetected: async () => {
      console.log('onVoiceDetected callback triggered in ComprehensiveExamFlow');
      // Show warning when voice is detected
      setVoiceWarning('Voice detected. Please ensure you are alone during the exam.');
      console.log('Voice warning set');
      
      // Clear warning after 5 seconds
      setTimeout(() => {
        setVoiceWarning(null);
      }, 5000);
      
      // Increment voice detection count
      if (enrollmentId && examMonitoringEnabled) {
        setVoiceDetectionCount(prev => {
          const newCount = prev + 1;
          console.log('Updating voice detection count:', newCount);
          sendMonitoringUpdate({ voice_detection_count: newCount }).catch((err) => {
            console.error('Failed to update voice detection count:', err);
          });
          return newCount;
        });
      } else {
        console.warn('Cannot update count - enrollmentId:', enrollmentId, 'monitoringEnabled:', examMonitoringEnabled);
      }
    },
    energyThreshold: -50, // -50dB threshold
    analysisInterval: 16, // ~60fps
  });

  // Fullscreen change listener - only active during exam
  useEffect(() => {
    if (examState.phase !== 'active' || !enrollmentId) return;

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
        // Always show warning when fullscreen is exited
        setShowFullscreenExitWarning(true);
        
        // Only track and update backend if monitoring is enabled
        if (examMonitoringEnabled) {
          // User exited fullscreen - increment count and send to backend
          // enrollmentId is guaranteed to be available here
          setFullscreenExitCount(prev => {
            const newCount = prev + 1;
            sendMonitoringUpdate({ fullscreen_exit_count: newCount }).catch((err) => {
              console.error('Failed to update fullscreen exit count:', err);
            });
            return newCount;
          });
        }
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
  }, [examState.phase, isFullscreen, enrollmentId, examMonitoringEnabled]);

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

    // Check camera if required - only if monitoring is enabled
    if (examConfig.proctoring.cameraRequired && examMonitoringEnabled) {
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
      // If monitoring is disabled, mark camera as not required
      setSystemChecks(prev => ({ ...prev, camera: !examConfig.proctoring.cameraRequired || !examMonitoringEnabled }));
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
      
      // Store enrollment_id from response
      const enrollment_id = (startResponse.payload as any).enrollment_id;
      if (enrollment_id) {
        setEnrollmentId(enrollment_id);
      }
      
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

  // Enable camera and microphone when exam starts
  const enableCamera = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      // Store the stream in ref so we can use it when video element is available
      streamRef.current = stream;
      setProctoringActive(true);
      
      // Try to set the stream to video element if it's already available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
    } catch (error: any) {
      console.error('Failed to enable camera:', error);
      setWarningMessage('Camera access failed. Please ensure camera permissions are granted.');
      setShowWarning(true);
      // Don't block exam start if camera fails, but show warning
      setProctoringActive(false);
      streamRef.current = null;
    }
  };

  const beginActiveExam = async (startedAt: Date) => {
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

    // Only enable camera and monitoring if monitoring is enabled for this exam
    if (examMonitoringEnabled) {
      // Request camera permission BEFORE entering fullscreen to avoid browser warnings
      await enableCamera();

      // Small delay to ensure permission dialog is closed before requesting fullscreen
      // This prevents browser warnings about permission requests during fullscreen
      await new Promise(resolve => setTimeout(resolve, 300));

      // Enter fullscreen mode after camera permission is granted and dialog is closed
      enterFullscreen();

      // Capture exam start snapshot after camera is ready
      // Use a longer delay to ensure video stream is fully ready
      if (enrollmentId) {
        setTimeout(async () => {
          if (proctoringActive && videoRef.current && videoRef.current.readyState >= 2) {
            console.log('Capturing exam start snapshot...');
            await captureSnapshot('exam_start');
          } else {
            console.warn('Video not ready for exam start snapshot, retrying...');
            // Retry after another 2 seconds
            setTimeout(async () => {
              if (proctoringActive && videoRef.current && videoRef.current.readyState >= 2) {
                await captureSnapshot('exam_start');
              }
            }, 2000);
          }
        }, 3000); // Wait 3 seconds for video to be ready
      }
    } else {
      // If monitoring is disabled, just enter fullscreen without camera
      enterFullscreen();
    }

    if (examConfig.proctoring.tabSwitchDetection && examMonitoringEnabled) {
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

  // Handle photo upload before exam starts - MUST be before any conditional returns
  const handlePhotoUploaded = async (mediaId: string) => {
    if (!enrollmentId) {
      console.log('Photo uploaded before exam start. Will map to examMonitoring when exam starts.');
      // Store the mediaId to map later when enrollmentId is available
      setPendingPhotoMediaId(mediaId);
      return;
    }

    try {
      // Map uploaded photo to examMonitoring metadata exam_start
      await updateMonitoring({
        enrollment_id: enrollmentId,
        snapshot_media_id: mediaId,
        snapshot_type: 'exam_start',
      });
      console.log('Photo mapped to exam_start successfully');
      setPendingPhotoMediaId(null);
    } catch (error) {
      console.error('Failed to map photo to examMonitoring:', error);
    }
  };

  // Map pending photo when enrollmentId becomes available - MUST be before any conditional returns
  useEffect(() => {
    if (enrollmentId && pendingPhotoMediaId) {
      updateMonitoring({
        enrollment_id: enrollmentId,
        snapshot_media_id: pendingPhotoMediaId,
        snapshot_type: 'exam_start',
      })
        .then(() => {
          console.log('Pending photo mapped to exam_start successfully');
          setPendingPhotoMediaId(null);
        })
        .catch((error) => {
          console.error('Failed to map pending photo to examMonitoring:', error);
        });
    }
  }, [enrollmentId, pendingPhotoMediaId]);

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
      enrollmentId={enrollmentId}
      onStartExam={handleStartExam}
      onBackToSetup={() => setExamState(prev => ({ ...prev, phase: 'setup' }))}
      onPhotoUploaded={examMonitoringEnabled ? handlePhotoUploaded : undefined}
      monitoringEnabled={examMonitoringEnabled}
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
          streamRef={streamRef}
          faceDetectionWarning={faceDetectionWarning}
          voiceWarning={voiceWarning}
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

function ExamInstructionsPhase({ examConfig, onStartExam, onBackToSetup, enrollmentId, onPhotoUploaded, monitoringEnabled = true }: any) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Microphone test state
  const [micTestActive, setMicTestActive] = useState(false);
  const [micTestError, setMicTestError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [micTestStream, setMicTestStream] = useState<MediaStream | null>(null);
  const micAudioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micAnimationFrameRef = useRef<number | null>(null);
  const micTestActiveRef = useRef<boolean>(false);

  // Start camera when component mounts - only if monitoring is enabled
  useEffect(() => {
    if (!monitoringEnabled) return; // Don't start camera if monitoring is disabled

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        }
        setCameraError(null);
      } catch (error: any) {
        console.error('Failed to access camera:', error);
        setCameraError('Camera access denied. Please enable camera permissions to capture your photo.');
      }
    };

    startCamera();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [monitoringEnabled]);

  // Microphone test functions
  const startMicTest = async () => {
    try {
      setMicTestError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      // Verify stream has audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found in stream');
      }
      
      console.log('Microphone stream obtained:', {
        tracks: audioTracks.length,
        trackEnabled: audioTracks[0].enabled,
        trackReadyState: audioTracks[0].readyState,
      });
      
      setMicTestStream(stream);
      setMicTestActive(true);
      micTestActiveRef.current = true;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      micAudioContextRef.current = audioContext;
      
      console.log('AudioContext created, state:', audioContext.state);
      
      // Resume audio context if suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('AudioContext resumed, new state:', audioContext.state);
      }
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3; // Increased for smoother visualization
      micAnalyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      console.log('Audio source connected to analyser');
      
      // For getByteTimeDomainData, we need a buffer of size fftSize
      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateMicLevel = () => {
        // Check if test is still active using ref
        if (!micTestActiveRef.current || !micAnalyserRef.current || !micAudioContextRef.current) {
          if (micAnimationFrameRef.current) {
            cancelAnimationFrame(micAnimationFrameRef.current);
            micAnimationFrameRef.current = null;
          }
          return;
        }
        
        // Ensure audio context is running
        if (micAudioContextRef.current.state === 'suspended') {
          micAudioContextRef.current.resume().catch(console.error);
        }
        
        try {
          // Use getByteTimeDomainData for amplitude detection
          micAnalyserRef.current.getByteTimeDomainData(dataArray);
        } catch (error) {
          console.error('Error getting time domain data:', error);
          return;
        }
        
        // Calculate volume level
        let sum = 0;
        let max = 0;
        let min = 255;
        
        for (let i = 0; i < dataArray.length; i++) {
          const sample = dataArray[i];
          min = Math.min(min, sample);
          max = Math.max(max, sample);
          // Normalize sample to -1 to 1 range
          const normalized = (sample - 128) / 128;
          sum += normalized * normalized;
        }
        
        // Calculate RMS (Root Mean Square)
        const rms = Math.sqrt(sum / dataArray.length);
        
        // Calculate peak-to-peak amplitude
        const peakToPeak = max - min;
        const peakToPeakNormalized = peakToPeak / 255;
        
        // Convert RMS to percentage (0-100)
        // RMS for silence is ~0, for loud audio is ~0.3-0.5
        const rmsLevel = Math.min(100, (rms * 200)); // Scale RMS to 0-100
        
        // Also use peak-to-peak as a backup
        const peakLevel = Math.min(100, (peakToPeakNormalized * 100));
        
        // Use the maximum of both methods
        const level = Math.max(rmsLevel, peakLevel);
        
        setMicLevel(level);
        
        // Continue the loop
        micAnimationFrameRef.current = requestAnimationFrame(updateMicLevel);
      };
      
      // Start monitoring after a small delay to ensure everything is set up
      setTimeout(() => {
        console.log('Starting microphone level monitoring...');
        updateMicLevel();
      }, 300);
    } catch (error: any) {
      console.error('Failed to access microphone:', error);
      setMicTestError('Microphone access denied. Please enable microphone permissions.');
      setMicTestActive(false);
      micTestActiveRef.current = false;
    }
  };
  
  const stopMicTest = () => {
    if (micTestStream) {
      micTestStream.getTracks().forEach(track => track.stop());
      setMicTestStream(null);
    }
    if (micAnimationFrameRef.current) {
      cancelAnimationFrame(micAnimationFrameRef.current);
      micAnimationFrameRef.current = null;
    }
    if (micAudioContextRef.current) {
      micAudioContextRef.current.close().catch(console.error);
      micAudioContextRef.current = null;
    }
    setMicTestActive(false);
    micTestActiveRef.current = false;
    setMicLevel(0);
  };
  
  // Cleanup microphone test on unmount
  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, []);

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !streamRef.current) {
      alert('Camera not ready. Please wait for camera to initialize.');
      return;
    }

    setIsCapturing(true);
    try {
      // Create canvas if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      // Check if video is ready
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        alert('Video not ready. Please wait a moment and try again.');
        setIsCapturing(false);
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Failed to capture photo. Please try again.');
        setIsCapturing(false);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob and create preview
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to capture photo. Please try again.');
          setIsCapturing(false);
          return;
        }

        // Create preview
        const previewUrl = URL.createObjectURL(blob);
        setPhotoPreview(previewUrl);

        // Upload photo immediately after capture
        setIsUploading(true);
        try {
          const { uploadMedia } = await import('../../../../services/api/media');
          const mediaResponse = await uploadMedia(blob);
          const mediaId = mediaResponse.id;

          // Map to examMonitoring metadata exam_start
          if (onPhotoUploaded) {
            await onPhotoUploaded(mediaId);
          }

          // Stop camera stream after successful capture
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }

          alert('Photo captured and uploaded successfully!');
        } catch (error: any) {
          console.error('Failed to upload photo:', error);
          alert('Failed to upload photo. Please try again.');
        } finally {
          setIsUploading(false);
          setIsCapturing(false);
        }
      }, 'image/jpeg', 0.8);
    } catch (error: any) {
      console.error('Error capturing photo:', error);
      alert('Failed to capture photo. Please try again.');
      setIsCapturing(false);
    }
  };

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

            {/* Photo Capture Section - Only show if monitoring is enabled */}
            {monitoringEnabled && (
              <div className="space-y-3 pt-2 pb-2 border-t">
                <h4 className="font-semibold text-base">Capture Your Photo (Optional but Recommended)</h4>
              <div className="space-y-3">
                {cameraError ? (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{cameraError}</p>
                  </div>
                ) : (
                  <>
                    {!photoPreview ? (
                      <div className="space-y-3">
                        <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-lg overflow-hidden border-2 border-border">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                          />
                          {!streamRef.current && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="text-center text-white">
                                <Camera className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                                <p className="text-sm">Initializing camera...</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            onClick={handleCapturePhoto}
                            disabled={isCapturing || isUploading || !streamRef.current}
                            className="flex items-center gap-2"
                            size="lg"
                          >
                            <Camera className="h-4 w-4" />
                            {isCapturing ? 'Capturing...' : isUploading ? 'Uploading...' : 'Capture Photo'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-lg overflow-hidden border-2 border-border">
                          <img
                            src={photoPreview}
                            alt="Captured Photo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            ✓ Captured
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          {enrollmentId 
                            ? 'Photo captured and mapped to your exam record.' 
                            : 'Photo captured. It will be mapped to your exam record when you start the exam.'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              </div>
            )}

            {/* Microphone Test Section - Only show if monitoring is enabled */}
            {monitoringEnabled && (
              <div className="space-y-3 pt-2 pb-2 border-t">
                <h4 className="font-semibold text-base">Test Your Microphone (Optional but Recommended)</h4>
                <div className="space-y-3">
                  {micTestError ? (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{micTestError}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {!micTestActive ? (
                        <div className="text-center">
                          <Button
                            type="button"
                            onClick={startMicTest}
                            variant="outline"
                            className="flex items-center gap-2 mx-auto"
                            size="lg"
                          >
                            <Mic className="h-4 w-4" />
                            Test Microphone
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Click to test your microphone before starting the exam
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Mic className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Microphone Level</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{micLevel.toFixed(0)}%</span>
                            </div>
                            
                            {/* Audio Level Bar */}
                            <div className="w-full h-4 bg-muted rounded-full overflow-hidden mb-2">
                              <div 
                                className={`h-full transition-all duration-100 ${
                                  micLevel > 70 ? 'bg-red-500' :
                                  micLevel > 40 ? 'bg-yellow-500' :
                                  micLevel > 10 ? 'bg-green-500' :
                                  'bg-muted-foreground'
                                }`}
                                style={{ width: `${Math.min(100, micLevel)}%` }}
                              />
                            </div>
                            
                            {/* Waveform visualization */}
                            <div className="flex items-end justify-between gap-0.5 h-6">
                              {Array.from({ length: 15 }).map((_, i) => {
                                const wave = Math.sin((Date.now() / 50 + i * 0.4) % (Math.PI * 2));
                                const height = (Math.abs(wave) * (micLevel / 100) + 0.1) * 100;
                                
                                return (
                                  <div
                                    key={i}
                                    className="flex-1 bg-primary transition-all duration-75"
                                    style={{
                                      height: `${Math.max(5, Math.min(100, height))}%`,
                                      minHeight: '2px'
                                    }}
                                  />
                                );
                              })}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              {micLevel > 10 ? (
                                <span className="text-green-600 dark:text-green-400">✓ Microphone working</span>
                              ) : (
                                <span className="text-muted-foreground">Speak into your microphone</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              onClick={stopMicTest}
                              variant="outline"
                              className="flex items-center gap-2"
                              size="sm"
                            >
                              Stop Test
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

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

function ActiveExamPhase({ examConfig, examState, onAnswerChange, onFlagQuestion, onNavigateToQuestion, onSubmitExam, formatTime, showCalculator, setShowCalculator, showWarning, setShowWarning, warningMessage, proctoringActive, videoRef, streamRef, faceDetectionWarning, voiceWarning }: any) {
  const currentQuestion = examConfig.questions[examState.currentQuestion];

  // Set stream to video element when it becomes available
  useEffect(() => {
    if (videoRef.current && streamRef?.current && proctoringActive) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err: any) => {
        console.error('Error playing video:', err);
      });
    }
  }, [proctoringActive, videoRef, streamRef]);

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
      {/* Proctoring Video - Small window overlay in bottom-left when exam is active */}
      {proctoringActive && (
        <div className="fixed bottom-4 left-4 z-50 bg-background border-2 border-primary rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary/10 px-2 py-1 flex items-center gap-2">
            <Camera className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">Camera Active</span>
          </div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-48 h-36 object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
          />
        </div>
      )}

      {/* Face Detection Warning Banner */}
      {faceDetectionWarning && (
        <div 
          className="fixed left-1/2 transform -translate-x-1/2 z-[99999] bg-destructive text-destructive-foreground px-6 py-4 rounded-lg shadow-2xl border-2 border-destructive animate-pulse min-w-[400px] max-w-[90vw] pointer-events-auto"
          style={{ bottom: '80px' }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-base mb-1">Proctoring Alert</div>
              <div className="text-sm font-medium">{faceDetectionWarning}</div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Detection Warning Banner */}
      {voiceWarning && (
        <div 
          className="fixed left-1/2 transform -translate-x-1/2 z-[99999] bg-destructive text-destructive-foreground px-6 py-4 rounded-lg shadow-2xl border-2 border-destructive animate-pulse min-w-[400px] max-w-[90vw] pointer-events-auto"
          style={{ bottom: faceDetectionWarning ? '140px' : '80px' }}
        >
          <div className="flex items-center gap-3">
            <Mic className="h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-base mb-1">Audio Proctoring Alert</div>
              <div className="text-sm font-medium">{voiceWarning}</div>
            </div>
          </div>
        </div>
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