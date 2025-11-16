/**
 * Admission Form View Page
 * Displays the admission form for representatives to view and share
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
import { examApi } from '../../services/api/exam';
import { ArrowLeft, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../shared/components/ui/dialog';

export function AdmissionFormViewPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const [examTitle, setExamTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      if (!examId) {
        error('Exam ID is required');
        navigate('/representative/dashboard');
        return;
      }

      try {
        setLoading(true);

        // Load exam details
        const examResponse = await examApi.getExamById(examId);
        setExamTitle(examResponse.payload.title || 'Exam');

        // Load admission form
        const formResponse = await admissionFormApi.getAdmissionForm(examId);
        if (formResponse?.payload?.form_structure) {
          setFormFields(formResponse.payload.form_structure);
          // Initialize form data
          const initialData: Record<string, any> = {};
          formResponse.payload.form_structure.forEach((field) => {
            initialData[field.id || field.label] = '';
          });
          setFormData(initialData);
        } else {
          error('Admission form not found for this exam');
          navigate('/representative/dashboard');
        }

        // Generate share URL
        const baseUrl = window.location.origin;
        const shareUrlPath = `/public/exam/${examId}/admission-form`;
        setShareUrl(`${baseUrl}${shareUrlPath}`);
      } catch (err: any) {
        console.error('Error loading admission form:', err);
        error('Failed to load admission form. Please try again.');
        navigate('/representative/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId, navigate, error]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      error('Failed to copy URL. Please try again.');
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(`Fill out the admission form for ${examTitle}: ${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/representative/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{examTitle}</h1>
              <p className="text-muted-foreground">Admission Form</p>
            </div>
          </div>
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Form
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Admission Form</DialogTitle>
                <DialogDescription>
                  Share this form URL with students via WhatsApp or copy the link
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Form URL</Label>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyUrl}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleShareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share on WhatsApp
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admission Form</CardTitle>
            <CardDescription>
              Fill out the form below. All required fields are marked with an asterisk (*).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              {formFields.map((field) => renderField(field))}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

