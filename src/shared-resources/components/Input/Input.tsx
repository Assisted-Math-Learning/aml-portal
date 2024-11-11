import cx from 'classnames';
import React, { FC } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import './Input.scss';
import { InputProps } from '../../types/Input.type';

const Input: FC<InputProps> = ({
  className,
  type,
  onChange,
  onBlur,
  label,
  error,
  centerAlignText,
  acceptSingleCharacter,
  value,
  ...restProps
}) => {
  const onValueChange = (e: any) => {
    if (!onChange) {
      return;
    }
    let val = e.target.value.trim();
    if (acceptSingleCharacter && val.length) {
      val = val[val.length - 1];
    }
    if (type === 'number') {
      val = val.replace(/[^0-9.]/g, '');
      if (val.length) {
        val = +val;
      }
    }
    onChange?.({ ...e, target: { ...e?.target, value: val } });
  };
  return (
    <Box
      component='form'
      className={cx('w-40', className, { '!w-[46px]': acceptSingleCharacter })}
      noValidate
      autoComplete='off'
    >
      <TextField
        label={label}
        error={!!error}
        helperText={error}
        onChange={onValueChange}
        onBlur={onBlur}
        type={type === 'number' ? 'text' : type}
        className={cx('!m-0', {
          'text-align-center': centerAlignText,
          'single-character-input': acceptSingleCharacter,
        })}
        variant='outlined'
        value={value}
        inputProps={{
          autocomplete: restProps.autoComplete,
          form: {
            autocomplete: 'off',
          },
        }}
        {...restProps}
      />
    </Box>
  );
};

export default React.memo(Input);
