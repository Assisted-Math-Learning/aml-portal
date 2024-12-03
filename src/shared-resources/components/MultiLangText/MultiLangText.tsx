import { useLanguage } from 'context/LanguageContext';
import React, { ElementType } from 'react';
import { SupportedLanguages } from 'types/enum';

type MultiLangTextProps = React.HTMLAttributes<HTMLElement> & {
  labelMap?: Record<string | 'en', string>;
  component?: ElementType;
  enforceLang?: keyof typeof SupportedLanguages;
};

export const getTranslatedString = (
  language: keyof typeof SupportedLanguages,
  labelMap: Record<string | 'en', string> = {}
) => {
  const text = labelMap[language] ?? labelMap.en;

  return text;
};

const MultiLangText: React.FC<MultiLangTextProps> = ({
  labelMap = {},
  component: Component,
  enforceLang,
  ...props
}) => {
  const { language } = useLanguage();

  const text = getTranslatedString(enforceLang ?? language, labelMap);

  if (!Component) {
    return text;
  }

  return <Component {...props}>{text}</Component>;
};

export default MultiLangText;
