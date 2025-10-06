import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { useNotifications } from './NotificationProvider';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye,
  Copy,
  Upload,
  Download,
  Search,
  Filter,
  Settings,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Code,
  Calculator,
  Move,
  ArrowUp,
  ArrowDown,
  Link,
  Target,
  Timer,
  Hash,
  Type,
  List,
  MoreHorizontal
} from 'lucide-react';

export interface Question {
  id: string;
  type: 'MCQ' | 'ONE_WORD' | 'DESCRIPTIVE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MATCHING' | 'ORDERING' | 'CODE' | 'NUMERIC';
  title: string;
  content: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  timeLimit?: number;
  options?: { id: string; text: string; isCorrect?: boolean }[];
  correctAnswer?: string | string[] | number;
  metadata?: {
    language?: string; // for CODE type
    template?: string; // for CODE type
    leftItems?: string[]; // for MATCHING type
    rightItems?: string[]; // for MATCHING type
    items?: string[]; // for ORDERING type
    blanks?: string[]; // for FILL_BLANK type
    minLength?: number; // for DESCRIPTIVE type
    maxLength?: number; // for DESCRIPTIVE type
    precision?: number; // for NUMERIC type
    unit?: string; // for NUMERIC type
  };
  explanation?: string;
  hint?: string;
  createdAt: string;
  lastModified: string;
}

interface QuestionManagementProps {
  examId: string;
  examTitle: string;
  questions: Question[];
  onQuestionsUpdate: (questions: Question[]) => void;
  onClose: () => void;
}

const questionTypes = [
  { value: 'MCQ', label: 'Multiple Choice', icon: CheckCircle, description: 'Select one correct answer from multiple options' },
  { value: 'ONE_WORD', label: 'One Word Answer', icon: Type, description: 'Single word or short phrase answer' },
  { value: 'DESCRIPTIVE', label: 'Descriptive', icon: FileText, description: 'Long-form written answer' },
  { value: 'TRUE_FALSE', label: 'True/False', icon: Target, description: 'Binary choice question' },
  { value: 'FILL_BLANK', label: 'Fill in the Blanks', icon: Hash, description: 'Complete the sentence with missing words' },
  { value: 'MATCHING', label: 'Matching', icon: Link, description: 'Match items from two lists' },
  { value: 'ORDERING', label: 'Ordering', icon: List, description: 'Arrange items in correct order' },
  { value: 'CODE', label: 'Code Editor', icon: Code, description: 'Programming code question' },
  { value: 'NUMERIC', label: 'Numeric', icon: Calculator, description: 'Numerical answer with precision' }
];

