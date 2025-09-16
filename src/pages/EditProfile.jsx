import { useState } from 'react';
import { useAuth } from '../hooks';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';

export default function EditProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement profile update API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.', error);
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
