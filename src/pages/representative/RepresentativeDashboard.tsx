/**
 * Representative Dashboard
 * Shows list of enrolled exams with ASSIGNED status
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Badge } from '../../shared/components/ui/badge';
import { examApi, RepresentativeEnrollment } from '../../services/api/exam';
import { useNotifications } from '../../shared/providers/NotificationProvider';
import { FileText, Calendar, Clock, Loader2 } from 'lucide-react';
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
  const { error } = useNotifications();
  const [enrollments, setEnrollments] = useState<RepresentativeEnrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
                  <Button
                    onClick={() => handleViewForm(enrollment.exam_id)}
                    className="w-full"
                    variant="default"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Admission Form
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
