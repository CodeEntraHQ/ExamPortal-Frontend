import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  MapPin,
  Calendar,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Save,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface Entity {
  id: string;
  name: string;
  type: 'University' | 'School' | 'Institute' | 'Training Center' | 'Corporate';
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Pending';
  userCount: number;
  examCount: number;
  createdDate: string;
  lastActive: string;
  metadata: {
    establishedYear?: string;
    accreditation?: string;
    capacity?: string;
    specialization?: string;
  };
}

export function EntityManagement() {
  const [entities, setEntities] = useState<Entity[]>([
    {
      id: '1',
      name: 'Stanford University',
      type: 'University',
      address: '450 Serra Mall',
      city: 'Stanford',
      state: 'California',
      country: 'USA',
      zipCode: '94305',
      phone: '+1-650-723-2300',
      email: 'info@stanford.edu',
      website: 'https://stanford.edu',
      description: 'Leading research university with excellence in education and innovation.',
      status: 'Active',
      userCount: 15420,
      examCount: 1250,
      createdDate: '2023-01-15',
      lastActive: '2024-01-10',
      metadata: {
        establishedYear: '1885',
        accreditation: 'WASC',
        capacity: '17000',
        specialization: 'Research & Technology'
      }
    },
    {
      id: '2',
      name: 'Lincoln High School',
      type: 'School',
      address: '123 Education Ave',
      city: 'Springfield',
      state: 'Illinois',
      country: 'USA',
      zipCode: '62701',
      phone: '+1-217-555-0123',
      email: 'admin@lincolnhs.edu',
      website: 'https://lincolnhs.edu',
      description: 'Comprehensive high school serving grades 9-12 with academic excellence.',
      status: 'Active',
      userCount: 1200,
      examCount: 850,
      createdDate: '2023-03-20',
      lastActive: '2024-01-09',
      metadata: {
        establishedYear: '1965',
        accreditation: 'NCA',
        capacity: '1500',
        specialization: 'General Education'
      }
    },
    {
      id: '3',
      name: 'TechCorp Training Institute',
      type: 'Corporate',
      address: '789 Business Park Dr',
      city: 'Austin',
      state: 'Texas',
      country: 'USA',
      zipCode: '73301',
      phone: '+1-512-555-0456',
      email: 'training@techcorp.com',
      website: 'https://techcorp.com/training',
      description: 'Corporate training institute specializing in technology certifications.',
      status: 'Pending',
      userCount: 350,
      examCount: 125,
      createdDate: '2023-12-01',
      lastActive: '2024-01-08',
      metadata: {
        establishedYear: '2020',
        accreditation: 'ISO 9001',
        capacity: '500',
        specialization: 'Technology Training'
      }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [formData, setFormData] = useState<Partial<Entity>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const entityTypes = ['University', 'School', 'Institute', 'Training Center', 'Corporate'];
  const statuses = ['Active', 'Inactive', 'Pending'];

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || entity.type === filterType;
    const matchesStatus = filterStatus === 'all' || entity.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const validateForm = (data: Partial<Entity>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.name?.trim()) errors.name = 'Name is required';
    if (!data.type) errors.type = 'Type is required';
    if (!data.email?.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';
    if (!data.address?.trim()) errors.address = 'Address is required';
    if (!data.city?.trim()) errors.city = 'City is required';
    if (!data.state?.trim()) errors.state = 'State is required';
    if (!data.country?.trim()) errors.country = 'Country is required';
    
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) return;

    if (editingEntity) {
      // Update existing entity
      setEntities(prev => prev.map(entity => 
        entity.id === editingEntity.id 
          ? { ...entity, ...formData } as Entity
          : entity
      ));
    } else {
      // Create new entity
      const newEntity: Entity = {
        id: Date.now().toString(),
        ...formData,
        status: 'Pending',
        userCount: 0,
        examCount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0],
        metadata: formData.metadata || {}
      } as Entity;
      
      setEntities(prev => [...prev, newEntity]);
    }
    
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingEntity(null);
    setFormData({});
    setErrors({});
  };

  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity);
    setFormData(entity);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (entityId: string) => {
    if (confirm('Are you sure you want to delete this entity? This action cannot be undone.')) {
      setEntities(prev => prev.filter(entity => entity.id !== entityId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Inactive':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Entity Management
          </h1>
          <p className="text-muted-foreground">
            Manage educational institutions and organizations
          </p>
        </div>
        <div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Add Entity
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntity ? 'Edit Entity' : 'Create New Entity'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Entity Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter entity name"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={formData.type || ''} 
                      onValueChange={(value) => setFormData({ ...formData, type: value as Entity['type'] })}
                    >
                      <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        {entityTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the entity"
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@entity.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1-555-123-4567"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.entity.com"
                  />
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Address Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street"
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State"
                      className={errors.state ? 'border-destructive' : ''}
                    />
                    {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode || ''}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="12345"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                    className={errors.country ? 'border-destructive' : ''}
                  />
                  {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingEntity ? 'Update Entity' : 'Create Entity'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entities by name, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Entities ({filteredEntities.length})</CardTitle>
          <CardDescription>
            Manage and monitor all registered entities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntities.map((entity, index) => (
                  <motion.tr
                    key={entity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{entity.name}</div>
                        <div className="text-sm text-muted-foreground">{entity.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entity.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {entity.city}, {entity.state}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{entity.phone}</div>
                        <div className="text-muted-foreground">{entity.website}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {entity.userCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        {entity.examCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(entity.status)}>
                        {entity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(entity.lastActive).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(entity)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(entity.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </div>
  );
}