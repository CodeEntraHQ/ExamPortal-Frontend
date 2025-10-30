import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { examApi, CreateExamPayload } from '../services/api/exam';

interface CreateExamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entityId?: string;
}

type ExamFormData = {
  title: string;
  type: CreateExamPayload['type'];
  duration_seconds: number;
  metadata: {
    totalMarks: number;
    passingMarks: number;
    instructions: string;
  };
  entity_id?: string;
};

export const CreateExamModal = ({ open, onClose, onSuccess, entityId }: CreateExamModalProps) => {
  const initialFormState: ExamFormData = {
    title: '',
    type: 'MCQ',
    duration_seconds: 3600, // Default 1 hour
    metadata: {
      totalMarks: 100,
      passingMarks: 40,
      instructions: ''
    },
    entity_id: entityId
  };

  const [formData, setFormData] = useState<ExamFormData>(initialFormState);
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
      type: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await examApi.createExam(formData);
      setFormData(initialFormState);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new exam.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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
                <SelectItem value="MCQ">Multiple Choice Questions</SelectItem>
                {/* <SelectItem value="ONE_WORD">One Word Answer</SelectItem>
                <SelectItem value="DESCRIPTIVE">Descriptive</SelectItem>
                <SelectItem value="HYBRID">Hybrid</SelectItem>
                <SelectItem value="QUIZ">Quiz</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem> */}
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

          <div className="grid gap-2">
            <Label htmlFor="totalMarks">Total Marks</Label>
            <Input
              id="totalMarks"
              type="number"
              min={0}
              value={formData.metadata.totalMarks}
              onChange={(e) => handleNumberChange(e.target.value, 'metadata.totalMarks')}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="passingMarks">Passing Marks</Label>
            <Input
              id="passingMarks"
              type="number"
              min={0}
              value={formData.metadata.passingMarks}
              onChange={(e) => handleNumberChange(e.target.value, 'metadata.passingMarks')}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.metadata.instructions}
              onChange={(e) => handleTextChange(e.target.value, 'metadata.instructions')}
              rows={4}
            />
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
            {loading ? 'Creating...' : 'Create Exam'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}