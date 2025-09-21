import { useState, useEffect } from 'react';
import { Grid, AddCard } from '../../components/ui';
import CollegeCard from '../../components/colleges/CollegeCard';
import AddCollegeModal from '../../components/modals/AddCollegeModal';
import collegeService from '../../services/collegeService.js';

export default function SuperAdminDashboard() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await collegeService.getColleges();
      // Service now returns { colleges: [...], total, page, limit, totalPages }
      setColleges(response.colleges || []);
    } catch (err) {
      setError(`Failed to fetch colleges: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollege = () => {
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleCollegeCreated = newCollege => {
    // Add the new college to the list
    setColleges(prevColleges => [newCollege, ...prevColleges]);
    // Optionally show a success message
    console.log('College created successfully:', newCollege);
  };

  const handleCollegeClick = college => {
    console.log(college);
    // TODO: Implement college details/edit modal
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='mx-auto max-w-7xl'>
        {/* Header Section */}
        <div className='mb-8'>
          <div>
            <h1 className='mb-2 text-4xl font-bold text-secondary-900 dark:text-secondary-50'>
              Manage Colleges
            </h1>
            <p className='text-base text-secondary-500 dark:text-secondary-400'>
              Create, update, and monitor all educational institutions in the
              system.
            </p>
          </div>
        </div>

        {/* Colleges Grid Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold text-secondary-900 dark:text-secondary-50'>
              Colleges
            </h2>
            <div className='text-sm text-secondary-500 dark:text-secondary-400'>
              {colleges.length} {colleges.length === 1 ? 'college' : 'colleges'}{' '}
              registered
            </div>
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary-600'></div>
              <span className='ml-3 text-secondary-600 dark:text-secondary-300'>
                Loading colleges...
              </span>
            </div>
          ) : error ? (
            <div className='p-6 text-center border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800'>
              <div className='mb-2 font-medium text-red-600 dark:text-red-400'>
                Error loading colleges
              </div>
              <div className='mb-4 text-sm text-red-500 dark:text-red-400'>
                {error}
              </div>
              <button
                onClick={fetchColleges}
                className='px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700'
              >
                Retry
              </button>
            </div>
          ) : (
            <Grid cols={3} gap={6}>
              {/* Add New College Card */}
              <AddCard
                title='Add New College'
                description='Create a new educational institution'
                onClick={handleAddCollege}
                shadowColor='green'
              />

              {/* Existing Colleges */}
              {colleges.map(college => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  onClick={() => handleCollegeClick(college)}
                />
              ))}
            </Grid>
          )}
        </div>
      </div>

      {/* Add College Modal */}
      <AddCollegeModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCollegeCreated}
      />
    </div>
  );
}
