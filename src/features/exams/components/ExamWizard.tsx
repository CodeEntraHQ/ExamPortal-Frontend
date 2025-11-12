import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Badge } from '../../../shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { Switch } from '../../../shared/components/ui/switch';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { Progress } from '../../../shared/components/ui/progress';
import { Separator } from '../../../shared/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/components/ui/dialog';
import { 
  ChevronLeft,
  ChevronRight,
  Save,
  Upload,
  Download,
  Eye,
  Calendar,
  Clock,
  Settings,
  Plus,
  Trash2,
  Copy,
  BookOpen,
  FileText,
  Image,
  Video,
  Mic,
  Code,
  Calculator,
  ListOrdered,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  Timer,
  Users,
  Globe,
  Lock,
  Shuffle,
  Brain,
  Award,
  TrendingUp,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { AIAssistantPanel } from '../../../shared/components/common/AIAssistantPanel';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  content: string;
  points: number;
  negativeMarking: number;
  timeLimit?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  explanation?: string;
  hint?: string;
  metadata: Record<string, any>;
  options?: QuestionOption[];
  correctAnswers?: string[];
  caseSensitive?: boolean;
  tolerance?: number;
  formula?: string;
  codeLanguage?: string;
  testCases?: TestCase[];
  attachmentRequired?: boolean;
  rubric?: RubricCriteria[];
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  points: number;
}

interface RubricCriteria {
  criteria: string;
  points: number;
  description: string;
}

type QuestionType = 
  | 'mcq-single'
  | 'mcq-multiple'
  | 'true-false'
  | 'short-answer'
  | 'long-answer'
  | 'numeric'
  | 'formula'
  | 'fill-blank'
  | 'matching'
  | 'ordering'
  | 'file-upload'
  | 'image-hotspot'
  | 'audio-response'
  | 'video-response'
  | 'code-editor'
  | 'drag-drop'
  | 'matrix'
  | 'cloze'
  | 'adaptive'
  | 'composite'
  | 'survey'
  | 'peer-assessment';

interface ExamSection {
  id: string;
  name: string;
  description: string;
  timeLimit?: number;
  questions: Question[];
  shuffle: boolean;
  showOneAtTime: boolean;
}

interface ExamSettings {
  title: string;
  description: string;
  instructions: string;
  tags: string[];
  language: string;
  timeZone: string;
  duration: number;
  startDate?: Date;
  endDate?: Date;
  maxAttempts: number;
  passingScore: number;
  showResults: boolean;
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  allowBackNavigation: boolean;
  proctoring: {
    camera: boolean;
    screenShare: boolean;
    browserLockdown: boolean;
    plagiarismCheck: boolean;
  };
  accessibility: {
    extraTime: number;
    screenReader: boolean;
    highContrast: boolean;
    largeFonts: boolean;
  };
}

interface ExamWizardProps {
  isOpen: boolean;
  onClose: () => void;
  examId?: string;
  onSave: (exam: any) => void;
}

const questionTypes: { value: QuestionType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'mcq-single', label: 'Multiple Choice (Single)', icon: <CheckCircle className="h-4 w-4" />, description: 'Single correct answer from multiple options' },
  { value: 'mcq-multiple', label: 'Multiple Choice (Multiple)', icon: <CheckCircle className="h-4 w-4" />, description: 'Multiple correct answers from options' },
  { value: 'true-false', label: 'True/False', icon: <CheckCircle className="h-4 w-4" />, description: 'Binary choice question' },
  { value: 'short-answer', label: 'Short Answer', icon: <FileText className="h-4 w-4" />, description: 'Brief text response' },
  { value: 'long-answer', label: 'Long Answer', icon: <FileText className="h-4 w-4" />, description: 'Extended text response' },
  { value: 'numeric', label: 'Numeric', icon: <Calculator className="h-4 w-4" />, description: 'Numerical answer with tolerance' },
  { value: 'formula', label: 'Formula/LaTeX', icon: <Calculator className="h-4 w-4" />, description: 'Mathematical formula or LaTeX expression' },
  { value: 'fill-blank', label: 'Fill in the Blank', icon: <FileText className="h-4 w-4" />, description: 'Complete missing text' },
  { value: 'matching', label: 'Matching', icon: <ListOrdered className="h-4 w-4" />, description: 'Match items from two lists' },
  { value: 'ordering', label: 'Ordering', icon: <ListOrdered className="h-4 w-4" />, description: 'Arrange items in correct order' },
  { value: 'file-upload', label: 'File Upload', icon: <Upload className="h-4 w-4" />, description: 'Upload document or file' },
  { value: 'image-hotspot', label: 'Image Hotspot', icon: <Image className="h-4 w-4" />, description: 'Click areas on an image' },
  { value: 'audio-response', label: 'Audio Response', icon: <Mic className="h-4 w-4" />, description: 'Record audio answer' },
  { value: 'video-response', label: 'Video Response', icon: <Video className="h-4 w-4" />, description: 'Record video answer' },
  { value: 'code-editor', label: 'Code Editor', icon: <Code className="h-4 w-4" />, description: 'Programming code with test cases' },
  { value: 'drag-drop', label: 'Drag & Drop', icon: <RotateCcw className="h-4 w-4" />, description: 'Drag items to correct positions' },
  { value: 'matrix', label: 'Matrix', icon: <Target className="h-4 w-4" />, description: 'Grid-based multiple choice' },
  { value: 'cloze', label: 'Cloze/Gap Fill', icon: <FileText className="h-4 w-4" />, description: 'Multiple blanks in text' },
  { value: 'adaptive', label: 'Adaptive', icon: <Brain className="h-4 w-4" />, description: 'Branching logic based on answers' },
  { value: 'composite', label: 'Composite', icon: <Plus className="h-4 w-4" />, description: 'Multiple sub-questions' },
  { value: 'survey', label: 'Survey', icon: <Users className="h-4 w-4" />, description: 'Non-graded feedback collection' },
  { value: 'peer-assessment', label: 'Peer Assessment', icon: <Users className="h-4 w-4" />, description: 'Students evaluate each other' }
];

