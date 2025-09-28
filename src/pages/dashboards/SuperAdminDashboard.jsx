import { useState, useEffect } from 'react';
import { Grid, AddCard } from '../../components/ui';
import EntityCard from '../../components/entities/EntityCard';
import AddEntityModal from '../../components/modals/AddEntityModal';
import EditEntityModal from '../../components/modals/EditEntityModal';
import entityService from '../../services/entityService.js';

export default function SuperAdminDashboard() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await entityService.getEntities();
      // Service now returns { entities: [...], total, page, limit, totalPages }
      setEntities(response.entities || []);
    } catch (err) {
      setError(`Failed to fetch entities: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntity = () => {
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleEntityCreated = newEntity => {
    // Add the new entity to the list
    setEntities(prevEntities => [newEntity, ...prevEntities]);
    // Optionally show a success message
    console.log('Entity created successfully:', newEntity);
  };

  const handleEntityUpdated = updatedEntity => {
    setEntities(prevEntities =>
      prevEntities.map(entity =>
        entity.id === updatedEntity.id ? updatedEntity : entity
      )
    );
  };

  const handleEntityClick = entity => {
    setSelectedEntity(entity);
    setIsEditModalOpen(true);
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='mx-auto max-w-7xl'>
        {/* Header Section */}
        <div className='mb-8'>
          <div>
            <h1 className='mb-2 text-4xl font-bold text-secondary-900 dark:text-secondary-50'>
              Manage Entities
            </h1>
            <p className='text-base text-secondary-500 dark:text-secondary-400'>
              Create, update, and monitor all entities in the system.
            </p>
          </div>
        </div>

        {/* Entities Grid Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold text-secondary-900 dark:text-secondary-50'>
              Entities
            </h2>
            <div className='text-sm text-secondary-500 dark:text-secondary-400'>
              {entities.length} {entities.length === 1 ? 'entity' : 'entities'}{' '}
              registered
            </div>
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary-600'></div>
              <span className='ml-3 text-secondary-600 dark:text-secondary-300'>
                Loading entities...
              </span>
            </div>
          ) : error ? (
            <div className='p-6 text-center border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800'>
              <div className='mb-2 font-medium text-red-600 dark:text-red-400'>
                Error loading entities
              </div>
              <div className='mb-4 text-sm text-red-500 dark:text-red-400'>
                {error}
              </div>
              <button
                onClick={fetchEntities}
                className='px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700'
              >
                Retry
              </button>
            </div>
          ) : (
            <Grid cols={3} gap={6}>
              {/* Add New Entity Card */}
              <AddCard
                title='Add New Entity'
                description='Create a new entity'
                onClick={handleAddEntity}
                shadowColor='green'
              />

              {/* Existing Entities */}
              {entities.map(entity => (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  onClick={() => handleEntityClick(entity)}
                />
              ))}
            </Grid>
          )}
        </div>
      </div>

      {/* Add Entity Modal */}
      <AddEntityModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleEntityCreated}
      />
      <EditEntityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEntityUpdated}
        entity={selectedEntity}
      />
    </div>
  );
}
