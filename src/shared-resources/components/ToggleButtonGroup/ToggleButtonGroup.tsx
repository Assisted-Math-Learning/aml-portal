import React from 'react';
import MatToggleButton from '@mui/material/ToggleButton';
import MatToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import './ToggleButtonGroup.scss';
import classNames from 'classnames';
import { ToggleButtonGroupProps } from '../../types/ToggleButtonGroup.type';

const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  options,
  selectedValue,
  setSelectedValue,
  error,
  styles,
}) => {
  const isOdd = options.length % 2 !== 0;

  const renderOption = (option: string) => {
    const parts = option.split(',').map((part) => part.trim());

    return (
      <div className='flex flex-col items-start'>
        {parts.map((part, index) => (
          <span key={index}>{part}</span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <MatToggleButtonGroup
        value={selectedValue}
        exclusive
        onChange={(_, val) => setSelectedValue(val)}
        className='toggle-btn-group !grid grid-cols-2 gap-x-[58px] gap-y-8 justify-self-center'
        aria-errormessage={error}
      >
        {options
          .filter((option) => option !== '')
          .map((option, index) => (
            <MatToggleButton
              key={option}
              value={option}
              className={classNames(
                `w-[236px] !py-2 !border-2 !m-0 !border-black !rounded-2xl !text-4xl !font-semibold !text-black !font-publicSans`,
                isOdd && index === options.length - 1
                  ? 'col-span-2 justify-self-center'
                  : ''
              )}
              disableRipple
              sx={{
                '&.Mui-selected': styles,
              }}
            >
              {renderOption(option)}
            </MatToggleButton>
          ))}
      </MatToggleButtonGroup>

      {error && (
        <p className='text-error text-xs mt-[3px] mx-[14px] font-normal'>
          {error}
        </p>
      )}
    </div>
  );
};

export default ToggleButtonGroup;
