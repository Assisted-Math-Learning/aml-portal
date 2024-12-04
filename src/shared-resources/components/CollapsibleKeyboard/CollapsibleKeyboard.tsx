import React, { useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import cx from 'classnames';
import KeyboardClosedStateIcon from '../../icons/KeyboardClosedStateIcon';
import KeyboardButton from './KeyboardButton';
import { KEYBOARD_KEYS } from '../../../constant/constants';

type Props = {
  onKeyClick?: (key: string) => void;
  onBackSpaceClick?: (bool: boolean) => void;
};

const CollapsibleKeyboard: React.FC<Props> = ({
  onBackSpaceClick,
  onKeyClick,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  const keyboardKeys = useMemo(
    () =>
      KEYBOARD_KEYS.map((key) => (
        <KeyboardButton
          key={key}
          onClick={() => onKeyClick?.(key)}
          onBlur={() => onKeyClick?.('')}
        >
          {key}
        </KeyboardButton>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div
      className='relative lg:h-[379px] lg:w-[389px] h-[330px] w-[320px] overflow-hidden'
      onMouseDown={(e) => e.preventDefault()}
      role='presentation'
    >
      <IconButton
        className={cx('!p-0 absolute top-1/2 -translate-y-1/2', {
          '!hidden': expanded,
          '-right-[calc(100%-73px)]': !expanded,
        })}
        disableRipple
        onClick={toggleExpanded}
        tabIndex={-1}
      >
        <KeyboardClosedStateIcon />
      </IconButton>

      <div
        className={cx(
          'bg-disabled absolute top-1/2 -translate-y-1/2 w-full h-full rounded-tl-[20px] rounded-bl-[20px] flex justify-between items-center py-[30px] lg:pl-[38px] pl-8 lg:pr-[17px] pr-2 transition-all duration-300 ease-in',
          {
            'translate-x-0': expanded,
            'translate-x-full': !expanded,
          }
        )}
      >
        <div className='grid grid-cols-3 gap-2.5'>
          {keyboardKeys}
          <KeyboardButton
            onClick={() => onBackSpaceClick?.(true)}
            onBlur={() => onBackSpaceClick?.(false)}
          >
            <BackspaceOutlinedIcon className='text-[#49454F] !text-4xl' />
          </KeyboardButton>
        </div>

        <IconButton
          className={cx('!p-0 h-fit')}
          disableRipple
          onClick={toggleExpanded}
          tabIndex={-1}
        >
          <PlayArrowRoundedIcon className='!h-16 !w-16 !text-keyboardButtonActiveBg' />
        </IconButton>
      </div>
    </div>
  );
};

export default CollapsibleKeyboard;
