import React, { useCallback, useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import './ProfileWithMenu.scss';
import { getUserInitials } from 'shared-resources/utils/helpers';
import { SupportedLanguages, SupportedLanguagesLabels } from 'types/enum';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import { useSelector } from 'react-redux';
import {
  isBoardLoading,
  supportedLanguages,
} from 'store/selectors/board.selector';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import MultiLangText from '../MultiLangText/MultiLangText';
import Loader from '../Loader/Loader';

type Props = {
  onLogout?: () => void;
  username?: string;
  setLanguage: (language: keyof typeof SupportedLanguages) => void;
  language: keyof typeof SupportedLanguages;
};

const ProfileWithMenu: React.FC<Props> = ({
  onLogout,
  username,
  setLanguage,
  language,
}) => {
  const supportedLangs = useSelector(supportedLanguages);
  const isLoadingBoard = useSelector(isBoardLoading);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const topSupportedLanguages = useMemo(() => {
    const resLangs = [] as (keyof typeof SupportedLanguages)[];
    const languages = Object.keys(supportedLangs ?? {});

    if (!languages.includes(SupportedLanguages.en) && languages.length === 1) {
      resLangs.push(SupportedLanguages.en, ...(languages as typeof resLangs));
      return resLangs;
    }

    const topLanguages = Object.keys(supportedLangs ?? {}).slice(0, 2);

    resLangs.push(...(topLanguages as typeof resLangs));

    return resLangs;
  }, [supportedLangs]);

  const handleLanguageChange = useCallback(
    (_: any, checked: boolean) => {
      if (topSupportedLanguages.length === 2) {
        setLanguage(
          checked ? topSupportedLanguages[1] : topSupportedLanguages[0]
        );
      }
    },
    [setLanguage, topSupportedLanguages]
  );

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
        {isLoadingBoard ||
          (topSupportedLanguages.length === 2 && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <>
                {isLoadingBoard && (
                  <div className='[&_img]:h-10 [&_img]:w-10 w-full flex justify-center'>
                    <Loader />
                  </div>
                )}
                {!isLoadingBoard && (
                  <div className='gap-2 flex'>
                    {SupportedLanguagesLabels[topSupportedLanguages[0]]}
                    <ToggleSwitch
                      checked={language === topSupportedLanguages[1]}
                      onChange={handleLanguageChange}
                    />
                    {SupportedLanguagesLabels[topSupportedLanguages[1]]}
                  </div>
                )}
              </>
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default ProfileWithMenu;
