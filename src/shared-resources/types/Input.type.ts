import { CSSProperties, ChangeEvent } from 'react';

export interface InputProps {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  type?: 'email' | 'password' | 'text' | 'date' | 'file' | 'number' | 'time';
  className?: string;
  leadingIcon?: any;
  trailingIcon?: any;
  labelClassName?: string;
  style?: CSSProperties;
  disabled?: boolean;
  error?: string;
  showErrorText?: boolean;
  centerAlignText?: boolean;
  acceptSingleCharacter?: boolean;
  value?: any;
  autoComplete?: string;
}
