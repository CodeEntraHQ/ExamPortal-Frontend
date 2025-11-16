/**
 * Admission Form Builder Page
 * Allows users to create and edit admission forms for exams
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/components/ui/select';
import { useNotifications } from '../../shared/providers/NotificationProvider';
import { useAuth } from '../../features/auth/providers/AuthProvider';
import { admissionFormApi, FormField, FieldType } from '../../services/api/admissionForm';
import { examApi } from '../../services/api/exam';
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AdmissionFormBuilderPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useNotifications();

  const [examTitle, setExamTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [hasExistingForm, setHasExistingForm] = useState<boolean>(false);

  // Default required fields based on user model
  const defaultFields: FormField[] = [
    {
      id: 'email',
      label: 'Email',
      type: 'EMAIL',
      required: true,
      placeholder: 'Enter your email address',
    },
    {
      id: 'name',
      label: 'Full Name',
      type: 'TEXT',
      required: true,
      placeholder: 'Enter your full name',
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      if (!examId) {
        error('Exam ID is required');
        navigate(-1);
        return;
      }

      try {
        setLoading(true);

        // Load exam details
        const examResponse = await examApi.getExamById(examId);
        setExamTitle(examResponse.payload.title || 'Exam');

        // Try to load existing admission form
        // If form doesn't exist (404), that's expected and we'll create a new one
        try {
          const formResponse = await admissionFormApi.getAdmissionForm(examId);
          if (formResponse?.payload?.form_structure) {
            // Ensure all fields have unique IDs for React keys and deletion
            const fieldsWithIds = formResponse.payload.form_structure.map((field, index) => ({
              ...field,
              id: field.id || `field-${Date.now()}-${index}`,
            }));
            setFormFields(fieldsWithIds);
            setHasExistingForm(true);
          } else {
            // No form structure found, use defaults
            setFormFields([...defaultFields]);
            setHasExistingForm(false);
          }
        } catch (err: any) {
          // Any error loading the form means it doesn't exist yet
          // This is expected when creating a new form, so we silently handle it
          const errorMessage = String(err?.message || '').toLowerCase();
          const errorString = String(err || '').toLowerCase();
          
          // Only log if it's not a 404/not found error
          const isNotFoundError = 
            errorMessage.includes('404') ||
            errorMessage.includes('not_found') ||
            errorMessage.includes('not found') ||
            errorMessage.includes('admission form not found') ||
            errorString.includes('not_found') ||
            errorString.includes('404');
          
          if (!isNotFoundError) {
            // Log unexpected errors but don't block the user
            console.warn('Error loading admission form (proceeding with defaults):', err);
          }
          
          // Always use default fields when form doesn't exist or can't be loaded
          setFormFields([...defaultFields]);
          setHasExistingForm(false);
        }
      } catch (err: any) {
        console.error('Error loading exam data:', err);
        error(err?.message || 'Failed to load exam data');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId, navigate, error]);

  const handleAddField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      type: 'TEXT',
      required: false,
      placeholder: 'Enter value',
    };
    setFormFields([...formFields, newField]);
  };

  const handleRemoveField = (fieldId: string | undefined) => {
    if (!fieldId) {
      console.error('Cannot remove field: field ID is undefined');
      return;
    }
    
    // Don't allow removing default required fields
    if (fieldId === 'email' || fieldId === 'name') {
      error('Cannot remove required default fields');
      return;
    }
    
    // Filter out the field with the matching ID
    const updatedFields = formFields.filter((f) => f.id !== fieldId);
    setFormFields(updatedFields);
  };

  const handleFieldChange = (fieldId: string, updates: Partial<FormField>) => {
    setFormFields(
      formFields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field))
    );
  };

  const handleSave = async () => {
    if (!examId) return;

    // Validate fields
    if (formFields.length === 0) {
      error('At least one field is required');
      return;
    }

    for (const field of formFields) {
      if (!field.label || field.label.trim() === '') {
        error(`Field label is required for all fields`);
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        exam_id: examId,
        form_structure: formFields.map(({ id, ...field }) => field), // Remove id before sending
      };

      if (hasExistingForm) {
        await admissionFormApi.updateAdmissionForm(examId, {
          form_structure: payload.form_structure,
        });
        success('Admission form updated successfully');
      } else {
        await admissionFormApi.createAdmissionForm(payload);
        success('Admission form created successfully');
        setHasExistingForm(true);
      }
    } catch (err: any) {
      console.error('Error saving admission form:', err);
      error(err?.message || 'Failed to save admission form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admission Form Builder</h1>
              <p className="text-muted-foreground mt-1">Exam: {examTitle}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : hasExistingForm ? 'Update Form' : 'Create Form'}
          </Button>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
            <CardDescription>
              Configure the fields for the admission form. Default fields (Email and Name) are required and cannot be removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              {formFields.map((field, index) => {
                const fieldKey = field.id || `field-${index}`;
                return (
                <motion.div
                  key={fieldKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="pt-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`label-${field.id}`}>Field Label</Label>
                          <Input
                            id={`label-${field.id}`}
                            value={field.label}
                            onChange={(e) =>
                              handleFieldChange(field.id!, { label: e.target.value })
                            }
                            placeholder="Field label"
                            disabled={field.id === 'email' || field.id === 'name'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`type-${field.id}`}>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value: FieldType) =>
                              handleFieldChange(field.id!, { type: value })
                            }
                            disabled={field.id === 'email' || field.id === 'name'}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TEXT">Text</SelectItem>
                              <SelectItem value="NUMBER">Number</SelectItem>
                              <SelectItem value="EMAIL">Email</SelectItem>
                              <SelectItem value="PHONE">Phone</SelectItem>
                              <SelectItem value="GENDER">Gender</SelectItem>
                              <SelectItem value="DATE">Date</SelectItem>
                              <SelectItem value="TEXTAREA">Textarea</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                          <Input
                            id={`placeholder-${field.id}`}
                            value={field.placeholder || ''}
                            onChange={(e) =>
                              handleFieldChange(field.id!, { placeholder: e.target.value })
                            }
                            placeholder="Placeholder text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`required-${field.id}`} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`required-${field.id}`}
                              checked={field.required || false}
                              onChange={(e) =>
                                handleFieldChange(field.id!, { required: e.target.checked })
                              }
                              disabled={field.id === 'email' || field.id === 'name'}
                              className="h-4 w-4"
                            />
                            Required
                          </Label>
                        </div>
                      </div>
                      {(field.id !== 'email' && field.id !== 'name') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveField(field.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
                );
              })}
            </AnimatePresence>

            <Button
              onClick={handleAddField}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Field
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

