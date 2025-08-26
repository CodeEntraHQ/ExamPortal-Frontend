const colorMap = {
  primary: 'bg-primary text-white border-primary shadow-primary',
  blue: 'bg-blue-500 text-white border-blue-500 shadow-indigo-600',
  green: 'bg-green-500 text-white border-green-500 shadow-green-600',
  red: 'bg-red-500 text-white border-red-500 shadow-red-600',
  gray: 'bg-gray-200 text-gray-800 border-gray-200 shadow-gray-400',
  white: 'bg-white text-primary border-primary shadow-primary',
};

export default function CommonButton({
  children,
  color = 'primary',
  className = '',
  ...props
}) {
  const base =
    'px-8 py-3 text-lg font-semibold border-2 transition-all duration-200 rounded shadow-[4px_4px_0px_0px] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none';
  return (
    <button
      className={`${base} ${colorMap[color] || ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
