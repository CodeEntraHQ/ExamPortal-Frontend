import React, { useState, useEffect } from 'react';
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
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  title?: string;
  description?: string;
  showResend?: boolean;
}

export function TwoFactorModal({
  isOpen,
  onClose,
  onVerify,
  onResend,
  title = 'Two-Factor Authentication',
  description = 'Enter the 6-digit code from your authenticator app or email',
  showResend = true,
}: TwoFactorModalProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOtp('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onVerify(otp);
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!onResend || resendCountdown > 0) return;

    setError('');
    setIsLoading(true);
    
    try {
      await onResend();
      setResendCountdown(30);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-center block">
              Authentication Code
            </Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="Enter your 6-digit authentication code"
              value={otp}
              onChange={handleOtpChange}
              className="text-center text-2xl tracking-widest font-mono"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            {showResend && onResend && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={resendCountdown > 0 || isLoading}
                className="w-full"
              >
                {resendCountdown > 0
                  ? `Resend code in ${resendCountdown}s`
                  : 'Resend Code'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}