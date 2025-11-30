import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Switch } from '../../../shared/components/ui/switch';
import { examApi, UpdateExamPayload, BackendExam } from '../../../services/api/exam';
import { Plus, X } from 'lucide-react';
import '../../../styles/scrollbar.css';

interface EditExamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedExam?: BackendExam) => void;
  exam: BackendExam | null;
}

interface MetadataField {
  totalMarks?: number;
  passingMarks?: number;
  instructions?: string | string[];
  isMultipleCorrect?: boolean;
  description?: string;
  startDate?: string;
  endDate?: string;
}

type ExamFormData = {
  title: string;
  type: 'EXAM' | 'QUIZ';
  duration_seconds: number;
  metadata: MetadataField;
  active: boolean;
  results_visible: boolean;
};

export const EditExamModal = ({ open, onClose, onSuccess, exam }: EditExamModalProps) => {
  // Console log the exam data received from previous page
  useEffect(() => {
    if (exam) {
      console.log('EditExamModal - Exam data received from previous page:', exam);
      console.log('EditExamModal - Exam metadata:', exam.metadata);
    }
  }, [exam]);

  const getInitialFormState = (): ExamFormData => {
    if (exam) {
      let metadata: MetadataField = {};
      if (exam.metadata && typeof exam.metadata === 'object' && !Array.isArray(exam.metadata)) {
        metadata = { ...exam.metadata } as MetadataField;
        // Convert instructions to array if it's a string (backward compatibility)
        if (metadata.instructions && typeof metadata.instructions === 'string') {
          metadata.instructions = [metadata.instructions];
        }
      }
      return {
        title: exam.title || '',
        type: (exam.type === 'QUIZ' ? 'QUIZ' : 'EXAM') as 'EXAM' | 'QUIZ',
        duration_seconds: exam.duration_seconds || 3600,
        metadata,
        active: exam.active !== undefined ? exam.active : true,
        results_visible: exam.results_visible ?? false,
      };
    }
    return {
      title: '',
      type: 'EXAM',
      duration_seconds: 3600,
      metadata: {},
      active: true,
      results_visible: false,
    };
  };

  const [formData, setFormData] = useState<ExamFormData>(getInitialFormState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when exam changes or modal opens
  useEffect(() => {
    if (exam && open) {
      const initialData = getInitialFormState();
      setFormData(initialData);
      setError(null);
    }
  }, [exam, open]);

  // Reset form when modal is closed
  const handleClose = () => {
    setFormData(getInitialFormState());
    setError(null);
    onClose();
  };

  const handleTextChange = (value: string, field: string) => {
    if (field.startsWith('metadata.')) {
      const metadataField = field.split('.')[1] as keyof ExamFormData['metadata'];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNumberChange = (value: string, field: string) => {
    const numberValue = Number(value);
    if (field.startsWith('metadata.')) {
      const metadataField = field.split('.')[1] as keyof ExamFormData['metadata'];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: numberValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: field === 'duration_seconds' ? numberValue * 60 : numberValue
      }));
    }
  };

  const handleTypeChange = (value: ExamFormData['type']) => {
    setFormData(prev => ({
      ...prev,
      type: value,
      // Reset isMultipleCorrect when type changes (only relevant for QUIZ)
      metadata: {
        ...prev.metadata,
        isMultipleCorrect: value === 'QUIZ' ? prev.metadata.isMultipleCorrect : undefined
      }
    }));
  };

  const handleBooleanChange = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: value
    }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    try {
      setLoading(true);
      setError(null);
      
      // Filter out empty instructions before submitting
      const metadata = { ...formData.metadata };
      if (metadata.instructions && Array.isArray(metadata.instructions)) {
        const filteredInstructions = metadata.instructions
          .map(inst => typeof inst === 'string' ? inst.trim() : String(inst).trim())
          .filter(inst => inst.length > 0);
        metadata.instructions = filteredInstructions.length > 0 ? filteredInstructions : undefined;
      }
      
      // Only include isMultipleCorrect for QUIZ type
      if (formData.type !== 'QUIZ') {
        delete metadata.isMultipleCorrect;
      }
      
      const submissionData: UpdateExamPayload = {
        title: formData.title,
        type: formData.type,
        duration_seconds: formData.duration_seconds,
        active: formData.active,
        results_visible: formData.results_visible,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      };
      
      const response = await examApi.updateExam(exam.id, submissionData);
      const updatedExam = response.payload;
      handleClose();
      onSuccess(updatedExam);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update exam');
    } finally {
      setLoading(false);
    }
  };

  if (!exam) {
    return null;
  }

  // Get available metadata fields by iterating through the metadata JSON object
  const getAvailableMetadataFields = () => {
    // Handle null, undefined, or non-object metadata
    if (!exam?.metadata || exam.metadata === null || typeof exam.metadata !== 'object' || Array.isArray(exam.metadata)) {
      console.log('EditExamModal - No valid metadata found:', exam?.metadata);
      return [];
    }
    const available: Array<{ key: string; value: any; type: 'string' | 'number' | 'boolean' | 'date' | 'array' }> = [];
    
    // Iterate through all keys in metadata object
    Object.keys(exam.metadata).forEach(key => {
      const value = exam.metadata[key];
      // Skip null, undefined, and empty strings (but allow 0 and false)
      if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        return;
      }
      
      // Determine field type
      let type: 'string' | 'number' | 'boolean' | 'date' | 'array' = 'string';
      if (Array.isArray(value)) {
        type = 'array';
      } else if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (typeof value === 'string') {
        // Check if it looks like a date
        const datePattern = /^\d{4}-\d{2}-\d{2}/;
        if (datePattern.test(value)) {
          type = 'date';
        } else {
          type = 'string';
        }
      }
      
      available.push({ key, value, type });
    });
    
    return available;
  };

  const availableMetadataFields = getAvailableMetadataFields();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogDescription>
            Update the details of the exam.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTextChange(e.target.value, 'title')}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Exam Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: ExamFormData['type']) => handleTypeChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={formData.duration_seconds / 60}
                  onChange={(e) => handleNumberChange(e.target.value, 'duration_seconds')}
                  required
                />
              </div>

              {/* Show isMultipleCorrect toggle only for QUIZ type */}
              {formData.type === 'QUIZ' && (
                <div className="grid gap-2 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="isMultipleCorrect">Allow Multiple Correct Answers</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable this to allow questions with multiple correct answers
                      </p>
                    </div>
                    <Switch
                      id="isMultipleCorrect"
                      checked={formData.metadata.isMultipleCorrect || false}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            isMultipleCorrect: checked
                          }
                        }));
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="active">Status</Label>
                <Select
                  value={formData.active ? 'active' : 'inactive'}
                  onValueChange={(value) => handleBooleanChange(value === 'active')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Visibility Toggle */}
              <div className="grid gap-2 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="resultsVisible">Enable Results Visibility</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow students to view their exam results
                    </p>
                  </div>
                  <Switch
                    id="resultsVisible"
                    checked={formData.results_visible || false}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        results_visible: checked
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Metadata Section */}
            {availableMetadataFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Exam Metadata</h3>
                
                {availableMetadataFields.map((field) => {
                  const fieldKey = field.key;
                  const fieldValue = (formData.metadata as any)[fieldKey];
                  
                  // Render based on field type
                  if (field.type === 'number') {
                    return (
                      <div key={fieldKey} className="grid gap-2">
                        <Label htmlFor={fieldKey}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                        <Input
                          id={fieldKey}
                          type="number"
                          min={0}
                          value={typeof fieldValue === 'number' ? fieldValue : ''}
                          onChange={(e) => handleNumberChange(e.target.value, `metadata.${fieldKey}`)}
                          placeholder={`Enter ${fieldKey}...`}
                        />
                      </div>
                    );
                  } else if (field.type === 'date') {
                    return (
                      <div key={fieldKey} className="grid gap-2">
                        <Label htmlFor={fieldKey}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                        <Input
                          id={fieldKey}
                          type="date"
                          value={typeof fieldValue === 'string' ? fieldValue : ''}
                          onChange={(e) => handleTextChange(e.target.value, `metadata.${fieldKey}`)}
                        />
                      </div>
                    );
                  } else if (field.type === 'boolean') {
                    return (
                      <div key={fieldKey} className="grid gap-2">
                        <Label htmlFor={fieldKey}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                        <Select
                          value={fieldValue ? 'true' : 'false'}
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                [fieldKey]: value === 'true'
                              }
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  } else if (field.type === 'array' && fieldKey === 'instructions') {
                    // Special handling for instructions array
                    const instructions = Array.isArray(fieldValue) ? fieldValue : (fieldValue ? [String(fieldValue)] : ['']);
                    return (
                      <div key={fieldKey} className="grid gap-2">
                        <Label htmlFor={fieldKey}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                        <div className="space-y-2">
                          {instructions.map((instruction, index) => (
                            <div key={index} className="flex gap-2 items-start">
                              <Input
                                value={instruction}
                                onChange={(e) => {
                                  const newInstructions = [...instructions];
                                  newInstructions[index] = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    metadata: {
                                      ...prev.metadata,
                                      [fieldKey]: newInstructions
                                    }
                                  }));
                                }}
                                placeholder={`Instruction ${index + 1}...`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  const newInstructions = [...instructions];
                                  newInstructions.splice(index, 1);
                                  setFormData(prev => ({
                                    ...prev,
                                    metadata: {
                                      ...prev.metadata,
                                      [fieldKey]: newInstructions.length > 0 ? newInstructions : ['']
                                    }
                                  }));
                                }}
                                disabled={instructions.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              const currentInstructions = Array.isArray(fieldValue) ? fieldValue : (fieldValue ? [String(fieldValue)] : ['']);
                              setFormData(prev => ({
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  [fieldKey]: [...currentInstructions, '']
                                }
                              }));
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Instruction
                          </Button>
                        </div>
                      </div>
                    );
                  } else {
                    // String type - check if it's a long text (use textarea) or short (use input)
                    const isLongText = typeof fieldValue === 'string' && fieldValue.length > 50;
                    if (isLongText) {
                      return (
                        <div key={fieldKey} className="grid gap-2">
                          <Label htmlFor={fieldKey}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                          <Textarea
                            id={fieldKey}
                            value={typeof fieldValue === 'string' ? fieldValue : ''}
                            onChange={(e) => handleTextChange(e.target.value, `metadata.${fieldKey}`)}
                            rows={6}
                            placeholder={`Enter ${fieldKey}...`}
                            className="resize-none"
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div key={fieldKey} className="grid gap-2">
                          <Label htmlFor={fieldKey}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
                          <Input
                            id={fieldKey}
                            type="text"
                            value={typeof fieldValue === 'string' ? fieldValue : String(fieldValue || '')}
                            onChange={(e) => handleTextChange(e.target.value, `metadata.${fieldKey}`)}
                            placeholder={`Enter ${fieldKey}...`}
                          />
                        </div>
                      );
                    }
                  }
                })}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.type}
          >
            {loading ? 'Updating...' : 'Update Exam'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

