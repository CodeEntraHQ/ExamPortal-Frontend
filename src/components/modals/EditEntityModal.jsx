import { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../hooks';
import { Button, Input, Label, Textarea } from '../ui';
import entityService from '../../services/entityService.js';
import { validateForm } from '../../utils/validation.js';

export default function EditEntityModal({
  isOpen,
  onClose,
  onSuccess,
  entity,
}) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'COLLEGE',
  });
  const { addSuccess, addError } = useNotification();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && entity) {
      setFormData({
        name: entity.name,
        address: entity.address,
        type: entity.type || 'COLLEGE',
      });
    }
  }, [isOpen, entity]);

  // Focus on name input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle clicking outside modal to close
  useEffect(() => {
    const handleClickOutside = e => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;

    setFormData({ name: '', address: '', type: 'COLLEGE' });
    setErrors({});
    onClose();
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEntityForm = () => {
    const fields = [
      { name: 'name', type: 'name', required: true },
      { name: 'address', type: 'name', required: true },
      { name: 'type', type: 'name', required: true },
    ];

    const validation = validateForm(formData, fields);

    // Additional custom validation for entity name
    if (formData.name && formData.name.trim().length < 3) {
      validation.errors.name = 'Entity name must be at least 3 characters long';
      validation.isValid = false;
    }

    return validation;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const validation = validateEntityForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedFields = { entity_id: entity.id };
      if (formData.name.trim() !== entity.name) {
        updatedFields.name = formData.name.trim();
      }
      if (formData.address.trim() !== entity.address) {
        updatedFields.address = formData.address.trim();
      }
      if (formData.type !== entity.type) {
        updatedFields.type = formData.type;
      }

      const updatedEntity = await entityService.updateEntity(updatedFields);

      // Success - close modal and refresh entity list
      addSuccess('Entity updated successfully!');
      handleClose();
      onSuccess(updatedEntity);
    } catch (error) {
      console.error('Error updating entity:', error);

      // Handle specific error messages from backend
      if (error.message.includes('already exists')) {
        addError(
          'A entity with this name already exists. Please choose a different name.'
        );
      } else if (error.message.includes('validation')) {
        addError('Please check the form data and try again.');
      } else {
        addError('Failed to update entity. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div
        ref={modalRef}
        className='relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl border-2 border-primary-200 dark:border-secondary-600'
      >
        {/* Header */}
        <div className='sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-primary-200 dark:border-secondary-600 dark:bg-secondary-800 rounded-t-2xl'>
          <div>
            <h2 className='text-2xl font-bold text-secondary-900 dark:text-secondary-50'>
              Edit Entity
            </h2>
            <p className='mt-1 text-sm text-secondary-500 dark:text-secondary-400'>
              Update the details of the educational institution
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className='p-2 transition-colors text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed'
            aria-label='Close modal'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6'>
          <div className='space-y-6'>
            {/* Entity Name */}
            <div>
              <Label htmlFor='name' required>
                Entity Name
              </Label>
              <Input
                ref={nameInputRef}
                id='name'
                name='name'
                type='text'
                placeholder='Enter entity name (e.g., Harvard University)'
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                errorMessage={errors.name}
                disabled={isSubmitting}
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor='address' required>
                Address
              </Label>
              <Textarea
                id='address'
                name='address'
                placeholder='Enter complete address including city, state, and postal code'
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                error={!!errors.address}
                errorMessage={errors.address}
                disabled={isSubmitting}
              />
            </div>

            {/* Entity Type */}
            <div>
              <Label htmlFor='type' required>
                Entity Type
              </Label>
              <div className='relative'>
                <select
                  id='type'
                  name='type'
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className='block w-full px-6 py-4 text-lg transition-all duration-200 bg-white border-2 rounded-lg shadow-sm appearance-none placeholder-secondary-400 text-secondary-900 border-primary-200 dark:border-secondary-600 dark:bg-secondary-700 dark:text-secondary-100 dark:placeholder-secondary-500 focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-100 dark:focus:ring-primary-900/20'
                >
                  <option value='COLLEGE'>College</option>
                  <option value='SCHOOL'>School</option>
                </select>
                <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
                  <svg
                    className='w-5 h-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-4 pt-6 mt-8 border-t border-primary-200 dark:border-secondary-600'>
            <Button
              type='button'
              onClick={handleClose}
              className='flex justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className='w-5 h-5 mr-2 animate-spin'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 4v16m8-8H4'
                    />
                  </svg>
                  Update Entity
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
