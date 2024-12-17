/* eslint-disable func-names, react/no-this-in-sfc,  no-unsafe-optional-chaining, no-lonely-if, jsx-a11y/no-autofocus */
import React from 'react';
import cx from 'classnames';

interface AmlInputProps {
  key?: React.Key | null | undefined;
  name: string | undefined;
  onFocus: (event: any) => void;
  autoFocus?: boolean | undefined;
  value: string | number | readonly string[] | undefined;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
}

const AmlInput: React.FC<AmlInputProps> = (props: AmlInputProps) => {
  const {
    key,
    name,
    onFocus,
    autoFocus,
    value,
    onChange,
    maxLength = 1,
    className,
    disabled,
  } = props;

  return (
    <input
      key={key}
      type='text'
      name={name}
      onFocus={onFocus}
      autoFocus={autoFocus}
      autoComplete='off'
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className={cx(
        'border-2 border-gray-900 rounded-[10px] w-[46px] h-[61px] text-center font-bold text-[36px] focus:outline-none focus:border-primary',
        className
      )}
      onKeyPress={(e) => {
        if (!/[0-9]/.test(e.key)) e.preventDefault();
      }}
      onPaste={(e) => {
        const pasteData = e.clipboardData.getData('text');
        if (!/^[0-9]*$/.test(pasteData)) {
          e.preventDefault(); // Prevent paste if it contains non-numeric characters
        }
      }}
      disabled={disabled}
    />
  );
};

export default AmlInput;
