import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../shared/components/ui/dialog';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { AlertCircle, Loader2, Mail, Building2, MapPin, Phone, FileText, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createTrialEntity } from '../../../services/api/entity';
import { toast } from 'sonner';

interface TrialEntityFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrialEntityForm({ isOpen, onClose }: TrialEntityFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Entity details, Step 2: Admin email
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'COLLEGE' as 'COLLEGE' | 'SCHOOL',
    address: '',
    description: '',
    email: '',
    phone: '',
    logo: null as File | null,
    admin_email: '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData({
        name: '',
        type: 'COLLEGE',
        address: '',
        description: '',
        email: '',
        phone: '',
        logo: null,
        admin_email: '',
      });
      setLogoPreview(null);
      setError('');
    }
  }, [isOpen]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.address) {
      setError('Please fill in all required fields (Name and Address).');
      return;
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.admin_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
      setError('Please enter a valid admin email address.');
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('type', formData.type);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.phone) {
        const phoneStr = formData.phone.replace(/\D/g, '');
        if (phoneStr.length > 0) {
          formDataToSend.append('phone_number', phoneStr);
        }
      }
      if (formData.logo) formDataToSend.append('logo', formData.logo);
      formDataToSend.append('admin_email', formData.admin_email);

      const response = await createTrialEntity(formDataToSend);
      
      if (response.payload) {
        toast.success('Trial entity created successfully! Please check your email and click the link to set your password.');
        onClose();
        // Redirect to login page - user should check email and click link
        navigate('/login');
      } else {
        setError('Failed to create trial entity. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create trial entity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Start Your 14-Day Free Trial</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Get full access to all features for 14 days. No credit card required.
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <span>Trial Period: 14 days</span>
            <span>•</span>
            <span>Monitoring: Disabled for trial</span>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStep1Submit}
              className="space-y-6"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter institution name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type <span className="text-destructive">*</span></Label>
                  <Select value={formData.type} onValueChange={(value: 'COLLEGE' | 'SCHOOL') => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COLLEGE">College</SelectItem>
                      <SelectItem value="SCHOOL">School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="City, State/Country"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your institution"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Institution Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="institution@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Label htmlFor="logo" className="cursor-pointer flex-1">
                    <Button type="button" variant="outline" size="sm" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </Label>
                </div>
                {logoPreview && (
                  <div className="relative mt-2 inline-block">
                    <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-contain border rounded" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, logo: null }));
                        setLogoPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Continue to Admin Setup
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStep2Submit}
              className="space-y-6"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Institution Details</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{formData.type}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">{formData.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email">Admin Email Address <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
                    placeholder="admin@example.com"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send a password setup link to this email address. This email will be used as your admin account.
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  After submitting, you'll receive an email with a link to set your password. Once you set your password, you can log in and start using the platform.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Trial...
                    </>
                  ) : (
                    'Create Trial Account'
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
