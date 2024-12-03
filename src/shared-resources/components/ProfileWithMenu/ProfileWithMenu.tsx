import React from 'react';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import './ProfileWithMenu.scss';
import { getUserInitials } from 'shared-resources/utils/helpers';
import { useLanguage } from 'context/LanguageContext';
import { SupportedLanguages } from 'types/enum';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import MultiLangText from '../MultiLangText/MultiLangText';

type Props = {
  onLogout?: () => void;
  username?: string;
};

const ProfileWithMenu: React.FC<Props> = ({ onLogout, username }) => {
  const { language, setLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (_: any, checked: boolean) => {
    setLanguage(checked ? SupportedLanguages.kn : SupportedLanguages.en);
  };

  return (
    <>
      <div className='flex gap-3.5 justify-center items-center'>
        <div className='flex flex-col items-end gap-2 text-base font-medium font-roboto'>
          <p className='max-w-[182px] truncate'>{username}</p>
          {/* <p className='max-w-[182px] truncate text-[#A5A5A5]'>Learner</p> */}
        </div>
        <IconButton
          onClick={handleClick}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          disableRipple
          className='!p-0'
        >
          <Avatar className='!h-[68px] !w-[68px] !bg-primary border-4 border-disabled'>
            {getUserInitials(username || 'U')}
          </Avatar>
        </IconButton>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        className='profile-with-menu'
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            onLogout?.();
            handleClose();
          }}
        >
          <MultiLangText labelMap={multiLangLabels.logout} />
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className='gap-2 flex'>
            English
            <ToggleSwitch
              checked={language === SupportedLanguages.kn}
              onChange={handleLanguageChange}
            />
            <MultiLangText
              labelMap={multiLangLabels.kannada}
              enforceLang={SupportedLanguages.kn}
            />
          </div>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileWithMenu;
