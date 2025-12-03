import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/components/ui/button';
import { Home, FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 max-w-3xl mx-auto">
        {/* Icon */}
        <div className="mb-16 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
              <FileQuestion className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-9xl font-bold text-foreground mb-8 tracking-tight">
          404
        </h1>

        {/* Title */}
        <h2 className="text-4xl font-semibold text-foreground mb-6">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-16 max-w-lg leading-relaxed">
          The page you're looking for doesn't exist or has been moved to a different location.
        </p>

        {/* Home Button */}
        <Button
          onClick={() => navigate('/')}
          size="lg"
          className="px-8 py-6 text-lg"
        >
          <Home className="mr-2 h-5 w-5" />
          Go Home
        </Button>
      </div>
    </div>
  );
}

