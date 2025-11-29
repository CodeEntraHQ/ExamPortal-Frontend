import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { AlertCircle, Loader2, GraduationCap, ArrowLeft, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../../shared/providers/ThemeProvider';
import { envConfig } from '@/config/env';
import { registerUser } from '../../../services/api/user';

interface UserRegistrationProps {
  onRegistrationSuccess?: () => void;
}

export function UserRegistration({ onRegistrationSuccess }: UserRegistrationProps) {
  const navigate = useNavigate();
  const { token: tokenFromParams } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  
  const handleRegistrationSuccess = () => {
    if (onRegistrationSuccess) {
      onRegistrationSuccess();
    } else {
      navigate('/login');
    }
  };
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const { theme, toggleTheme } = useTheme();
  const appName = envConfig.appName;

  useEffect(() => {
    // Try to get token from URL params, search params, or route params
    const tokenFromUrl = searchParams.get('token') || tokenFromParams;
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid or missing invitation token');
    }
  }, [searchParams, tokenFromParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!token) {
      setError('Invalid or missing invitation token.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser(token, password);
      if (response.responseCode === 'USER_REGISTERED') {
        setSuccess(true);
        setTimeout(() => {
          handleRegistrationSuccess();
        }, 2000);
      } else {
        setError(response.responseMessage || 'Failed to set password. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <Button
          variant="outline"
          onClick={handleRegistrationSuccess}
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
        <Card className="w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold">{appName}</span>
            </div>
            <CardTitle>Set Your Password</CardTitle>
            <CardDescription>
              {success ? "Your password has been set successfully." : "Create a password for your account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4 text-center">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your password has been set successfully. You can now log in with your email and password.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleRegistrationSuccess} className="w-full">
                  Go to Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={isLoading || !token}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    'Set Password'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

