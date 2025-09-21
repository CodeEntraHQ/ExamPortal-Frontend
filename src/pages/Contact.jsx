import { useState } from 'react';
import { useNotification } from '../hooks';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import Textarea from '../components/ui/Textarea';

export default function Contact() {
  const { addSuccess, addError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addSuccess('Message sent successfully!');
    } catch {
      addError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-4'>
            Contact Us
          </h1>
          <p className='text-lg text-secondary-600 dark:text-secondary-300'>
            Get in touch with our support team
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <div>
            <h2 className='text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6'>
              Send us a message
            </h2>
            <form className='space-y-6' onSubmit={handleSubmit}>
              <div>
                <Label htmlFor='contactName'>Name</Label>
                <Input id='contactName' type='text' placeholder='Your name' />
              </div>
              <div>
                <Label htmlFor='contactEmail'>Email</Label>
                <Input
                  id='contactEmail'
                  type='email'
                  placeholder='your.email@example.com'
                />
              </div>
              <div>
                <Label htmlFor='contactSubject'>Subject</Label>
                <Input
                  id='contactSubject'
                  type='text'
                  placeholder='What is this about?'
                />
              </div>
              <div>
                <Label htmlFor='contactMessage'>Message</Label>
                <Textarea
                  id='contactMessage'
                  rows={4}
                  placeholder='Your message...'
                />
              </div>
              <Button
                type='submit'
                variant='primary'
                color='primary'
                shadowColor='primary'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          <div>
            <h2 className='text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-6'>
              Get in touch
            </h2>
            <div className='space-y-6'>
              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-primary-600 dark:text-primary-400'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3 8l7.89 4.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='font-semibold text-secondary-900 dark:text-secondary-50'>
                    Email
                  </h3>
                  <p className='text-secondary-600 dark:text-secondary-300'>
                    support@examentra.com
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-primary-600 dark:text-primary-400'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='font-semibold text-secondary-900 dark:text-secondary-50'>
                    Phone
                  </h3>
                  <p className='text-secondary-600 dark:text-secondary-300'>
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-primary-600 dark:text-primary-400'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z'
                    />
                    <path
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='font-semibold text-secondary-900 dark:text-secondary-50'>
                    Address
                  </h3>
                  <p className='text-secondary-600 dark:text-secondary-300'>
                    123 Education Street
                    <br />
                    Learning City, LC 12345
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
