import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Building,
  Users,
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Award,
  Target,
  BarChart3,
  PieChart,
  Download,
  Upload,
  RefreshCw,
  Archive,
  Shield,
  Key,
  Database,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';

interface Entity {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'suspended';
  studentsCount: number;
  adminsCount: number;
  examsCount: number;
  averageScore: number;
  createdAt: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  subscriptionPlan: string;
  lastActivity: string;
  performance: number;
  growth: number;
}

interface ModernEntityManagementProps {
  onBackToDashboard?: () => void;
  onViewEntity?: (entityId: string, entityName: string) => void;
  onEditEntity?: (entityId: string, entityName: string) => void;
}

export function ModernEntityManagement({ onBackToDashboard, onViewEntity, onEditEntity }: ModernEntityManagementProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Mock entities data
  const entities: Entity[] = [
    {
      id: '1',
      name: 'Harvard University',
      type: 'University',
      status: 'active',
      studentsCount: 23000,
      adminsCount: 12,
      examsCount: 450,
      averageScore: 87.5,
      createdAt: '2023-01-15',
      location: 'Cambridge, MA',
      email: 'admin@harvard.edu',
      phone: '+1-617-495-1000',
      website: 'harvard.edu',
      subscriptionPlan: 'Enterprise',
      lastActivity: '2 hours ago',
      performance: 95,
      growth: 12
    },
    {
      id: '2',
      name: 'MIT Technology Institute',
      type: 'Institute',
      status: 'active',
      studentsCount: 11500,
      adminsCount: 8,
      examsCount: 320,
      averageScore: 91.2,
      createdAt: '2023-02-20',
      location: 'Cambridge, MA',
      email: 'admin@mit.edu',
      phone: '+1-617-253-1000',
      website: 'mit.edu',
      subscriptionPlan: 'Enterprise',
      lastActivity: '1 hour ago',
      performance: 98,
      growth: 18
    },
    {
      id: '3',
      name: 'Stanford University',
      type: 'University',
      status: 'active',
      studentsCount: 17000,
      adminsCount: 10,
      examsCount: 380,
      averageScore: 89.8,
      createdAt: '2023-01-10',
      location: 'Stanford, CA',
      email: 'admin@stanford.edu',
      phone: '+1-650-723-2300',
      website: 'stanford.edu',
      subscriptionPlan: 'Enterprise',
      lastActivity: '30 minutes ago',
      performance: 96,
      growth: 15
    },
    {
      id: '4',
      name: 'Community College East',
      type: 'College',
      status: 'active',
      studentsCount: 5500,
      adminsCount: 5,
      examsCount: 150,
      averageScore: 78.4,
      createdAt: '2023-03-05',
      location: 'Austin, TX',
      email: 'admin@cce.edu',
      phone: '+1-512-223-4000',
      website: 'cce.edu',
      subscriptionPlan: 'Professional',
      lastActivity: '1 day ago',
      performance: 82,
      growth: 7
    },
    {
      id: '5',
      name: 'Tech Bootcamp Pro',
      type: 'Bootcamp',
      status: 'suspended',
      studentsCount: 1200,
      adminsCount: 3,
      examsCount: 45,
      averageScore: 72.1,
      createdAt: '2023-04-12',
      location: 'San Francisco, CA',
      email: 'admin@techbootcamp.com',
      phone: '+1-415-555-0123',
      website: 'techbootcamp.com',
      subscriptionPlan: 'Basic',
      lastActivity: '1 week ago',
      performance: 65,
      growth: -5
    }
  ];

  // Filter entities - ADMIN users should only see their own entity
  const filteredEntities = entities.filter(entity => {
    // For ADMIN role, show only their own entity
    if (user?.role === 'ADMIN') {
      // Assuming the admin's entity ID matches their entityId or entityName
      const isOwnEntity = entity.name === user?.entityName || 
                         entity.id === user?.entityId ||
                         entity.name.toLowerCase().includes(user?.entityName?.toLowerCase() || '');
      if (!isOwnEntity) return false;
    }

    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || entity.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || entity.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Professional': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Basic': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleCreateEntity = () => {
    setShowCreateDialog(false);
    // Handle entity creation logic here
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {user?.role === 'ADMIN' ? 'My Entity' : 'Entity Management'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'ADMIN' 
                ? `Manage your organization: ${user?.entityName || 'Your Entity'}` 
                : 'Manage and monitor all educational institutions'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBackToDashboard}>
              Back to Dashboard
            </Button>
            {user?.role === 'SUPERADMIN' && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entity
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Entity</DialogTitle>
                    <DialogDescription>
                      Add a new educational institution to the platform
                    </DialogDescription>
                  </DialogHeader>
                  <CreateEntityForm onSubmit={handleCreateEntity} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Entities</p>
                  <p className="text-3xl font-bold">{entities.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Students</p>
                  <p className="text-3xl font-bold">{entities.reduce((sum, e) => sum + e.studentsCount, 0).toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Exams</p>
                  <p className="text-3xl font-bold">{entities.reduce((sum, e) => sum + e.examsCount, 0).toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Performance</p>
                  <p className="text-3xl font-bold">{(entities.reduce((sum, e) => sum + e.averageScore, 0) / entities.length).toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entities by name, location, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="University">University</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Institute">Institute</SelectItem>
                  <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Entities Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEntities.map((entity, index) => (
              <motion.div
                key={entity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden group">
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {entity.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(entity.status)}>
                            {entity.status}
                          </Badge>
                          <Badge variant="outline">{entity.type}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{entity.studentsCount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{entity.examsCount}</div>
                        <div className="text-xs text-muted-foreground">Exams</div>
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Performance</span>
                        <span className="text-sm font-bold">{entity.performance}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${entity.performance}%` }}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{entity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span>Last active: {entity.lastActivity}</span>
                      </div>
                    </div>

                    {/* Subscription */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge className={getPlanColor(entity.subscriptionPlan)}>
                        {entity.subscriptionPlan}
                      </Badge>
                      <div className={`flex items-center gap-1 text-sm ${entity.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {entity.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span>{Math.abs(entity.growth)}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => onViewEntity?.(entity.id, entity.name)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => onEditEntity?.(entity.id, entity.name)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="space-y-0">
                  {filteredEntities.map((entity, index) => (
                    <motion.div
                      key={entity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-6 border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold">{entity.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{entity.type}</span>
                            <span>•</span>
                            <span>{entity.location}</span>
                            <span>•</span>
                            <span>{entity.studentsCount.toLocaleString()} students</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold">{entity.performance}%</div>
                          <div className="text-xs text-muted-foreground">Performance</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold">{entity.examsCount}</div>
                          <div className="text-xs text-muted-foreground">Exams</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(entity.status)}>
                            {entity.status}
                          </Badge>
                          <Badge className={getPlanColor(entity.subscriptionPlan)}>
                            {entity.subscriptionPlan}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onViewEntity?.(entity.id, entity.name)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEditEntity?.(entity.id, entity.name)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Create Entity Form Component
function CreateEntityForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    subscriptionPlan: '',
    adminEmail: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Institution Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter institution name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="University">University</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Institute">Institute</SelectItem>
                  <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
              placeholder="Brief description of the institution"
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@institution.edu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1-555-0123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="www.institution.edu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">Primary Admin Email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
              placeholder="admin@institution.edu"
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
            <Select value={formData.subscriptionPlan} onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionPlan: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              The primary admin will receive an email invitation to set up their account and access the platform.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          Create Entity
        </Button>
      </div>
    </form>
  );
}