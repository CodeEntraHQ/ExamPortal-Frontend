import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { examApi, BackendQuestion, CreateQuestionPayload, UpdateQuestionPayload } from '../../../services/api/exam';
import { 
  Plus, 
  Trash2, 
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';

// Export Question type alias for use in other components
export type Question = BackendQuestion;

interface QuestionManagementProps {
  examId: string;
  examTitle: string;
}

export function QuestionManagement({ examId, examTitle }: QuestionManagementProps) {
  const { success, error } = useNotifications();
  const [questions, setQuestions] = useState<BackendQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<BackendQuestion | null>(null);
  const [isMultipleCorrect, setIsMultipleCorrect] = useState<boolean>(false);
  
  // Form state for add/edit
  const [formData, setFormData] = useState<CreateQuestionPayload>({
    exam_id: examId,
    question_text: '',
    type: 'MCQ',
    metadata: {
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correct_answers: []
    }
  });

  // Fetch exam data to get isMultipleCorrect
  const fetchExamData = async () => {
    try {
      const cleanedExamId = examId.split(':')[0].trim();
      const examResponse = await examApi.getExamById(cleanedExamId);
      const exam = examResponse.payload;
      const metadata = exam.metadata || {};
      setIsMultipleCorrect(metadata.isMultipleCorrect || false);
    } catch (err) {
      console.error('Error fetching exam data:', err);
      // Default to false if fetch fails
      setIsMultipleCorrect(false);
    }
  };

  // Fetch questions from backend
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      // Clean examId by removing any suffix like ":1"
      const cleanedExamId = examId.split(':')[0].trim();
      // Backend limit is max 10, so we fetch with limit 10
      const response = await examApi.getQuestions(cleanedExamId, 1, 10);
      setQuestions(response.payload.questions || []);
    } catch (err) {
      // Only show error if it's not a validation error (which shouldn't happen now)
      // For validation errors or when there are no questions, silently handle it
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch questions';
      // Don't show validation errors to user if it's just about limit
      if (errorMsg.includes('limit')) {
        // Silently set empty questions and let the UI show "No questions found"
        setQuestions([]);
      } else {
        setErrorMessage(errorMsg);
        error(errorMsg);
      }
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
    fetchQuestions();
  }, [examId]);

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || question.type === filterType;
    return matchesSearch && matchesType;
  });

  // Handle add question
  const handleAddQuestion = async () => {
    try {
      // Validate MCQ questions
      if (formData.type === 'MCQ' || formData.type === 'MULTIPLE_CORRECT') {
        const options = formData.metadata?.options || [];
        const correctAnswers = formData.metadata?.correct_answers || [];
        const validOptions = options.filter(
          (opt: { text?: string }) => typeof opt.text === 'string' && opt.text.trim().length > 0
        );
        
        if (validOptions.length < 2) {
          error('MCQ questions must have at least 2 options');
          return;
        }
        
        if (correctAnswers.length === 0) {
          error('MCQ questions must have at least one correct answer');
          return;
        }
      }

      if (!formData.question_text.trim()) {
        error('Question text is required');
        return;
      }

      setLoading(true);
      await examApi.createQuestion(formData);
      success('Question created successfully!');
      setShowAddModal(false);
      resetForm();
      fetchQuestions();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create question';
      error(errorMsg);
      console.error('Error creating question:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit question
  const handleEditQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      // Validate MCQ questions
      if (formData.type === 'MCQ' || formData.type === 'MULTIPLE_CORRECT') {
        const options = formData.metadata?.options || [];
        const correctAnswers = formData.metadata?.correct_answers || [];
        const validOptions = options.filter(
          (opt: { text?: string }) => typeof opt.text === 'string' && opt.text.trim().length > 0
        );
        
        if (validOptions.length < 2) {
          error('MCQ questions must have at least 2 options');
          return;
        }
        
        if (correctAnswers.length === 0) {
          error('MCQ questions must have at least one correct answer');
          return;
        }
      }

      if (!formData.question_text.trim()) {
        error('Question text is required');
        return;
      }

      setLoading(true);
      const updatePayload: UpdateQuestionPayload = {
        question_id: selectedQuestion.id,
        question_text: formData.question_text,
        type: formData.type,
        metadata: formData.metadata
      };
      await examApi.updateQuestion(updatePayload);
      success('Question updated successfully!');
      setShowEditModal(false);
      setSelectedQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update question';
      error(errorMsg);
      console.error('Error updating question:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await examApi.deleteQuestion(questionId);
      success('Question deleted successfully!');
      fetchQuestions();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete question';
      error(errorMsg);
      console.error('Error deleting question:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (question: BackendQuestion) => {
    setSelectedQuestion(question);
    setFormData({
      exam_id: examId,
      question_text: question.question_text,
      type: question.type,
      metadata: question.metadata || {
        options: [],
        correct_answers: []
      }
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      exam_id: examId,
      question_text: '',
      type: 'MCQ',
      metadata: {
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        correct_answers: []
      }
    });
  };

  // Handle MCQ option changes
  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const options = [...(formData.metadata?.options || [])];
    if (field === 'text') {
      options[index] = { ...options[index], text: value as string };
    } else {
      // If single correct mode and this option is being marked as correct,
      // unmark all other options
      if (value === true && !isMultipleCorrect) {
        options.forEach((opt, idx) => {
          opt.isCorrect = idx === index;
        });
      } else {
        options[index] = { ...options[index], isCorrect: value as boolean };
      }
    }

    // Update correct_answers array based on isCorrect flags
    const correctAnswers = options
      .map((opt, idx) => opt.isCorrect ? idx : null)
      .filter(idx => idx !== null) as number[];

    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        options,
        correct_answers: correctAnswers
      }
    });
  };

  // Add new option for MCQ
  const addOption = () => {
    const options = [...(formData.metadata?.options || [])];
    options.push({ text: '', isCorrect: false });
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        options
      }
    });
  };

  // Remove option for MCQ
  const removeOption = (index: number) => {
    const options = [...(formData.metadata?.options || [])];
    options.splice(index, 1);
    
    // Update correct_answers
    const correctAnswers = options
      .map((opt, idx) => opt.isCorrect ? idx : null)
      .filter(idx => idx !== null) as number[];

    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        options,
        correct_answers: correctAnswers
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filter, Add Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full">
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

            {/* Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MCQ">MCQ</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Add Question Button */}
            <Button 
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert - Only show for real errors, not validation or empty state */}
      {errorMessage && !errorMessage.includes('limit') && questions.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Questions List */}
      <Card>
        <CardContent className="p-6">
          {loading && questions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {questions.length === 0 ? 'No questions found. Add your first question!' : 'No questions match your search criteria.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-32">Created</TableHead>
                  <TableHead className="w-32 text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question, index) => (
                  <TableRow
                    key={question.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openEditModal(question)}
                  >
                    <TableCell className="font-mono text-sm">{index + 1}</TableCell>
                    <TableCell>
                      <div className="max-w-2xl">
                        <p className="line-clamp-2">{question.question_text}</p>
                        {question.type === 'MCQ' && question.metadata?.options && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {question.metadata.options.length} options
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {question.created_at ? new Date(question.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteQuestion(question.id);
                          }}
                          disabled={loading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Question Modal */}
      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Create a new question for "{examTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question-text">Question Text *</Label>
              <Textarea
                id="question-text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Enter the question text..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="question-type">Question Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'MCQ' | 'MULTIPLE_CORRECT' | 'ONE_WORD' | 'SUBJECTIVE') => {
                  setFormData({
                    ...formData,
                    type: value,
                    metadata: value === 'MCQ' || value === 'MULTIPLE_CORRECT' ? {
                      options: [
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false }
                      ],
                      correct_answers: []
                    } : {}
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                  <SelectItem value="MULTIPLE_CORRECT">Multiple Correct</SelectItem>
                  <SelectItem value="ONE_WORD">One Word</SelectItem>
                  <SelectItem value="SUBJECTIVE">Subjective</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MCQ Options */}
            {(formData.type === 'MCQ' || formData.type === 'MULTIPLE_CORRECT') && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Options *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                {(formData.metadata?.options || []).map(
                  (
                    option: { text?: string; isCorrect?: boolean },
                    index: number
                  ) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">
                        <input
                          type={isMultipleCorrect ? "checkbox" : "radio"}
                          checked={option.isCorrect || false}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', isMultipleCorrect ? e.target.checked : true)}
                          name={isMultipleCorrect ? undefined : `correct-answer-add`}
                          className="mr-1"
                        />
                        Correct
                      </Label>
                      {(formData.metadata?.options || []).length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  ),
                )}
                <p className="text-xs text-muted-foreground">
                  * At least 2 options required, and at least one must be marked as correct
                  {!isMultipleCorrect && ' (Single correct answer mode - only one option can be correct)'}
                  {isMultipleCorrect && ' (Multiple correct answers mode - multiple options can be correct)'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddQuestion} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Question'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Question Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        setShowEditModal(open);
        if (!open) {
          setSelectedQuestion(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update question details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-question-text">Question Text *</Label>
              <Textarea
                id="edit-question-text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Enter the question text..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-question-type">Question Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'MCQ' | 'MULTIPLE_CORRECT' | 'ONE_WORD' | 'SUBJECTIVE') => {
                  setFormData({
                    ...formData,
                    type: value,
                    metadata: value === 'MCQ' || value === 'MULTIPLE_CORRECT' ? (formData.metadata?.options ? formData.metadata : {
                      options: [
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false }
                      ],
                      correct_answers: []
                    }) : {}
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                  <SelectItem value="MULTIPLE_CORRECT">Multiple Correct</SelectItem>
                  <SelectItem value="ONE_WORD">One Word</SelectItem>
                  <SelectItem value="SUBJECTIVE">Subjective</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MCQ Options */}
            {(formData.type === 'MCQ' || formData.type === 'MULTIPLE_CORRECT') && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Options *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                {(formData.metadata?.options || []).map(
                  (
                    option: { text?: string; isCorrect?: boolean },
                    index: number
                  ) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">
                        <input
                          type={isMultipleCorrect ? "checkbox" : "radio"}
                          checked={option.isCorrect || false}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', isMultipleCorrect ? e.target.checked : true)}
                          name={isMultipleCorrect ? undefined : `correct-answer-edit-${selectedQuestion?.id}`}
                          className="mr-1"
                        />
                        Correct
                      </Label>
                      {(formData.metadata?.options || []).length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  ),
                )}
                <p className="text-xs text-muted-foreground">
                  * At least 2 options required, and at least one must be marked as correct
                  {!isMultipleCorrect && ' (Single correct answer mode - only one option can be correct)'}
                  {isMultipleCorrect && ' (Multiple correct answers mode - multiple options can be correct)'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditQuestion} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Question'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
