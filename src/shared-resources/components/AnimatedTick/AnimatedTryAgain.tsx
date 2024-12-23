import React from 'react';

type Props = {};

const AnimatedTryAgain = (props: Props) => (
  <div className='relative flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full'>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='w-12 h-12 text-white'
      style={{ animation: 'spinOnce 1s linear forwards' }}
    >
      <path d='M3 12a9 9 1 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
      <path d='M3 3v5h5' />
    </svg>
  </div>
);

export default AnimatedTryAgain;
