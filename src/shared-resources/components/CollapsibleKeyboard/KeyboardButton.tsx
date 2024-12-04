import React from 'react';
import Button from '../Button/Button';
import './KeyboardButton.scss';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  onBlur?: () => void;
};

const KeyboardButton: React.FC<Props> = ({ children, onClick, onBlur }) => (
  <Button
    className='keyboard-button lg:!h-[75px] !h-[65px] !w-[60px] lg:!w-[70px] !border-none !bg-white !text-black lg:!text-4xl !text-3xl font-semibold !font-quicksand'
    onClick={onClick}
    onBlur={onBlur}
    tabIndex={-1}
  >
    {children}
  </Button>
);

export default KeyboardButton;
