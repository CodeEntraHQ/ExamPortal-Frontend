import { Link } from 'react-router-dom';

// You can replace these with actual icons from a library like react-icons
const IconPlaceholder = ({ className }) => (
  <div className={`bg-primary-500 rounded-full w-12 h-12 ${className}`}></div>
);

export default function Home() {
  return (
    <div className='bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-50'>
      <main>
        {/* Hero Section */}
        <section className='relative pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-40 lg:pb-24'>
          <div className='absolute inset-0 bg-primary-50 dark:bg-secondary-800 opacity-50'></div>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='lg:grid lg:grid-cols-12 lg:gap-8'>
              <div className='sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left'>
                <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-primary-800 dark:text-primary-300'>
                  The Future of Online Examinations
                </h1>
                <p className='mt-6 max-w-2xl mx-auto text-lg text-secondary-500 dark:text-secondary-400 sm:mt-5 sm:text-xl lg:mx-0'>
                  A seamless, secure, and intuitive platform for students and
                  educators.
                </p>
                <div className='mt-10'>
                  <Link
                    to='#'
                    className='inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition'
                  >
                    Browse Exams
                  </Link>
                </div>
              </div>
              <div className='mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center'>
                <style>
                  {`
                    @keyframes float-up-down {
                      0%, 100% { transform: translateY(0); }
                      50% { transform: translateY(-20px); }
                    }
                    @keyframes float-left-right {
                      0%, 100% { transform: translateX(0); }
                      50% { transform: translateX(-20px); }
                    }
                    .float-up-down { animation: float-up-down 4s ease-in-out infinite; }
                    .float-left-right { animation: float-left-right 5s ease-in-out infinite; }
                  `}
                </style>
                <svg
                  viewBox='0 0 600 400'
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-full h-auto'
                >
                  <defs>
                    <linearGradient
                      id='paint0_linear_1_2'
                      x1='0'
                      y1='0'
                      x2='600'
                      y2='400'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='#16a34a' />
                      <stop offset='1' stopColor='#14532d' />
                    </linearGradient>
                    <radialGradient
                      id='paint1_radial_1_2'
                      cx='0'
                      cy='0'
                      r='1'
                      gradientUnits='userSpaceOnUse'
                      gradientTransform='translate(300 200) rotate(90) scale(200)'
                    >
                      <stop stopColor='white' stopOpacity='0.2' />
                      <stop offset='1' stopColor='white' stopOpacity='0' />
                    </radialGradient>
                    <filter
                      id='shadow'
                      x='-20%'
                      y='-20%'
                      width='140%'
                      height='140%'
                    >
                      <feGaussianBlur in='SourceAlpha' stdDeviation='8' />
                      <feOffset dx='0' dy='4' result='offsetblur' />
                      <feComponentTransfer>
                        <feFuncA type='linear' slope='0.5' />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in='SourceGraphic' />
                      </feMerge>
                    </filter>
                  </defs>
                  <g
                    className='transform hover:scale-105 transition-transform duration-500'
                    style={{
                      transform:
                        'perspective(1000px) rotateY(-10deg) rotateX(10deg)',
                    }}
                  >
                    <rect
                      width='600'
                      height='400'
                      rx='20'
                      fill='url(#paint0_linear_1_2)'
                      filter='url(#shadow)'
                    />
                    <rect
                      width='600'
                      height='400'
                      rx='20'
                      fill='url(#paint1_radial_1_2)'
                    />
                    <g opacity='0.9'>
                      <path
                        d='M150 300L250 200L350 300L450 200'
                        stroke='white'
                        strokeWidth='12'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='float-up-down'
                        style={{ transform: 'translateZ(20px)' }}
                      />
                      <circle
                        cx='100'
                        cy='150'
                        r='30'
                        fill='#4ade80'
                        className='float-left-right'
                        style={{ transform: 'translateZ(40px)' }}
                      />
                      <circle
                        cx='500'
                        cy='150'
                        r='30'
                        fill='#4ade80'
                        className='float-left-right'
                        style={{
                          transform: 'translateZ(40px)',
                          animationDelay: '-2.5s',
                        }}
                      />
                      <rect
                        x='200'
                        y='100'
                        width='200'
                        height='50'
                        rx='10'
                        fill='white'
                        className='float-up-down'
                        style={{
                          transform: 'translateZ(60px)',
                          animationDelay: '-2s',
                        }}
                      />
                      <rect
                        x='220'
                        y='115'
                        width='160'
                        height='20'
                        rx='5'
                        fill='#16a34a'
                        className='float-up-down'
                        style={{
                          transform: 'translateZ(80px)',
                          animationDelay: '-3s',
                        }}
                      />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Category Cards Section */}
        <section className='py-16 sm:py-24 lg:py-32'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-center mb-12 text-primary-800 dark:text-primary-300'>
              Explore by Category
            </h2>
            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
              {['Mathematics', 'Science', 'Engineering', 'Humanities'].map(
                category => (
                  <div
                    key={category}
                    className='bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow'
                  >
                    <IconPlaceholder className='mx-auto mb-4' />
                    <h3 className='text-xl font-bold text-secondary-800 dark:text-secondary-200'>
                      {category}
                    </h3>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Exams Grid Section */}
        <section className='bg-primary-50 dark:bg-secondary-800 py-16 sm:py-24 lg:py-32'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-center mb-12 text-primary-800 dark:text-primary-300'>
              Upcoming Exams
            </h2>
            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className='bg-white dark:bg-secondary-900 rounded-lg shadow-lg p-6'
                >
                  <h3 className='text-lg font-bold text-secondary-800 dark:text-secondary-200'>
                    Exam Subject {i + 1}
                  </h3>
                  <p className='text-sm text-secondary-500 dark:text-secondary-400 mt-1'>
                    Date: 2024-10-{20 + i}
                  </p>
                  <p className='text-sm text-secondary-500 dark:text-secondary-400'>
                    Examiner: Dr. Smith
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className='py-16 sm:py-24 lg:py-32'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-center mb-12 text-primary-800 dark:text-primary-300'>
              How It Works
            </h2>
            <div className='grid grid-cols-1 gap-12 sm:grid-cols-3 text-center'>
              <div>
                <IconPlaceholder className='mx-auto mb-4' />
                <h3 className='text-xl font-bold text-secondary-800 dark:text-secondary-200'>
                  1. Register
                </h3>
                <p className='text-secondary-500 dark:text-secondary-400 mt-2'>
                  Create an account in minutes.
                </p>
              </div>
              <div>
                <IconPlaceholder className='mx-auto mb-4' />
                <h3 className='text-xl font-bold text-secondary-800 dark:text-secondary-200'>
                  2. Take Exam
                </h3>
                <p className='text-secondary-500 dark:text-secondary-400 mt-2'>
                  Choose your exam and start.
                </p>
              </div>
              <div>
                <IconPlaceholder className='mx-auto mb-4' />
                <h3 className='text-xl font-bold text-secondary-800 dark:text-secondary-200'>
                  3. Get Results
                </h3>
                <p className='text-secondary-500 dark:text-secondary-400 mt-2'>
                  Instant results and feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className='bg-primary-50 dark:bg-secondary-800 py-16 sm:py-24 lg:py-32'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-center mb-12 text-primary-800 dark:text-primary-300'>
              What Our Students Say
            </h2>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='bg-white dark:bg-secondary-900 rounded-lg shadow-lg p-8'
                >
                  <div className='flex items-center mb-4'>
                    <img
                      className='w-12 h-12 rounded-full'
                      src={`https://i.pravatar.cc/48?u=student${i}`}
                      alt=''
                    />
                    <div className='ml-4'>
                      <p className='font-bold text-secondary-800 dark:text-secondary-200'>
                        Student Name {i + 1}
                      </p>
                    </div>
                  </div>
                  <p className='text-secondary-500 dark:text-secondary-400'>
                    "This platform is amazing! It's so easy to use and the exams
                    are very well-structured."
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resource/Blog Preview Section */}
        <section className='py-16 sm:py-24 lg:py-32'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-center mb-12 text-primary-800 dark:text-primary-300'>
              Latest Guides & Updates
            </h2>
            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden'
                >
                  <div className='h-48 bg-primary-400'></div>
                  <div className='p-6'>
                    <h3 className='text-lg font-bold text-secondary-800 dark:text-secondary-200'>
                      Blog Post Title {i + 1}
                    </h3>
                    <p className='text-secondary-500 dark:text-secondary-400 mt-2'>
                      A brief description of the blog post goes here.
                    </p>
                    <Link
                      to='#'
                      className='text-primary-500 dark:text-primary-400 font-bold mt-4 inline-block'
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
