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
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useAuth } from './AuthProvider';
import { useNotifications } from './NotificationProvider';
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
  CheckCircle
} from 'lucide-react';

interface ExamFormData {
  title: string;
  description: string;
  entityId: string;
  duration: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  instructions: string;
  passingMarks: number;
  totalMarks: number;
  allowRetake: boolean;
  randomizeQuestions: boolean;
  showResultsImmediately: boolean;
  proctoring: boolean;
  category: string;
  tags: string[];
}

interface ExamCreationFormProps {
  onSave: (examData: ExamFormData) => void;
  onCancel: () => void;
  currentEntity?: string;
}

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

export function ExamCreationForm({ onSave, onCancel, currentEntity }: ExamCreationFormProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    description: '',
    entityId: currentEntity || user?.entityId || '',
    duration: 60,
    startDate: undefined,
    endDate: undefined,
    instructions: '',
    passingMarks: 50,
    totalMarks: 100,
    allowRetake: false,
    randomizeQuestions: false,
    showResultsImmediately: true,
    proctoring: false,
    category: '',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreview, setIsPreview] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Exam title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Exam description is required';
    }
    if (!formData.entityId) {
      newErrors.entityId = 'Entity selection is required';
    }
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (formData.passingMarks < 0 || formData.passingMarks > formData.totalMarks) {
      newErrors.passingMarks = 'Passing marks must be between 0 and total marks';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification('Please fix the errors before saving', 'error');
      return;
    }

    onSave(formData);
    addNotification('Exam created successfully!', 'success');
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

  // Mock entities for dropdown
  const availableEntities = [
    { id: 'entity-1', name: 'Springfield High School' },
    { id: 'entity-2', name: 'Riverside College' },
    { id: 'entity-3', name: 'Tech University' }
  ];

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
              <Badge variant="outline">{formData.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.totalMarks} total marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.passingMarks} passing marks</span>
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Exam</CardTitle>
            <CardDescription>
              Set up a new exam with questions, timing, and assessment criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
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
              </div>
            </div>

            <Separator />

            {/* Description and Instructions */}
            <div className="space-y-4">
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

            <Separator />

            {/* Settings */}
            <div>
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </div>
      </form>
    </motion.div>
  );
}