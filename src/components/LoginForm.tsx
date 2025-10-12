import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, ArrowLeft, GraduationCap, AlertCircle, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { CaptchaComponent } from './CaptchaComponent';
import { motion } from 'motion/react';

interface LoginFormProps {
  onBackToHome?: () => void;
}

export function LoginForm({ onBackToHome }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // 2FA states
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [tempLoginData, setTempLoginData] = useState<{email: string, password: string} | null>(null);
  
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Handle remember me on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaVerified) {
      setError('Please complete the captcha verification');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate random server errors for demo
      if (Math.random() < 0.1) {
        throw new Error('Server temporarily unavailable. Please try again later.');
      }
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Store temp login data and show 2FA
      setTempLoginData({ email, password });
      setShow2FA(true);
      setResendCountdown(30); // 30 second countdown for resend
      
    } catch (err: any) {
      if (err.message.includes('Server')) {
        setError(err.message);
      } else {
        setError('Invalid credentials. Try: superadmin@example.com, admin@school.com, or student@example.com');
      }
      setCaptchaVerified(false); // Reset captcha on error
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate OTP verification (in real app, this would be an API call)
      if (otpCode !== '123456') {
        throw new Error('Invalid OTP code. Use 123456 for demo.');
      }

      // Complete login with stored credentials
      if (tempLoginData) {
        await login(tempLoginData.email, tempLoginData.password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendCountdown(30);
    // Simulate API call to resend OTP
    // In real app, this would trigger backend to send new OTP
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetEmailSent(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2FA Screen
  if (show2FA) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setShow2FA(false);
              setOtpCode('');
              setTempLoginData(null);
            }}
            className="border-border hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="border-border hover:bg-accent"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to your email or authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handle2FASubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="otp">Authentication Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading || otpCode.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={resendCountdown > 0}
                    className="text-primary hover:text-primary/80"
                  >
                    {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend Code'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowForgotPassword(false)}
            className="border-border hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="border-border hover:bg-accent"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-xl font-semibold">ExamEntra</span>
              </div>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                {resetEmailSent 
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive reset instructions"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetEmailSent ? (
                <div className="space-y-4 text-center">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      We've sent password reset instructions to <strong>{forgotEmail}</strong>
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                      setForgotEmail('');
                    }} 
                    className="w-full"
                  >
                    Return to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4"> 
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        {onBackToHome && (
          <Button
            variant="outline"
            onClick={onBackToHome}
            className="border-border hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        )}
        <div className={onBackToHome ? '' : 'ml-auto'}>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="border-border hover:bg-accent"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">ExamEntra</span>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-me" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember-me" className="text-sm">
                Remember me
              </Label>
            </div>

            {/* Captcha Component */}
            <CaptchaComponent onVerify={setCaptchaVerified} />

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
              disabled={isLoading || !captchaVerified}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setShowForgotPassword(true)}
                className="text-primary hover:text-primary/80"
              >
                Forgot your password?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}