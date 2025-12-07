/**
 * Representative Dashboard
 * Shows list of enrolled exams with ASSIGNED status
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Badge } from '../../shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../shared/components/ui/dialog';
import { Input } from '../../shared/components/ui/input';
import { Label } from '../../shared/components/ui/label';
import { examApi, RepresentativeEnrollment } from '../../services/api/exam';
import { admissionFormApi } from '../../services/api/admissionForm';
import { useNotifications } from '../../shared/providers/NotificationProvider';
import { FileText, Calendar, Clock, Loader2, Share2, Copy, Check, MessageSquare, Mail } from 'lucide-react';
// Helper function to format date
const formatDateAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

export function RepresentativeDashboard() {
  const navigate = useNavigate();
  const { error, success } = useNotifications();
  const [enrollments, setEnrollments] = useState<RepresentativeEnrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<{ examId: string; examTitle: string } | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await examApi.getRepresentativeEnrollments();
        setEnrollments(response.payload.enrollments || []);
      } catch (err: any) {
        console.error('Failed to fetch enrollments:', err);
        error('Failed to load enrolled exams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [error]);

  const handleViewForm = (examId: string) => {
    navigate(`/representative/exam/${examId}/form`);
  };

  const handleShareClick = async (examId: string, examTitle: string) => {
    try {
      // Get admission form to retrieve public token
      const formResponse = await admissionFormApi.getAdmissionForm(examId);
      const publicToken = formResponse?.payload?.public_token;
      
      if (publicToken) {
        const baseUrl = window.location.origin;
        const shareUrlPath = `/public/admission-form/${publicToken}`;
        setShareUrl(`${baseUrl}${shareUrlPath}`);
        setSelectedExam({ examId, examTitle });
        setShowShareDialog(true);
      } else {
        error('Public link not available for this exam');
      }
    } catch (err: any) {
      console.error('Failed to get share link:', err);
      error('Failed to generate share link. Please try again.');
    }
  };

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
    const examTitle = selectedExam?.examTitle || 'the exam';
    const message = encodeURIComponent(`Fill out the admission form for ${examTitle}: ${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareEmail = () => {
    const examTitle = selectedExam?.examTitle || 'the exam';
    const subject = encodeURIComponent(`Admission Form for ${examTitle}`);
    const body = encodeURIComponent(`Please fill out the admission form for ${examTitle}:\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Representative Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage your assigned exam admission forms
          </p>
        </div>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No exams assigned yet. You will see enrolled exams here once they are assigned to you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-2">{enrollment.exam.title}</CardTitle>
                    <Badge variant="secondary">{enrollment.exam.type}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(enrollment.exam.duration_seconds)}
                    </span>
                    {enrollment.exam.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateAgo(enrollment.exam.created_at)}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enrollment.exam.metadata?.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {enrollment.exam.metadata.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewForm(enrollment.exam_id)}
                      className="flex-1"
                      variant="default"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Form
                    </Button>
                    <Button
                      onClick={() => handleShareClick(enrollment.exam_id, enrollment.exam.title)}
                      variant="outline"
                      className="flex-shrink-0"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Share Public Link</DialogTitle>
              <DialogDescription>
                Share the admission form link for "{selectedExam?.examTitle}"
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
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Share on WhatsApp
                </Button>
                <Button onClick={handleShareEmail} variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
