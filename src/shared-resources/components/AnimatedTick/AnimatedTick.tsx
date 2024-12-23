import React from 'react';

const AnimatedTick = () => (
  <div className='relative flex items-center justify-center w-16 h-16 bg-green-500 rounded-full'>
    <svg
      className='absolute text-white w-12 h-12 stroke-current'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path
        className='path'
        d='M5 12l5 5L20 7'
        style={{
          strokeDasharray: 24,
          strokeDashoffset: 24,
          animation: 'draw 1s ease-out forwards',
        }}
      />
    </svg>
  </div>
);

export default AnimatedTick;
