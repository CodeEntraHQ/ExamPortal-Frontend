import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/components/ui/dialog';
import { Entity } from './EntityManagement';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { 
  Building, 
  Users, 
  BookOpen, 
  BarChart3, 
  MapPin,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
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
  const [showSettingsModal, setShowSettingsModal] = useState(editMode || false);
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

  const { success } = useNotifications();

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
                <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Entity Settings</DialogTitle>
                      <DialogDescription>
                        Update entity information and configuration
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="entity-name">Entity Name</Label>
                        <Input
                          id="entity-name"
                          value={entitySettings.name}
                          onChange={(e) => setEntitySettings({ ...entitySettings, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="entity-type">Type</Label>
                        <Input
                          id="entity-type"
                          value={entitySettings.type}
                          onChange={(e) => setEntitySettings({ ...entitySettings, type: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="entity-address">Address</Label>
                        <Textarea
                          id="entity-address"
                          value={entitySettings.address}
                          onChange={(e) => setEntitySettings({ ...entitySettings, address: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="entity-description">Description</Label>
                        <Textarea
                          id="entity-description"
                          value={entitySettings.description}
                          onChange={(e) => setEntitySettings({ ...entitySettings, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="contact-email">Contact Email</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            value={entitySettings.contactEmail}
                            onChange={(e) => setEntitySettings({ ...entitySettings, contactEmail: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="contact-phone">Contact Phone</Label>
                          <Input
                            id="contact-phone"
                            value={entitySettings.contactPhone}
                            onChange={(e) => setEntitySettings({ ...entitySettings, contactPhone: e.target.value })}
                          />
                        </div>
                      </div>
                        <div className="grid gap-2">
                          <Label htmlFor="entity-logo">Logo</Label>
                          <Input
                            id="entity-logo"
                            value={entitySettings.logoLink}
                            onChange={(e) => setEntitySettings({ ...entitySettings, logoLink: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowSettingsModal(false);
                            success('Entity settings updated successfully');
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                
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
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">User Management</h2>
                <p className="text-muted-foreground">
                  Manage users and roles for {entityDetails.name}
                </p>
              </div>
            </div>
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
                  Configure settings and preferences for {entityDetails.name}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic entity information and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Entity Name</Label>
                    <Input value={entitySettings.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Input value={entitySettings.type} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea value={entitySettings.address} disabled rows={2} />
                  </div>
                  <Button onClick={() => setShowSettingsModal(true)} className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Contact details and communication preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input value={entitySettings.contactEmail} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input value={entitySettings.contactPhone} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={entitySettings.description} disabled rows={3} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
