import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
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
import { authenticatedFetch, getApiUrl } from '../../../services/api/core';
import { 
  Plus, 
  Trash2, 
  Search,
  Loader2,
  AlertCircle,
  FileText
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<BackendQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state for add/edit
  const [formData, setFormData] = useState<CreateQuestionPayload>({
    exam_id: examId,
    question_text: '',
    type: 'MCQ_SINGLE',
    metadata: {
      options: [
        { text: '' },
        { text: '' },
        { text: '' },
        { text: '' }
      ],
      correct_answers: []
    }
  });

  // Fetch all questions from backend (paginated)
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      // Clean examId by removing any suffix like ":1"
      const cleanedExamId = examId.split(':')[0].trim();
      
      // Fetch all questions by paginating through pages
      // Backend limit must be less than 10, so we use 9
      const allQuestions: BackendQuestion[] = [];
      let currentPage = 1;
      let totalPages = 1;
      const pageSize = 9; // Backend requires limit < 10
      
      while (currentPage <= totalPages) {
        const response = await examApi.getQuestions(cleanedExamId, currentPage, pageSize);
        const { questions = [], totalPages: serverTotalPages, total, limit } = response.payload;
        
        allQuestions.push(...questions);
        
        const effectiveLimit = limit ?? pageSize;
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
      
      setQuestions(allQuestions);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch questions';
      setErrorMessage(errorMsg);
      error(errorMsg);
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      if (formData.type === 'MCQ_SINGLE' || formData.type === 'MCQ_MULTIPLE') {
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
        
        // For MCQ_SINGLE, must have exactly one correct answer
        if (formData.type === 'MCQ_SINGLE' && correctAnswers.length !== 1) {
          error('MCQ_SINGLE questions must have exactly one correct answer');
          return;
        }
      } else if (formData.type === 'SINGLE_WORD') {
        const correctAnswer = formData.metadata?.correct_answer;
        if (!correctAnswer || typeof correctAnswer !== 'string' || correctAnswer.trim().length === 0) {
          error('SINGLE_WORD questions must have a correct answer');
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

  // Navigate to edit page
  const openEditModal = (question: BackendQuestion) => {
    const rolePrefix = user?.role === 'ADMIN' ? '/admin' : '/superadmin';
    navigate(`${rolePrefix}/exam/${examId}/question/${question.id}/edit`);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      exam_id: examId,
      question_text: '',
      type: 'MCQ_SINGLE',
      metadata: {
        options: [
          { text: '' },
          { text: '' },
          { text: '' },
          { text: '' }
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
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          options
        }
      });
    } else {
      // Handle correct answer selection
      const currentCorrectAnswers = [...(formData.metadata?.correct_answers || [])];
      
      if (formData.type === 'MCQ_SINGLE') {
        // For single correct, replace the array with just this index
        setFormData({
          ...formData,
          metadata: {
            ...formData.metadata,
            correct_answers: value ? [index] : []
          }
        });
      } else if (formData.type === 'MCQ_MULTIPLE') {
        // For multiple correct, add or remove from array
        if (value) {
          if (!currentCorrectAnswers.includes(index)) {
            setFormData({
              ...formData,
              metadata: {
                ...formData.metadata,
                correct_answers: [...currentCorrectAnswers, index]
              }
            });
          }
        } else {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
              correct_answers: currentCorrectAnswers.filter(idx => idx !== index)
      }
    });
        }
      }
    }
  };

  // Add new option for MCQ
  const addOption = () => {
    const options = [...(formData.metadata?.options || [])];
    options.push({ text: '' });
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
    
    // Update correct_answers - remove the deleted index and adjust other indices
    const correctAnswers = (formData.metadata?.correct_answers || [])
      .filter((idx: number) => idx !== index)
      .map((idx: number) => idx > index ? idx - 1 : idx);

    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        options,
        correct_answers: correctAnswers
      }
    });
  };

  // Helper function to convert image URL to base64
  const imageUrlToBase64 = async (url: string): Promise<string | null> => {
    try {
      // If URL is a media API endpoint, fetch through authenticated API
      // Media URLs from backend are like /v1/medias?id=... or full URLs
      let fetchUrl = url;
      
      // Check if it's a media API URL
      if (url.includes('/v1/medias') || url.includes('medias?id=')) {
        if (url.startsWith('http')) {
          // Full URL, use as-is
          fetchUrl = url;
        } else {
          // Relative URL, ensure it starts with /v1/medias
          if (url.startsWith('/v1/medias')) {
            fetchUrl = getApiUrl(url);
          } else if (url.includes('medias?id=')) {
            // Extract query params
            const queryString = url.includes('?') ? url.split('?')[1] : url;
            fetchUrl = getApiUrl(`/v1/medias?${queryString}`);
          } else {
            fetchUrl = getApiUrl(url);
          }
        }
      } else if (!url.startsWith('http')) {
        // If it's a relative URL, prepend API base URL
        fetchUrl = getApiUrl(url);
      }

      // Use authenticated fetch to get the image
      const response = await authenticatedFetch(fetchUrl);
      if (!response.ok) {
        console.warn(`Failed to fetch image: ${url}`, response.status);
        return null;
      }

      // Check if response is JSON (media API format) or blob
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // Media API returns JSON with payload.media.data
        const data = await response.json();
        if (data.payload?.media?.data) {
          // Convert buffer array to blob
          const buffer = new Uint8Array(data.payload.media.data);
          const blob = new Blob([buffer], { type: 'image/jpeg' });
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              resolve(base64String);
            };
            reader.onerror = () => {
              console.warn(`Failed to convert image to base64: ${url}`);
              resolve(null);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          console.warn(`Invalid media response format: ${url}`);
          return null;
        }
      } else {
        // Direct image blob
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = () => {
            console.warn(`Failed to convert image to base64: ${url}`);
            resolve(null);
          };
          reader.readAsDataURL(blob);
        });
      }
    } catch (err) {
      console.warn(`Error converting image to base64: ${url}`, err);
      return null;
    }
  };

  // Export questions as PDF
  const exportQuestionsToPDF = async () => {
    try {
      if (filteredQuestions.length === 0) {
        error('No questions to export');
        return;
      }

      // Show loading message
      success('Preparing PDF export...');

      // Collect all image URLs
      const imageUrls: string[] = [];
      const imageMap = new Map<string, string>();

      filteredQuestions.forEach((question) => {
        const questionImageUrl = (question as any).question_image_id;
        if (questionImageUrl) {
          imageUrls.push(questionImageUrl);
        }

        if (question.type === 'MCQ_SINGLE' || question.type === 'MCQ_MULTIPLE') {
          const options = question.metadata?.options || [];
          options.forEach((option: any) => {
            if (option.image_url) {
              imageUrls.push(option.image_url);
            }
          });
        }
      });

      // Convert all images to base64
      if (imageUrls.length > 0) {
        const uniqueUrls = Array.from(new Set(imageUrls));
        const base64Promises = uniqueUrls.map(async (url) => {
          const base64 = await imageUrlToBase64(url);
          if (base64) {
            imageMap.set(url, base64);
          }
        });
        await Promise.all(base64Promises);
      }

      // Build questions HTML with base64 images
      const buildQuestionHTML = (question: BackendQuestion, index: number) => {
        const questionImageUrl = (question as any).question_image_id || null;
        const questionImageBase64 = questionImageUrl ? imageMap.get(questionImageUrl) : null;
        
        let questionHtml = `
          <div class="question">
            <div class="question-number">Question ${index + 1}</div>
            <div class="question-type">${question.type}</div>
            <div class="question-text">${question.question_text}</div>
        `;
        
        // Add question image if it exists (use base64 if available)
        if (questionImageBase64) {
          questionHtml += `
            <div class="question-image">
              <img src="${questionImageBase64}" alt="Question Image" />
            </div>
          `;
        } else if (questionImageUrl) {
          // Fallback to URL if base64 conversion failed
          questionHtml += `
            <div class="question-image">
              <img src="${questionImageUrl}" alt="Question Image" onerror="this.style.display='none';" />
            </div>
          `;
        }
        
        if (question.type === 'MCQ_SINGLE' || question.type === 'MCQ_MULTIPLE') {
          const options = question.metadata?.options || [];
          questionHtml += '<div class="options">';
          options.forEach((option: any, optIndex: number) => {
            const isCorrect = question.metadata?.correct_answers?.includes(optIndex) || false;
            const optionImageUrl = option.image_url || null;
            const optionImageBase64 = optionImageUrl ? imageMap.get(optionImageUrl) : null;
            
            questionHtml += `
              <div class="option ${isCorrect ? 'correct' : ''}">
                <span class="option-label">${String.fromCharCode(65 + optIndex)}.</span>
                ${option.text || ''}
                ${isCorrect ? ' <span style="color: #10b981;">✓ Correct</span>' : ''}
            `;
            
            // Add option image if it exists (use base64 if available)
            if (optionImageBase64) {
              questionHtml += `
                <div class="option-image">
                  <img src="${optionImageBase64}" alt="Option ${String.fromCharCode(65 + optIndex)} Image" />
                </div>
              `;
            } else if (optionImageUrl) {
              // Fallback to URL if base64 conversion failed
              questionHtml += `
                <div class="option-image">
                  <img src="${optionImageUrl}" alt="Option ${String.fromCharCode(65 + optIndex)} Image" onerror="this.style.display='none';" />
                </div>
              `;
            }
            
            questionHtml += '</div>';
          });
          questionHtml += '</div>';
        } else if (question.type === 'SINGLE_WORD') {
          const correctAnswer = question.metadata?.correct_answer || 'N/A';
          questionHtml += `
            <div class="correct-answer">
              Correct Answer: ${correctAnswer}
            </div>
          `;
        }
        
        questionHtml += '</div>';
        return questionHtml;
      };

      // Build questions HTML
      const questionsHTML = filteredQuestions.map((question, index) => buildQuestionHTML(question, index)).join('');

      // Create HTML content for PDF with base64 images
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Questions Export - ${examTitle}</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                @page {
                  margin: 1cm;
                  size: A4;
                }
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                }
              }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                background: linear-gradient(90deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 25px 20px;
                margin: -20px -20px 30px -20px;
                border-radius: 8px;
              }
              .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: bold;
                color: white;
              }
              .header h2 {
                margin: 5px 0;
                font-size: 20px;
                font-weight: 500;
                color: white;
              }
              .header p {
                margin: 10px 0 0 0;
                font-size: 12px;
                color: rgba(255,255,255,0.9);
              }
              .question {
                margin-bottom: 30px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                page-break-inside: avoid;
              }
              .question-number {
                font-weight: bold;
                font-size: 16px;
                color: #10b981;
                margin-bottom: 10px;
              }
              .question-text {
                font-size: 14px;
                margin-bottom: 15px;
                color: #333;
              }
              .question-image {
                margin: 15px 0;
                text-align: center;
              }
              .question-image img {
                max-width: 100%;
                max-height: 400px;
                border: 1px solid #ddd;
                border-radius: 5px;
                object-fit: contain;
              }
              .question-type {
                display: inline-block;
                padding: 4px 8px;
                background-color: #e0f2fe;
                color: #0369a1;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .options {
                margin-left: 20px;
                margin-top: 10px;
              }
              .option {
                margin-bottom: 8px;
                padding: 8px;
                background-color: #f9fafb;
                border-left: 3px solid #d1d5db;
                border-radius: 3px;
              }
              .option.correct {
                background-color: #d1fae5;
                border-left-color: #10b981;
                font-weight: bold;
              }
              .option-label {
                font-weight: bold;
                color: #666;
                margin-right: 8px;
              }
              .option-image {
                margin-top: 8px;
                text-align: center;
              }
              .option-image img {
                max-width: 100%;
                max-height: 200px;
                border: 1px solid #ddd;
                border-radius: 3px;
                object-fit: contain;
              }
              .correct-answer {
                margin-top: 10px;
                padding: 8px;
                background-color: #d1fae5;
                border-left: 3px solid #10b981;
                border-radius: 3px;
                font-weight: bold;
                color: #059669;
              }
              .summary {
                margin-top: 30px;
                padding: 15px;
                background-color: #f0fdf4;
                border: 2px solid #10b981;
                border-radius: 5px;
              }
              .summary h3 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #059669;
                font-weight: bold;
              }
              .summary p {
                margin: 5px 0;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ExamEntra</h1>
              <h2>${examTitle}</h2>
              <p>Questions Export - Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            
            ${questionsHTML}
            
            <div class="summary">
              <h3>Summary</h3>
              <p><strong>Total Questions:</strong> ${filteredQuestions.length}</p>
              <p><strong>MCQ Single:</strong> ${filteredQuestions.filter(q => q.type === 'MCQ_SINGLE').length}</p>
              <p><strong>MCQ Multiple:</strong> ${filteredQuestions.filter(q => q.type === 'MCQ_MULTIPLE').length}</p>
              <p><strong>Single Word:</strong> ${filteredQuestions.filter(q => q.type === 'SINGLE_WORD').length}</p>
            </div>
          </body>
        </html>
      `;

      // Create an iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        error('Failed to create PDF export');
        document.body.removeChild(iframe);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for iframe content to load, then trigger print
      const waitForContent = () => {
        const images = iframeDoc.querySelectorAll('img');
        const totalImages = images.length;

        if (totalImages === 0) {
          // No images, proceed immediately
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
            success('PDF download started automatically');
          }, 500);
          return;
        }

        let loadedCount = 0;
        let hasTriggeredPrint = false;

        const checkAndPrint = () => {
          if (!hasTriggeredPrint && loadedCount === totalImages) {
            hasTriggeredPrint = true;
            setTimeout(() => {
              iframe.contentWindow?.print();
              setTimeout(() => {
                document.body.removeChild(iframe);
              }, 1000);
              success('PDF download started automatically');
            }, 500);
          }
        };

        images.forEach((img: HTMLImageElement) => {
          if (img.complete && img.naturalHeight !== 0) {
            // Image already loaded (base64 images load instantly)
            loadedCount++;
            checkAndPrint();
          } else {
            // Wait for image to load
            img.onload = () => {
              loadedCount++;
              checkAndPrint();
            };
            img.onerror = () => {
              // Image failed to load, count it as loaded to proceed
              loadedCount++;
              checkAndPrint();
            };
          }
        });
      };

      // Wait for iframe to load
      iframe.onload = () => {
        setTimeout(waitForContent, 300);
      };
    } catch (err) {
      console.error('Error generating PDF:', err);
      error('Failed to generate PDF export');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filter, Add Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Left Side: Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            {/* Search Bar */}
              <div className="w-full sm:flex-1 sm:min-w-[50%]">
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
                <SelectItem value="MCQ_SINGLE">MCQ Single</SelectItem>
                <SelectItem value="MCQ_MULTIPLE">MCQ Multiple</SelectItem>
                <SelectItem value="SINGLE_WORD">Single Word</SelectItem>
              </SelectContent>
            </Select>
            </div>

            {/* Right Side: Action Buttons (ADMIN and SUPERADMIN only) */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
              <div className="flex gap-2 items-center">
                {/* Export PDF Button */}
                <Button 
                  onClick={exportQuestionsToPDF}
                  variant="outline"
                  disabled={filteredQuestions.length === 0}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Questions as PDF
                </Button>

            {/* Add Question Button */}
            <Button 
              onClick={() => {
                const cleanedExamId = examId.split(':')[0].trim();
                // Determine route based on current path
                const basePath = window.location.pathname.includes('/superadmin/') ? '/superadmin' : '/admin';
                window.location.href = `${basePath}/exam/${cleanedExamId}/question/create`;
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
              </div>
            )}
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
        <CardContent className="p-0">
          {loading && questions.length === 0 ? (
            <div className="flex items-center justify-center py-12 px-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-muted-foreground">
                {questions.length === 0 ? 'No questions found. Add your first question!' : 'No questions match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-y-auto border-t" style={{ maxHeight: '500px' }}>
                <div className="px-6 pt-4 pb-4">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      <TableRow>
                        <TableHead className="w-12 bg-background">#</TableHead>
                        <TableHead className="bg-background">Question</TableHead>
                        <TableHead className="w-24 bg-background">Type</TableHead>
                        <TableHead className="w-32 bg-background">Created</TableHead>
                        <TableHead className="w-32 text-right bg-background">Delete</TableHead>
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
                              {(question.type === 'MCQ_SINGLE' || question.type === 'MCQ_MULTIPLE') && question.metadata?.options && (
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
                </div>
              </div>
            </div>
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
                onValueChange={(value: 'MCQ_SINGLE' | 'MCQ_MULTIPLE' | 'SINGLE_WORD') => {
                  if (value === 'MCQ_SINGLE' || value === 'MCQ_MULTIPLE') {
                  setFormData({
                    ...formData,
                    type: value,
                      metadata: {
                      options: [
                          { text: '' },
                          { text: '' },
                          { text: '' },
                          { text: '' }
                      ],
                      correct_answers: []
                      }
                    });
                  } else if (value === 'SINGLE_WORD') {
                    setFormData({
                      ...formData,
                      type: value,
                      metadata: {
                        correct_answer: ''
                      }
                  });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ_SINGLE">MCQ Single Correct</SelectItem>
                  <SelectItem value="MCQ_MULTIPLE">MCQ Multiple Correct</SelectItem>
                  <SelectItem value="SINGLE_WORD">Single Word Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MCQ Options */}
            {(formData.type === 'MCQ_SINGLE' || formData.type === 'MCQ_MULTIPLE') && (
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
                          type={formData.type === 'MCQ_MULTIPLE' ? "checkbox" : "radio"}
                          checked={(formData.metadata?.correct_answers || []).includes(index)}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', formData.type === 'MCQ_MULTIPLE' ? e.target.checked : true)}
                          name={formData.type === 'MCQ_MULTIPLE' ? undefined : `correct-answer-add`}
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
                  {formData.type === 'MCQ_SINGLE' && ' (Single correct answer - only one option can be correct)'}
                  {formData.type === 'MCQ_MULTIPLE' && ' (Multiple correct answers - multiple options can be correct)'}
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

    </div>
  );
}
