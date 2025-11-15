/**
 * SuperAdmin Entity Management Page
 * Lists all entities for superadmin
 */

import { EntityManagement } from '../../features/entities/components/EntityManagement';
import { Entity } from '../../features/entities/components/EntityManagement';
import { useNavigate } from 'react-router-dom';

export function SuperAdminEntityManagement() {
  const navigate = useNavigate();

  return (
    <EntityManagement
      onBackToDashboard={() => navigate('/superadmin/dashboard')}
      onViewEntity={(entity: Entity) => {
        navigate(`/superadmin/entities/${entity.id}`);
      }}
      onEditEntity={(entity: Entity) => {
        navigate(`/superadmin/entities/${entity.id}`, { state: { editMode: true } });
      }}
    />
  );
}

