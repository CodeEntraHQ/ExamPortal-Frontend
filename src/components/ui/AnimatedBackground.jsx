export default function AnimatedBackground({ children, className = '' }) {
  return (
    <section
      className={`relative bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800 overflow-hidden ${className}`}
    >
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -inset-[20px]'>
          {/* Floating orbs - evenly distributed across entire background */}
          {/* Top row */}
          <div className='absolute w-48 h-48 rounded-full top-1/8 left-1/8 bg-primary-300/30 dark:bg-primary-600/30 blur-2xl animate-float'></div>
          <div className='absolute w-56 h-56 rounded-full top-1/8 left-1/2 bg-secondary-400/25 dark:bg-secondary-600/25 blur-2xl animate-float2'></div>
          <div className='absolute rounded-full w-44 h-44 top-1/8 right-1/8 bg-primary-200/20 dark:bg-primary-700/20 blur-2xl animate-float3'></div>

          {/* Middle row */}
          <div className='absolute w-64 h-64 rounded-full top-1/2 left-1/6 bg-secondary-300/30 dark:bg-secondary-500/30 blur-2xl animate-float'></div>
          <div className='absolute rounded-full w-52 h-52 top-1/2 right-1/6 bg-primary-400/25 dark:bg-primary-500/25 blur-2xl animate-float2'></div>

          {/* Bottom row */}
          <div className='absolute rounded-full w-60 h-60 bottom-1/8 left-1/4 bg-secondary-200/25 dark:bg-secondary-700/25 blur-2xl animate-float3'></div>
          <div className='absolute w-48 h-48 rounded-full bottom-1/8 right-1/4 bg-primary-300/20 dark:bg-primary-600/20 blur-2xl animate-float'></div>

          {/* Center area */}
          <div className='absolute w-40 h-40 rounded-full top-1/3 left-1/3 bg-secondary-400/20 dark:bg-secondary-600/20 blur-2xl animate-float2'></div>
          <div className='absolute rounded-full w-36 h-36 top-2/3 right-1/3 bg-primary-200/15 dark:bg-primary-700/15 blur-2xl animate-float3'></div>
        </div>
      </div>
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-200/50 dark:from-primary-800/40 via-transparent to-transparent'></div>
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-100/50 dark:from-secondary-800/40 via-transparent to-transparent'></div>

      {/* Content */}
      <div className='relative z-10 flex items-center justify-center h-full'>
        {children}
      </div>
    </section>
  );
}
