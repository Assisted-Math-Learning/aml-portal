import React from 'react';
import ToggleSwitch from 'shared-resources/components/ToggleSwitch/ToggleSwitch';
import { SupportedLanguages } from 'types/enum';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import { useLanguage } from 'context/LanguageContext';
import MultiLangText from 'shared-resources/components/MultiLangText/MultiLangText';
import { AuthContext } from '../../context/AuthContext';
import ProfileWithMenu from '../../shared-resources/components/ProfileWithMenu/ProfileWithMenu';
import ENV_CONFIG from '../../constant/env.config';

type Props = {
  learnerId?: string;
  username?: string;
};

const Header: React.FC<Props> = ({ learnerId, username }) => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (_: any, checked: boolean) => {
    setLanguage(checked ? SupportedLanguages.kn : SupportedLanguages.en);
  };

  return (
    <div className='py-1 px-4 border-b-[1px] border-black items-center flex justify-between'>
      <div className='flex gap-4 items-center'>
        <img
          src='/assets/logo.svg'
          alt='logo'
          className='h-[64px] w-[64px] rounded-full'
        />
        <p className='font-publicSans text-2xl'>
          AML v{ENV_CONFIG.APP_VERSION ?? '1.0.0'}
        </p>
      </div>
      {!learnerId && (
        <div className='gap-2 flex'>
          <span className='font-semibold'>English</span>
          <ToggleSwitch
            checked={language === SupportedLanguages.kn}
            onChange={handleLanguageChange}
          />
          <MultiLangText
            labelMap={multiLangLabels.kannada}
            enforceLang={SupportedLanguages.kn}
          />
        </div>
      )}
      {learnerId && (
        <AuthContext.Consumer>
          {({ onLogout }) => (
            <ProfileWithMenu
              onLogout={onLogout}
              username={username}
              handleLanguageChange={handleLanguageChange}
              language={language}
            />
          )}
        </AuthContext.Consumer>
      )}
    </div>
  );
};

export default Header;