export function QuestionManagement({ 
  examId, 
  examTitle, 
  questions: initialQuestions, 
  onQuestionsUpdate, 
  onClose 
}: QuestionManagementProps) {
  const { showNotification } = useNotifications();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: 'MCQ',
    title: '',
    content: '',
    points: 1,
    difficulty: 'Medium',
    tags: [],
    options: [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false }
    ]
  });

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || question.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = questionTypes.find(t => t.value === type);
    return typeConfig?.icon || HelpCircle;
  };

  const validateQuestion = (question: Partial<Question>): string[] => {
    const errors: string[] = [];
    
    if (!question.title?.trim()) errors.push('Question title is required');
    if (!question.content?.trim()) errors.push('Question content is required');
    if (!question.points || question.points <= 0) errors.push('Points must be greater than 0');
    
    if (question.type === 'MCQ') {
      const validOptions = question.options?.filter(opt => opt.text.trim()) || [];
      if (validOptions.length < 2) errors.push('At least 2 options are required for MCQ');
      const correctOptions = question.options?.filter(opt => opt.isCorrect) || [];
      if (correctOptions.length === 0) errors.push('At least one correct answer must be selected');
    }
    
    if (question.type === 'ONE_WORD' && !question.correctAnswer) {
      errors.push('Correct answer is required for One Word questions');
    }
    
    if (question.type === 'NUMERIC' && question.correctAnswer === undefined) {
      errors.push('Correct numerical answer is required');
    }
    
    return errors;
  };

  const handleAddQuestion = () => {
    const errors = validateQuestion(newQuestion);
    if (errors.length > 0) {
      showNotification(errors.join(', '), 'error');
      return;
    }

    const question: Question = {
      id: `question-${Date.now()}`,
      type: newQuestion.type as Question['type'],
      title: newQuestion.title!,
      content: newQuestion.content!,
      points: newQuestion.points!,
      difficulty: newQuestion.difficulty as Question['difficulty'],
      tags: newQuestion.tags || [],
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
      metadata: newQuestion.metadata,
      explanation: newQuestion.explanation,
      hint: newQuestion.hint,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const updatedQuestions = [...questions, question];
    setQuestions(updatedQuestions);
    onQuestionsUpdate(updatedQuestions);
    
    setShowAddModal(false);
    setNewQuestion({
      type: 'MCQ',
      title: '',
      content: '',
      points: 1,
      difficulty: 'Medium',
      tags: [],
      options: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
      ]
    });
    
    showNotification('Question added successfully!', 'success');
  };

  const handleEditQuestion = () => {
    if (!selectedQuestion) return;
    
    const errors = validateQuestion(selectedQuestion);
    if (errors.length > 0) {
      showNotification(errors.join(', '), 'error');
      return;
    }

    const updatedQuestions = questions.map(q => 
      q.id === selectedQuestion.id 
        ? { ...selectedQuestion, lastModified: new Date().toISOString() }
        : q
    );
    
    setQuestions(updatedQuestions);
    onQuestionsUpdate(updatedQuestions);
    setShowEditModal(false);
    setSelectedQuestion(null);
    showNotification('Question updated successfully!', 'success');
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(updatedQuestions);
      onQuestionsUpdate(updatedQuestions);
      showNotification('Question deleted successfully!', 'success');
    }
  };

  const handleDuplicateQuestion = (question: Question) => {
    const duplicatedQuestion: Question = {
      ...question,
      id: `question-${Date.now()}`,
      title: `${question.title} (Copy)`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    const updatedQuestions = [...questions, duplicatedQuestion];
    setQuestions(updatedQuestions);
    onQuestionsUpdate(updatedQuestions);
    showNotification('Question duplicated successfully!', 'success');
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    const updatedQuestions = [...questions];
    [updatedQuestions[currentIndex], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[currentIndex]];
    
    setQuestions(updatedQuestions);
    onQuestionsUpdate(updatedQuestions);
  };

  const renderQuestionTypeForm = (question: Partial<Question>, isEdit: boolean = false) => {
    const updateQuestion = (updates: Partial<Question>) => {
      if (isEdit && selectedQuestion) {
        setSelectedQuestion({ ...selectedQuestion, ...updates });
      } else {
        setNewQuestion({ ...question, ...updates });
      }
    };

    const currentQuestion = isEdit ? selectedQuestion : question;
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'MCQ':
        return (
          <div className="space-y-4">
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {currentQuestion.options?.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) => {
                        const updatedOptions = currentQuestion.options?.map(opt => 
                          opt.id === option.id ? { ...opt, isCorrect: !!checked } : opt
                        ) || [];
                        updateQuestion({ options: updatedOptions });
                      }}
                    />
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => {
                        const updatedOptions = currentQuestion.options?.map(opt => 
                          opt.id === option.id ? { ...opt, text: e.target.value } : opt
                        ) || [];
                        updateQuestion({ options: updatedOptions });
                      }}
                      className="flex-1"
                    />
                    {currentQuestion.options && currentQuestion.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedOptions = currentQuestion.options?.filter(opt => opt.id !== option.id) || [];
                          updateQuestion({ options: updatedOptions });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOption = { 
                    id: `option-${Date.now()}`, 
                    text: '', 
                    isCorrect: false 
                  };
                  const updatedOptions = [...(currentQuestion.options || []), newOption];
                  updateQuestion({ options: updatedOptions });
                }}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        );

      case 'ONE_WORD':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              <Input
                id="correctAnswer"
                value={currentQuestion.correctAnswer as string || ''}
                onChange={(e) => updateQuestion({ correctAnswer: e.target.value })}
                placeholder="Enter the correct answer"
              />
            </div>
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-4">
            <div>
              <Label>Correct Answer</Label>
              <RadioGroup
                value={currentQuestion.correctAnswer as string || ''}
                onValueChange={(value) => updateQuestion({ correctAnswer: value })}
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
          </div>
        );

      case 'DESCRIPTIVE':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minLength">Minimum Length (words)</Label>
                <Input
                  id="minLength"
                  type="number"
                  value={currentQuestion.metadata?.minLength || ''}
                  onChange={(e) => updateQuestion({ 
                    metadata: { 
                      ...currentQuestion.metadata, 
                      minLength: parseInt(e.target.value) || 0 
                    } 
                  })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="maxLength">Maximum Length (words)</Label>
                <Input
                  id="maxLength"
                  type="number"
                  value={currentQuestion.metadata?.maxLength || ''}
                  onChange={(e) => updateQuestion({ 
                    metadata: { 
                      ...currentQuestion.metadata, 
                      maxLength: parseInt(e.target.value) || 0 
                    } 
                  })}
                  placeholder="500"
                />
              </div>
            </div>
          </div>
        );

      case 'NUMERIC':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numericAnswer">Correct Answer</Label>
                <Input
                  id="numericAnswer"
                  type="number"
                  step="any"
                  value={currentQuestion.correctAnswer as number || ''}
                  onChange={(e) => updateQuestion({ correctAnswer: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter the correct numerical answer"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit (optional)</Label>
                <Input
                  id="unit"
                  value={currentQuestion.metadata?.unit || ''}
                  onChange={(e) => updateQuestion({ 
                    metadata: { 
                      ...currentQuestion.metadata, 
                      unit: e.target.value 
                    } 
                  })}
                  placeholder="e.g., kg, m/s, etc."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="precision">Decimal Precision</Label>
              <Input
                id="precision"
                type="number"
                min="0"
                max="10"
                value={currentQuestion.metadata?.precision || 2}
                onChange={(e) => updateQuestion({ 
                  metadata: { 
                    ...currentQuestion.metadata, 
                    precision: parseInt(e.target.value) || 2 
                  } 
                })}
                placeholder="2"
              />
            </div>
          </div>
        );

      case 'CODE':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Programming Language</Label>
              <Select
                value={currentQuestion.metadata?.language || 'javascript'}
                onValueChange={(value) => updateQuestion({ 
                  metadata: { 
                    ...currentQuestion.metadata, 
                    language: value 
                  } 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template">Code Template (optional)</Label>
              <Textarea
                id="template"
                value={currentQuestion.metadata?.template || ''}
                onChange={(e) => updateQuestion({ 
                  metadata: { 
                    ...currentQuestion.metadata, 
                    template: e.target.value 
                  } 
                })}
                placeholder="Enter initial code template..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Question Management</h2>
          <p className="text-muted-foreground">Manage questions for "{examTitle}"</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {questions.length} Questions • {totalPoints} Points
          </Badge>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {questionTypes.slice(0, 4).map((type) => {
          const count = questions.filter(q => q.type === type.value).length;
          return (
            <Card key={type.value}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-lg font-semibold">{count}</div>
                    <div className="text-xs text-muted-foreground">{type.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>
                      Create a new question for the exam
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Question Type Selection */}
                    <div>
                      <Label>Question Type</Label>
                      <Tabs value={newQuestion.type} onValueChange={(value) => {
                        const type = value as Question['type'];
                        setNewQuestion({ 
                          ...newQuestion, 
                          type,
                          options: type === 'MCQ' ? [
                            { id: '1', text: '', isCorrect: false },
                            { id: '2', text: '', isCorrect: false },
                            { id: '3', text: '', isCorrect: false },
                            { id: '4', text: '', isCorrect: false }
                          ] : undefined,
                          correctAnswer: undefined,
                          metadata: undefined
                        });
                      }}>
                        <TabsList className="grid grid-cols-3 w-full">
                          {questionTypes.slice(0, 9).map((type) => (
                            <TabsTrigger key={type.value} value={type.value} className="text-xs">
                              <type.icon className="h-3 w-3 mr-1" />
                              {type.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Basic Question Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="title">Question Title</Label>
                        <Input
                          id="title"
                          value={newQuestion.title || ''}
                          onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                          placeholder="Enter a clear, concise question title"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="content">Question Content</Label>
                        <Textarea
                          id="content"
                          value={newQuestion.content || ''}
                          onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                          placeholder="Enter the detailed question content..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="points">Points</Label>
                        <Input
                          id="points"
                          type="number"
                          min="1"
                          value={newQuestion.points || 1}
                          onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={newQuestion.difficulty || 'Medium'}
                          onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => 
                            setNewQuestion({ ...newQuestion, difficulty: value })
                          }
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
                    </div>

                    {/* Question Type Specific Fields */}
                    {renderQuestionTypeForm(newQuestion)}

                    {/* Optional Fields */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="hint">Hint (optional)</Label>
                        <Input
                          id="hint"
                          value={newQuestion.hint || ''}
                          onChange={(e) => setNewQuestion({ ...newQuestion, hint: e.target.value })}
                          placeholder="Provide a helpful hint for students"
                        />
                      </div>
                      <div>
                        <Label htmlFor="explanation">Explanation (optional)</Label>
                        <Textarea
                          id="explanation"
                          value={newQuestion.explanation || ''}
                          onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                          placeholder="Explain the correct answer and reasoning..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddQuestion} className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
          <CardDescription>Manage and organize your exam questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredQuestions.map((question, index) => {
                  const IconComponent = getTypeIcon(question.type);
                  return (
                    <motion.tr
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <h4 className="font-medium line-clamp-1">{question.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {question.content}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <IconComponent className="h-3 w-3" />
                          {questionTypes.find(t => t.value === question.type)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {question.points} pts
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setShowPreviewModal(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicateQuestion(question)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <div className="flex flex-col">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveQuestion(question.id, 'up')}
                              disabled={index === 0}
                              className="h-4 p-0"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveQuestion(question.id, 'down')}
                              disabled={index === filteredQuestions.length - 1}
                              className="h-4 p-0"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Question Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Modify the question details and settings
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              {/* Basic Question Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="edit-title">Question Title</Label>
                  <Input
                    id="edit-title"
                    value={selectedQuestion.title || ''}
                    onChange={(e) => setSelectedQuestion({ ...selectedQuestion, title: e.target.value })}
                    placeholder="Enter a clear, concise question title"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit-content">Question Content</Label>
                  <Textarea
                    id="edit-content"
                    value={selectedQuestion.content || ''}
                    onChange={(e) => setSelectedQuestion({ ...selectedQuestion, content: e.target.value })}
                    placeholder="Enter the detailed question content..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-points">Points</Label>
                  <Input
                    id="edit-points"
                    type="number"
                    min="1"
                    value={selectedQuestion.points || 1}
                    onChange={(e) => setSelectedQuestion({ ...selectedQuestion, points: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-difficulty">Difficulty</Label>
                  <Select
                    value={selectedQuestion.difficulty || 'Medium'}
                    onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => 
                      setSelectedQuestion({ ...selectedQuestion, difficulty: value })
                    }
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
              </div>

              {/* Question Type Specific Fields */}
              {renderQuestionTypeForm(selectedQuestion, true)}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditQuestion} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Question Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
            <DialogDescription>
              Preview how this question will appear to students
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getDifficultyColor(selectedQuestion.difficulty)}>
                  {selectedQuestion.difficulty}
                </Badge>
                <Badge variant="outline">
                  {selectedQuestion.points} points
                </Badge>
                <Badge variant="outline">
                  {questionTypes.find(t => t.value === selectedQuestion.type)?.label}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{selectedQuestion.title}</h3>
                <p className="text-muted-foreground mt-2">{selectedQuestion.content}</p>
              </div>

              {selectedQuestion.type === 'MCQ' && selectedQuestion.options && (
                <div className="space-y-2">
                  <Label>Options:</Label>
                  {selectedQuestion.options.map((option, index) => (
                    <div key={option.id} className={`p-2 rounded border ${option.isCorrect ? 'bg-success/10 border-success' : 'bg-muted/50'}`}>
                      {String.fromCharCode(65 + index)}. {option.text}
                      {option.isCorrect && <CheckCircle className="inline h-4 w-4 ml-2 text-success" />}
                    </div>
                  ))}
                </div>
              )}

              {selectedQuestion.type === 'ONE_WORD' && selectedQuestion.correctAnswer && (
                <div>
                  <Label>Correct Answer:</Label>
                  <div className="p-2 bg-success/10 border border-success rounded">
                    {selectedQuestion.correctAnswer}
                  </div>
                </div>
              )}

              {selectedQuestion.hint && (
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Hint:</strong> {selectedQuestion.hint}
                  </AlertDescription>
                </Alert>
              )}

              {selectedQuestion.explanation && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Explanation:</strong> {selectedQuestion.explanation}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}