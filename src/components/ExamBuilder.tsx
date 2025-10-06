import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Slider } from './ui/slider';
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
  Trash2,
  Edit,
  Copy,
  ArrowLeft,
  ArrowRight,
  Upload,
  Download,
  BarChart3,
  Target,
  Brain,
  Code,
  Image,
  PlayCircle,
  Volume2,
  Calculator,
  Palette,
  Type,
  List,
  ToggleLeft,
  Move,
  HelpCircle,
  Shuffle,
  Hash,
  AlignLeft,
  MousePointer,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { useNotifications } from './NotificationProvider';

// Question Types
const QUESTION_TYPES = [
  { 
    id: 'multiple-choice', 
    name: 'Multiple Choice', 
    icon: List, 
    description: 'Single correct answer from multiple options',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
  },
  { 
    id: 'multiple-answer', 
    name: 'Multiple Answer', 
    icon: CheckCircle, 
    description: 'Multiple correct answers from options',
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
  },
  { 
    id: 'true-false', 
    name: 'True/False', 
    icon: ToggleLeft, 
    description: 'Binary choice question',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  },
  { 
    id: 'short-answer', 
    name: 'Short Answer', 
    icon: Type, 
    description: 'Brief text response',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  },
  { 
    id: 'essay', 
    name: 'Essay', 
    icon: AlignLeft, 
    description: 'Long-form written response',
    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  },
  { 
    id: 'fill-blank', 
    name: 'Fill in the Blank', 
    icon: Hash, 
    description: 'Complete the missing text',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  { 
    id: 'matching', 
    name: 'Matching', 
    icon: MousePointer, 
    description: 'Match items from two lists',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
  },
  { 
    id: 'ordering', 
    name: 'Ordering', 
    icon: Move, 
    description: 'Arrange items in correct order',
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
  },
  { 
    id: 'numerical', 
    name: 'Numerical', 
    icon: Calculator, 
    description: 'Numeric answer with tolerance',
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
  },
  { 
    id: 'coding', 
    name: 'Coding', 
    icon: Code, 
    description: 'Programming question',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
  }
];

interface Question {
  id: string;
  type: string;
  title: string;
  content: string;
  points: number;
  timeLimit?: number;
  options?: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer?: any;
  metadata?: any;
  explanation?: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ExamData {
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  passingScore: number;
  instructions: string;
  category: string;
  tags: string[];
  startDate?: Date;
  endDate?: Date;
  allowRetake: boolean;
  randomizeQuestions: boolean;
  showResultsImmediately: boolean;
  proctoring: boolean;
  questions: Question[];
}

interface ExamBuilderProps {
  onSave: (examData: ExamData) => void;
  onCancel: () => void;
  editingExam?: ExamData;
}

export function ExamBuilder({ onSave, onCancel, editingExam }: ExamBuilderProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [examData, setExamData] = useState<ExamData>(editingExam || {
    title: '',
    description: '',
    duration: 60,
    totalPoints: 0,
    passingScore: 50,
    instructions: '',
    category: '',
    tags: [],
    allowRetake: false,
    randomizeQuestions: false,
    showResultsImmediately: true,
    proctoring: false,
    questions: []
  });

  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('');

  const steps = [
    { id: 'basic', title: 'Basic Info', description: 'Exam details and settings' },
    { id: 'questions', title: 'Questions', description: 'Add and configure questions' },
    { id: 'settings', title: 'Settings', description: 'Advanced configuration' },
    { id: 'review', title: 'Review', description: 'Preview and finalize' }
  ];

  const updateExamData = (field: keyof ExamData, value: any) => {
    setExamData(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = (question: Question) => {
    const newQuestions = editingQuestion 
      ? examData.questions.map(q => q.id === editingQuestion.id ? question : q)
      : [...examData.questions, question];
    
    updateExamData('questions', newQuestions);
    updateExamData('totalPoints', newQuestions.reduce((sum, q) => sum + q.points, 0));
    setShowQuestionBuilder(false);
    setEditingQuestion(null);
    setSelectedQuestionType('');
  };

  const deleteQuestion = (questionId: string) => {
    const newQuestions = examData.questions.filter(q => q.id !== questionId);
    updateExamData('questions', newQuestions);
    updateExamData('totalPoints', newQuestions.reduce((sum, q) => sum + q.points, 0));
  };

  const duplicateQuestion = (question: Question) => {
    const newQuestion = { ...question, id: `${question.id}-copy-${Date.now()}` };
    updateExamData('questions', [...examData.questions, newQuestion]);
    updateExamData('totalPoints', examData.totalPoints + question.points);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return examData.title && examData.description && examData.category;
      case 1:
        return examData.questions.length > 0;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSave = () => {
    if (examData.questions.length === 0) {
      addNotification('Please add at least one question', 'error');
      return;
    }
    onSave(examData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep examData={examData} updateExamData={updateExamData} />;
      case 1:
        return (
          <QuestionsStep 
            examData={examData}
            onAddQuestion={() => setShowQuestionBuilder(true)}
            onEditQuestion={(question) => {
              setEditingQuestion(question);
              setSelectedQuestionType(question.type);
              setShowQuestionBuilder(true);
            }}
            onDeleteQuestion={deleteQuestion}
            onDuplicateQuestion={duplicateQuestion}
          />
        );
      case 2:
        return <SettingsStep examData={examData} updateExamData={updateExamData} />;
      case 3:
        return <ReviewStep examData={examData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">
                {editingExam ? 'Edit Exam' : 'Create New Exam'}
              </h1>
              <p className="text-muted-foreground">
                {editingExam ? 'Modify your existing exam' : 'Build a comprehensive assessment'}
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {index + 1}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onCancel()}
              disabled={false}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>
            
            <div className="flex gap-2">
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!validateStep(currentStep)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Builder Modal */}
      <Dialog open={showQuestionBuilder} onOpenChange={setShowQuestionBuilder}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'Modify the existing question' : 'Create a new question for your exam'}
            </DialogDescription>
          </DialogHeader>
          
          {!selectedQuestionType ? (
            <QuestionTypeSelector onSelectType={setSelectedQuestionType} />
          ) : (
            <QuestionBuilder
              type={selectedQuestionType}
              question={editingQuestion}
              onSave={addQuestion}
              onCancel={() => {
                setShowQuestionBuilder(false);
                setEditingQuestion(null);
                setSelectedQuestionType('');
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Step Components
function BasicInfoStep({ examData, updateExamData }: { examData: ExamData; updateExamData: (field: keyof ExamData, value: any) => void }) {
  const examCategories = [
    'Academic Assessment',
    'Certification Exam',
    'Practice Test',
    'Quiz',
    'Mid-term Exam',
    'Final Exam',
    'Entrance Test',
    'Skill Assessment'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Configure the fundamental details of your exam</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                value={examData.title}
                onChange={(e) => updateExamData('title', e.target.value)}
                placeholder="Enter exam title"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={examData.category} onValueChange={(value) => updateExamData('category', value)}>
                <SelectTrigger>
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={examData.duration}
                  onChange={(e) => updateExamData('duration', parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={examData.passingScore}
                  onChange={(e) => updateExamData('passingScore', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={examData.description}
                onChange={(e) => updateExamData('description', e.target.value)}
                placeholder="Describe what this exam covers"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={examData.instructions}
                onChange={(e) => updateExamData('instructions', e.target.value)}
                placeholder="Detailed instructions for students"
                rows={4}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionsStep({ 
  examData, 
  onAddQuestion, 
  onEditQuestion, 
  onDeleteQuestion, 
  onDuplicateQuestion 
}: {
  examData: ExamData;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (question: Question) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions ({examData.questions.length})</CardTitle>
              <CardDescription>
                Total Points: {examData.totalPoints} | Average: {examData.questions.length > 0 ? Math.round(examData.totalPoints / examData.questions.length) : 0} per question
              </CardDescription>
            </div>
            <Button onClick={onAddQuestion} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {examData.questions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No questions yet</h3>
              <p className="text-muted-foreground mb-4">Start building your exam by adding questions</p>
              <Button onClick={onAddQuestion} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {examData.questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={() => onEditQuestion(question)}
                  onDelete={() => onDeleteQuestion(question.id)}
                  onDuplicate={() => onDuplicateQuestion(question)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsStep({ examData, updateExamData }: { examData: ExamData; updateExamData: (field: keyof ExamData, value: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
        <CardDescription>Configure exam behavior and student experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Exam Behavior</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Retakes</Label>
                <p className="text-xs text-muted-foreground">Students can retake the exam</p>
              </div>
              <Switch
                checked={examData.allowRetake}
                onCheckedChange={(checked) => updateExamData('allowRetake', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Randomize Questions</Label>
                <p className="text-xs text-muted-foreground">Shuffle question order</p>
              </div>
              <Switch
                checked={examData.randomizeQuestions}
                onCheckedChange={(checked) => updateExamData('randomizeQuestions', checked)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Results & Security</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Results Immediately</Label>
                <p className="text-xs text-muted-foreground">Display results after submission</p>
              </div>
              <Switch
                checked={examData.showResultsImmediately}
                onCheckedChange={(checked) => updateExamData('showResultsImmediately', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Proctoring</Label>
                <p className="text-xs text-muted-foreground">Monitor exam attempts</p>
              </div>
              <Switch
                checked={examData.proctoring}
                onCheckedChange={(checked) => updateExamData('proctoring', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewStep({ examData }: { examData: ExamData }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exam Overview</CardTitle>
          <CardDescription>Review your exam before finalizing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Basic Information</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Title:</span> {examData.title}</p>
                  <p><span className="text-muted-foreground">Category:</span> {examData.category}</p>
                  <p><span className="text-muted-foreground">Duration:</span> {examData.duration} minutes</p>
                  <p><span className="text-muted-foreground">Total Points:</span> {examData.totalPoints}</p>
                  <p><span className="text-muted-foreground">Passing Score:</span> {examData.passingScore}%</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Settings</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Allow Retakes:</span> {examData.allowRetake ? 'Yes' : 'No'}</p>
                  <p><span className="text-muted-foreground">Randomize Questions:</span> {examData.randomizeQuestions ? 'Yes' : 'No'}</p>
                  <p><span className="text-muted-foreground">Show Results Immediately:</span> {examData.showResultsImmediately ? 'Yes' : 'No'}</p>
                  <p><span className="text-muted-foreground">Proctoring:</span> {examData.proctoring ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-4">Questions Summary ({examData.questions.length})</h4>
            <div className="space-y-3">
              {examData.questions.map((question, index) => (
                <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Q{index + 1}</span>
                    <div>
                      <p className="font-medium">{question.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {QUESTION_TYPES.find(t => t.id === question.type)?.name}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{question.points} pts</p>
                    {question.timeLimit && (
                      <p className="text-xs text-muted-foreground">{question.timeLimit}min</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionTypeSelector({ onSelectType }: { onSelectType: (type: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Select Question Type</h3>
        <p className="text-sm text-muted-foreground">Choose the type of question you want to create</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUESTION_TYPES.map((type) => (
          <Card 
            key={type.id} 
            className="cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onSelectType(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${type.color}`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{type.name}</h4>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ 
  question, 
  index, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const questionType = QUESTION_TYPES.find(t => t.id === question.type);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-medium text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">{question.title}</h4>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{question.content}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {questionType?.name}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">{question.points} points</span>
                {question.timeLimit && (
                  <span className="text-xs text-muted-foreground">{question.timeLimit}min</span>
                )}
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionBuilder({ 
  type, 
  question, 
  onSave, 
  onCancel 
}: {
  type: string;
  question?: Question | null;
  onSave: (question: Question) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Question>(question || {
    id: `question-${Date.now()}`,
    type,
    title: '',
    content: '',
    points: 1,
    timeLimit: undefined,
    options: [],
    correctAnswer: null,
    metadata: {},
    explanation: '',
    tags: [],
    difficulty: 'medium'
  });

  const updateFormData = (field: keyof Question, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      return;
    }
    onSave(formData);
  };

  const questionTypeConfig = QUESTION_TYPES.find(t => t.id === type);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${questionTypeConfig?.color}`}>
          {questionTypeConfig?.icon && <questionTypeConfig.icon className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="font-medium">{questionTypeConfig?.name}</h3>
          <p className="text-sm text-muted-foreground">{questionTypeConfig?.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Question Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Enter question title"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                value={formData.points}
                onChange={(e) => updateFormData('points', parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="timeLimit">Time Limit (min)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={formData.timeLimit || ''}
                onChange={(e) => updateFormData('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => updateFormData('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="content">Question Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => updateFormData('content', e.target.value)}
            placeholder="Enter the question content"
            rows={3}
          />
        </div>

        {/* Type-specific content */}
        {renderTypeSpecificContent(type, formData, updateFormData)}

        <div>
          <Label htmlFor="explanation">Explanation (Optional)</Label>
          <Textarea
            id="explanation"
            value={formData.explanation}
            onChange={(e) => updateFormData('explanation', e.target.value)}
            placeholder="Provide an explanation for the correct answer"
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!formData.title || !formData.content}>
          {question ? 'Update Question' : 'Add Question'}
        </Button>
      </DialogFooter>
    </div>
  );
}

function renderTypeSpecificContent(type: string, formData: Question, updateFormData: (field: keyof Question, value: any) => void) {
  switch (type) {
    case 'multiple-choice':
    case 'multiple-answer':
      return <MultipleChoiceOptions formData={formData} updateFormData={updateFormData} allowMultiple={type === 'multiple-answer'} />;
    case 'true-false':
      return <TrueFalseOptions formData={formData} updateFormData={updateFormData} />;
    case 'short-answer':
    case 'essay':
      return <TextAnswerOptions formData={formData} updateFormData={updateFormData} />;
    case 'numerical':
      return <NumericalOptions formData={formData} updateFormData={updateFormData} />;
    case 'fill-blank':
      return <FillBlankOptions formData={formData} updateFormData={updateFormData} />;
    case 'matching':
      return <MatchingOptions formData={formData} updateFormData={updateFormData} />;
    case 'ordering':
      return <OrderingOptions formData={formData} updateFormData={updateFormData} />;
    case 'coding':
      return <CodingOptions formData={formData} updateFormData={updateFormData} />;
    default:
      return null;
  }
}

// Type-specific option components
function MultipleChoiceOptions({ formData, updateFormData, allowMultiple }: any) {
  const [options, setOptions] = useState(formData.options || [
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false }
  ]);

  const updateOptions = (newOptions: any[]) => {
    setOptions(newOptions);
    updateFormData('options', newOptions);
    updateFormData('correctAnswer', newOptions.filter(o => o.isCorrect).map(o => o.id));
  };

  const addOption = () => {
    const newOption = { id: Date.now().toString(), text: '', isCorrect: false };
    updateOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      updateOptions(options.filter(o => o.id !== id));
    }
  };

  const updateOption = (id: string, field: string, value: any) => {
    const newOptions = options.map(option => 
      option.id === id 
        ? { ...option, [field]: value }
        : allowMultiple ? option : { ...option, isCorrect: field === 'isCorrect' ? false : option.isCorrect }
    );
    updateOptions(newOptions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Answer Options</Label>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-3">
            {allowMultiple ? (
              <Checkbox
                checked={option.isCorrect}
                onCheckedChange={(checked) => updateOption(option.id, 'isCorrect', checked)}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="correct-answer"
                  checked={option.isCorrect}
                  onChange={() => updateOption(option.id, 'isCorrect', true)}
                  className="h-4 w-4"
                />
              </div>
            )}
            <Input
              value={option.text}
              onChange={(e) => updateOption(option.id, 'text', e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1"
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOption(option.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrueFalseOptions({ formData, updateFormData }: any) {
  return (
    <div className="space-y-4">
      <Label>Correct Answer</Label>
      <RadioGroup 
        value={formData.correctAnswer} 
        onValueChange={(value) => updateFormData('correctAnswer', value)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id="true" />
          <Label htmlFor="true">True</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="false" />
          <Label htmlFor="false">False</Label>
        </div>
      </RadioGroup>
    </div>
  );
}

function TextAnswerOptions({ formData, updateFormData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sample-answer">Sample Answer (Optional)</Label>
        <Textarea
          id="sample-answer"
          value={formData.correctAnswer || ''}
          onChange={(e) => updateFormData('correctAnswer', e.target.value)}
          placeholder="Provide a sample correct answer for reference"
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          This will help with manual grading and provide guidance to students
        </p>
      </div>
    </div>
  );
}

function NumericalOptions({ formData, updateFormData }: any) {
  const [metadata, setMetadata] = useState(formData.metadata || { tolerance: 0, unit: '' });

  const updateMetadata = (field: string, value: any) => {
    const newMetadata = { ...metadata, [field]: value };
    setMetadata(newMetadata);
    updateFormData('metadata', newMetadata);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="correct-value">Correct Answer</Label>
          <Input
            id="correct-value"
            type="number"
            value={formData.correctAnswer || ''}
            onChange={(e) => updateFormData('correctAnswer', parseFloat(e.target.value))}
            placeholder="Enter correct number"
          />
        </div>
        <div>
          <Label htmlFor="tolerance">Tolerance (±)</Label>
          <Input
            id="tolerance"
            type="number"
            value={metadata.tolerance}
            onChange={(e) => updateMetadata('tolerance', parseFloat(e.target.value) || 0)}
            placeholder="0.1"
            step="0.1"
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit (Optional)</Label>
          <Input
            id="unit"
            value={metadata.unit}
            onChange={(e) => updateMetadata('unit', e.target.value)}
            placeholder="kg, m/s, etc."
          />
        </div>
      </div>
    </div>
  );
}

function FillBlankOptions({ formData, updateFormData }: any) {
  const [blanks, setBlanks] = useState(formData.correctAnswer || ['']);

  const updateBlanks = (newBlanks: string[]) => {
    setBlanks(newBlanks);
    updateFormData('correctAnswer', newBlanks);
  };

  const addBlank = () => {
    updateBlanks([...blanks, '']);
  };

  const removeBlank = (index: number) => {
    if (blanks.length > 1) {
      updateBlanks(blanks.filter((_, i) => i !== index));
    }
  };

  const updateBlank = (index: number, value: string) => {
    const newBlanks = [...blanks];
    newBlanks[index] = value;
    updateBlanks(newBlanks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Correct Answers for Blanks</Label>
        <Button type="button" variant="outline" size="sm" onClick={addBlank}>
          <Plus className="h-4 w-4 mr-1" />
          Add Blank
        </Button>
      </div>
      <div className="space-y-2">
        {blanks.map((blank, index) => (
          <div key={index} className="flex items-center gap-2">
            <Label className="w-16">Blank {index + 1}:</Label>
            <Input
              value={blank}
              onChange={(e) => updateBlank(index, e.target.value)}
              placeholder="Correct answer for this blank"
              className="flex-1"
            />
            {blanks.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBlank(index)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Use _____ (underscores) in your question content to indicate where blanks should appear
      </p>
    </div>
  );
}

function MatchingOptions({ formData, updateFormData }: any) {
  const [metadata, setMetadata] = useState(formData.metadata || {
    leftItems: [''],
    rightItems: [''],
    correctMatches: {}
  });

  const updateMetadata = (field: string, value: any) => {
    const newMetadata = { ...metadata, [field]: value };
    setMetadata(newMetadata);
    updateFormData('metadata', newMetadata);
  };

  const addItem = (side: 'leftItems' | 'rightItems') => {
    const newItems = [...metadata[side], ''];
    updateMetadata(side, newItems);
  };

  const removeItem = (side: 'leftItems' | 'rightItems', index: number) => {
    if (metadata[side].length > 1) {
      const newItems = metadata[side].filter((_: any, i: number) => i !== index);
      updateMetadata(side, newItems);
    }
  };

  const updateItem = (side: 'leftItems' | 'rightItems', index: number, value: string) => {
    const newItems = [...metadata[side]];
    newItems[index] = value;
    updateMetadata(side, newItems);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Left Column Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => addItem('leftItems')}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {metadata.leftItems.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateItem('leftItems', index, e.target.value)}
                  placeholder={`Left item ${index + 1}`}
                />
                {metadata.leftItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem('leftItems', index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Right Column Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => addItem('rightItems')}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {metadata.rightItems.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateItem('rightItems', index, e.target.value)}
                  placeholder={`Right item ${index + 1}`}
                />
                {metadata.rightItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem('rightItems', index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderingOptions({ formData, updateFormData }: any) {
  const [items, setItems] = useState(formData.correctAnswer || ['']);

  const updateItems = (newItems: string[]) => {
    setItems(newItems);
    updateFormData('correctAnswer', newItems);
  };

  const addItem = () => {
    updateItems([...items, '']);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      updateItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    updateItems(newItems);
  };

  const moveItem = (from: number, to: number) => {
    const newItems = [...items];
    const [removed] = newItems.splice(from, 1);
    newItems.splice(to, 0, removed);
    updateItems(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Items to Order (in correct sequence)</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-8 text-sm text-muted-foreground">{index + 1}.</span>
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
              className="flex-1"
            />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveItem(index, index - 1)}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveItem(index, index + 1)}
                disabled={index === items.length - 1}
              >
                ↓
              </Button>
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodingOptions({ formData, updateFormData }: any) {
  const [metadata, setMetadata] = useState(formData.metadata || {
    language: 'javascript',
    template: '',
    testCases: []
  });

  const updateMetadata = (field: string, value: any) => {
    const newMetadata = { ...metadata, [field]: value };
    setMetadata(newMetadata);
    updateFormData('metadata', newMetadata);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="language">Programming Language</Label>
          <Select value={metadata.language} onValueChange={(value) => updateMetadata('language', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="c">C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="template">Code Template (Optional)</Label>
        <Textarea
          id="template"
          value={metadata.template}
          onChange={(e) => updateMetadata('template', e.target.value)}
          placeholder="// Provide starting code template for students"
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label htmlFor="solution">Expected Solution</Label>
        <Textarea
          id="solution"
          value={formData.correctAnswer || ''}
          onChange={(e) => updateFormData('correctAnswer', e.target.value)}
          placeholder="// Enter the correct solution"
          rows={6}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}