import React from 'react';
import ToggleSwitch from 'shared-resources/components/ToggleSwitch/ToggleSwitch';
import { SupportedLanguages, SupportedLanguagesLabels } from 'types/enum';
import { useLanguage } from 'context/LanguageContext';
import {
  CONTENT_LANG,
  localStorageService,
} from 'services/LocalStorageService';
import { AuthContext } from '../../context/AuthContext';
import ProfileWithMenu from '../../shared-resources/components/ProfileWithMenu/ProfileWithMenu';

type Props = {
  learnerId?: string;
  username?: string;
};

const storedLanguage = (localStorageService.getLocalStorageValue(
  CONTENT_LANG
) ?? SupportedLanguages.en) as keyof typeof SupportedLanguages;

const Header: React.FC<Props> = ({ learnerId, username }) => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (_: any, checked: boolean) => {
    setLanguage(
      checked ? SupportedLanguages[storedLanguage] : SupportedLanguages.en
    );
  };

  return (
    <div className='py-4 w-[70px] border-r-[1px] border-black items-center flex flex-col justify-between'>
      <div className='flex gap-4 items-center'>
        <img
          src='/assets/logo.svg'
          alt='logo'
          className='h-[60px] w-[60px] rounded-full'
        />
      </div>
      {!learnerId && storedLanguage !== SupportedLanguages.en && (
        <div className='gap-2 flex absolute right-28 pt-2'>
          <span className='font-semibold'>English</span>
          <ToggleSwitch
            checked={language === storedLanguage}
            onChange={handleLanguageChange}
          />
          <span>{SupportedLanguagesLabels[storedLanguage]}</span>
        </div>
      )}
      {learnerId && (
        <AuthContext.Consumer>
          {({ onLogout }) => (
            <ProfileWithMenu
              onLogout={onLogout}
              setLanguage={setLanguage}
              username={username}
              language={language}
            />
          )}
        </AuthContext.Consumer>
      )}
    </div>
  );
};

export default Header;
