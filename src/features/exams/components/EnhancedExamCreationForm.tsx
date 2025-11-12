import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Switch } from '../../../shared/components/ui/switch';
import { Badge } from '../../../shared/components/ui/badge';
import { Separator } from '../../../shared/components/ui/separator';
import { Calendar } from '../../../shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shared/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/components/ui/dialog';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { QuestionManagement, Question } from './QuestionManagement';
import { motion } from 'motion/react';
import { 
  CalendarIcon, 
  Clock, 
  Users, 
  FileText, 
  Settings, 
  Save, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Plus,
  BookOpen,
  Target,
  Layers,
  Shield,
  Timer,
  Mail,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  Camera,
  CameraOff
} from 'lucide-react';

interface ExamFormData {
  title: string;
  description: string;
  entityId: string;
  type: 'MCQ' | 'ONE_WORD' | 'DESCRIPTIVE' | 'HYBRID';
  duration: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  instructions: string;
  passingMarks: number;
  totalMarks: number;
  allowRetake: boolean;
  maxAttempts: number;
  randomizeQuestions: boolean;
  showResultsImmediately: boolean;
  proctoring: boolean;
  category: string;
  tags: string[];
  questions: Question[];
  timePerQuestion?: number;
  negativeMarking: boolean;
  negativeMarkingValue: number;
  autoSubmit: boolean;
  allowReview: boolean;
  showQuestionNumbers: boolean;
  preventCopyPaste: boolean;
  lockdownBrowser: boolean;
}

interface EnhancedExamCreationFormProps {
  onSave: (examData: ExamFormData) => void;
  onCancel: () => void;
  currentEntity?: string;
  examToEdit?: Partial<ExamFormData>;
}

const examCategories = [
  'Academic Assessment',
  'Certification Exam',
  'Practice Test',
  'Quiz',
  'Mid-term Exam',
  'Final Exam',
  'Entrance Test',
  'Skill Assessment',
  'Placement Test',
  'Competitive Exam'
];

const examTypes = [
  { value: 'MCQ', label: 'Multiple Choice Questions', description: 'Only multiple choice questions' },
  { value: 'ONE_WORD', label: 'One Word Answers', description: 'Short answer questions' },
  { value: 'DESCRIPTIVE', label: 'Descriptive', description: 'Long form written answers' },
  { value: 'HYBRID', label: 'Mixed Types', description: 'Combination of different question types' }
];

