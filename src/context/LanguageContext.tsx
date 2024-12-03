import React, { useEffect, useState } from 'react';
import {
  CONTENT_LANG,
  localStorageService,
} from 'services/LocalStorageService';
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

  useEffect(() => {
    const storedLanguage =
      localStorageService.getLocalStorageValue(CONTENT_LANG);
    if (storedLanguage) {
      setLanguage(storedLanguage as keyof typeof SupportedLanguages);
    }
  }, []);

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
