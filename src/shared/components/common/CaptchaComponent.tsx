import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  RefreshCw, 
  Shield, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface CaptchaComponentProps {
  onVerify: (verified: boolean) => void;
  variant?: 'checkbox' | 'invisible' | 'puzzle' | 'otp';
  className?: string;
}

export function CaptchaComponent({ onVerify, variant = 'checkbox', className }: CaptchaComponentProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckboxVerify = async () => {
    setIsLoading(true);
    setError('');
    
    // Simulate captcha verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsVerified(true);
    setIsLoading(false);
    onVerify(true);
  };

  if (variant === 'checkbox') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`space-y-2 ${className}`}
      >
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center space-x-2 p-4 border border-border rounded-lg bg-card">
          <Checkbox
            id="captcha"
            checked={isVerified}
            disabled={isLoading || isVerified}
            onCheckedChange={handleCheckboxVerify}
          />
          <div className="flex-1">
            <Label htmlFor="captcha" className="flex items-center gap-2 cursor-pointer">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isVerified ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {isLoading ? 'Verifying...' : isVerified ? 'Verified' : "I'm not a robot"}
            </Label>
          </div>
          <div className="text-xs text-muted-foreground">reCAPTCHA</div>
        </div>
      </motion.div>
    );
  }

  return null;
}
