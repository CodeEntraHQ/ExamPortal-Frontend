import React, { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { updateUserProfile, changePassword } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Bell, 
  Palette,
  Save,
  Upload,
  Activity,
  Award,
  Clock,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';

export function ProfileManagement() {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(user?.profile_picture_link || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    bio: user?.bio || '',
    address: user?.address || '',
    gender: user?.gender || '',
    roll_number: user?.roll_number || '',
    created_at: user?.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '2023-01-15',
    last_login_at: user?.last_login_at ? new Date(user.last_login_at).toISOString().split('T')[0] : '2023-01-15',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [initialProfileData, setInitialProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone_number || '',
    bio: user?.bio || '',
    address: user?.address || '',
    gender: user?.gender || '',
    roll_number: user?.roll_number || '',
  });

  useEffect(() => {
    setProfilePicturePreview(user?.profile_picture_link || null);
    if (user) {
      const initialData = {
        name: user.name || '',
        phone: user.phone_number || '',
        bio: user.bio || '',
        address: user.address || '',
        gender: user.gender || '',
        roll_number: user.roll_number || '',
      };
      setInitialProfileData(initialData);
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone_number || '',
        bio: user.bio || '',
        address: user.address || '',
        gender: user.gender || '',
        roll_number: user.roll_number || '',
        created_at: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '2023-01-15',
        last_login_at: user.last_login_at ? new Date(user.last_login_at).toISOString().split('T')[0] : '2023-01-15',
      }));
    }
  }, [user]);


  // const [notifications, setNotifications] = useState({
  //   emailNotifications: true,
  //   examReminders: true,
  //   resultNotifications: true,
  //   systemUpdates: false,
  // });

  const calculateProfileCompletion = () => {
    const fields = [profileData.name, profileData.phone, profileData.bio, profileData.address];
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    const totalFields = fields.length;
    if (totalFields === 0) return 100;
    return Math.round((filledFields / totalFields) * 100);
  };

  const handleSave = async () => {
    const formData = new FormData();

    if (profileData.name !== initialProfileData.name) {
      formData.append('name', profileData.name);
    }
    if (profileData.bio !== initialProfileData.bio) {
      formData.append('bio', profileData.bio);
    }
    if (profileData.phone !== initialProfileData.phone) {
      formData.append('phone_number', profileData.phone);
    }
    if (profileData.address !== initialProfileData.address) {
      formData.append('address', profileData.address);
    }
    if (profileData.gender !== initialProfileData.gender) {
      formData.append('gender', profileData.gender);
    }
    if (user?.role === 'STUDENT' && profileData.roll_number !== initialProfileData.roll_number) {
      formData.append('roll_number', profileData.roll_number);
    }
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }

    const hasChanges = formData.has('name') || formData.has('bio') || formData.has('phone_number') || formData.has('address') || formData.has('gender') || formData.has('roll_number') || formData.has('profile_picture');

    if (!hasChanges) {
      console.log('No changes to save.');
      setIsEditing(false);
      return;
    }

    try {
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser.payload);
      setProfilePicturePreview(updatedUser.payload.profile_picture_link || null);
      setInitialProfileData({
        name: updatedUser.payload.name || '',
        phone: updatedUser.payload.phone_number || '',
        bio: updatedUser.payload.bio || '',
        address: updatedUser.payload.address || '',
        gender: updatedUser.payload.gender || '',
        roll_number: updatedUser.payload.roll_number || '',
      });
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setProfileData(prev => ({
        ...prev,
        ...initialProfileData
      }));
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    setPasswordError(null);
    setPasswordSuccessMessage(null);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccessMessage('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'An unexpected error occurred.');
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const localUrl = URL.createObjectURL(file);
      setProfilePicturePreview(localUrl);
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'STUDENT':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatsData = () => {
    if (user?.role === 'STUDENT') {
      return [
        { label: 'Exams Taken', value: '24', icon: Activity, trend: '+3 this month' },
        { label: 'Average Score', value: '87%', icon: TrendingUp, trend: '+5% improvement' },
        { label: 'Certificates', value: '8', icon: Award, trend: '2 pending' },
        { label: 'Study Hours', value: '156h', icon: Clock, trend: 'This semester' },
      ];
    } else {
      return [
        { label: 'Exams Created', value: '45', icon: Activity, trend: '+8 this month' },
        { label: 'Students Managed', value: '340', icon: User, trend: 'Across 12 courses' },
        { label: 'Success Rate', value: '94%', icon: TrendingUp, trend: 'Above average' },
        { label: 'Active Hours', value: '89h', icon: Clock, trend: 'This month' },
      ];
    }
  };

  const statsData = getStatsData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="transition-all duration-200 hover:scale-105"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-primary mt-1">{stat.trend}</p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Profile Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {/* <TabsTrigger value="notifications">Notifications</TabsTrigger> */}
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {successMessage && (
                  <Alert variant="constructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                      className="transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(value: string) => setProfileData({ ...profileData, gender: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {user?.role === 'STUDENT' && (
                    <div className="space-y-2">
                      <Label htmlFor="roll_number">Roll Number</Label>
                      <Input
                        id="roll_number"
                        value={profileData.roll_number}
                        onChange={(e) => setProfileData({ ...profileData, roll_number: e.target.value })}
                        disabled={!isEditing}
                        className="transition-all duration-200"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    disabled={!isEditing}
                    rows={2}
                    className="transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={1}
                    className="transition-all duration-200"
                  />
                </div>
                {isEditing && (
                  <Button 
                    onClick={handleSave}
                    className="w-full transition-all duration-200 hover:scale-105"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Profile Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <ImageWithFallback
                      src={profilePicturePreview}
                      fallback={user?.name?.charAt(0) || 'E'}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      disabled={!isEditing}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{profileData.name}</h3>
                    <Badge className={getRoleBadgeColor()}>
                      {user?.role}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {profileData.email}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Quick Stats
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profile Completion</span>
                      <span className="font-medium">{calculateProfileCompletion()}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined on</span>
                      <span className="font-medium">{new Date(profileData.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login</span>
                      <span className="font-medium">{new Date(profileData.last_login_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Status</span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
                <CardDescription>
                  Manage your account security and authentication preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {passwordSuccessMessage && (
                  <Alert variant="constructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordSuccessMessage}</AlertDescription>
                  </Alert>
                )}
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
                  <Button className="w-full" onClick={handlePasswordChange}>
                    Update Password
                  </Button>
                </div>

                <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {key === 'emailNotifications' && 'Receive notifications via email'}
                      {key === 'examReminders' && 'Get reminders about upcoming exams'}
                      {key === 'resultNotifications' && 'Be notified when results are available'}
                      {key === 'systemUpdates' && 'Receive updates about system changes'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications({ ...notifications, [key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Display Preferences
              </CardTitle>
              <CardDescription>
                Customize your ExamEntra experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">
                      Currently using {theme} mode
                    </p>
                  </div>
                  <Badge variant="outline">{theme}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Language</p>
                    <p className="text-xs text-muted-foreground">English (US)</p>
                  </div>
                  <Badge variant="outline">EN</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Timezone</p>
                    <p className="text-xs text-muted-foreground">Eastern Standard Time</p>
                  </div>
                  <Badge variant="outline">EST</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
