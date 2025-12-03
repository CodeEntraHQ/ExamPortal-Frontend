import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/components/ui/dialog';
import { Entity } from './EntityManagement';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { updateEntity, getEntities, ApiEntity } from '../../../services/api/entity';
import { 
  Building, 
  Users, 
  BookOpen, 
  BarChart3, 
  MapPin,
  Calendar,
  Settings,
  Pencil,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { RoleAwareExamManagement } from '../../../features/exams/components/RoleAwareExamManagement';
import { UserManagement } from '../../../features/users/components/UserManagement';
import { AnalyticsDashboard } from '../../../features/dashboard/components/AnalyticsDashboard';
import { SubmissionsManagement } from '../../../features/submissions/components/SubmissionsManagement';
import { ImageWithFallback } from '../../../shared/components/common/ImageWithFallback';

interface EntityDetailPageProps {
  entity: Entity;
  editMode?: boolean;
  onBackToEntities: () => void;
  onBackToDashboard: () => void;
  onExploreExam: (examId: string, examName: string) => void;
  onEditExam?: (examId: string, examName: string) => void;
  onCreateExam?: () => void;
}

// Helper function to map API entity to UI entity (same as in EntityManagement)
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
});

export function EntityDetailPage({
  entity,
  editMode,
  onBackToEntities,
  onBackToDashboard,
  onExploreExam,
  onEditExam,
  onCreateExam
}: EntityDetailPageProps) {
  const [activeTab, setActiveTab] = useState(editMode ? 'settings' : 'exams');
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [entityDetails, setEntityDetails] = useState<Entity>(entity);
  const [isLoadingEntity, setIsLoadingEntity] = useState(false);
  const [entitySettings, setEntitySettings] = useState({
    name: entity.name,
    type: entity.type || '',
    address: entity.location || '',
    description: entity.description || '',
    contactEmail: entity.email || '',
    contactPhone: entity.phone || '',
    logoLink: entity.logo_link || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { success, error } = useNotifications();
  const { user } = useAuth();

  // Sync entityDetails when entity prop changes
  useEffect(() => {
    setEntityDetails(entity);
    setEntitySettings({
      name: entity.name,
      type: entity.type || '',
      address: entity.location || '',
      description: entity.description || '',
      contactEmail: entity.email || '',
      contactPhone: entity.phone || '',
      logoLink: entity.logo_link || ''
    });
    setIsEditing(false);
  }, [entity]);

  // Fetch full entity data if entity is incomplete (only has id and name)
  useEffect(() => {
    const fetchEntityData = async () => {
      // Check if entity is incomplete (missing required fields like createdAt, type, etc.)
      const isIncomplete = !entity.createdAt || !entity.type || !entity.location;
      
      // ADMIN users don't have permission to list entities, so skip fetch for them
      if (user?.role === 'ADMIN') {
        // For ADMIN, use the entity data as-is (it comes from login response)
        return;
      }
      
      if (isIncomplete && entity.id) {
        setIsLoadingEntity(true);
        try {
          // Only SUPERADMIN can fetch entities list
          if (user?.role === 'SUPERADMIN') {
            // Fetch entities and find the one matching our entity ID
            const response = await getEntities(1, 10); // Fetch entities (max 10 per backend limit)
            const foundEntity = response.payload.entities.find(e => e.id === entity.id);
            
            if (foundEntity) {
              const fullEntity = mapApiEntityToUiEntity(foundEntity);
              setEntityDetails(fullEntity);
              setEntitySettings({
                name: fullEntity.name,
                type: fullEntity.type,
                address: fullEntity.location,
                description: fullEntity.description || '',
                contactEmail: fullEntity.email || '',
                contactPhone: fullEntity.phone || '',
                logoLink: fullEntity.logo_link || ''
              });
            }
          }
        } catch (err) {
          console.error('Failed to fetch entity details:', err);
          // Don't show error for ADMIN users as they don't have permission
          if (user?.role === 'SUPERADMIN') {
            error('Failed to load entity details');
          }
        } finally {
          setIsLoadingEntity(false);
        }
      }
    };

    fetchEntityData();
  }, [entity.id, entity.createdAt, entity.type, entity.location, error, user?.role]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Entity Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-start gap-4">
                <ImageWithFallback
                  src={entityDetails.logo_link || null}
                  fallback={<Building className="h-8 w-8 text-primary" />}
                  alt={entityDetails.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">{entityDetails.name}</h1>
                    <Badge 
                      variant={entityDetails.status === 'active' ? 'default' : 'secondary'}
                      className={entityDetails.status === 'active' 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                      }
                    >
                      {entityDetails.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                    {entityDetails.type && (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">{entityDetails.type}</Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{entityDetails.location || 'No location set'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {entityDetails.createdAt 
                          ? `Created ${entityDetails.createdAt}`
                          : isLoadingEntity 
                            ? 'Loading...'
                            : 'Created N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={showInsightsModal} onOpenChange={setShowInsightsModal}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Insights
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Entity Insights</DialogTitle>
                      <DialogDescription>
                        AI-generated insights and recommendations for {entityDetails.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <h4 className="font-semibold text-primary mb-2">Performance Insights</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Average exam completion rate: 89.2% (Above average)</li>
                          <li>• Student engagement has increased by 15% this month</li>
                          <li>• Most popular exam category: Programming (67% participation)</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-success/10 rounded-lg">
                        <h4 className="font-semibold text-success mb-2">Recommendations</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Consider adding more intermediate-level exams</li>
                          <li>• Peak exam activity is between 2-4 PM</li>
                          <li>• Students prefer 90-minute exam duration</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Action Items</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Review low-performing exams (below 60% pass rate)</li>
                          <li>• Update exam instructions for clarity</li>
                          <li>• Schedule regular performance reviews</li>
                        </ul>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowInsightsModal(false)}>
                        Close
                      </Button>
                      <Button onClick={() => {
                        setShowInsightsModal(false);
                        success('Insights exported successfully');
                      }}>
                        Export Report
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Manage Exams
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Manage Submissions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-6">
            <RoleAwareExamManagement 
              currentEntity={entityDetails.id} 
              onCreateExam={onCreateExam || (() => {
                // Default: navigate to exam creation
                // This will be overridden by parent components with proper navigation
              })}
              onViewExamDetails={onExploreExam}
              onEditExamDetails={onEditExam}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement currentEntity={entityDetails.id} />
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <SubmissionsManagement currentEntity={entityDetails.id} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Monitoring & Analytics</h2>
                <p className="text-muted-foreground">
                  Real-time monitoring and performance insights for {entityDetails.name}
                </p>
              </div>
            </div>
            <AnalyticsDashboard currentEntity={entityDetails.id} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-xl font-semibold">Entity Settings</h2>
                <p className="text-muted-foreground">
                  Update entity information and configuration
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={isEditing ? 'Editing enabled' : 'Enable editing'}
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const payload: any = {
                    entity_id: entityDetails.id,
                    name: entitySettings.name,
                    type: entitySettings.type,
                    address: entitySettings.address,
                    description: entitySettings.description || '',
                    email: entitySettings.contactEmail || '',
                    phone_number: entitySettings.contactPhone || '',
                  };
                  
                  // Note: logo_link is not supported by the API - only file uploads are supported
                  // If logo needs to be updated, it should be done via file upload in a separate feature

                  const response = await updateEntity(payload);
                  
                  // Update local state with response
                  if (response && response.payload) {
                    const updatedEntity = response.payload;
                    const updatedEntityDetails: Entity = {
                      ...entityDetails,
                      name: updatedEntity.name || entityDetails.name,
                      type: updatedEntity.type || entityDetails.type || '',
                      location: updatedEntity.address || entityDetails.location || '',
                      description: updatedEntity.description || entityDetails.description || '',
                      email: updatedEntity.email || entityDetails.email || '',
                      phone: updatedEntity.phone_number || entityDetails.phone || '',
                      logo_link: updatedEntity.logo_link || entityDetails.logo_link || '',
                      createdAt: updatedEntity.created_at 
                        ? new Date(updatedEntity.created_at).toLocaleDateString() 
                        : entityDetails.createdAt || new Date().toLocaleDateString(),
                    };
                    
                    setEntityDetails(updatedEntityDetails);
                    
                    // Save entity data to localStorage for admin users (so it persists on reload)
                    if (user?.role === 'ADMIN' && updatedEntityDetails.id) {
                      const savedEntityKey = `entity_${updatedEntityDetails.id}`;
                      const dataToSave = {
                        name: updatedEntityDetails.name,
                        type: updatedEntityDetails.type,
                        location: updatedEntityDetails.location,
                        email: updatedEntityDetails.email,
                        phone: updatedEntityDetails.phone,
                        description: updatedEntityDetails.description,
                        logo_link: updatedEntityDetails.logo_link,
                        createdAt: updatedEntityDetails.createdAt,
                        status: updatedEntityDetails.status,
                      };
                      localStorage.setItem(savedEntityKey, JSON.stringify(dataToSave));
                    }
                    
                    // Also update the entitySettings state to reflect saved values
                    setEntitySettings({
                      name: updatedEntityDetails.name,
                      type: updatedEntityDetails.type,
                      address: updatedEntityDetails.location,
                      description: updatedEntityDetails.description || '',
                      contactEmail: updatedEntityDetails.email || '',
                      contactPhone: updatedEntityDetails.phone || '',
                      logoLink: updatedEntityDetails.logo_link || '',
                    });
                  }
                  
                  success('Entity settings updated successfully');
                setIsEditing(false);
                } catch (err: any) {
                  console.error('❌ EntityDetailPage - Error updating entity:', err);
                  const errorMessage = err?.message || err?.response?.data?.message || 'Failed to update entity settings';
                  error(errorMessage);
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Basic entity information and configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="entity-name">Entity Name</Label>
                      <Input
                        id="entity-name"
                        value={entitySettings.name}
                        onChange={(e) => setEntitySettings({ ...entitySettings, name: e.target.value })}
                        required
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity-type">Type</Label>
                      <Select
                        value={entitySettings.type}
                        disabled={!isEditing}
                        onValueChange={(value: 'COLLEGE' | 'SCHOOL') => setEntitySettings({ ...entitySettings, type: value })}
                      >
                        <SelectTrigger disabled={!isEditing}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COLLEGE">College</SelectItem>
                          <SelectItem value="SCHOOL">School</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity-address">Address</Label>
                      <Textarea
                        id="entity-address"
                        value={entitySettings.address}
                        onChange={(e) => setEntitySettings({ ...entitySettings, address: e.target.value })}
                        rows={2}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity-logo">Logo URL</Label>
                      <Input
                        id="entity-logo"
                        value={entitySettings.logoLink}
                        onChange={(e) => setEntitySettings({ ...entitySettings, logoLink: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Contact details and communication preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={entitySettings.contactEmail}
                        onChange={(e) => setEntitySettings({ ...entitySettings, contactEmail: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Contact Phone</Label>
                      <Input
                        id="contact-phone"
                        value={entitySettings.contactPhone}
                        onChange={(e) => setEntitySettings({ ...entitySettings, contactPhone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity-description">Description</Label>
                      <Textarea
                        id="entity-description"
                        value={entitySettings.description}
                        onChange={(e) => setEntitySettings({ ...entitySettings, description: e.target.value })}
                        rows={3}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="submit"
                  disabled={!isEditing || isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
