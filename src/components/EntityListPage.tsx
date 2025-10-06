import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Building, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Calendar,
  Users,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { Breadcrumb } from './Breadcrumb';
import { useAuth } from './AuthProvider';

interface Entity {
  id: string;
  name: string;
  type: string;
  address: string;
  createdAt: string;
  totalUsers: number;
  totalExams: number;
  status: 'active' | 'inactive';
}

interface EntityListPageProps {
  onExploreEntity: (entityId: string, entityName: string) => void;
  onBackToDashboard: () => void;
}

export function EntityListPage({ onExploreEntity, onBackToDashboard }: EntityListPageProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  
  const [newEntity, setNewEntity] = useState({
    name: '',
    type: '',
    address: '',
  });

  // Mock data - in real app this would come from API
  const mockEntities: Entity[] = [
    {
      id: 'entity-1',
      name: 'Engineering College',
      type: 'College',
      address: '123 Tech Street, Silicon Valley',
      createdAt: '2024-01-15',
      totalUsers: 1245,
      totalExams: 89,
      status: 'active'
    },
    {
      id: 'entity-2',
      name: 'Business School',
      type: 'School',
      address: '456 Commerce Ave, Business District',
      createdAt: '2024-01-20',
      totalUsers: 892,
      totalExams: 67,
      status: 'active'
    },
    {
      id: 'entity-3',
      name: 'Medical Institute',
      type: 'Institute',
      address: '789 Health Blvd, Medical Center',
      createdAt: '2024-02-01',
      totalUsers: 567,
      totalExams: 45,
      status: 'active'
    },
    {
      id: 'entity-4',
      name: 'Arts & Sciences',
      type: 'College',
      address: '321 Liberal Arts Way, University Town',
      createdAt: '2024-02-10',
      totalUsers: 234,
      totalExams: 23,
      status: 'inactive'
    }
  ];

  const [entities, setEntities] = useState<Entity[]>(mockEntities);

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEntity = () => {
    const newEntityData: Entity = {
      id: `entity-${Date.now()}`,
      name: newEntity.name,
      type: newEntity.type,
      address: newEntity.address,
      createdAt: new Date().toISOString().split('T')[0],
      totalUsers: 0,
      totalExams: 0,
      status: 'active'
    };

    setEntities([...entities, newEntityData]);
    setNewEntity({ name: '', type: '', address: '' });
    setShowCreateDialog(false);
  };

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity);
    setNewEntity({
      name: entity.name,
      type: entity.type,
      address: entity.address,
    });
  };

  const handleUpdateEntity = () => {
    if (!editingEntity) return;

    setEntities(entities.map(entity => 
      entity.id === editingEntity.id 
        ? { ...entity, name: newEntity.name, type: newEntity.type, address: newEntity.address }
        : entity
    ));
    setEditingEntity(null);
    setNewEntity({ name: '', type: '', address: '' });
  };

  const handleDeleteEntity = (entityId: string) => {
    setEntities(entities.filter(entity => entity.id !== entityId));
  };

  const breadcrumbItems = [
    { label: 'Dashboard', onClick: onBackToDashboard },
    { label: 'Administration', isActive: true }
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Entity Management
            </h1>
            <p className="text-muted-foreground">
              Manage and organize your educational entities
            </p>
          </div>
          
          {user?.role === 'SUPERADMIN' && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Entity
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Entity</DialogTitle>
                  <DialogDescription>
                    Add a new educational entity to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Entity Name</Label>
                    <Input
                      id="name"
                      value={newEntity.name}
                      onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                      placeholder="Enter entity name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newEntity.type} onValueChange={(value) => setNewEntity({ ...newEntity, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="University">University</SelectItem>
                        <SelectItem value="College">College</SelectItem>
                        <SelectItem value="School">School</SelectItem>
                        <SelectItem value="Institute">Institute</SelectItem>
                        <SelectItem value="Academy">Academy</SelectItem>
                        <SelectItem value="Training Center">Training Center</SelectItem>
                        <SelectItem value="Online Platform">Online Platform</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={newEntity.address}
                      onChange={(e) => setNewEntity({ ...newEntity, address: e.target.value })}
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateEntity}
                    disabled={!newEntity.name || !newEntity.type || !newEntity.address}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Create Entity
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Card className="p-4 min-w-[120px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">{entities.length}</p>
                </div>
                <Building className="h-6 w-6 text-primary/60" />
              </div>
            </Card>
            <Card className="p-4 min-w-[120px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-success">
                    {entities.filter(e => e.status === 'active').length}
                  </p>
                </div>
                <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-success"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Entities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Entities</CardTitle>
            <CardDescription>
              Overview of all educational entities in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntities.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{entity.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entity.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{entity.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{entity.totalUsers}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        <span>{entity.totalExams}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={entity.status === 'active' ? 'default' : 'secondary'}
                        className={entity.status === 'active' 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-muted text-muted-foreground'
                        }
                      >
                        {entity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(entity.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => onExploreEntity(entity.id, entity.name)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                        
                        {user?.role === 'SUPERADMIN' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditEntity(entity)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                disabled
                                className="text-muted-foreground cursor-not-allowed"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete (Disabled)
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Entity Dialog */}
      <Dialog open={!!editingEntity} onOpenChange={(open) => !open && setEditingEntity(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Entity</DialogTitle>
            <DialogDescription>
              Update entity information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Entity Name</Label>
              <Input
                id="edit-name"
                value={newEntity.name}
                onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                placeholder="Enter entity name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={newEntity.type} onValueChange={(value) => setNewEntity({ ...newEntity, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="University">University</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                  <SelectItem value="Institute">Institute</SelectItem>
                  <SelectItem value="Academy">Academy</SelectItem>
                  <SelectItem value="Training Center">Training Center</SelectItem>
                  <SelectItem value="Online Platform">Online Platform</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={newEntity.address}
                onChange={(e) => setNewEntity({ ...newEntity, address: e.target.value })}
                placeholder="Enter full address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntity(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateEntity}
              disabled={!newEntity.name || !newEntity.type || !newEntity.address}
              className="bg-primary hover:bg-primary/90"
            >
              Update Entity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}