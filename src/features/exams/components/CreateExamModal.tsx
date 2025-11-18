import React, { useState } from 'react';
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
import { Plus, X, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Switch } from '../../../shared/components/ui/switch';
import { examApi, CreateExamPayload } from '../../../services/api/exam';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import '../../../styles/scrollbar.css';

interface CreateExamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entityId?: string;
}

type MetadataFieldType = 'text' | 'number' | 'boolean';

type MetadataKey = 'totalMarks' | 'passingMarks' | 'instructions' | 'isMultipleCorrect';

interface MetadataFieldDefinition {
  key: MetadataKey;
  label: string;
  type: MetadataFieldType;
  defaultValue: string | number | boolean | string[];
}

interface MetadataField {
  totalMarks?: number;
  passingMarks?: number;
  instructions?: string[];
  isMultipleCorrect?: boolean;
}

type ExamFormData = {
  title: string;
  type: CreateExamPayload['type'];
  duration_seconds: number;
  metadata: MetadataField;
  entity_id?: string;
};

export const CreateExamModal = ({ open, onClose, onSuccess, entityId }: CreateExamModalProps) => {
  const { user } = useAuth();
  const availableMetadataFields: (MetadataFieldDefinition & { description: string })[] = [
    { 
      key: 'totalMarks', 
      label: 'Total Marks', 
      type: 'number', 
      defaultValue: 100,
      description: 'Maximum points possible in this exam'
    },
    { 
      key: 'passingMarks', 
      label: 'Passing Marks', 
      type: 'number', 
      defaultValue: 40,
      description: 'Minimum points required to pass'
    },
    { 
      key: 'instructions', 
      label: 'Instructions', 
      type: 'text', 
      defaultValue: [],
      description: 'Guidelines and rules for exam takers (multiple instructions)'
    }
  ];

  const initialFormState: ExamFormData = {
    title: '',
    type: 'QUIZ',
    duration_seconds: 3600, // Default 1 hour
    metadata: {},
    entity_id: entityId
  };

  const [formData, setFormData] = useState<ExamFormData>(initialFormState);
  const [activeMetadataFields, setActiveMetadataFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal is closed
  const handleClose = () => {
    setFormData(initialFormState);
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

  const handleBooleanChange = (value: boolean, field: string) => {
    if (field.startsWith('metadata.')) {
      const metadataField = field.split('.')[1] as keyof ExamFormData['metadata'];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      // Ensure required metadata fields are present for the API
      // Filter out empty instructions before submitting
      const instructions = (formData.metadata.instructions || [])
        .map(inst => inst.trim())
        .filter(inst => inst.length > 0);
      
      const submissionData: CreateExamPayload = {
        title: formData.title,
        type: formData.type,
        duration_seconds: formData.duration_seconds,
        metadata: {
          totalMarks: formData.metadata.totalMarks ?? 100,
          passingMarks: formData.metadata.passingMarks ?? 40,
          instructions: instructions.length > 0 ? instructions : [],
          // Only include isMultipleCorrect for QUIZ type
          ...(formData.type === 'QUIZ' && formData.metadata.isMultipleCorrect !== undefined
            ? { isMultipleCorrect: formData.metadata.isMultipleCorrect }
            : {}),
        },
        // Only include entity_id for SUPERADMIN users with a valid non-empty string
        ...(user?.role === 'SUPERADMIN' && formData.entity_id && formData.entity_id.trim().length > 0
          ? { entity_id: formData.entity_id.trim() }
          : {}),
      };
      await examApi.createExam(submissionData);
      setFormData(initialFormState);
      setActiveMetadataFields([]);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new exam.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
                {/* <SelectItem value="MCQ">Multiple Choice Questions</SelectItem>
                <SelectItem value="ONE_WORD">One Word Answer</SelectItem>
                <SelectItem value="DESCRIPTIVE">Descriptive</SelectItem>
                <SelectItem value="HYBRID">Hybrid</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem> */}
              </SelectContent>
            </Select>
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
                  onCheckedChange={(checked) => handleBooleanChange(checked, 'metadata.isMultipleCorrect')}
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              value={formData.duration_seconds / 60}
              onChange={(e) => handleNumberChange(e.target.value, 'duration_seconds')}
              required
            />
          </div>

          <div className="grid gap-2">
            <div className="relative w-[180px]">
              <Select
                onValueChange={(value: MetadataKey) => {
                  if (!activeMetadataFields.includes(value)) {
                    setActiveMetadataFields([...activeMetadataFields, value]);
                    const field = availableMetadataFields.find(f => f.key === value);
                    if (field) {
                      setFormData(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          [value]: value === 'instructions' ? [''] : field.defaultValue
                        }
                      }));
                    }
                  }
                }}
                disabled={activeMetadataFields.length === availableMetadataFields.length}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-8"
                  asChild
                >
                  <SelectTrigger>
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="text-sm">Add Field</span>
                  </SelectTrigger>
                </Button>
                <SelectContent 
                  className="w-[180px] overflow-hidden" 
                  position="popper"
                  sideOffset={4}
                >
                  <div className="max-h-[80px] overflow-y-auto custom-scrollbar">
                    {availableMetadataFields
                      .filter(field => !activeMetadataFields.includes(field.key))
                      .map(field => (
                        <SelectItem 
                          key={field.key} 
                          value={field.key} 
                          className="border-b last:border-b-0 border-border/50 hover:bg-muted/50 focus:bg-muted/50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 py-2 px-1">
                            <span className="text-base">
                              {field.type === 'text' 
                                ? '📝' 
                                : field.type === 'number'
                                ? '🔢'
                                : '⚡'}
                            </span>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {field.label}
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate">
                                {field.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
            {activeMetadataFields.length === availableMetadataFields.length && (
              <p className="text-sm text-muted-foreground text-center">
                All available fields have been added
              </p>
            )}
          </div>

          {activeMetadataFields.map(fieldKey => {
            const field = availableMetadataFields.find(f => f.key === fieldKey);
            if (!field) return null;

            const handleRemoveField = (key: string) => {
              if (key === 'totalMarks' || key === 'passingMarks' || key === 'instructions') {
                setActiveMetadataFields(activeMetadataFields.filter(k => k !== key));
                setFormData(prev => {
                  const { [key]: _, ...restMetadata } = prev.metadata;
                  return { ...prev, metadata: restMetadata };
                });
              }
            };

            return (
              <div key={fieldKey} className="grid gap-2 relative p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Label htmlFor={fieldKey}>{field.label}</Label>
                    <p className="text-xs text-muted-foreground">
                      {field.type === 'text' ? 'Text input' : field.type === 'number' ? 'Numeric value' : 'Boolean choice'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive rounded-full"
                    onClick={() => handleRemoveField(fieldKey)}
                  >
                    ✕
                  </Button>
                </div>
                {field.type === 'text' && fieldKey === 'instructions' && (
                  <div className="mt-2 space-y-2">
                    {(formData.metadata.instructions || ['']).map((instruction, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <Input
                          value={instruction}
                          onChange={(e) => {
                            const newInstructions = [...(formData.metadata.instructions || [])];
                            newInstructions[index] = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                instructions: newInstructions
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
                            const newInstructions = [...(formData.metadata.instructions || [])];
                            newInstructions.splice(index, 1);
                            setFormData(prev => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                instructions: newInstructions.length > 0 ? newInstructions : ['']
                              }
                            }));
                          }}
                          disabled={(formData.metadata.instructions || []).length === 1}
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
                        const currentInstructions = formData.metadata.instructions || [''];
                        setFormData(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            instructions: [...currentInstructions, '']
                          }
                        }));
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Instruction
                    </Button>
                  </div>
                )}
                {field.type === 'number' && (fieldKey === 'totalMarks' || fieldKey === 'passingMarks') && (
                  <Input
                    id={fieldKey}
                    type="number"
                    min={0}
                    value={formData.metadata[fieldKey] || 0}
                    onChange={(e) => handleNumberChange(e.target.value, `metadata.${fieldKey}`)}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="mt-2"
                  />
                )}
              </div>
            );
          })}

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
            {loading ? 'Creating...' : 'Create Exam'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}