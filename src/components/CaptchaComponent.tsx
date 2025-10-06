import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  RefreshCw, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  Smartphone,
  Mail
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
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Mock puzzle data
  const puzzleImages = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    isCorrect: [1, 3, 7].includes(i), // Mock correct images
    src: `https://picsum.photos/100/100?random=${i}`
  }));

  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  const handleCheckboxVerify = async () => {
    setIsLoading(true);
    setError('');
    
    // Simulate captcha verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock random failure (20% chance)
    if (Math.random() < 0.2) {
      setError('Verification failed. Please try again.');
      setIsLoading(false);
      return;
    }
    
    setIsVerified(true);
    setIsLoading(false);
    onVerify(true);
  };

  const handlePuzzleVerify = () => {
    const correctImages = puzzleImages.filter(img => img.isCorrect).map(img => img.id);
    const isCorrect = correctImages.length === selectedImages.length && 
                     correctImages.every(id => selectedImages.includes(id));
    
    if (isCorrect) {
      setIsVerified(true);
      setShowPuzzle(false);
      onVerify(true);
    } else {
      setError('Incorrect selection. Please try again.');
      setSelectedImages([]);
    }
  };

  const handleOTPVerify = () => {
    if (otpCode === '123456') { // Mock OTP
      setIsVerified(true);
      setShowOTPModal(false);
      onVerify(true);
    } else {
      setError('Invalid OTP code. Please try again.');
    }
  };

  const sendOTP = async (method: 'sms' | 'email') => {
    setIsLoading(true);
    // Mock OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtpSent(true);
    setIsLoading(false);
  };

  const toggleImageSelection = (imageId: number) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  if (variant === 'checkbox') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`space-y-2 ${className}`}
      >
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
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!isVerified && (
          <div className="flex gap-2 text-xs">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => setShowPuzzle(true)}
            >
              Try image verification
            </Button>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => setShowOTPModal(true)}
            >
              Use OTP fallback
            </Button>
          </div>
        )}

        {/* Puzzle Modal */}
        <Dialog open={showPuzzle} onOpenChange={setShowPuzzle}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select all images with traffic lights</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {puzzleImages.map((image) => (
                  <motion.div
                    key={image.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative cursor-pointer rounded border-2 transition-colors ${
                      selectedImages.includes(image.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                    onClick={() => toggleImageSelection(image.id)}
                  >
                    <img
                      src={image.src}
                      alt={`Captcha image ${image.id}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    {selectedImages.includes(image.id) && (
                      <div className="absolute inset-0 bg-primary/20 rounded flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handlePuzzleVerify} className="flex-1">
                  Verify
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedImages([]);
                  setError('');
                }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* OTP Modal */}
        <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Verify with OTP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Choose how you'd like to receive your verification code:
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => sendOTP('sms')} 
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      {isLoading ? 'Sending...' : 'Send SMS'}
                    </Button>
                    <Button 
                      onClick={() => sendOTP('email')} 
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {isLoading ? 'Sending...' : 'Send Email'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to your device:
                  </p>
                  <Input
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button onClick={handleOTPVerify} className="w-full">
                    Verify OTP
                  </Button>
                  
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setOtpSent(false)}
                    className="w-full"
                  >
                    Resend code
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return null;
}