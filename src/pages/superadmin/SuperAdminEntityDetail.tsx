/**
 * SuperAdmin Entity Detail Page
 * Detailed view of a specific entity for superadmin
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { EntityDetailPage } from '../../features/entities/components/EntityDetailPage';
import { Entity } from '../../features/entities/components/EntityManagement';
import { useEffect, useState } from 'react';
import { getEntities, ApiEntity } from '../../services/api/entity';

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

export function SuperAdminEntityDetail() {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const editMode = location.state?.editMode || false;

  useEffect(() => {
    const fetchEntity = async () => {
      if (!entityId) {
        navigate('/superadmin/entities', { replace: true });
        return;
      }

      setIsLoading(true);
      try {
        const response = await getEntities(1, 10);
        const foundEntity = response.payload.entities.find(e => e.id === entityId);

        if (foundEntity) {
          setEntity(mapApiEntityToUiEntity(foundEntity));
        } else {
          navigate('/superadmin/entities', { replace: true });
        }
      } catch (error) {
        console.error('Failed to fetch entity:', error);
        navigate('/superadmin/entities', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntity();
  }, [entityId, navigate]);

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
      editMode={editMode}
      onBackToEntities={() => navigate('/superadmin/entities')}
      onBackToDashboard={() => navigate('/superadmin/dashboard')}
      onExploreExam={(examId: string, examName: string) => {
        navigate(`/superadmin/exam/${examId}`, {
          state: { examName, entityId: entity.id, entityName: entity.name },
        });
      }}
      onEditExam={(examId: string, examName: string) => {
        navigate(`/superadmin/exam/${examId}`, {
          state: { examName, entityId: entity.id, entityName: entity.name, editMode: true },
        });
      }}
      onCreateExam={() => {
        navigate('/superadmin/exam/create', {
          state: { entityId: entity.id, entityName: entity.name },
        });
      }}
    />
  );
}

