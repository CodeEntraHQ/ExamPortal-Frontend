import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/providers/AuthProvider';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Textarea } from '../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/components/ui/select';
import { useNotifications } from '../../shared/providers/NotificationProvider';
import { examApi, CreateQuestionPayload, BackendQuestion } from '../../services/api/exam';
import { authenticatedFetch, getApiUrl } from '../../services/api/core';
import { 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Loader2, 
  AlertCircle, 
  Image as ImageIcon, 
  Type,
  ArrowLeft
} from 'lucide-react';
import { Alert, AlertDescription } from '../../shared/components/ui/alert';
import { ImageWithFallback } from '../../shared/components/common/ImageWithFallback';

interface ImagePreview {
  file: File;
  preview: string;
  width?: number;
  height?: number;
}

type OptionMode = 'text' | 'image';

export function QuestionCreationPage() {
  const { examId, questionId } = useParams<{ examId: string; questionId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { success, error } = useNotifications();
  
  const isEditMode = !!questionId;
  
  const getBasePath = () => {
    if (location.pathname.includes('/superadmin/')) {
      return '/superadmin';
    }
    return '/admin';
  };
  
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'MCQ_SINGLE' | 'MCQ_MULTIPLE' | 'SINGLE_WORD'>('MCQ_SINGLE');
  const [questionImage, setQuestionImage] = useState<ImagePreview | null>(null);
  const [existingQuestionImageId, setExistingQuestionImageId] = useState<string | null>(null);
  const [existingQuestionImageUrl, setExistingQuestionImageUrl] = useState<string | null>(null);
  const [existingQuestionImageBlob, setExistingQuestionImageBlob] = useState<string | null>(null);
  const [options, setOptions] = useState<Array<{ 
    text: string; 
    image?: ImagePreview; 
    isCorrect: boolean;
    mode: OptionMode;
    existingImageId?: string;
    existingImageUrl?: string | null;
    existingImageBlob?: string | null;
  }>>([
    { text: '', isCorrect: false, mode: 'text' },
    { text: '', isCorrect: false, mode: 'text' },
    { text: '', isCorrect: false, mode: 'text' },
    { text: '', isCorrect: false, mode: 'text' }
  ]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const optionImageInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Load question data when in edit mode
  useEffect(() => {
    const loadQuestion = async () => {
      if (!isEditMode || !questionId || !examId) return;

      try {
        setLoadingQuestion(true);
        
        // Fetch questions with pagination until we find the one we need
        let question: BackendQuestion | undefined;
        let page = 1;
        const limit = 10; // Backend limit
        let hasMorePages = true;
        
        while (hasMorePages && !question) {
          const response = await examApi.getQuestions(examId, page, limit);
          question = response.payload.questions.find((q: BackendQuestion) => q.id === questionId);
          
          // Check if there are more pages
          hasMorePages = page < response.payload.totalPages;
          page++;
          
          // Safety limit to prevent infinite loops
          if (page > 100) {
            break;
          }
        }
        
        if (question) {
          setQuestionText(question.question_text || '');
          setQuestionType(question.type);
          
          // Handle question image - backend returns question_image_id as a URL
          if (question.question_image_id) {
            setExistingQuestionImageId(question.question_image_id);
            setExistingQuestionImageUrl(question.question_image_id); // It's already a URL from backend
            
            // Fetch the image and convert to blob URL for display
            try {
              const imageResponse = await authenticatedFetch(question.question_image_id);
              const imageData = await imageResponse.json();
              if (imageData.payload?.media?.data) {
                const buffer = new Uint8Array(imageData.payload.media.data);
                const blob = new Blob([buffer], { type: 'image/jpeg' });
                const blobUrl = URL.createObjectURL(blob);
                setExistingQuestionImageBlob(blobUrl);
              }
            } catch (err) {
              console.error('Failed to load question image:', err);
            }
          } else {
            setExistingQuestionImageId(null);
            setExistingQuestionImageUrl(null);
            setExistingQuestionImageBlob(null);
          }

          if (question.type === 'MCQ_SINGLE' || question.type === 'MCQ_MULTIPLE') {
            const questionOptions = question.metadata?.options || [];
            const correctAnswers = question.metadata?.correct_answers || [];
            
            const loadedOptions = questionOptions.map((opt: any, idx: number) => {
              const isCorrect = correctAnswers.includes(idx);
              // Backend returns image_id and image_url for options with images
              // image_id is the actual ID we need to preserve for updates
              if (opt.image_id || opt.image_url) {
                return {
                  text: '',
                  isCorrect,
                  mode: 'image' as OptionMode,
                  existingImageId: opt.image_id, // This is the actual media ID from backend
                  existingImageUrl: opt.image_url || null, // URL from backend for display
                  existingImageBlob: null, // Will be loaded separately
                };
              } else {
                return {
                  text: opt.text || '',
                  isCorrect,
                  mode: 'text' as OptionMode
                };
              }
            });
            
            // Ensure at least 4 options
            while (loadedOptions.length < 4) {
              loadedOptions.push({ text: '', isCorrect: false, mode: 'text' as OptionMode });
            }
            
            setOptions(loadedOptions);
            
            // Load option images asynchronously
            loadedOptions.forEach(async (opt, idx) => {
              if (opt.existingImageUrl && !opt.existingImageBlob) {
                try {
                  const imageResponse = await authenticatedFetch(opt.existingImageUrl);
                  const imageData = await imageResponse.json();
                  if (imageData.payload?.media?.data) {
                    const buffer = new Uint8Array(imageData.payload.media.data);
                    const blob = new Blob([buffer], { type: 'image/jpeg' });
                    const blobUrl = URL.createObjectURL(blob);
                    setOptions(prev => prev.map((o, i) => 
                      i === idx ? { ...o, existingImageBlob: blobUrl } : o
                    ));
                  }
                } catch (err) {
                  console.error(`Failed to load image for option ${idx}:`, err);
                }
              }
            });
          } else if (question.type === 'SINGLE_WORD') {
            setCorrectAnswer(question.metadata?.correct_answer || '');
          }
        } else {
          error('Question not found');
          // Navigate back if question not found
          setTimeout(() => {
            navigate(`${getBasePath()}/exam/${examId}`, { replace: true });
          }, 2000);
        }
      } catch (err) {
        error('Failed to load question data');
        console.error('Error loading question:', err);
        // Navigate back on error
        setTimeout(() => {
          navigate(`${getBasePath()}/exam/${examId}`, { replace: true });
        }, 2000);
      } finally {
        setLoadingQuestion(false);
      }
    };

    loadQuestion();
  }, [isEditMode, questionId, examId, error]);

  const validateImage = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      if (file.size > 5242880) {
        reject(new Error('Image size must be less than 5MB'));
        return;
      }

      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        reject(new Error('Only JPEG and PNG images are allowed'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width > 1920 || img.height > 1080) {
            reject(new Error(`Image dimensions (${img.width}x${img.height}px) exceed maximum allowed (1920x1080px)`));
            return;
          }
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => reject(new Error('Invalid image file'));
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const handleQuestionImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.questionImage;
        return newErrors;
      });

      const dimensions = await validateImage(file);
      const preview = URL.createObjectURL(file);
      setQuestionImage({ file, preview, ...dimensions });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid image';
      setValidationErrors(prev => ({ ...prev, questionImage: errorMessage }));
      error(errorMessage);
      if (questionImageInputRef.current) {
        questionImageInputRef.current.value = '';
      }
    }
  };

  const handleOptionImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`option${index}Image`];
        return newErrors;
      });

      const dimensions = await validateImage(file);
      const preview = URL.createObjectURL(file);
      
      setOptions(prev => {
        const newOptions = [...prev];
        newOptions[index] = {
          ...newOptions[index],
          text: '',
          image: { file, preview, ...dimensions },
          mode: 'image'
        };
        return newOptions;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid image';
      setValidationErrors(prev => ({ ...prev, [`option${index}Image`]: errorMessage }));
      error(errorMessage);
      if (optionImageInputRefs.current[index]) {
        optionImageInputRefs.current[index]!.value = '';
      }
    }
  };

  const removeQuestionImage = () => {
    if (questionImage?.preview) {
      URL.revokeObjectURL(questionImage.preview);
    }
    setQuestionImage(null);
    if (questionImageInputRef.current) {
      questionImageInputRef.current.value = '';
    }
  };

  const removeOptionImage = (index: number) => {
    setOptions(prev => {
      const newOptions = [...prev];
      if (newOptions[index].image?.preview) {
        URL.revokeObjectURL(newOptions[index].image!.preview);
      }
      newOptions[index] = {
        ...newOptions[index],
        image: undefined,
        mode: 'text'
      };
      return newOptions;
    });
    if (optionImageInputRefs.current[index]) {
      optionImageInputRefs.current[index]!.value = '';
    }
  };

  const toggleOptionMode = (index: number) => {
    setOptions(prev => {
      const newOptions = [...prev];
      const newMode: OptionMode = newOptions[index].mode === 'text' ? 'image' : 'text';
      
      if (newMode === 'text') {
        if (newOptions[index].image?.preview) {
          URL.revokeObjectURL(newOptions[index].image!.preview);
        }
        newOptions[index] = {
          ...newOptions[index],
          image: undefined,
          text: '',
          mode: 'text'
        };
      } else {
        newOptions[index] = {
          ...newOptions[index],
          text: '',
          mode: 'image'
        };
      }
      return newOptions;
    });
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setOptions(prev => {
      const newOptions = [...prev];
      if (field === 'text') {
        newOptions[index] = { ...newOptions[index], text: value as string };
      } else {
        if (questionType === 'MCQ_SINGLE') {
          newOptions.forEach((opt, idx) => {
            opt.isCorrect = idx === index && value === true;
          });
        } else {
          newOptions[index].isCorrect = value as boolean;
        }
      }
      return newOptions;
    });
  };

  const addOption = () => {
    setOptions(prev => [...prev, { text: '', isCorrect: false, mode: 'text' }]);
  };

  const removeOption = (index: number) => {
    setOptions(prev => {
      const newOptions = [...prev];
      if (newOptions[index].image?.preview) {
        URL.revokeObjectURL(newOptions[index].image!.preview);
      }
      newOptions.splice(index, 1);
      return newOptions;
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!questionText.trim()) {
      errors.questionText = 'Question text is required';
    }

    if (questionType === 'MCQ_SINGLE' || questionType === 'MCQ_MULTIPLE') {
      const validOptions = options.filter(opt => {
        if (opt.mode === 'text') {
          return opt.text.trim().length > 0;
        } else {
          return opt.image !== undefined || opt.existingImageId !== undefined || opt.existingImageUrl !== undefined;
        }
      });
      
      if (validOptions.length < 2) {
        errors.options = 'At least 2 options are required';
      }

      const correctAnswers = options.filter(opt => opt.isCorrect);
      if (correctAnswers.length === 0) {
        errors.correctAnswers = 'At least one option must be marked as correct';
      }

      if (questionType === 'MCQ_SINGLE' && correctAnswers.length !== 1) {
        errors.correctAnswers = 'MCQ_SINGLE questions must have exactly one correct answer';
      }

      options.forEach((opt, idx) => {
        if (opt.mode === 'text' && !opt.text.trim()) {
          errors[`option${idx}`] = `Option ${idx + 1} must have text`;
        }
        if (opt.mode === 'image' && !opt.image && !opt.existingImageId && !opt.existingImageUrl) {
          errors[`option${idx}`] = `Option ${idx + 1} must have an image`;
        }
      });
    } else if (questionType === 'SINGLE_WORD') {
      if (!correctAnswer.trim()) {
        errors.correctAnswer = 'Correct answer is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !examId) {
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Only append exam_id when creating, not when updating (backend doesn't accept it for updates)
      if (!isEditMode) {
        formData.append('exam_id', examId);
      }
      
      formData.append('question_text', questionText);
      formData.append('type', questionType);

      if (questionImage) {
        formData.append('question_image', questionImage.file);
      }

      let metadata: any = {};

      if (questionType === 'MCQ_SINGLE' || questionType === 'MCQ_MULTIPLE') {
        const processedOptions: any[] = [];
        const correctAnswerIndices: number[] = [];
        const imageFiles: File[] = [];

        options.forEach((opt) => {
          const hasContent = opt.mode === 'text' 
            ? opt.text.trim().length > 0 
            : (opt.image !== undefined || opt.existingImageId !== undefined || opt.existingImageUrl !== undefined);
          
          if (hasContent) {
            const processedIndex = processedOptions.length;
            
            if (opt.mode === 'image') {
              if (opt.image) {
                // New image uploaded - send file
                imageFiles.push(opt.image.file);
                processedOptions.push({ image_id: 'placeholder' });
              } else if (opt.existingImageId) {
                // Keep existing image - send the actual image_id
                // The backend will preserve this image
                processedOptions.push({ image_id: opt.existingImageId });
              } else {
                // This shouldn't happen, but handle gracefully
                console.warn(`Option ${processedIndex} is in image mode but has no image`);
              }
            } else {
              processedOptions.push({ text: opt.text });
            }
            
            if (opt.isCorrect) {
              correctAnswerIndices.push(processedIndex);
            }
          }
        });

        imageFiles.forEach((file) => {
          formData.append('option_images', file);
        });

        metadata = {
          options: processedOptions,
          correct_answers: correctAnswerIndices
        };
      } else if (questionType === 'SINGLE_WORD') {
        metadata = {
          correct_answer: correctAnswer
        };
      }

      formData.append('metadata', JSON.stringify(metadata));

      const url = isEditMode 
        ? getApiUrl(`/v1/exams/question/${questionId}`)
        : getApiUrl('/v1/exams/question');
      
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        // Don't set Content-Type header - let browser set it with boundary for FormData
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} question`);
      }

      success(`Question ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate(`${getBasePath()}/exam/${examId}`, { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create question';
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (questionImage?.preview) {
      URL.revokeObjectURL(questionImage.preview);
    }
    if (existingQuestionImageBlob) {
      URL.revokeObjectURL(existingQuestionImageBlob);
    }
    options.forEach(opt => {
      if (opt.image?.preview) {
        URL.revokeObjectURL(opt.image.preview);
      }
      if (opt.existingImageBlob) {
        URL.revokeObjectURL(opt.existingImageBlob);
      }
    });
    navigate(`${getBasePath()}/exam/${examId}`, { replace: true });
  };

  if (loadingQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="-ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-medium text-foreground">
              {isEditMode ? 'Edit Question' : 'Create Question'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={questionType}
              onValueChange={(value: 'MCQ_SINGLE' | 'MCQ_MULTIPLE' | 'SINGLE_WORD') => {
                setQuestionType(value);
                if (value === 'SINGLE_WORD') {
                  setOptions([{ text: '', isCorrect: false, mode: 'text' }]);
                } else {
                  setOptions([
                    { text: '', isCorrect: false, mode: 'text' },
                    { text: '', isCorrect: false, mode: 'text' },
                    { text: '', isCorrect: false, mode: 'text' },
                    { text: '', isCorrect: false, mode: 'text' }
                  ]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MCQ_SINGLE">Single Choice</SelectItem>
                <SelectItem value="MCQ_MULTIPLE">Multiple Choice</SelectItem>
                <SelectItem value="SINGLE_WORD">Single Word</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Question Paper Layout */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-8 pb-6 space-y-8">
          {/* Question Section - Top */}
          <div className="space-y-6">
            {/* Question Text - Full Width */}
            <div className="space-y-2">
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter your question here..."
                rows={5}
                className={`w-full resize-none text-base border border-border rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20 bg-background text-foreground placeholder:text-muted-foreground ${
                  validationErrors.questionText ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                }`}
              />
              {validationErrors.questionText && (
                <p className="text-sm text-red-500">{validationErrors.questionText}</p>
              )}
            </div>

            {/* Question Image - Full Width */}
            <div className="space-y-2">
              {questionImage ? (
                <div className="space-y-2">
                  <div className="relative w-full rounded-lg border border-border overflow-hidden bg-muted/30 dark:bg-muted/20">
                    <img
                      src={questionImage.preview}
                      alt="Question"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeQuestionImage}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              ) : existingQuestionImageBlob || existingQuestionImageUrl ? (
                <div className="space-y-2">
                  <div className="relative w-full rounded-lg border border-border overflow-hidden bg-muted/30 dark:bg-muted/20">
                    {existingQuestionImageBlob ? (
                      <img
                        src={existingQuestionImageBlob}
                        alt="Question"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    ) : (
                      <ImageWithFallback
                        src={existingQuestionImageUrl}
                        fallback={<ImageIcon className="h-12 w-12 text-muted-foreground" />}
                        alt="Question"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (existingQuestionImageBlob) {
                        URL.revokeObjectURL(existingQuestionImageBlob);
                      }
                      setExistingQuestionImageId(null);
                      setExistingQuestionImageUrl(null);
                      setExistingQuestionImageBlob(null);
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="w-full">
                  <input
                    ref={questionImageInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleQuestionImageChange}
                    className="hidden"
                    id="question-image-input"
                  />
                  <Label htmlFor="question-image-input" className="w-full">
                    <div className="w-full border-2 border-dashed border-border rounded-lg p-20 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all">
                      <div className="flex flex-col items-center gap-4">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="text-base font-medium text-foreground">Click to upload question image</p>
                          <p className="text-sm text-muted-foreground mt-1">Max 5MB • 1920x1080px • JPEG or PNG</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              )}
              {validationErrors.questionImage && (
                <p className="text-sm text-red-500">{validationErrors.questionImage}</p>
              )}
            </div>
          </div>

          {/* Options Section - 2x2 Grid */}
          {(questionType === 'MCQ_SINGLE' || questionType === 'MCQ_MULTIPLE') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Options</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={addOption}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>

              {validationErrors.options && (
                <Alert variant="destructive" className="border-0 bg-red-50 dark:bg-red-950/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{validationErrors.options}</AlertDescription>
                </Alert>
              )}
              {validationErrors.correctAnswers && (
                <Alert variant="destructive" className="border-0 bg-red-50 dark:bg-red-950/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{validationErrors.correctAnswers}</AlertDescription>
                </Alert>
              )}

              {/* 2x2 Grid Layout */}
              <div className="grid grid-cols-2 gap-4">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className={`relative border-2 rounded-lg p-4 transition-all bg-card ${
                      option.isCorrect
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {/* Option Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOptionChange(index, 'isCorrect', questionType === 'MCQ_MULTIPLE' ? !option.isCorrect : true)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all cursor-pointer hover:scale-110 ${
                            option.isCorrect
                              ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          title={option.isCorrect ? 'Click to unmark as correct' : 'Click to mark as correct'}
                        >
                          {String.fromCharCode(65 + index)}
                        </button>
                        <span className="text-xs text-muted-foreground dark:text-foreground/70">Option {index + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Mode Toggle */}
                        <div className="flex items-center gap-1 bg-muted dark:bg-muted/50 rounded p-0.5">
                          <button
                            type="button"
                            onClick={() => toggleOptionMode(index)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              option.mode === 'text'
                                ? 'bg-background dark:bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Type className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleOptionMode(index)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              option.mode === 'image'
                                ? 'bg-background dark:bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <ImageIcon className="h-3 w-3" />
                          </button>
                        </div>
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Option Content */}
                    <div className="space-y-3">
                      {option.mode === 'text' ? (
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}...`}
                          className={`h-9 text-sm bg-background text-foreground ${
                            validationErrors[`option${index}`] ? 'border-red-500' : ''
                          }`}
                        />
                      ) : (
                        <div className="space-y-2">
                          {option.image ? (
                            <div className="space-y-2">
                              <div className="relative w-full rounded-lg border border-border overflow-hidden bg-muted/30 dark:bg-muted/20">
                                <img
                                  src={option.image.preview}
                                  alt={`Option ${String.fromCharCode(65 + index)}`}
                                  className="w-full h-auto max-h-64 object-contain"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOptionImage(index)}
                                className="w-full"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove Image
                              </Button>
                            </div>
                          ) : option.existingImageBlob || option.existingImageUrl ? (
                            <div className="space-y-2">
                              <div className="relative w-full rounded-lg border border-border overflow-hidden bg-muted/30 dark:bg-muted/20">
                                {option.existingImageBlob ? (
                                  <img
                                    src={option.existingImageBlob}
                                    alt={`Option ${String.fromCharCode(65 + index)}`}
                                    className="w-full h-auto max-h-64 object-contain"
                                  />
                                ) : (
                                  <ImageWithFallback
                                    src={option.existingImageUrl || null}
                                    fallback={<ImageIcon className="h-8 w-8 text-muted-foreground" />}
                                    alt={`Option ${String.fromCharCode(65 + index)}`}
                                    className="w-full h-auto max-h-64 object-contain"
                                  />
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (option.existingImageBlob) {
                                    URL.revokeObjectURL(option.existingImageBlob);
                                  }
                                  setOptions(prev => prev.map((opt, idx) => 
                                    idx === index 
                                      ? { ...opt, existingImageId: undefined, existingImageUrl: null, existingImageBlob: null, mode: 'text' as OptionMode }
                                      : opt
                                  ));
                                }}
                                className="w-full"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove Image
                              </Button>
                            </div>
                          ) : (
                            <div className="w-full">
                              <input
                                ref={(el) => { optionImageInputRefs.current[index] = el; }}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(e) => handleOptionImageChange(index, e)}
                                className="hidden"
                                id={`option-image-input-${index}`}
                              />
                              <Label htmlFor={`option-image-input-${index}`} className="w-full">
                                <div className="w-full border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all">
                                  <div className="flex flex-col items-center gap-3">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium text-foreground">Click to upload option image</p>
                                      <p className="text-xs text-muted-foreground mt-1">Max 5MB • 1920x1080px</p>
                                    </div>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Validation Errors */}
                      {validationErrors[`option${index}`] && (
                        <p className="text-xs text-red-500">{validationErrors[`option${index}`]}</p>
                      )}
                      {validationErrors[`option${index}Image`] && (
                        <p className="text-xs text-red-500">{validationErrors[`option${index}Image`]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single Word Answer */}
          {questionType === 'SINGLE_WORD' && (
            <div className="space-y-2">
              <Label htmlFor="correct-answer" className="text-sm font-medium text-foreground">
                Correct Answer
              </Label>
              <Input
                id="correct-answer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter the correct answer..."
                className={`bg-background text-foreground ${
                  validationErrors.correctAnswer ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.correctAnswer && (
                <p className="text-sm text-red-500">{validationErrors.correctAnswer}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-border flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || loadingQuestion}
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Question' : 'Create Question'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