export function EnhancedExamCreationForm({ 
  onSave, 
  onCancel, 
  currentEntity,
  examToEdit 
}: EnhancedExamCreationFormProps) {
  const { user } = useAuth();
  const { success, error: showError } = useNotifications();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ExamFormData>({
    title: examToEdit?.title || '',
    description: examToEdit?.description || '',
    entityId: examToEdit?.entityId || currentEntity || user?.entityId || '',
    type: examToEdit?.type || 'MCQ',
    duration: examToEdit?.duration || 60,
    startDate: examToEdit?.startDate ? new Date(examToEdit.startDate as any) : undefined,
    endDate: examToEdit?.endDate ? new Date(examToEdit.endDate as any) : undefined,
    instructions: examToEdit?.instructions || '',
    passingMarks: examToEdit?.passingMarks || 50,
    totalMarks: examToEdit?.totalMarks || 100,
    allowRetake: examToEdit?.allowRetake || false,
    maxAttempts: examToEdit?.maxAttempts || 1,
    randomizeQuestions: examToEdit?.randomizeQuestions || false,
    showResultsImmediately: examToEdit?.showResultsImmediately || true,
    proctoring: examToEdit?.proctoring || false,
    category: examToEdit?.category || '',
    tags: examToEdit?.tags || [],
    questions: examToEdit?.questions || [],
    timePerQuestion: examToEdit?.timePerQuestion || undefined,
    negativeMarking: examToEdit?.negativeMarking || false,
    negativeMarkingValue: examToEdit?.negativeMarkingValue || 0.25,
    autoSubmit: examToEdit?.autoSubmit !== undefined ? examToEdit.autoSubmit : true,
    allowReview: examToEdit?.allowReview !== undefined ? examToEdit.allowReview : true,
    showQuestionNumbers: examToEdit?.showQuestionNumbers !== undefined ? examToEdit.showQuestionNumbers : true,
    preventCopyPaste: examToEdit?.preventCopyPaste || false,
    lockdownBrowser: examToEdit?.lockdownBrowser || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreview, setIsPreview] = useState(false);
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [microphoneStatus, setMicrophoneStatus] = useState<'checking' | 'granted' | 'denied' | 'not-checked'>('not-checked');
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Mock entities for dropdown
  const availableEntities = [
    { id: 'entity-1', name: 'Springfield High School' },
    { id: 'entity-2', name: 'Riverside College' },
    { id: 'entity-3', name: 'Tech University' }
  ];

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Exam title is required';
      if (!formData.description.trim()) newErrors.description = 'Exam description is required';
      if (!formData.entityId) newErrors.entityId = 'Entity selection is required';
      if (!formData.category) newErrors.category = 'Category is required';
    }

    if (step === 2) {
      if (formData.duration <= 0) newErrors.duration = 'Duration must be greater than 0';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (formData.passingMarks < 0 || formData.passingMarks > formData.totalMarks) {
        newErrors.passingMarks = 'Passing marks must be between 0 and total marks';
      }
    }

    if (step === 3) {
      if (formData.questions.length === 0) {
        newErrors.questions = 'At least one question is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      showError('Please fix the errors before proceeding');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(1) && validateStep(2) && validateStep(3) && validateStep(4)) {
      // Calculate total marks from questions
      const calculatedTotalMarks = formData.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
      const finalFormData = {
        ...formData,
        totalMarks: calculatedTotalMarks > 0 ? calculatedTotalMarks : formData.totalMarks
      };
      
      onSave(finalFormData);
      success('Exam created successfully!');
    } else {
      showError('Please complete all required fields');
    }
  };

  const handleInputChange = (field: keyof ExamFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleInputChange('tags', [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const checkMicrophone = async () => {
    setMicrophoneStatus('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicrophoneStatus('granted');
      
      // Set up audio level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (analyserRef.current && microphoneStatus === 'granted') {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();
      
      success('Microphone access granted successfully!');
    } catch (error) {
      setMicrophoneStatus('denied');
      showError('Microphone access denied. This may affect proctoring features.');
    }
  };

  const stopMicrophoneCheck = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setMicrophoneStatus('not-checked');
    setAudioLevel(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicrophoneCheck();
    };
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Title, description, and category' },
    { number: 2, title: 'Configuration', description: 'Duration, dates, and scoring' },
    { number: 3, title: 'Questions', description: 'Add and manage questions' },
    { number: 4, title: 'Settings', description: 'Advanced exam settings' }
  ];

  if (showQuestionManager) {
    return (
      <QuestionManagement
        examId="new-exam"
        examTitle={formData.title || 'New Exam'}
      />
    );
  }

  if (isPreview) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{formData.title}</CardTitle>
                <CardDescription>{formData.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{formData.category}</Badge>
                <Badge variant="outline">{formData.type}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(formData.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.totalMarks} total marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.passingMarks} passing marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.questions.length} questions</span>
                </div>
                {formData.startDate && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Starts: {formData.startDate.toLocaleDateString()}</span>
                  </div>
                )}
                {formData.endDate && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Ends: {formData.endDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Allow Retake:</span>
                      <span>{formData.allowRetake ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Attempts:</span>
                      <span>{formData.maxAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Randomize Questions:</span>
                      <span>{formData.randomizeQuestions ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Show Results Immediately:</span>
                      <span>{formData.showResultsImmediately ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proctoring:</span>
                      <span>{formData.proctoring ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Negative Marking:</span>
                      <span>{formData.negativeMarking ? `Yes (-${formData.negativeMarkingValue})` : 'No'}</span>
                    </div>
                  </div>
                </div>
                
                {formData.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {formData.instructions && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Instructions</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{formData.instructions}</p>
                </div>
              </div>
            )}

            {formData.questions.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Questions ({formData.questions.length})</h4>
                <div className="space-y-2">
                  {formData.questions.map((question, index) => (
                    <div key={question.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{index + 1}. {question.question_text}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {question.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.marks || 0} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setIsPreview(false)}>
            <Settings className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step.number === currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : step.number < currentStep 
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {step.number < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
              {step.number < steps.length && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  step.number < currentStep ? 'bg-success' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {examToEdit ? 'Edit Exam' : 'Create New Exam'} - Step {currentStep}
          </CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Exam Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter exam title"
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {examCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-xs text-destructive mt-1">{errors.category}</p>
                    )}
                  </div>

                  {user?.role === 'SUPERADMIN' && (
                    <div>
                      <Label htmlFor="entity">Entity *</Label>
                      <Select 
                        value={formData.entityId} 
                        onValueChange={(value) => handleInputChange('entityId', value)}
                      >
                        <SelectTrigger className={errors.entityId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEntities.map((entity) => (
                            <SelectItem key={entity.id} value={entity.id}>
                              {entity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.entityId && (
                        <p className="text-xs text-destructive mt-1">{errors.entityId}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Exam Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'MCQ' | 'ONE_WORD' | 'DESCRIPTIVE' | 'HYBRID') => 
                        handleInputChange('type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {examTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter exam description"
                  rows={3}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Enter detailed instructions for students"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                        placeholder="60"
                        min="1"
                        className={errors.duration ? 'border-destructive' : ''}
                      />
                      {errors.duration && (
                        <p className="text-xs text-destructive mt-1">{errors.duration}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="totalMarks">Total Marks *</Label>
                      <Input
                        id="totalMarks"
                        type="number"
                        value={formData.totalMarks}
                        onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value) || 0)}
                        placeholder="100"
                        min="1"
                      />
                      {formData.questions.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Will be calculated from questions: {formData.questions.reduce((sum, q) => sum + (q.marks || 0), 0)} points
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="passingMarks">Passing Marks *</Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      value={formData.passingMarks}
                      onChange={(e) => handleInputChange('passingMarks', parseInt(e.target.value) || 0)}
                      placeholder="50"
                      min="0"
                      max={formData.totalMarks}
                      className={errors.passingMarks ? 'border-destructive' : ''}
                    />
                    {errors.passingMarks && (
                      <p className="text-xs text-destructive mt-1">{errors.passingMarks}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Attempts</Label>
                      <Input
                        type="number"
                        value={formData.maxAttempts}
                        onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <Label>Time per Question (optional)</Label>
                      <Input
                        type="number"
                        value={formData.timePerQuestion || ''}
                        onChange={(e) => handleInputChange('timePerQuestion', parseInt(e.target.value) || undefined)}
                        placeholder="Optional"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${errors.startDate ? 'border-destructive' : ''} ${!formData.startDate && 'text-muted-foreground'}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate ? formData.startDate.toLocaleDateString() : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => handleInputChange('startDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.startDate && (
                        <p className="text-xs text-destructive mt-1">{errors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <Label>End Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${errors.endDate ? 'border-destructive' : ''} ${!formData.endDate && 'text-muted-foreground'}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? formData.endDate.toLocaleDateString() : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => handleInputChange('endDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.endDate && (
                        <p className="text-xs text-destructive mt-1">{errors.endDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Negative Marking</Label>
                        <p className="text-xs text-muted-foreground">Deduct marks for wrong answers</p>
                      </div>
                      <Switch
                        checked={formData.negativeMarking}
                        onCheckedChange={(checked) => handleInputChange('negativeMarking', checked)}
                      />
                    </div>

                    {formData.negativeMarking && (
                      <div>
                        <Label>Negative Marking Value</Label>
                        <Input
                          type="number"
                          value={formData.negativeMarkingValue}
                          onChange={(e) => handleInputChange('negativeMarkingValue', parseFloat(e.target.value) || 0)}
                          placeholder="0.25"
                          step="0.1"
                          min="0"
                          max="1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Marks to deduct for each wrong answer
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Questions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Questions</h3>
                  <p className="text-muted-foreground">
                    Add questions to your exam. You currently have {formData.questions.length} questions.
                  </p>
                </div>
                <Button
                  onClick={() => setShowQuestionManager(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Questions
                </Button>
              </div>

              {errors.questions && (
                <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{errors.questions}</span>
                  </div>
                </div>
              )}

              {formData.questions.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{formData.questions.length}</div>
                        <div className="text-sm text-muted-foreground">Total Questions</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {formData.questions.reduce((sum, q) => sum + (q.marks || 0), 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Points</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {formData.questions.length > 0 ? Math.round(formData.questions.reduce((sum, q) => sum + (q.marks || 0), 0) / formData.questions.length) : 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Points</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {formatDuration(Math.round(formData.duration / formData.questions.length))}
                        </div>
                        <div className="text-sm text-muted-foreground">Time per Q</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {formData.questions.map((question, index) => (
                      <Card key={question.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                  Q{index + 1}
                                </span>
                                <h4 className="font-medium">{question.question_text}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {question.question_text}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{question.type}</Badge>
                              <Badge variant="outline">{question.marks || 0} pts</Badge>
                              {question.metadata?.difficulty && (
                                <Badge variant="outline" className={
                                  question.metadata.difficulty === 'Easy' ? 'text-green-600' :
                                  question.metadata.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                }>
                                  {question.metadata.difficulty}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No questions added yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your exam by adding questions
                  </p>
                  <Button
                    onClick={() => setShowQuestionManager(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Exam Settings</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowRetake">Allow Retake</Label>
                      <p className="text-xs text-muted-foreground">Students can retake the exam</p>
                    </div>
                    <Switch
                      id="allowRetake"
                      checked={formData.allowRetake}
                      onCheckedChange={(checked) => handleInputChange('allowRetake', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
                      <p className="text-xs text-muted-foreground">Shuffle question order</p>
                    </div>
                    <Switch
                      id="randomizeQuestions"
                      checked={formData.randomizeQuestions}
                      onCheckedChange={(checked) => handleInputChange('randomizeQuestions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoSubmit">Auto Submit</Label>
                      <p className="text-xs text-muted-foreground">Submit automatically when time ends</p>
                    </div>
                    <Switch
                      id="autoSubmit"
                      checked={formData.autoSubmit}
                      onCheckedChange={(checked) => handleInputChange('autoSubmit', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowReview">Allow Review</Label>
                      <p className="text-xs text-muted-foreground">Students can review answers before submit</p>
                    </div>
                    <Switch
                      id="allowReview"
                      checked={formData.allowReview}
                      onCheckedChange={(checked) => handleInputChange('allowReview', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showResultsImmediately">Show Results Immediately</Label>
                      <p className="text-xs text-muted-foreground">Display results after submission</p>
                    </div>
                    <Switch
                      id="showResultsImmediately"
                      checked={formData.showResultsImmediately}
                      onCheckedChange={(checked) => handleInputChange('showResultsImmediately', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="proctoring">Enable Proctoring</Label>
                      <p className="text-xs text-muted-foreground">Monitor exam attempts</p>
                    </div>
                    <Switch
                      id="proctoring"
                      checked={formData.proctoring}
                      onCheckedChange={(checked) => handleInputChange('proctoring', checked)}
                    />
                  </div>

                  {/* Microphone Check - Show only when proctoring is enabled */}
                  {formData.proctoring && (
                    <Card className="border-dashed border-2 border-muted-foreground/20">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Mic className="h-4 w-4 text-primary" />
                              <div>
                                <Label>Microphone Check</Label>
                                <p className="text-xs text-muted-foreground">Test microphone for proctoring</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {microphoneStatus === 'not-checked' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={checkMicrophone}
                                  className="flex items-center gap-2"
                                >
                                  <Mic className="h-4 w-4" />
                                  Test Mic
                                </Button>
                              )}
                              {microphoneStatus === 'checking' && (
                                <div className="flex items-center gap-2 text-blue-600">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  <span className="text-sm">Checking...</span>
                                </div>
                              )}
                              {microphoneStatus === 'granted' && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm">Working</span>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={stopMicrophoneCheck}
                                  >
                                    <MicOff className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {microphoneStatus === 'denied' && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">Access Denied</span>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={checkMicrophone}
                                  >
                                    <Mic className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Audio Level Indicator */}
                          {microphoneStatus === 'granted' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Audio Level</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-100"
                                  style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Speak normally to test your microphone. The bar should move when you speak.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="preventCopyPaste">Prevent Copy/Paste</Label>
                      <p className="text-xs text-muted-foreground">Disable copy-paste functionality</p>
                    </div>
                    <Switch
                      id="preventCopyPaste"
                      checked={formData.preventCopyPaste}
                      onCheckedChange={(checked) => handleInputChange('preventCopyPaste', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lockdownBrowser">Lockdown Browser</Label>
                      <p className="text-xs text-muted-foreground">Restrict browser features during exam</p>
                    </div>
                    <Switch
                      id="lockdownBrowser"
                      checked={formData.lockdownBrowser}
                      onCheckedChange={(checked) => handleInputChange('lockdownBrowser', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => setIsPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              {examToEdit ? 'Update Exam' : 'Create Exam'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}