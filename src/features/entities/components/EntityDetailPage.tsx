import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/components/ui/dialog';
import { Entity } from './EntityManagement';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { updateEntity } from '../../../services/api/entity';
import { 
  Building, 
  Users, 
  BookOpen, 
  BarChart3, 
  MapPin,
  Calendar,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { Breadcrumb } from '../../../shared/components/layout/Breadcrumb';
import { RoleAwareExamManagement } from '../../../features/exams/components/RoleAwareExamManagement';
import { UserManagement } from '../../../features/users/components/UserManagement';
import { AnalyticsDashboard } from '../../../features/dashboard/components/AnalyticsDashboard';
import { ImageWithFallback } from '../../../shared/components/common/ImageWithFallback';

interface EntityDetailPageProps {
  entity: Entity;
  editMode?: boolean;
  onBackToEntities: () => void;
  onBackToDashboard: () => void;
  onExploreExam: (examId: string, examName: string) => void;
  onEditExam?: (examId: string, examName: string) => void;
}

export function EntityDetailPage({
  entity,
  editMode,
  onBackToEntities,
  onBackToDashboard,
  onExploreExam,
  onEditExam
}: EntityDetailPageProps) {
  const [activeTab, setActiveTab] = useState(editMode ? 'settings' : 'exams');
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [entityDetails, setEntityDetails] = useState<Entity>(entity);
  const [entitySettings, setEntitySettings] = useState({
    name: entity.name,
    type: entity.type,
    address: entity.location,
    description: entity.description || '',
    contactEmail: entity.email || '',
    contactPhone: entity.phone || '',
    logoLink: entity.logo_link || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const { success, error } = useNotifications();

  const breadcrumbItems = [
    { label: 'Dashboard', onClick: onBackToDashboard },
    { label: 'Administration', onClick: onBackToEntities },
    { label: entityDetails.name, isActive: true }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      
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
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{entityDetails.type}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{entityDetails.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(entityDetails.createdAt).toLocaleDateString()}</span>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Manage Exams
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Users
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
              onCreateExam={() => {
                // Navigate to exam creation or trigger creation modal
                console.log('Creating exam for entity:', entityDetails.id);
              }}
              onViewExamDetails={onExploreExam}
              onEditExamDetails={onEditExam}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement currentEntity={entityDetails.id} />
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
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Entity Settings</h2>
                <p className="text-muted-foreground">
                  Update entity information and configuration
                </p>
              </div>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  console.log('🟢 EntityDetailPage - Submitting form with settings:', entitySettings);
                  
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

                  console.log('🟢 EntityDetailPage - Calling updateEntity with payload:', payload);
                  const response = await updateEntity(payload);
                  console.log('🟢 EntityDetailPage - Update response:', response);
                  
                  // Update local state with response
                  if (response && response.payload) {
                    const updatedEntity = {
                      ...entityDetails,
                      name: response.payload.name || entityDetails.name,
                      type: response.payload.type || entityDetails.type,
                      location: response.payload.address || entityDetails.location,
                      description: response.payload.description || entityDetails.description,
                      email: response.payload.email || entityDetails.email,
                      phone: response.payload.phone_number || entityDetails.phone,
                      logo_link: response.payload.logo_link || entityDetails.logo_link,
                    };
                    
                    setEntityDetails(updatedEntity);
                    
                    // Also update the entitySettings state to reflect saved values
                    setEntitySettings({
                      name: updatedEntity.name,
                      type: updatedEntity.type,
                      address: updatedEntity.location,
                      description: updatedEntity.description || '',
                      contactEmail: updatedEntity.email || '',
                      contactPhone: updatedEntity.phone || '',
                      logoLink: updatedEntity.logo_link || '',
                    });
                  }
                  
                  success('Entity settings updated successfully');
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity-type">Type</Label>
                      <Select
                        value={entitySettings.type}
                        onValueChange={(value: 'COLLEGE' | 'SCHOOL') => setEntitySettings({ ...entitySettings, type: value })}
                      >
                        <SelectTrigger>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity-logo">Logo URL</Label>
                      <Input
                        id="entity-logo"
                        value={entitySettings.logoLink}
                        onChange={(e) => setEntitySettings({ ...entitySettings, logoLink: e.target.value })}
                        placeholder="https://example.com/logo.png"
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Contact Phone</Label>
                      <Input
                        id="contact-phone"
                        value={entitySettings.contactPhone}
                        onChange={(e) => setEntitySettings({ ...entitySettings, contactPhone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entity-description">Description</Label>
                      <Textarea
                        id="entity-description"
                        value={entitySettings.description}
                        onChange={(e) => setEntitySettings({ ...entitySettings, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="submit"
                  disabled={isSaving}
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
