/**
 * Admin Entity Management Page
 * Entity detail page for admin users (their own entity)
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EntityDetailPage } from '../../features/entities/components/EntityDetailPage';
import { Entity } from '../../features/entities/components/EntityManagement';
import { useAuth } from '../../features/auth/providers/AuthProvider';
import { getEntities, getEntityById, ApiEntity } from '../../services/api/entity';

// Helper function to map API entity to UI entity
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

export function AdminEntityManagement() {
  const { entityId } = useParams<{ entityId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntity = async () => {
      if (!user?.entityId) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      const targetEntityId = entityId || user.entityId;

      // If admin tries to access a different entity, redirect to their own
      if (user.role === 'ADMIN' && targetEntityId !== user.entityId) {
        navigate('/admin/entity', { replace: true });
        return;
      }

      setIsLoading(true);
      
      // For ADMIN users, fetch their entity details
      if (user.role === 'ADMIN') {
        console.log('🔵 AdminEntityManagement - Admin user detected');
        console.log('🔵 AdminEntityManagement - User data:', {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          entityId: user.entityId,
          entityName: user.entityName,
        });
        
        try {
          // Fetch full entity details from backend
          console.log('🔵 AdminEntityManagement - Fetching entity details from backend');
          const response = await getEntityById(user.entityId);
          
          console.log('✅ AdminEntityManagement - Entity data fetched from backend:', response);
          
          if (response && response.payload) {
            const apiEntity = response.payload;
            const entityData: Entity = {
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
            };
            
            // Save to localStorage for future use
            const savedEntityKey = `entity_${user.entityId}`;
            localStorage.setItem(savedEntityKey, JSON.stringify({
              name: entityData.name,
              type: entityData.type,
              location: entityData.location,
              email: entityData.email,
              phone: entityData.phone,
              description: entityData.description,
              logo_link: entityData.logo_link,
              createdAt: entityData.createdAt,
              status: entityData.status,
              studentsCount: entityData.studentsCount,
              examsCount: entityData.examsCount,
            }));
            
            console.log('✅ AdminEntityManagement - Entity data fetched and saved:', entityData);
            setEntity(entityData);
            setIsLoading(false);
            return;
          }
        } catch (error: any) {
          console.error('❌ AdminEntityManagement - Failed to fetch entity from backend:', error);
          console.log('⚠️ AdminEntityManagement - Using fallback: entity data from login response');
          
          // Fallback: Use entity data from login response
          const entityData: Entity = {
            id: user.entityId,
            name: user.entityName || 'Your Entity',
            type: '',
            studentsCount: 0,
            examsCount: 0,
            status: 'active',
            createdAt: '',
            location: '',
            email: '',
            phone: '',
            lastActivity: '',
            description: '',
            logo_link: '',
          };
          
          setEntity(entityData);
          setIsLoading(false);
          return;
        }
      }

      // For SUPERADMIN, fetch entities (they have permission)
      try {
        const response = await getEntities(1, 10);
        const foundEntity = response.payload.entities.find(e => e.id === targetEntityId);

        if (foundEntity) {
          setEntity(mapApiEntityToUiEntity(foundEntity));
        } else {
          // If entity not found, create a minimal entity from user data
          setEntity({
            id: user.entityId,
            name: user.entityName || 'Your Entity',
            type: '',
            studentsCount: 0,
            examsCount: 0,
            status: 'active',
            createdAt: '',
            location: '',
            email: '',
            phone: '',
            lastActivity: '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch entity:', error);
        // Fallback to user entity data
        setEntity({
          id: user.entityId,
          name: user.entityName || 'Your Entity',
          type: '',
          studentsCount: 0,
          examsCount: 0,
          status: 'active',
          createdAt: '',
          location: '',
          email: '',
          phone: '',
          lastActivity: '',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntity();
  }, [user, entityId, navigate]);

  if (isLoading || !entity) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading entity details...</p>
        </div>
      </div>
    );
  }

  return (
    <EntityDetailPage
      entity={entity}
      onBackToEntities={() => navigate('/admin/entity')}
      onBackToDashboard={() => navigate('/admin/dashboard')}
      onExploreExam={(examId: string, examName: string) => {
        navigate(`/admin/exam/${examId}`, {
          state: { examName, entityId: entity.id, entityName: entity.name },
        });
      }}
      onEditExam={(examId: string, examName: string) => {
        navigate(`/admin/exam/${examId}`, {
          state: { examName, entityId: entity.id, entityName: entity.name, editMode: true },
        });
      }}
      onCreateExam={() => {
        navigate('/admin/exam/create', {
          state: { entityId: entity.id, entityName: entity.name },
        });
      }}
    />
  );
}