export function ExamWizard({ isOpen, onClose, examId, onSave }: ExamWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    title: '',
    description: '',
    instructions: '',
    tags: [],
    language: 'English',
    timeZone: 'UTC',
    duration: 60,
    maxAttempts: 1,
    passingScore: 70,
    showResults: true,
    showCorrectAnswers: false,
    randomizeQuestions: false,
    allowBackNavigation: true,
    proctoring: {
      camera: false,
      screenShare: false,
      browserLockdown: false,
      plagiarismCheck: false
    },
    accessibility: {
      extraTime: 0,
      screenReader: false,
      highContrast: false,
      largeFonts: false
    }
  });
  
  const [sections, setSections] = useState<ExamSection[]>([
    {
      id: '1',
      name: 'Section 1',
      description: '',
      questions: [],
      shuffle: false,
      showOneAtTime: false
    }
  ]);

  const [selectedSection, setSelectedSection] = useState(0);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const { success, error, info } = useNotifications();

  const steps = [
    { id: 'title', label: 'Title & Settings', icon: <Settings className="h-4 w-4" /> },
    { id: 'sections', label: 'Sections', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'questions', label: 'Questions', icon: <FileText className="h-4 w-4" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="h-4 w-4" /> },
    { id: 'publish', label: 'Publish', icon: <Award className="h-4 w-4" /> }
  ];

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (examSettings.title.trim()) {
        handleAutoSave();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [examSettings, sections]);

  const handleAutoSave = async () => {
    setAutoSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAutoSaveStatus('saved');
    } catch (err) {
      setAutoSaveStatus('error');
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveExam = async () => {
    try {
      const examData = {
        id: examId || Date.now().toString(),
        settings: examSettings,
        sections,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await onSave(examData);
      success('Exam saved successfully');
      onClose();
    } catch (err) {
      error('Failed to save exam');
    }
  };

  const handlePublishExam = async () => {
    if (!examSettings.title.trim()) {
      error('Please enter an exam title');
      return;
    }

    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
    if (totalQuestions === 0) {
      error('Please add at least one question');
      return;
    }

    try {
      const examData = {
        id: examId || Date.now().toString(),
        settings: examSettings,
        sections,
        status: 'published',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await onSave(examData);
      success('Exam published successfully');
      onClose();
    } catch (err) {
      error('Failed to publish exam');
    }
  };

  const addSection = () => {
    const newSection: ExamSection = {
      id: Date.now().toString(),
      name: `Section ${sections.length + 1}`,
      description: '',
      questions: [],
      shuffle: false,
      showOneAtTime: false
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      const newSections = sections.filter((_, i) => i !== index);
      setSections(newSections);
      if (selectedSection >= newSections.length) {
        setSelectedSection(newSections.length - 1);
      }
    }
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      title: '',
      content: '',
      points: 1,
      negativeMarking: 0,
      difficulty: 'Medium',
      tags: [],
      metadata: {},
      options: type.includes('mcq') || type === 'true-false' ? [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false }
      ] : undefined
    };
    
    setEditingQuestion(newQuestion);
    setShowQuestionDialog(true);
  };

  const saveQuestion = (question: Question) => {
    const updatedSections = [...sections];
    const currentSection = updatedSections[selectedSection];
    
    const existingIndex = currentSection.questions.findIndex(q => q.id === question.id);
    if (existingIndex >= 0) {
      currentSection.questions[existingIndex] = question;
    } else {
      currentSection.questions.push(question);
    }
    
    setSections(updatedSections);
    setShowQuestionDialog(false);
    setEditingQuestion(null);
    success('Question saved successfully');
  };

  const removeQuestion = (questionId: string) => {
    const updatedSections = [...sections];
    const currentSection = updatedSections[selectedSection];
    currentSection.questions = currentSection.questions.filter(q => q.id !== questionId);
    setSections(updatedSections);
    success('Question removed');
  };

  const duplicateQuestion = (questionId: string) => {
    const updatedSections = [...sections];
    const currentSection = updatedSections[selectedSection];
    const originalQuestion = currentSection.questions.find(q => q.id === questionId);
    
    if (originalQuestion) {
      const duplicatedQuestion = {
        ...originalQuestion,
        id: Date.now().toString(),
        title: `${originalQuestion.title} (Copy)`
      };
      currentSection.questions.push(duplicatedQuestion);
      setSections(updatedSections);
      success('Question duplicated');
    }
  };

  const getTotalQuestions = () => {
    return sections.reduce((sum, section) => sum + section.questions.length, 0);
  };

  const getTotalPoints = () => {
    return sections.reduce((sum, section) => 
      sum + section.questions.reduce((sectionSum, question) => sectionSum + question.points, 0), 0
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                {examId ? 'Edit Exam' : 'Create New Exam'}
              </h2>
              <p className="text-muted-foreground">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${
                  autoSaveStatus === 'saved' ? 'bg-green-500' :
                  autoSaveStatus === 'saving' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                {autoSaveStatus === 'saved' && 'Saved'}
                {autoSaveStatus === 'saving' && 'Saving...'}
                {autoSaveStatus === 'error' && 'Error saving'}
              </div>
              <Button variant="outline" onClick={() => setShowAIAssistant(true)}>
                <Zap className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
          </div>
          
          {/* Step Navigation */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {step.icon}
                <span className="hidden sm:inline text-sm">{step.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* Step Content will be rendered here */}
              {currentStep === 0 && (
                <div className="p-6 space-y-6 overflow-y-auto h-full">
                  <ExamSettingsStep examSettings={examSettings} setExamSettings={setExamSettings} />
                </div>
              )}
              
              {currentStep === 1 && (
                <div className="p-6 space-y-6 overflow-y-auto h-full">
                  <SectionsStep 
                    sections={sections} 
                    setSections={setSections}
                    selectedSection={selectedSection}
                    setSelectedSection={setSelectedSection}
                    addSection={addSection}
                    removeSection={removeSection}
                  />
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="p-6 space-y-6 overflow-y-auto h-full">
                  <QuestionsStep 
                    sections={sections}
                    selectedSection={selectedSection}
                    onAddQuestion={addQuestion}
                    onEditQuestion={(question) => {
                      setEditingQuestion(question);
                      setShowQuestionDialog(true);
                    }}
                    onRemoveQuestion={removeQuestion}
                    onDuplicateQuestion={duplicateQuestion}
                  />
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="p-6 space-y-6 overflow-y-auto h-full">
                  <ExamPreviewStep examSettings={examSettings} sections={sections} />
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="p-6 space-y-6 overflow-y-auto h-full">
                  <PublishStep 
                    examSettings={examSettings}
                    sections={sections}
                    totalQuestions={getTotalQuestions()}
                    totalPoints={getTotalPoints()}
                    onPublish={handlePublishExam}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{getTotalQuestions()} questions</span>
            <span>{getTotalPoints()} points</span>
            <span>{examSettings.duration} minutes</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSaveExam} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            )}
          </div>
        </div>

        {/* Question Dialog */}
        {showQuestionDialog && editingQuestion && (
          <QuestionEditorDialog
            question={editingQuestion}
            onSave={saveQuestion}
            onClose={() => {
              setShowQuestionDialog(false);
              setEditingQuestion(null);
            }}
          />
        )}

        {/* AI Assistant Panel */}
        <AIAssistantPanel
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          examId={examId}
        />
      </motion.div>
    </div>
  );
}

// Component implementations for each step would go here...
// For brevity, I'll implement the key components

function ExamSettingsStep({ examSettings, setExamSettings }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Exam Title *</Label>
              <Input
                value={examSettings.title}
                onChange={(e) => setExamSettings({ ...examSettings, title: e.target.value })}
                placeholder="Enter exam title"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes) *</Label>
              <Input
                type="number"
                value={examSettings.duration}
                onChange={(e) => setExamSettings({ ...examSettings, duration: parseInt(e.target.value) || 0 })}
                placeholder="90"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={examSettings.description}
              onChange={(e) => setExamSettings({ ...examSettings, description: e.target.value })}
              placeholder="Brief description of the exam"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Instructions for Students</Label>
            <Textarea
              value={examSettings.instructions}
              onChange={(e) => setExamSettings({ ...examSettings, instructions: e.target.value })}
              placeholder="Enter detailed instructions for students"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Max Attempts</Label>
              <Select 
                value={examSettings.maxAttempts?.toString()} 
                onValueChange={(value) => setExamSettings({ ...examSettings, maxAttempts: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attempts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Attempt</SelectItem>
                  <SelectItem value="2">2 Attempts</SelectItem>
                  <SelectItem value="3">3 Attempts</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Passing Score (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={examSettings.passingScore}
                onChange={(e) => setExamSettings({ ...examSettings, passingScore: parseInt(e.target.value) || 0 })}
                placeholder="70"
              />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select 
                value={examSettings.language} 
                onValueChange={(value) => setExamSettings({ ...examSettings, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date & Time</Label>
              <Input
                type="datetime-local"
                value={examSettings.startDate ? new Date(examSettings.startDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setExamSettings({ ...examSettings, startDate: new Date(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <Input
                type="datetime-local"
                value={examSettings.endDate ? new Date(examSettings.endDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setExamSettings({ ...examSettings, endDate: new Date(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Proctoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Camera Monitoring</Label>
                <Switch 
                  checked={examSettings.proctoring?.camera}
                  onCheckedChange={(checked) => setExamSettings({ 
                    ...examSettings, 
                    proctoring: { ...examSettings.proctoring, camera: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Screen Share</Label>
                <Switch 
                  checked={examSettings.proctoring?.screenShare}
                  onCheckedChange={(checked) => setExamSettings({ 
                    ...examSettings, 
                    proctoring: { ...examSettings.proctoring, screenShare: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Browser Lockdown</Label>
                <Switch 
                  checked={examSettings.proctoring?.browserLockdown}
                  onCheckedChange={(checked) => setExamSettings({ 
                    ...examSettings, 
                    proctoring: { ...examSettings.proctoring, browserLockdown: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Plagiarism Check</Label>
                <Switch 
                  checked={examSettings.proctoring?.plagiarismCheck}
                  onCheckedChange={(checked) => setExamSettings({ 
                    ...examSettings, 
                    proctoring: { ...examSettings.proctoring, plagiarismCheck: checked }
                  })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Randomize Questions</Label>
                <Switch 
                  checked={examSettings.randomizeQuestions}
                  onCheckedChange={(checked) => setExamSettings({ ...examSettings, randomizeQuestions: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow Back Navigation</Label>
                <Switch 
                  checked={examSettings.allowBackNavigation}
                  onCheckedChange={(checked) => setExamSettings({ ...examSettings, allowBackNavigation: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Results</Label>
                <Switch 
                  checked={examSettings.showResults}
                  onCheckedChange={(checked) => setExamSettings({ ...examSettings, showResults: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Correct Answers</Label>
                <Switch 
                  checked={examSettings.showCorrectAnswers}
                  onCheckedChange={(checked) => setExamSettings({ ...examSettings, showCorrectAnswers: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Extra Time (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={examSettings.accessibility?.extraTime || 0}
                  onChange={(e) => setExamSettings({ 
                    ...examSettings, 
                    accessibility: { 
                      ...examSettings.accessibility, 
                      extraTime: parseInt(e.target.value) || 0 
                    }
                  })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Screen Reader Support</Label>
                <Switch 
                  checked={examSettings.accessibility?.screenReader}
                  onCheckedChange={(checked) => setExamSettings({ 
                    ...examSettings, 
                    accessibility: { ...examSettings.accessibility, screenReader: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>High Contrast Mode</Label>
                <Switch 
                  checked={examSettings.accessibility?.highContrast}
                  onCheckedChange={(checked) => setExamSettings({ 
                    ...examSettings, 
                    accessibility: { ...examSettings.accessibility, highContrast: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Large Fonts</Label>
                <Switch 
                  checked={examSettings.accessibility?.largeFonts}
                  onCheckedChange={(checked) => setExamSettings({ 
                    ...examSettings, 
                    accessibility: { ...examSettings.accessibility, largeFonts: checked }
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionsStep({ sections, setSections, selectedSection, setSelectedSection, addSection, removeSection }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Exam Sections</h3>
        <Button onClick={addSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>
      
      <div className="grid gap-4">
        {sections.map((section: ExamSection, index: number) => (
          <Card 
            key={section.id} 
            className={`cursor-pointer transition-colors ${
              selectedSection === index ? 'ring-2 ring-primary' : 'hover:bg-accent/50'
            }`}
            onClick={() => setSelectedSection(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{section.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {section.questions.length} questions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(index);
                    }}
                    disabled={sections.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuestionsStep({ sections, selectedSection, onAddQuestion, onEditQuestion, onRemoveQuestion, onDuplicateQuestion }: any) {
  const currentSection = sections[selectedSection];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Questions - {currentSection.name}</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Select Question Type</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {questionTypes.map((type) => (
                <Card 
                  key={type.value}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onAddQuestion(type.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {type.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{type.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {currentSection.questions.map((question: Question, index: number) => (
          <Card key={question.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {questionTypes.find(t => t.value === question.type)?.label}
                    </Badge>
                    <Badge variant="outline">{question.points} pts</Badge>
                    <Badge variant="outline">{question.difficulty}</Badge>
                  </div>
                  <h4 className="font-medium">{question.title || 'Untitled Question'}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {question.content.slice(0, 100)}...
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditQuestion(question)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDuplicateQuestion(question.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {currentSection.questions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No questions added yet</p>
            <p className="text-sm">Click "Add Question" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExamPreviewStep({ examSettings, sections }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exam Preview</CardTitle>
          <CardDescription>
            This is how students will see your exam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">{examSettings.title}</h3>
              <p className="text-muted-foreground">{examSettings.description}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {examSettings.duration} minutes
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {sections.reduce((sum: number, section: ExamSection) => sum + section.questions.length, 0)} questions
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                {sections.reduce((sum: number, section: ExamSection) => 
                  sum + section.questions.reduce((qSum: number, question: Question) => qSum + question.points, 0), 0
                )} points
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Preview mode - actual exam interface may vary based on student settings
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PublishStep({ examSettings, sections, totalQuestions, totalPoints, onPublish }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ready to Publish</CardTitle>
          <CardDescription>
            Review your exam details before publishing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Exam Title</Label>
              <p className="text-sm text-muted-foreground">{examSettings.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Duration</Label>
              <p className="text-sm text-muted-foreground">{examSettings.duration} minutes</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Questions</Label>
              <p className="text-sm text-muted-foreground">{totalQuestions}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Total Points</Label>
              <p className="text-sm text-muted-foreground">{totalPoints}</p>
            </div>
          </div>
          
          <Button onClick={onPublish} className="w-full">
            <Award className="h-4 w-4 mr-2" />
            Publish Exam
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionEditorDialog({ question, onSave, onClose }: any) {
  const [editedQuestion, setEditedQuestion] = useState(question);
  
  const renderQuestionTypeFields = () => {
    switch (editedQuestion.type) {
      case 'mcq-single':
      case 'mcq-multiple':
        return <MCQEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'true-false':
        return <TrueFalseEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'short-answer':
      case 'long-answer':
        return <TextAnswerEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'numeric':
        return <NumericEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'formula':
        return <FormulaEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'fill-blank':
        return <FillBlankEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'matching':
        return <MatchingEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'ordering':
        return <OrderingEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'file-upload':
        return <FileUploadEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'image-hotspot':
        return <ImageHotspotEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'audio-response':
      case 'video-response':
        return <MediaResponseEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'code-editor':
        return <CodeEditorConfig question={editedQuestion} onChange={setEditedQuestion} />;
      case 'drag-drop':
        return <DragDropEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'matrix':
        return <MatrixEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'cloze':
        return <ClozeEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'adaptive':
        return <AdaptiveEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'composite':
        return <CompositeEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'survey':
        return <SurveyEditor question={editedQuestion} onChange={setEditedQuestion} />;
      case 'peer-assessment':
        return <PeerAssessmentEditor question={editedQuestion} onChange={setEditedQuestion} />;
      default:
        return <div>Question type not implemented yet</div>;
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {questionTypes.find(t => t.value === question.type)?.icon}
            Edit {questionTypes.find(t => t.value === question.type)?.label}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Basic Question Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Title</Label>
                <Input
                  value={editedQuestion.title}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, title: e.target.value })}
                  placeholder="Enter question title"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Question Content</Label>
                <Textarea
                  value={editedQuestion.content}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, content: e.target.value })}
                  placeholder="Enter question content"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editedQuestion.points}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, points: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select 
                    value={editedQuestion.difficulty} 
                    onValueChange={(value) => setEditedQuestion({ ...editedQuestion, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Negative Marking</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editedQuestion.negativeMarking}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, negativeMarking: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Limit (min)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editedQuestion.timeLimit || ''}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, timeLimit: parseInt(e.target.value) || undefined })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea
                    value={editedQuestion.explanation || ''}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
                    placeholder="Explain the correct answer"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hint (Optional)</Label>
                  <Textarea
                    value={editedQuestion.hint || ''}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, hint: e.target.value })}
                    placeholder="Provide a hint for students"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={editedQuestion.tags?.join(', ') || ''}
                  onChange={(e) => setEditedQuestion({ 
                    ...editedQuestion, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                  })}
                  placeholder="algebra, equations, advanced"
                />
              </div>
            </CardContent>
          </Card>

          {/* Question Type Specific Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {renderQuestionTypeFields()}
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave(editedQuestion)}>
              Save Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Question Type Editor Components
function MCQEditor({ question, onChange }: any) {
  const addOption = () => {
    const newOptions = [...(question.options || []), { id: Date.now().toString(), text: '', isCorrect: false }];
    onChange({ ...question, options: newOptions });
  };

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange({ ...question, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (question.options || []).filter((_: any, i: number) => i !== index);
    onChange({ ...question, options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Answer Options</Label>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>
      
      <div className="space-y-3">
        {(question.options || []).map((option: any, index: number) => (
          <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Checkbox
              checked={option.isCorrect}
              onCheckedChange={(checked) => updateOption(index, 'isCorrect', checked)}
            />
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, 'text', e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeOption(index)}
              disabled={(question.options?.length || 0) <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {question.type === 'mcq-multiple' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Students can select multiple correct answers. Check all correct options.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function TrueFalseEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <Label>Correct Answer</Label>
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={question.correctAnswers?.[0] === 'true'}
            onCheckedChange={(checked) => onChange({ 
              ...question, 
              correctAnswers: checked ? ['true'] : ['false'] 
            })}
          />
          <Label>True</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={question.correctAnswers?.[0] === 'false'}
            onCheckedChange={(checked) => onChange({ 
              ...question, 
              correctAnswers: checked ? ['false'] : ['true'] 
            })}
          />
          <Label>False</Label>
        </div>
      </div>
    </div>
  );
}

function TextAnswerEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Sample Answer(s)</Label>
        <Textarea
          value={question.correctAnswers?.join('\n') || ''}
          onChange={(e) => onChange({ 
            ...question, 
            correctAnswers: e.target.value.split('\n').filter(answer => answer.trim()) 
          })}
          placeholder="Enter sample answers (one per line)"
          rows={4}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={question.caseSensitive}
          onCheckedChange={(checked) => onChange({ ...question, caseSensitive: checked })}
        />
        <Label>Case Sensitive</Label>
      </div>
      
      <div className="space-y-2">
        <Label>Character Limit (optional)</Label>
        <Input
          type="number"
          min="0"
          value={question.metadata?.characterLimit || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { 
              ...question.metadata, 
              characterLimit: parseInt(e.target.value) || undefined 
            } 
          })}
          placeholder="No limit"
        />
      </div>
    </div>
  );
}

function NumericEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Correct Answer</Label>
          <Input
            type="number"
            value={question.correctAnswers?.[0] || ''}
            onChange={(e) => onChange({ 
              ...question, 
              correctAnswers: [e.target.value] 
            })}
            placeholder="Enter numeric answer"
          />
        </div>
        <div className="space-y-2">
          <Label>Tolerance (±)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={question.tolerance || 0}
            onChange={(e) => onChange({ 
              ...question, 
              tolerance: parseFloat(e.target.value) || 0 
            })}
            placeholder="0"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Unit (optional)</Label>
        <Input
          value={question.metadata?.unit || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, unit: e.target.value } 
          })}
          placeholder="e.g., meters, kg, seconds"
        />
      </div>
    </div>
  );
}

function FormulaEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Formula/LaTeX Expression</Label>
        <Textarea
          value={question.formula || ''}
          onChange={(e) => onChange({ ...question, formula: e.target.value })}
          placeholder="Enter LaTeX formula (e.g., \\frac{a}{b} = c)"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Variables (JSON format)</Label>
        <Textarea
          value={question.metadata?.variables || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, variables: e.target.value } 
          })}
          placeholder='{"a": {"min": 1, "max": 10}, "b": {"min": 1, "max": 5}}'
          rows={3}
        />
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Use LaTeX syntax for mathematical expressions. Variables can be randomized using the JSON format above.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function FillBlankEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text with Blanks</Label>
        <Textarea
          value={question.content}
          onChange={(e) => onChange({ ...question, content: e.target.value })}
          placeholder="Enter text with [blank] placeholders"
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Blank Answers (one per line)</Label>
        <Textarea
          value={question.correctAnswers?.join('\n') || ''}
          onChange={(e) => onChange({ 
            ...question, 
            correctAnswers: e.target.value.split('\n').filter(answer => answer.trim()) 
          })}
          placeholder="Enter answers for each blank in order"
          rows={3}
        />
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Use [blank] to indicate where students should fill in answers. Provide answers in the same order as the blanks appear.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function MatchingEditor({ question, onChange }: any) {
  const addPair = () => {
    const newPairs = [...(question.metadata?.pairs || []), { left: '', right: '', id: Date.now().toString() }];
    onChange({ ...question, metadata: { ...question.metadata, pairs: newPairs } });
  };

  const updatePair = (index: number, field: string, value: string) => {
    const newPairs = [...(question.metadata?.pairs || [])];
    newPairs[index] = { ...newPairs[index], [field]: value };
    onChange({ ...question, metadata: { ...question.metadata, pairs: newPairs } });
  };

  const removePair = (index: number) => {
    const newPairs = (question.metadata?.pairs || []).filter((_: any, i: number) => i !== index);
    onChange({ ...question, metadata: { ...question.metadata, pairs: newPairs } });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Matching Pairs</Label>
        <Button type="button" variant="outline" size="sm" onClick={addPair}>
          <Plus className="h-4 w-4 mr-2" />
          Add Pair
        </Button>
      </div>
      
      <div className="space-y-3">
        {(question.metadata?.pairs || []).map((pair: any, index: number) => (
          <div key={pair.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Input
              value={pair.left}
              onChange={(e) => updatePair(index, 'left', e.target.value)}
              placeholder="Left item"
              className="flex-1"
            />
            <div className="text-muted-foreground">→</div>
            <Input
              value={pair.right}
              onChange={(e) => updatePair(index, 'right', e.target.value)}
              placeholder="Right item"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePair(index)}
              disabled={(question.metadata?.pairs?.length || 0) <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderingEditor({ question, onChange }: any) {
  const addItem = () => {
    const newItems = [...(question.metadata?.items || []), { text: '', order: (question.metadata?.items?.length || 0) + 1, id: Date.now().toString() }];
    onChange({ ...question, metadata: { ...question.metadata, items: newItems } });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...(question.metadata?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...question, metadata: { ...question.metadata, items: newItems } });
  };

  const removeItem = (index: number) => {
    const newItems = (question.metadata?.items || []).filter((_: any, i: number) => i !== index);
    onChange({ ...question, metadata: { ...question.metadata, items: newItems } });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Items to Order</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      
      <div className="space-y-3">
        {(question.metadata?.items || []).map((item: any, index: number) => (
          <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="w-12 text-center font-medium">{item.order}</div>
            <Input
              value={item.text}
              onChange={(e) => updateItem(index, 'text', e.target.value)}
              placeholder="Item text"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              disabled={(question.metadata?.items?.length || 0) <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Students will need to arrange these items in the correct order. The numbers shown represent the correct sequence.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function FileUploadEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Allowed File Types</Label>
          <Input
            value={question.metadata?.allowedTypes?.join(', ') || ''}
            onChange={(e) => onChange({ 
              ...question, 
              metadata: { 
                ...question.metadata, 
                allowedTypes: e.target.value.split(',').map((type: string) => type.trim()).filter((type: string) => type) 
              } 
            })}
            placeholder="pdf, doc, docx, txt"
          />
        </div>
        <div className="space-y-2">
          <Label>Max File Size (MB)</Label>
          <Input
            type="number"
            min="1"
            max="100"
            value={question.metadata?.maxFileSize || 10}
            onChange={(e) => onChange({ 
              ...question, 
              metadata: { ...question.metadata, maxFileSize: parseInt(e.target.value) || 10 } 
            })}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={question.attachmentRequired}
          onCheckedChange={(checked) => onChange({ ...question, attachmentRequired: checked })}
        />
        <Label>Attachment Required</Label>
      </div>
      
      <div className="space-y-2">
        <Label>Instructions for Upload</Label>
        <Textarea
          value={question.metadata?.uploadInstructions || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, uploadInstructions: e.target.value } 
          })}
          placeholder="Provide specific instructions for what students should upload"
          rows={3}
        />
      </div>
    </div>
  );
}

function ImageHotspotEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={question.metadata?.imageUrl || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, imageUrl: e.target.value } 
          })}
          placeholder="Enter image URL or upload image"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Hotspot Areas (JSON format)</Label>
        <Textarea
          value={question.metadata?.hotspots || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, hotspots: e.target.value } 
          })}
          placeholder='[{"x": 100, "y": 150, "width": 50, "height": 30, "correct": true}]'
          rows={4}
        />
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Define clickable areas on the image using JSON format with x, y coordinates, width, height, and whether the area is correct.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function MediaResponseEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Max Recording Duration (seconds)</Label>
          <Input
            type="number"
            min="10"
            max="600"
            value={question.metadata?.maxDuration || 60}
            onChange={(e) => onChange({ 
              ...question, 
              metadata: { ...question.metadata, maxDuration: parseInt(e.target.value) || 60 } 
            })}
          />
        </div>
        <div className="space-y-2">
          <Label>Quality</Label>
          <Select 
            value={question.metadata?.quality || 'medium'} 
            onValueChange={(value) => onChange({ 
              ...question, 
              metadata: { ...question.metadata, quality: value } 
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Recording Instructions</Label>
        <Textarea
          value={question.metadata?.recordingInstructions || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, recordingInstructions: e.target.value } 
          })}
          placeholder="Provide instructions for what students should record"
          rows={3}
        />
      </div>
    </div>
  );
}

function CodeEditorConfig({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Programming Language</Label>
        <Select 
          value={question.codeLanguage || 'javascript'} 
          onValueChange={(value) => onChange({ ...question, codeLanguage: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="c">C</SelectItem>
            <SelectItem value="csharp">C#</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Initial Code Template</Label>
        <Textarea
          value={question.metadata?.codeTemplate || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, codeTemplate: e.target.value } 
          })}
          placeholder="Provide starter code for students"
          rows={6}
          className="font-mono"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Test Cases (JSON format)</Label>
        <Textarea
          value={JSON.stringify(question.testCases || [], null, 2)}
          onChange={(e) => {
            try {
              const testCases = JSON.parse(e.target.value);
              onChange({ ...question, testCases });
            } catch (error) {
              // Invalid JSON, don't update
            }
          }}
          placeholder='[{"input": "5", "expectedOutput": "120", "points": 2}]'
          rows={6}
          className="font-mono"
        />
      </div>
    </div>
  );
}

function DragDropEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Draggable Items (JSON format)</Label>
        <Textarea
          value={question.metadata?.draggableItems || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, draggableItems: e.target.value } 
          })}
          placeholder='[{"id": "item1", "text": "Apple", "category": "fruit"}]'
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Drop Zones (JSON format)</Label>
        <Textarea
          value={question.metadata?.dropZones || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, dropZones: e.target.value } 
          })}
          placeholder='[{"id": "zone1", "label": "Fruits", "accepts": ["fruit"]}]'
          rows={4}
        />
      </div>
    </div>
  );
}

function MatrixEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Number of Rows</Label>
          <Input
            type="number"
            min="2"
            max="10"
            value={question.metadata?.rows || 3}
            onChange={(e) => onChange({ 
              ...question, 
              metadata: { ...question.metadata, rows: parseInt(e.target.value) || 3 } 
            })}
          />
        </div>
        <div className="space-y-2">
          <Label>Number of Columns</Label>
          <Input
            type="number"
            min="2"
            max="10"
            value={question.metadata?.columns || 3}
            onChange={(e) => onChange({ 
              ...question, 
              metadata: { ...question.metadata, columns: parseInt(e.target.value) || 3 } 
            })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Matrix Configuration (JSON format)</Label>
        <Textarea
          value={question.metadata?.matrixConfig || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, matrixConfig: e.target.value } 
          })}
          placeholder='{"rowHeaders": ["Row 1", "Row 2"], "columnHeaders": ["Col 1", "Col 2"]}'
          rows={4}
        />
      </div>
    </div>
  );
}

function ClozeEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text with Multiple Blanks</Label>
        <Textarea
          value={question.content}
          onChange={(e) => onChange({ ...question, content: e.target.value })}
          placeholder="The capital of France is {{blank1}} and it has a population of {{blank2}} million."
          rows={6}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Blank Definitions (JSON format)</Label>
        <Textarea
          value={question.metadata?.blanks || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, blanks: e.target.value } 
          })}
          placeholder='{"blank1": {"answers": ["Paris"], "type": "text"}, "blank2": {"answers": ["2.2"], "type": "numeric", "tolerance": 0.1}}'
          rows={6}
        />
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Use {'{{blank1}}'}, {'{{blank2}}'} etc. to mark blanks. Define each blank in the JSON configuration below.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function AdaptiveEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Branching Logic (JSON format)</Label>
        <Textarea
          value={question.metadata?.branchingLogic || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, branchingLogic: e.target.value } 
          })}
          placeholder='{"correct": {"nextQuestion": "q2", "feedback": "Great!"}, "incorrect": {"nextQuestion": "q1_help", "feedback": "Let me help you"}}'
          rows={6}
        />
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Define how the question flow changes based on student responses. This creates personalized learning paths.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function CompositeEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Sub-questions (JSON format)</Label>
        <Textarea
          value={question.metadata?.subQuestions || ''}
          onChange={(e) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, subQuestions: e.target.value } 
          })}
          placeholder='[{"type": "mcq-single", "content": "Part A:", "points": 2}, {"type": "short-answer", "content": "Part B:", "points": 3}]'
          rows={8}
        />
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Composite questions contain multiple sub-questions of different types within a single question.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function SurveyEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Survey Type</Label>
        <Select 
          value={question.metadata?.surveyType || 'rating'} 
          onValueChange={(value) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, surveyType: value } 
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Rating Scale</SelectItem>
            <SelectItem value="feedback">Text Feedback</SelectItem>
            <SelectItem value="satisfaction">Satisfaction</SelectItem>
            <SelectItem value="opinion">Opinion</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={question.metadata?.anonymous}
          onCheckedChange={(checked) => onChange({ 
            ...question, 
            metadata: { ...question.metadata, anonymous: checked } 
          })}
        />
        <Label>Anonymous Response</Label>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Survey questions are not graded and are used for feedback collection only.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function PeerAssessmentEditor({ question, onChange }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Assessment Criteria (JSON format)</Label>
        <Textarea
          value={JSON.stringify(question.rubric || [], null, 2)}
          onChange={(e) => {
            try {
              const rubric = JSON.parse(e.target.value);
              onChange({ ...question, rubric });
            } catch (error) {
              // Invalid JSON, don't update
            }
          }}
          placeholder='[{"criteria": "Content Quality", "points": 10, "description": "Evaluate the quality of content"}]'
          rows={6}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Number of Peers to Assign</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={question.metadata?.peersToAssign || 3}
            onChange={(e) => onChange({ 
              ...question, 
              metadata: { ...question.metadata, peersToAssign: parseInt(e.target.value) || 3 } 
            })}
          />
        </div>
        <div className="space-y-2">
          <Label>Assessment Deadline</Label>
          <Input
            type="datetime-local"
            value={question.metadata?.assessmentDeadline || ''}
            onChange={(e) => onChange({ 
              ...question, 
              metadata: { ...question.metadata, assessmentDeadline: e.target.value } 
            })}
          />
        </div>
      </div>
    </div>
  );
}