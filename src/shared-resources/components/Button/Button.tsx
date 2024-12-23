/* eslint-disable no-nested-ternary */
import React, { FocusEventHandler } from 'react';
import MatButton from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import cx from 'classnames';

interface Props {
  type?: 'button' | 'submit';
  className?: string;
  onClick?: (e?: any) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  tooltipMessage?: string; // Tooltip message as a prop
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  tabIndex?: number;
  theme?: 'primary' | 'outlined';
}

const Button: React.FC<Props> = ({
  type,
  className,
  children,
  onClick,
  disabled,
  tooltipMessage, // Tooltip message from props
  onBlur,
  tabIndex,
  theme = 'primary',
}) => {
  const button = (
    <MatButton
      type={type}
      onClick={onClick}
      className={cx(
        '!h-[72px] !w-56 !border-4 !border-solid !shadow-none !rounded-[10px] !text-2xl !font-bold active:opacity-[46%] !font-quicksand',
        disabled
          ? '!bg-disabled'
          : theme === 'primary'
          ? '!bg-primary'
          : 'border-primary border-4 !text-primary !bg-white',
        className
      )}
      variant='contained'
      disabled={disabled}
      disableRipple
      onBlur={onBlur}
      tabIndex={tabIndex}
    >
      {children}
    </MatButton>
  );

  return disabled ? (
    <Tooltip
      title={tooltipMessage || ''}
      placement='top'
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: '#ffffff', // White background
            color: '#000000', // Black text color
            fontSize: '14px', // Adjust font size if needed
            padding: '10px 10px', // Padding to increase size
            borderRadius: '8px', // Optional: rounded corners
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Optional: shadow
          },
        },
      }}
    >
      <span className='inline-block w-full h-full'>{button}</span>
    </Tooltip>
  ) : (
    button
  );
};

export default React.memo(Button);
