/**
 * Public Admission Form Page
 * Displays the admission form for public access (no authentication required)
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/components/ui/select';
import { Textarea } from '../../shared/components/ui/textarea';
import { useNotifications } from '../../shared/providers/NotificationProvider';
import { admissionFormApi, FormField } from '../../services/api/admissionForm';
import { Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../shared/components/ui/alert';

export function PublicAdmissionFormPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const [examTitle, setExamTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        error('Invalid link');
        return;
      }

      try {
        setLoading(true);

        // Load admission form by public token
        const formResponse = await admissionFormApi.getPublicAdmissionForm(token);
        if (formResponse?.payload?.form_structure) {
          setFormFields(formResponse.payload.form_structure);
          setExamTitle(formResponse.payload.exam_title || 'Exam');
          // Initialize form data
          const initialData: Record<string, any> = {};
          formResponse.payload.form_structure.forEach((field) => {
            initialData[field.id || field.label] = '';
          });
          setFormData(initialData);
        } else {
          error('Admission form not found');
        }
      } catch (err: any) {
        console.error('Error loading admission form:', err);
        error(err?.message || 'Failed to load admission form. Please check the link and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, error]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      error('Invalid link');
      return;
    }

    // Validate required fields
    const missingFields: string[] = [];
    formFields.forEach((field) => {
      const fieldId = field.id || field.label;
      if (field.required && (!formData[fieldId] || formData[fieldId] === '')) {
        missingFields.push(field.label);
      }
    });

    if (missingFields.length > 0) {
      error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      await admissionFormApi.submitPublicAdmissionForm(token, {
        form_responses: formData,
      });
      success('Admission form submitted successfully!');
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting admission form:', err);
      const errorMessage = err?.message || 'Failed to submit admission form. Please try again.';
      error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldId = field.id || field.label;
    const value = formData[fieldId] || '';

    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'NUMBER':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={field.required}
              min={field.validation?.min}
              max={field.validation?.max}
            />
          </div>
        );

      case 'TEXTAREA':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldId}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'GENDER':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleFieldChange(fieldId, val)} required={field.required}>
              <SelectTrigger id={fieldId}>
                <SelectValue placeholder={field.placeholder || 'Select gender'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'DATE':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              required={field.required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-3xl w-full">
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
                <h2 className="text-2xl font-bold">Form Submitted Successfully!</h2>
                <p className="text-muted-foreground">
                  Thank you for submitting the admission form. Your submission has been received and will be reviewed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{examTitle}</h1>
          <p className="text-muted-foreground">Admission Form</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admission Form</CardTitle>
            <CardDescription>
              Fill out the form below. All required fields are marked with an asterisk (*).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {formFields.map((field) => renderField(field))}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Reset form
                    const initialData: Record<string, any> = {};
                    formFields.forEach((field) => {
                      initialData[field.id || field.label] = '';
                    });
                    setFormData(initialData);
                  }}
                  disabled={submitting}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Form'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

