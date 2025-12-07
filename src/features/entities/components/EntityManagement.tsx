import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/components/ui/dialog';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { ImageWithFallback } from '../../../shared/components/common/ImageWithFallback';
import { 
  Building,
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Eye,
  MapPin,
  Activity,
  Target,
  BarChart3,
  Shield,
  Settings,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { getEntities, createEntity, updateEntity, Entity as ApiEntity, CreateEntityPayload, UpdateEntityPayload, GetEntitiesResponse } from '../../../services/api';
import { toast } from 'sonner';
import { Separator } from '../../../shared/components/ui/separator';
import { Switch } from '../../../shared/components/ui/switch';

export interface Entity {
  id: string;
  name: string;
  type: string;
  studentsCount: number;
  examsCount: number;
  status: string;
  createdAt: string;
  location: string;
  email: string;
  phone: string;
  lastActivity: string;
  description?: string;
  logo_link?: string;
  monitoring_enabled?: boolean;
}

const mapApiEntityToUiEntity = (apiEntity: ApiEntity): Entity => ({
  id: apiEntity.id,
  name: apiEntity.name,
  type: apiEntity.type || '',
  studentsCount: apiEntity.total_students || 0,
  examsCount: apiEntity.total_exams || 0,
  status: 'active',
  createdAt: apiEntity.created_at ? new Date(apiEntity.created_at).toLocaleDateString() : '',
  location: apiEntity.address || '',
  email: apiEntity.email || '',
  phone: apiEntity.phone_number || '',
  lastActivity: apiEntity.created_at ? new Date(apiEntity.created_at).toLocaleDateString() : '',
  description: apiEntity.description || '',
  logo_link: apiEntity.logo_link || '',
  monitoring_enabled: apiEntity.monitoring_enabled !== undefined ? apiEntity.monitoring_enabled : true,
});

interface EntityManagementProps {
  onBackToDashboard?: () => void;
  onViewEntity?: (entity: Entity) => void;
  onEditEntity?: (entity: Entity) => void;
}

export function EntityManagement({ onBackToDashboard, onViewEntity, onEditEntity }: EntityManagementProps) {
  const { user } = useAuth();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [totalEntities, setTotalEntities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: GetEntitiesResponse = await getEntities();
      setEntities(response.payload.entities.map(mapApiEntityToUiEntity));
      setTotalEntities(response.payload.total);
    } catch (err) {
      setError('Failed to fetch entities.');
      toast.error('Failed to fetch entities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const filteredEntities = entities.filter(entity => {
    if (user?.role === 'ADMIN') {
      const isOwnEntity = entity.name === user?.entityName || 
                         entity.id === user?.entityId ||
                         entity.name.toLowerCase().includes(user?.entityName?.toLowerCase() || '');
      if (!isOwnEntity) return false;
    }

    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || entity.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleCreateOrUpdate = async (formData: CreateEntityPayload | UpdateEntityPayload) => {
    try {
      if ('entity_id' in formData) {
        await updateEntity(formData);
        toast.success('Entity updated successfully!');
      } else {
        await createEntity(formData);
        toast.success('Entity created successfully!');
      }
      setIsModalOpen(false);
      setEditingEntity(null);
      fetchEntities();
    } catch (err: any) {
      console.error('❌ handleCreateOrUpdate - Error:', err);
      console.error('❌ handleCreateOrUpdate - Error message:', err.message);
      console.error('❌ handleCreateOrUpdate - Error stack:', err.stack);
      toast.error(`Failed to ${'entity_id' in formData ? 'update' : 'create'} entity: ${err.message || 'Unknown error'}`);
    }
  };

  const handleAddClick = () => {
    setEditingEntity(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (entity: Entity) => {
    setEditingEntity(entity);
    setIsModalOpen(true);
  };

  const handleToggleMonitoring = async (entity: Entity) => {
    try {
      const newMonitoringEnabled = !entity.monitoring_enabled;
      await updateEntity({
        entity_id: entity.id,
        name: entity.name,
        address: entity.location,
        type: entity.type as 'COLLEGE' | 'SCHOOL',
        description: entity.description,
        email: entity.email,
        phone_number: entity.phone,
        monitoring_enabled: newMonitoringEnabled,
      });
      
      // Update local state
      setEntities(prevEntities =>
        prevEntities.map(e =>
          e.id === entity.id
            ? { ...e, monitoring_enabled: newMonitoringEnabled }
            : e
        )
      );
      
      toast.success(
        `Monitoring ${newMonitoringEnabled ? 'enabled' : 'disabled'} for ${entity.name}`
      );
    } catch (err: any) {
      console.error('Failed to toggle monitoring:', err);
      toast.error(`Failed to toggle monitoring: ${err.message || 'Unknown error'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'INACTIVE':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
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
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entity
              </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Entities</p>
                  <p className="text-3xl font-bold">{totalEntities}</p>
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
                  <SelectItem value="COLLEGE">College</SelectItem>
                  <SelectItem value="SCHOOL">School</SelectItem>
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
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
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
                        <div className="flex items-center gap-4">
                          <ImageWithFallback
                            src={entity.logo_link ?? null}
                            fallback={<Building className="h-8 w-8 text-primary" />}
                            alt={entity.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {entity.name}
                            </h3>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(entity.status)}>{entity.status}</Badge>
                            <Badge variant="outline">{entity.type}</Badge>
                          </div>
                          </div>
                        </div>
                        {/* <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button> */}
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{entity.studentsCount}</div>
                          <div className="text-xs text-muted-foreground">Students</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{entity.examsCount}</div>
                          <div className="text-xs text-muted-foreground">Exams</div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-muted-foreground pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{entity.location}</span>
                        </div>
                        {/* <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span>Last active: {entity.lastActivity}</span>
                        </div> */}
                      </div>

                      {/* Monitoring Toggle - Only for SUPERADMIN */}
                      {user?.role === 'SUPERADMIN' && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Label htmlFor={`monitoring-${entity.id}`} className="text-sm font-medium">
                            Monitoring Enabled
                          </Label>
                          <Switch
                            id={`monitoring-${entity.id}`}
                            checked={entity.monitoring_enabled !== false}
                            onCheckedChange={() => handleToggleMonitoring(entity)}
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditClick(entity)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => onViewEntity?.(entity)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
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
                          <ImageWithFallback
                            src={entity.logo_link ?? null}
                            fallback={<Building className="h-6 w-6 text-primary" />}
                            alt={entity.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="space-y-1">
                            <h3 className="font-semibold">{entity.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{entity.type}</span>
                              <span>•</span>
                              <span>{entity.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{entity.studentsCount}</div>
                            <div className="text-xs text-muted-foreground">Students</div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{entity.examsCount}</div>
                            <div className="text-xs text-muted-foreground">Exams</div>
                          </div>


                        <div className="text-center">
                          <Badge className={getStatusColor(entity.status)}>
                            {entity.status}
                          </Badge>
                        </div>

                        {/* Monitoring Toggle - Only for SUPERADMIN */}
                        {user?.role === 'SUPERADMIN' && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`monitoring-list-${entity.id}`} className="text-sm">
                              Monitoring
                            </Label>
                            <Switch
                              id={`monitoring-list-${entity.id}`}
                              checked={entity.monitoring_enabled !== false}
                              onCheckedChange={() => handleToggleMonitoring(entity)}
                            />
                          </div>
                        )}

                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditClick(entity)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onViewEntity?.(entity)}
                            >
                              <Settings className="h-4 w-4" />
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
      )}

      {/* Create/Edit Entity Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEntity ? 'Edit Entity' : 'Create New Entity'}</DialogTitle>
            <DialogDescription>
              {editingEntity ? `Update the details for ${editingEntity.name}` : 'Add a new educational institution to the platform'}
            </DialogDescription>
          </DialogHeader>
          <EntityForm 
            entity={editingEntity} 
            onSubmit={handleCreateOrUpdate} 
            onCancel={() => setIsModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Unified Entity Form Component
function EntityForm({ entity, onSubmit, onCancel }: { entity: Entity | null, onSubmit: (data: CreateEntityPayload | UpdateEntityPayload) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<{
    name: string;
    type: 'COLLEGE' | 'SCHOOL';
    address: string;
    description: string;
    email: string;
    phone: string;
    logo: File | null;
  }>({
    name: '',
    type: 'COLLEGE',
    address: '',
    description: '',
    email: '',
    phone: '',
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (entity) {
      setFormData(prev => ({
        ...prev,
        name: entity.name,
        type: entity.type as 'COLLEGE' | 'SCHOOL',
        address: entity.location,
        description: entity.description || '',
        email: entity.email,
        phone: entity.phone,
      }));
      setLogoPreview(entity.logo_link || null);
    } else {
      setFormData({
        name: '',
        type: 'COLLEGE',
        address: '',
        description: '',
        email: '',
        phone: '',
        logo: null,
      });
      setLogoPreview(null);
    }
  }, [entity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.type) {
      toast.error('Please fill in all mandatory fields: Name, Address, and Type.');
      return;
    }
    
    const payload: any = {
      name: formData.name,
      type: formData.type,
      address: formData.address,
    };

    if (formData.description) {
      payload.description = formData.description;
    }
    if (formData.email) {
      payload.email = formData.email;
    }
    if (formData.phone) {
      payload.phone_number = formData.phone;
    }

    if (formData.logo) {
      payload.logo = formData.logo;
    }

    if (entity) {
      payload.entity_id = entity.id;
    }
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
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

        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center bg-muted/50">
                {logoPreview? (
                  <ImageWithFallback
                    src={logoPreview}
                    fallback={<Building className="h-6 w-6 text-primary" />}
                    alt={entity?.name || "Logo"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Add logo</span>
                )}
              </div>
              <Label htmlFor="logo" className="absolute -bottom-2 -right-2 cursor-pointer bg-primary text-primary-foreground p-2 rounded-full">
                <Upload className="h-4 w-4" />
              </Label>
              <Input
                id="logo"
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setFormData(prev => ({ ...prev, logo: file }));
                    setLogoPreview(URL.createObjectURL(file));
                  }
                }}
                accept="image/*"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {entity ? 'Update Entity' : 'Create Entity'}
        </Button>
      </div>
    </form>
  );
}
