import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  CONTENT_LANG,
  localStorageService,
} from 'services/LocalStorageService';
import { learnerIdSelector } from 'store/selectors/auth.selector';
import { supportedLanguages } from 'store/selectors/board.selector';
import { SupportedLanguages } from 'types/enum';

type LanguageContextProps = {
  language: keyof typeof SupportedLanguages;
  setLanguage: React.Dispatch<
    React.SetStateAction<keyof typeof SupportedLanguages>
  >;
};

export const LanguageContext = React.createContext<LanguageContextProps | null>(
  null
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<keyof typeof SupportedLanguages>(
    SupportedLanguages.en
  );

  const supportedLangs = useSelector(supportedLanguages);
  const learnerId = useSelector(learnerIdSelector);

  const handleTopSupportedLanguage = useCallback(
    (storedLanguage: string | null) => {
      const languages = Object.keys(supportedLangs ?? {});

      if (!learnerId && storedLanguage) {
        setLanguage(storedLanguage as keyof typeof SupportedLanguages);
        return;
      }

      if (storedLanguage && languages.includes(storedLanguage)) {
        setLanguage(storedLanguage as keyof typeof SupportedLanguages);
        return;
      }

      if (languages.length > 1) {
        setLanguage(languages[0] as keyof typeof SupportedLanguages);
        return;
      }

      setLanguage(SupportedLanguages.en);
    },
    [learnerId, supportedLangs]
  );

  useEffect(() => {
    const storedLanguage =
      localStorageService.getLocalStorageValue(CONTENT_LANG);
    handleTopSupportedLanguage(storedLanguage);
  }, [handleTopSupportedLanguage]);

  useEffect(() => {
    localStorageService.setLocalStorageValue(CONTENT_LANG, language);
  }, [language]);

  const providerValue = React.useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={providerValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);

  if (context === null) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
