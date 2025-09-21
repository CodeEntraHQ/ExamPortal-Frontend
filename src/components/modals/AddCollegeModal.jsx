import { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../hooks';
import { Button, Input, Label, Textarea } from '../ui';
import collegeService from '../../services/collegeService.js';
import { validateForm } from '../../utils/validation.js';

export default function AddCollegeModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });
  const { addSuccess, addError } = useNotification();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const nameInputRef = useRef(null);

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

    setFormData({ name: '', address: '' });
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

  const validateCollegeForm = () => {
    const fields = [
      { name: 'name', type: 'name', required: true },
      { name: 'address', type: 'name', required: true },
    ];

    const validation = validateForm(formData, fields);

    // Additional custom validation for college name
    if (formData.name && formData.name.trim().length < 3) {
      validation.errors.name =
        'College name must be at least 3 characters long';
      validation.isValid = false;
    }

    return validation;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const validation = validateCollegeForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const collegeData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
      };

      const newCollege = await collegeService.createCollege(collegeData);

      // Success - close modal and refresh college list
      addSuccess('College created successfully!');
      handleClose();
      onSuccess(newCollege);
    } catch (error) {
      console.error('Error creating college:', error);

      // Handle specific error messages from backend
      if (error.message.includes('already exists')) {
        addError(
          'A college with this name already exists. Please choose a different name.'
        );
      } else if (error.message.includes('validation')) {
        addError('Please check the form data and try again.');
      } else {
        addError('Failed to create college. Please try again.');
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
              Add New College
            </h2>
            <p className='mt-1 text-sm text-secondary-500 dark:text-secondary-400'>
              Create a new educational institution in the system
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
            {/* College Name */}
            <div>
              <Label htmlFor='name' required>
                College Name
              </Label>
              <Input
                ref={nameInputRef}
                id='name'
                name='name'
                type='text'
                placeholder='Enter college name (e.g., Harvard University)'
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
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-4 pt-6 mt-8 border-t border-primary-200 dark:border-secondary-600'>
            <Button
              type='button'
              variant='secondary'
              onClick={handleClose}
              disabled={isSubmitting}
              className='flex items-center justify-center h-14'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              color='green'
              shadowColor='green'
              disabled={isSubmitting}
              className='flex items-center justify-center h-14'
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
                  Creating...
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
                  Create College
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
