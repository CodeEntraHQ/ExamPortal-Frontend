import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/providers/AuthProvider';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Textarea } from '../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/components/ui/select';
import { useNotifications } from '../../shared/providers/NotificationProvider';
import { examApi, CreateQuestionPayload } from '../../services/api/exam';
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

interface ImagePreview {
  file: File;
  preview: string;
  width?: number;
  height?: number;
}

type OptionMode = 'text' | 'image';

export function QuestionCreationPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { success, error } = useNotifications();
  
  const getBasePath = () => {
    if (location.pathname.includes('/superadmin/')) {
      return '/superadmin';
    }
    return '/admin';
  };
  
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'MCQ_SINGLE' | 'MCQ_MULTIPLE' | 'SINGLE_WORD'>('MCQ_SINGLE');
  const [questionImage, setQuestionImage] = useState<ImagePreview | null>(null);
  const [options, setOptions] = useState<Array<{ 
    text: string; 
    image?: ImagePreview; 
    isCorrect: boolean;
    mode: OptionMode;
  }>>([
    { text: '', isCorrect: false, mode: 'text' },
    { text: '', isCorrect: false, mode: 'text' },
    { text: '', isCorrect: false, mode: 'text' },
    { text: '', isCorrect: false, mode: 'text' }
  ]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const optionImageInputRefs = useRef<Array<HTMLInputElement | null>>([]);

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
          return opt.image !== undefined;
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
        if (opt.mode === 'image' && !opt.image) {
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
      formData.append('exam_id', examId);
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
          const hasContent = opt.mode === 'text' ? opt.text.trim().length > 0 : opt.image !== undefined;
          
          if (hasContent) {
            const processedIndex = processedOptions.length;
            
            if (opt.mode === 'image' && opt.image) {
              imageFiles.push(opt.image.file);
              processedOptions.push({ image_id: 'placeholder' });
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

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/exams/question`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create question');
      }

      success('Question created successfully!');
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
    options.forEach(opt => {
      if (opt.image?.preview) {
        URL.revokeObjectURL(opt.image.preview);
      }
    });
    navigate(`${getBasePath()}/exam/${examId}`, { replace: true });
  };

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
            <h1 className="text-2xl font-medium text-foreground">Create Question</h1>
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
                <div className="relative w-full group">
                  <div className="relative w-full rounded-lg border border-border overflow-hidden bg-muted/30 dark:bg-muted/20">
                    <img
                      src={questionImage.preview}
                      alt="Question"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeQuestionImage}
                      className="absolute top-3 right-3 p-2 rounded-full bg-background/90 dark:bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity border border-border shadow-lg hover:bg-background"
                    >
                      <X className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <Input
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
                            <div className="relative w-full group">
                              <div className="relative w-full rounded-lg border border-border overflow-hidden bg-muted/30 dark:bg-muted/20">
                                <img
                                  src={option.image.preview}
                                  alt={`Option ${String.fromCharCode(65 + index)}`}
                                  className="w-full h-auto max-h-64 object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOptionImage(index)}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 dark:bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity border border-border shadow-lg hover:bg-background"
                                >
                                  <X className="h-4 w-4 text-foreground" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full">
                              <Input
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
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Question'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
