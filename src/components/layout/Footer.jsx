import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className='bg-secondary-100 dark:bg-secondary-900 border-t border-primary-200 dark:border-secondary-800'>
      <div className='w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        <div className='xl:grid xl:grid-cols-3 xl:gap-8'>
          <div className='space-y-8 xl:col-span-1'>
            <Link to='/' className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500'>
                <span className='font-bold text-white'>E</span>
              </div>
              <span className='text-xl font-bold text-primary-700 dark:text-primary-400'>
                ExamEntra
              </span>
            </Link>
            <p className='text-secondary-500 dark:text-secondary-400 text-base'>
              Your one-stop solution for managing and taking exams with ease.
            </p>
            <div className='flex space-x-6'>
              <a
                href='#'
                className='text-secondary-400 hover:text-secondary-500'
              >
                <span className='sr-only'>Facebook</span>
                <svg
                  className='h-6 w-6'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
              <a
                href='#'
                className='text-secondary-400 hover:text-secondary-500'
              >
                <span className='sr-only'>Instagram</span>
                <svg
                  className='h-6 w-6'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 0C9.58 0 9.22.01 8.05.058c-1.26.058-2.148.277-2.913.572a6.9 6.9 0 00-2.4 1.626A6.9 6.9 0 001.12 6.16c-.295.765-.514 1.653-.572 2.913C.01 10.22 0 10.58 0 13.1s.01 2.88.058 4.05c.058 1.26.277 2.148.572 2.913a6.9 6.9 0 001.626 2.4 6.9 6.9 0 002.4 1.626c.765.295 1.653.514 2.913.572.97.048 1.32.058 3.85.058s2.88-.01 4.05-.058c1.26-.058 2.148-.277 2.913-.572a6.9 6.9 0 002.4-1.626 6.9 6.9 0 001.626-2.4c.295-.765.514-1.653.572-2.913.048-.97.058-1.32.058-3.85s-.01-2.88-.058-4.05c-.058-1.26-.277-2.148-.572-2.913a6.9 6.9 0 00-1.626-2.4A6.9 6.9 0 0018.04 1.12c-.765-.295-1.653-.514-2.913-.572C14.12.01 13.77 0 11.25 0h.065z'
                    clipRule='evenodd'
                  />
                  <path
                    fillRule='evenodd'
                    d='M12 6.865A5.135 5.135 0 1012 17.135 5.135 5.135 0 0012 6.865zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.338-9.87a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
              <a
                href='#'
                className='text-secondary-400 hover:text-secondary-500'
              >
                <span className='sr-only'>Twitter</span>
                <svg
                  className='h-6 w-6'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
                </svg>
              </a>
            </div>
          </div>
          <div className='mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2'>
            <div className='md:grid md:grid-cols-2 md:gap-8'>
              <div>
                <h3 className='text-sm font-semibold text-secondary-400 tracking-wider uppercase'>
                  Solutions
                </h3>
                <ul className='mt-4 space-y-4'>
                  <li>
                    <Link
                      to='#'
                      className='text-base text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
                    >
                      Exams
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='text-base text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
                    >
                      Analytics
                    </Link>
                  </li>
                </ul>
              </div>
              <div className='mt-12 md:mt-0'>
                <h3 className='text-sm font-semibold text-secondary-400 tracking-wider uppercase'>
                  Support
                </h3>
                <ul className='mt-4 space-y-4'>
                  <li>
                    <Link
                      to='/contact'
                      className='text-base text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='text-base text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
                    >
                      Help
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className='md:grid md:grid-cols-2 md:gap-8'>
              <div>
                <h3 className='text-sm font-semibold text-secondary-400 tracking-wider uppercase'>
                  Company
                </h3>
                <ul className='mt-4 space-y-4'>
                  <li>
                    <Link
                      to='/about'
                      className='text-base text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='text-base text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
                    >
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div className='mt-12 md:mt-0'>
                <h3 className='text-sm font-semibold text-secondary-400 tracking-wider uppercase'>
                  Legal
                </h3>
                <ul className='mt-4 space-y-4'>
                  <li>
                    <Link
                      to='#'
                      className='text-base text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
                    >
                      Policies
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='#'
                      className='text-base text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
                    >
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-12 border-t border-secondary-200 dark:border-secondary-700 pt-8'>
          <p className='text-base text-secondary-400 xl:text-center'>
            &copy; 2024 ExamEntra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
