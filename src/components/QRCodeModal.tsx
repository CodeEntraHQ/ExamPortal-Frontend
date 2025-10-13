import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { QrCode, Copy, CheckCircle2, Smartphone, Info, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { motion, AnimatePresence } from 'motion/react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  qrCode: string;
  manualCode: string;
  appName?: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  onVerify,
  qrCode,
  manualCode,
  appName = 'ExamEntra',
}: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(manualCode.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await onVerify(otp);
      // Success - modal will be closed by parent component
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6 && !isVerifying) {
      handleVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <motion.div 
            className="flex items-center justify-center mb-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
          </motion.div>
          <DialogTitle className="text-center">
            Set Up Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* QR Code Section */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                1
              </div>
              <span className="font-semibold">Scan with your authenticator app</span>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg border border-border/50">
              {/* QR Code */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="shrink-0"
              >
                {qrCode ? (
                  <div className="relative p-3 bg-white rounded-lg shadow-md border-2 border-primary/10">
                    <img 
                      src={qrCode} 
                      alt="2FA QR Code" 
                      className="w-32 h-32 rounded"
                    />
                  </div>
                ) : (
                  <div className="w-38 h-38 bg-muted/30 rounded-lg flex items-center justify-center border border-dashed border-border">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </motion.div>

              {/* Manual Code */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Use Google Authenticator, Microsoft Authenticator, or Authy</span>
                </div>
                
                <Separator className="bg-border/50" />
                
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Can't scan? Enter manually:</p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 p-2 bg-background rounded border border-border/50 min-w-0">
                      <code className="text-xs font-mono break-all">
                        {manualCode || 'XXXX XXXX XXXX XXXX'}
                      </code>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={handleCopy}
                      className="shrink-0 h-8 w-8"
                      disabled={!manualCode}
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <Separator className="bg-border/50" />

          {/* OTP Verification Section */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                2
              </div>
              <span className="font-semibold">Enter the 6-digit code</span>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/20">
              <div className="space-y-3">
                <div className="flex justify-center" onKeyDown={handleKeyDown}>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isVerifying}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-xs text-center text-muted-foreground">
                  Enter the code shown in your authenticator app
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            onClick={handleVerify} 
            className="w-full font-semibold"
            disabled={otp.length !== 6 || isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Enable 2FA
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full"
            disabled={isVerifying}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}