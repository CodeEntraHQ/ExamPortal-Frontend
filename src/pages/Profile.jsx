import { useState, useRef } from 'react';
import { useAuth, useNotification } from '../hooks';
import userService from '../services/userService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import defaultProfile from '../assets/default-profile.svg';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addSuccess, addError } = useNotification();
  const [isEditingName, setIsEditingName] = useState(false);
  // const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = async e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(URL.createObjectURL(file));

      const formDataToSubmit = new FormData();
      formDataToSubmit.append('profile_picture', file);

      try {
        const response = await userService.updateUserProfile(formDataToSubmit);
        if (response.status === 'SUCCESS') {
          addSuccess('Profile picture updated successfully!');
          updateUser(response.payload);
        } else {
          addError('Failed to update profile picture. Please try again.');
        }
      } catch {
        addError('Failed to update profile picture. Please try again.');
      }
    }
  };

  const handleSubmit = async field => {
    // setIsLoading(true);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append(field, formData[field]);

    try {
      const response = await userService.updateUserProfile(formDataToSubmit);
      if (response.status === 'SUCCESS') {
        addSuccess('Profile updated successfully!');
        if (field === 'name') setIsEditingName(false);
        // if (field === 'email') setIsEditingEmail(false);
        updateUser(response.payload);
      } else {
        addError('Failed to update profile. Please try again.');
      }
    } catch {
      addError('Failed to update profile. Please try again.');
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-secondary-900 dark:text-secondary-50'>
            My Profile
          </h1>
          <p className='mt-2 text-secondary-600 dark:text-secondary-300'>
            View and manage your profile information
          </p>
        </div>

        <div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-1'>
              <Card>
                <div className='text-center'>
                  <div className='relative w-32 h-32 mx-auto mb-4 rounded-full'>
                    <img
                      src={
                        user?.profile_picture || profilePhoto || defaultProfile
                      }
                      alt='Profile'
                      className='w-full h-full rounded-full object-cover'
                    />
                    <button
                      type='button'
                      onClick={() => fileInputRef.current.click()}
                      className='absolute bottom-0 right-0 flex items-center justify-center w-10 h-10 bg-primary-600 rounded-full hover:bg-primary-700 text-white'
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
                          d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z'
                        />
                      </svg>
                    </button>
                    <input
                      type='file'
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                      className='hidden'
                      accept='image/*'
                    />
                  </div>
                  <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                    {user?.name}
                  </h3>
                  <p className='text-sm text-secondary-500 dark:text-secondary-400 capitalize'>
                    {user?.role}
                  </p>
                </div>
              </Card>
            </div>

            <div className='lg:col-span-2'>
              <Card>
                <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-4'>
                  Profile Information
                </h3>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='name'>Full Name</Label>
                    <div className='flex items-center gap-4'>
                      <Input
                        id='name'
                        name='name'
                        type='text'
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditingName}
                        required
                      />
                      <Button
                        type='button'
                        variant='icon'
                        onClick={() => setIsEditingName(!isEditingName)}
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
                            d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z'
                          />
                        </svg>
                      </Button>
                      {isEditingName && (
                        <Button
                          type='button'
                          onClick={() => handleSubmit('name')}
                        >
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='email'>Email</Label>
                    <p className='text-secondary-900 dark:text-secondary-100'>
                      {user?.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <p className='text-secondary-900 dark:text-secondary-100 capitalize'>
                      {user?.role || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <p className='text-secondary-900 dark:text-secondary-100'>
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
