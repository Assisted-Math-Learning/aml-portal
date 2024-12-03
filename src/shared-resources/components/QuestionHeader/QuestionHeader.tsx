import React from 'react';

interface QuestionheaderProps {
  HeaderText: string;
}

const QuestionHeader: React.FC<QuestionheaderProps> = (
  props: QuestionheaderProps
) => {
  const { HeaderText } = props;
  return (
    <div>
      <p className='md:w-[65%] md:text-start text-3xl md:text-4xl font-semibold text-headingTextColor pt-6 -mb-1'>
        {HeaderText}
      </p>
    </div>
  );
};

export default QuestionHeader;
