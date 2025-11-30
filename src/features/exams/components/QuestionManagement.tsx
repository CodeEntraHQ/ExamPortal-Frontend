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
  AlertCircle,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { authenticatedFetch } from '../../../services/api/core';

// Export Question type alias for use in other components
export type Question = BackendQuestion;

// Helper function to fetch image from backend and convert to data URL
const fetchImageAsDataUrl = async (imageLink: string | null | undefined): Promise<string | null> => {
  if (!imageLink) return null;
  
  try {
    const response = await authenticatedFetch(imageLink);
    const data = await response.json();
    if (data.payload?.media) {
      const mediaData = data.payload.media;
      let buffer: Uint8Array;
      
      if (mediaData && typeof mediaData === 'object') {
        if (mediaData.type === 'Buffer' && Array.isArray(mediaData.data)) {
          buffer = new Uint8Array(mediaData.data);
        } else if (Array.isArray(mediaData.data)) {
          buffer = new Uint8Array(mediaData.data);
        } else if (Array.isArray(mediaData)) {
          buffer = new Uint8Array(mediaData);
        } else {
          const values = Object.values(mediaData);
          if (values.length > 0 && Array.isArray(values[0])) {
            buffer = new Uint8Array(values[0] as number[]);
          } else {
            buffer = new Uint8Array(Object.values(mediaData) as number[]);
          }
        }
      } else {
        console.error('Unexpected media data format:', mediaData);
        return null;
      }
      
      const blob = new Blob([buffer], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
};

// Helper function to validate image dimensions
const validateImageDimensions = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  minWidth: number = 100,
  minHeight: number = 100
): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = img;
      
      if (width < minWidth || height < minHeight) {
        resolve({
          valid: false,
          width,
          height,
          error: `Image dimensions are too small. Minimum size: ${minWidth}x${minHeight}px. Current: ${width}x${height}px. Please resize and upload again.`
        });
        return;
      }
      
      if (width > maxWidth || height > maxHeight) {
        resolve({
          valid: false,
          width,
          height,
          error: `Image dimensions are too large. Maximum size: ${maxWidth}x${maxHeight}px. Current: ${width}x${height}px. Please resize and upload again.`
        });
        return;
      }
      
      resolve({ valid: true, width, height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: 'Failed to load image for validation. Please ensure the file is a valid image.'
      });
    };
    
    img.src = objectUrl;
  });
};

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

  // Image state for question and options
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null);
  const [optionImages, setOptionImages] = useState<{ [key: number]: File }>({});
  const [optionImagePreviews, setOptionImagePreviews] = useState<{ [key: number]: string }>({});
  
  // Toggle state for options (text vs image) - questions can have both
  const [optionModes, setOptionModes] = useState<{ [key: number]: 'text' | 'image' }>({});

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

  // Handle question image upload
  const handleQuestionImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        error('Invalid file type. Only JPEG and PNG images are allowed.');
        // Reset file input
        e.target.value = '';
        return;
      }
      
      // Validate file size (250KB max)
      if (file.size > 256000) {
        error('Image size is too large. Maximum size: 250KB. Please compress or resize the image and try again.');
        // Reset file input
        e.target.value = '';
        return;
      }
      
      // Validate minimum file size (at least 1KB to avoid corrupted images)
      if (file.size < 1024) {
        error('Image file is too small. Please use a valid image file.');
        // Reset file input
        e.target.value = '';
        return;
      }
      
      // Validate image dimensions
      // Question images: max 1920x1080, min 200x200
      const dimensionValidation = await validateImageDimensions(file, 1920, 1080, 200, 200);
      if (!dimensionValidation.valid) {
        error(dimensionValidation.error || 'Image dimensions are not accurate. Please resize and upload again.');
        // Reset file input
        e.target.value = '';
        return;
      }
      
      // Clean up old blob URL if it exists
      if (questionImagePreview && questionImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(questionImagePreview);
      }
      
      setQuestionImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle option image upload
  const handleOptionImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        error('Invalid file type. Only JPEG and PNG images are allowed.');
        // Reset file input
        e.target.value = '';
        return;
      }
      
      // Validate file size (250KB max)
      if (file.size > 256000) {
        error('Image size is too large. Maximum size: 250KB. Please compress or resize the image and try again.');
        // Reset file input
        e.target.value = '';
        return;
      }
      
      // Validate minimum file size (at least 1KB to avoid corrupted images)
      if (file.size < 1024) {
        error('Image file is too small. Please use a valid image file.');
        // Reset file input
        e.target.value = '';
        return;
      }
      
      // Validate image dimensions
      // Option images: max 800x600, min 100x100 (smaller than question images)
      const dimensionValidation = await validateImageDimensions(file, 800, 600, 100, 100);
      if (!dimensionValidation.valid) {
        error(dimensionValidation.error || 'Image dimensions are not accurate. Please resize and upload again.');
        // Reset file input
        e.target.value = '';
        return;
      }
      
      // Clean up old blob URL if it exists
      const oldPreview = optionImagePreviews[index];
      if (oldPreview && oldPreview.startsWith('blob:')) {
        URL.revokeObjectURL(oldPreview);
      }
      
      setOptionImages({ ...optionImages, [index]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setOptionImagePreviews({ ...optionImagePreviews, [index]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove question image
  const removeQuestionImage = () => {
    // Clean up object URL if it exists
    if (questionImagePreview && questionImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(questionImagePreview);
    }
    setQuestionImage(null);
    setQuestionImagePreview(null);
  };

  // Remove option image
  const removeOptionImage = (index: number) => {
    // Clean up object URL if it exists
    const preview = optionImagePreviews[index];
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    const newOptionImages = { ...optionImages };
    const newPreviews = { ...optionImagePreviews };
    delete newOptionImages[index];
    delete newPreviews[index];
    setOptionImages(newOptionImages);
    setOptionImagePreviews(newPreviews);
  };

  // Handle add question
  const handleAddQuestion = async () => {
    try {
      // Validate that at least question_text or question_image is provided
      if (!formData.question_text.trim() && !questionImage && !questionImagePreview) {
        error('Either question text or question image must be provided');
        return;
      }

      // Validate MCQ questions
      if (formData.type === 'MCQ' || formData.type === 'MULTIPLE_CORRECT') {
        const options = formData.metadata?.options || [];
        const correctAnswers = formData.metadata?.correct_answers || [];
        const validOptions = options.filter(
          (opt: { text?: string; image_id?: string }) => 
            (typeof opt.text === 'string' && opt.text.trim().length > 0) || 
            optionImages[options.indexOf(opt)] !== undefined
        );
        
        if (validOptions.length < 2) {
          error('MCQ questions must have at least 2 options (with text or image)');
          return;
        }
        
        if (correctAnswers.length === 0) {
          error('MCQ questions must have at least one correct answer');
          return;
        }
      }

      setLoading(true);
      await examApi.createQuestion(formData, questionImage, optionImages);
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
      // Validate that at least question_text or question_image is provided
      if (!formData.question_text.trim() && !questionImage && !questionImagePreview) {
        error('Either question text or question image must be provided');
        return;
      }

      // Validate MCQ questions
      if (formData.type === 'MCQ' || formData.type === 'MULTIPLE_CORRECT') {
        const options = formData.metadata?.options || [];
        const correctAnswers = formData.metadata?.correct_answers || [];
        const validOptions = options.filter(
          (opt: { text?: string; image_id?: string }) => 
            (typeof opt.text === 'string' && opt.text.trim().length > 0) || 
            optionImages[options.indexOf(opt)] !== undefined ||
            optionImagePreviews[options.indexOf(opt)] !== undefined
        );
        
        if (validOptions.length < 2) {
          error('MCQ questions must have at least 2 options (with text or image)');
          return;
        }
        
        if (correctAnswers.length === 0) {
          error('MCQ questions must have at least one correct answer');
          return;
        }
      }

      setLoading(true);
      const updatePayload: UpdateQuestionPayload = {
        question_id: selectedQuestion.id,
        question_text: formData.question_text,
        type: formData.type,
        metadata: formData.metadata
      };
      await examApi.updateQuestion(updatePayload, questionImage, optionImages);
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
  const openEditModal = async (question: BackendQuestion) => {
    setSelectedQuestion(question);
    setFormData({
      exam_id: examId,
      question_text: question.question_text || '',
      type: question.type,
      metadata: question.metadata || {
        options: [],
        correct_answers: []
      }
    });
    
    // Reset image states
    setQuestionImage(null);
    setOptionImages({});
    
    // Fetch and set question image preview
    if (question.question_image_link) {
      const questionPreview = await fetchImageAsDataUrl(question.question_image_link);
      setQuestionImagePreview(questionPreview);
    } else {
      setQuestionImagePreview(null);
    }
    
    // Fetch and set option image previews from existing question
    const previews: { [key: number]: string } = {};
    const modes: { [key: number]: 'text' | 'image' } = {};
    if (question.metadata?.options) {
      await Promise.all(
        question.metadata.options.map(async (opt: any, index: number) => {
          if (opt.image_link || opt.image_id) {
            const preview = await fetchImageAsDataUrl(opt.image_link);
            if (preview) {
              previews[index] = preview;
            }
            modes[index] = 'image';
          } else {
            modes[index] = 'text';
          }
        })
      );
    }
    setOptionImagePreviews(previews);
    setOptionModes(modes);
    
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    // Clean up object URLs before resetting
    if (questionImagePreview && questionImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(questionImagePreview);
    }
    Object.values(optionImagePreviews).forEach(preview => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    
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
    setQuestionImage(null);
    setQuestionImagePreview(null);
    setOptionImages({});
    setOptionImagePreviews({});
    setOptionModes({});
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
    const newIndex = options.length;
    options.push({ text: '', isCorrect: false });
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        options
      }
    });
    // Default new option to text mode
    setOptionModes({ ...optionModes, [newIndex]: 'text' });
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
        <DialogContent className="fullscreen w-screen h-screen overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 border-b mb-4 -mx-6 px-6 pt-6 -mt-6">
            <DialogTitle className="text-2xl">Add New Question</DialogTitle>
            <DialogDescription className="text-base">
              Create a new question for "{examTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-w-7xl mx-auto">
            {/* Question Text Input */}
            <div className="grid gap-2">
              <Label htmlFor="question-text">Question Text</Label>
              <Textarea
                id="question-text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Enter the question text (optional if image is provided)..."
                rows={4}
              />
            </div>

            {/* Question Image Upload */}
            <div className="grid gap-2">
              <Label htmlFor="question-image">Question Image</Label>
              {questionImagePreview ? (
                <div className="flex items-start gap-3">
                  <div className="border rounded-lg p-4 flex-1">
                    <img 
                      src={questionImagePreview} 
                      alt="Question preview" 
                      className="max-h-48 max-w-full mx-auto rounded object-contain"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeQuestionImage}
                    className="mt-4"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="question-image"
                    accept="image/jpeg,image/png"
                    onChange={handleQuestionImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="question-image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload question image (optional)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JPEG or PNG, max 250KB
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Dimensions: 200x200 to 1920x1080px
                    </span>
                  </label>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                * At least one of question text or question image must be provided
              </p>
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
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Options *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {(formData.metadata?.options || []).map(
                  (
                    option: { text?: string; isCorrect?: boolean },
                    index: number
                  ) => {
                    const optionMode = optionModes[index] || 'text';
                    return (
                      <div key={index} className="space-y-2 border rounded-lg p-3">
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Option {index + 1}</span>
                              <div className="flex gap-1 ml-auto">
                                <Button
                                  type="button"
                                  variant={optionMode === 'text' ? 'default' : 'outline'}
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setOptionModes({ ...optionModes, [index]: 'text' })}
                                >
                                  Text
                                </Button>
                                <Button
                                  type="button"
                                  variant={optionMode === 'image' ? 'default' : 'outline'}
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setOptionModes({ ...optionModes, [index]: 'image' })}
                                >
                                  Image
                                </Button>
                              </div>
                            </div>
                            {optionMode === 'text' ? (
                              <Input
                                value={option.text || ''}
                                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                placeholder={`Enter option ${index + 1} text...`}
                              />
                            ) : (
                              <div>
                                {optionImagePreviews[index] ? (
                                  <div className="flex items-start gap-2">
                                    <div className="border rounded-lg p-2 flex-1">
                                      <img 
                                        src={optionImagePreviews[index]} 
                                        alt={`Option ${index + 1} preview`} 
                                        className="max-h-32 max-w-full mx-auto rounded object-contain"
                                        style={{ maxWidth: '100%', height: 'auto' }}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeOptionImage(index)}
                                      className="mt-2"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed rounded-lg p-3 text-center">
                                    <input
                                      type="file"
                                      id={`option-image-${index}`}
                                      accept="image/jpeg,image/png"
                                      onChange={(e) => handleOptionImageChange(index, e)}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor={`option-image-${index}`}
                                      className="cursor-pointer flex flex-col items-center gap-1"
                                    >
                                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        Upload option image
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Max 250KB, 100x100 to 800x600px
                                      </span>
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}
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
                                onClick={() => {
                                  removeOption(index);
                                  removeOptionImage(index);
                                  const newModes = { ...optionModes };
                                  delete newModes[index];
                                  setOptionModes(newModes);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  * At least 2 options required, and at least one must be marked as correct
                  {!isMultipleCorrect && ' (Single correct answer mode - only one option can be correct)'}
                  {isMultipleCorrect && ' (Multiple correct answers mode - multiple options can be correct)'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="sticky bottom-0 bg-background z-10 pt-4 border-t mt-6 max-w-7xl mx-auto w-full">
            <Button variant="outline" onClick={() => setShowAddModal(false)} size="lg">
              Cancel
            </Button>
            <Button onClick={handleAddQuestion} disabled={loading} size="lg">
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
        <DialogContent className="fullscreen w-screen h-screen overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 border-b mb-4 -mx-6 px-6 pt-6 -mt-6">
            <DialogTitle className="text-2xl">Edit Question</DialogTitle>
            <DialogDescription className="text-base">
              Update question details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-w-7xl mx-auto">
            {/* Question Text Input for Edit */}
            <div className="grid gap-2">
              <Label htmlFor="edit-question-text">Question Text</Label>
              <Textarea
                id="edit-question-text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Enter the question text (optional if image is provided)..."
                rows={4}
              />
            </div>

            {/* Question Image Upload for Edit */}
            <div className="grid gap-2">
              <Label htmlFor="edit-question-image">Question Image</Label>
              {questionImagePreview ? (
                <div className="flex items-start gap-3">
                  <div className="border rounded-lg p-4 flex-1">
                    <img 
                      src={questionImagePreview} 
                      alt="Question preview" 
                      className="max-h-48 max-w-full mx-auto rounded object-contain"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeQuestionImage}
                    className="mt-4"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="edit-question-image"
                    accept="image/jpeg,image/png"
                    onChange={handleQuestionImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-question-image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload question image (optional)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JPEG or PNG, max 250KB
                    </span>
                  </label>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                * At least one of question text or question image must be provided
              </p>
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
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Options *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {(formData.metadata?.options || []).map(
                  (
                    option: { text?: string; isCorrect?: boolean },
                    index: number
                  ) => {
                    const optionMode = optionModes[index] || 'text';
                    return (
                      <div key={index} className="space-y-2 border rounded-lg p-3">
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Option {index + 1}</span>
                              <div className="flex gap-1 ml-auto">
                                <Button
                                  type="button"
                                  variant={optionMode === 'text' ? 'default' : 'outline'}
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setOptionModes({ ...optionModes, [index]: 'text' })}
                                >
                                  Text
                                </Button>
                                <Button
                                  type="button"
                                  variant={optionMode === 'image' ? 'default' : 'outline'}
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setOptionModes({ ...optionModes, [index]: 'image' })}
                                >
                                  Image
                                </Button>
                              </div>
                            </div>
                            {optionMode === 'text' ? (
                              <Input
                                value={option.text || ''}
                                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                placeholder={`Enter option ${index + 1} text...`}
                              />
                            ) : (
                              <div>
                                {optionImagePreviews[index] ? (
                                  <div className="flex items-start gap-2">
                                    <div className="border rounded-lg p-2 flex-1">
                                      <img 
                                        src={optionImagePreviews[index]} 
                                        alt={`Option ${index + 1} preview`} 
                                        className="max-h-32 max-w-full mx-auto rounded object-contain"
                                        style={{ maxWidth: '100%', height: 'auto' }}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeOptionImage(index)}
                                      className="mt-2"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed rounded-lg p-3 text-center">
                                    <input
                                      type="file"
                                      id={`edit-option-image-${index}`}
                                      accept="image/jpeg,image/png"
                                      onChange={(e) => handleOptionImageChange(index, e)}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor={`edit-option-image-${index}`}
                                      className="cursor-pointer flex flex-col items-center gap-1"
                                    >
                                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        Upload option image
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Max 250KB, 100x100 to 800x600px
                                      </span>
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}
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
                                onClick={() => {
                                  removeOption(index);
                                  removeOptionImage(index);
                                  const newModes = { ...optionModes };
                                  delete newModes[index];
                                  setOptionModes(newModes);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  * At least 2 options required, and at least one must be marked as correct
                  {!isMultipleCorrect && ' (Single correct answer mode - only one option can be correct)'}
                  {isMultipleCorrect && ' (Multiple correct answers mode - multiple options can be correct)'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="sticky bottom-0 bg-background z-10 pt-4 border-t mt-6 max-w-7xl mx-auto w-full">
            <Button variant="outline" onClick={() => setShowEditModal(false)} size="lg">
              Cancel
            </Button>
            <Button onClick={handleEditQuestion} disabled={loading} size="lg">
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
