import { useState } from 'react';
import { useAuth, useNotification } from '../hooks';
import userService from '../services/userService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const { addSuccess, addError } = useNotification();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    data.append('name', formData.name);

    if (profilePicture) {
      data.append('profile_picture', profilePicture);
    }

    try {
      const response = await userService.updateUserProfile(data);
      if (response && response.payload) {
        const updatedUserData = {
          ...user,
          ...response.payload,
        };
        updateUser(updatedUserData);
      }
      addSuccess('Profile updated successfully!');
    } catch (error) {
      addError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='max-w-2xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-secondary-900 dark:text-secondary-50'>
            Edit Profile
          </h1>
          <p className='mt-2 text-secondary-600 dark:text-secondary-300'>
            Update your profile information
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <Label htmlFor='name'>Full Name</Label>
              <Input
                id='name'
                name='name'
                type='text'
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor='profile_picture'>Profile Picture</Label>
              <Input
                id='profile_picture'
                name='profile_picture'
                type='file'
                onChange={handleFileChange}
                accept='image/*'
              />
            </div>

            <div>
              <Label htmlFor='role'>Role</Label>
              <Input
                id='role'
                name='role'
                type='text'
                value={user?.role || ''}
                disabled
                className='bg-secondary-50 dark:bg-secondary-800'
              />
              <p className='mt-1 text-sm text-secondary-500 dark:text-secondary-400'>
                Role cannot be changed. Contact an administrator if needed.
              </p>
            </div>

            <div className='flex gap-4'>
              <Button type='submit' disabled={isLoading} className='flex-1'>
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={() => window.history.back()}
                className='flex-1'
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
