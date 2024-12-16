/* eslint-disable jsx-a11y/control-has-associated-label, react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import ContainerLayout from 'shared-resources/components/ContainerLayout/ContainerLayout';
import { ArrowBack, ArrowForward } from '@mui/icons-material'; // Material UI icons for back and next arrows
import QuestionHeader from 'shared-resources/components/QuestionHeader/QuestionHeader';
import Button from 'shared-resources/components/Button/Button';
import { questionsSetSelector } from 'store/selectors/questionSet.selector';
import useEnterKeyHandler from 'hooks/useEnterKeyHandler';
import MultiLangText, {
  getTranslatedString,
} from 'shared-resources/components/MultiLangText/MultiLangText';
import { useLanguage } from 'context/LanguageContext';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';

const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const questionSet = useSelector(questionsSetSelector);
  const [mediaURLs, setMediaURLs] = useState<string[]>([]);
  const [hasWatchedEnough, setHasWatchedEnough] = useState(false);

  const { language } = useLanguage();

  useEffect(() => {
    const urls = questionSet?.contents || [];
    setMediaURLs(urls);
  }, [questionSet]);

  const handleNextClick = () => {
    if (currentVideoIndex < mediaURLs.length - 1) {
      setCurrentVideoIndex((prevIndex) => prevIndex + 1);
      setHasWatchedEnough(false);
    }
  };

  const handleBackClick = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex((prevIndex) => prevIndex - 1);
      setHasWatchedEnough(false);
    }
  };

  const handleProgress = ({ playedSeconds }: any) => {
    if (playedSeconds >= 10 && !hasWatchedEnough) {
      setHasWatchedEnough(true);
    }
  };

  const handleStartClick = () => {
    if (!mediaURLs.length || (!!mediaURLs.length && hasWatchedEnough)) {
      navigate('/questions');
    }
  };

  useEnterKeyHandler(handleStartClick);

  return (
    <>
      {mediaURLs.length ? (
        <div className='flex flex-col h-full pl-20 pr-20'>
          <QuestionHeader
            HeaderText={getTranslatedString(
              language,
              multiLangLabels.instructions
            )}
          />
          <div className='flex flex-col md:flex-row gap-6 items-center md:items-end justify-between p-6 pl-0 overflow-y-auto md:h-[80%] max-h-full'>
            {/* Input container */}
            <div className='w-full h-full md:w-[65%] mt-6 flex flex-col gap-6 md:gap-14 items-center justify-center'>
              {' '}
              <div className='flex items-center justify-between w-full h-full'>
                <button
                  className='text-gray-600 hover:text-gray-800 disabled:opacity-50'
                  onClick={handleBackClick}
                  disabled={currentVideoIndex === 0}
                >
                  <ArrowBack fontSize='large' />
                </button>

                <div className='flex-1 h-full'>
                  <ReactPlayer
                    url={mediaURLs[currentVideoIndex]}
                    playing
                    controls
                    width='100%'
                    height='100%'
                    className='rounded-lg overflow-hidden'
                    onProgress={handleProgress}
                  />
                </div>

                <button
                  className='text-gray-600 hover:text-gray-800 disabled:opacity-50'
                  onClick={handleNextClick}
                  disabled={currentVideoIndex === mediaURLs.length - 1}
                >
                  <ArrowForward fontSize='large' />
                </button>
              </div>
            </div>

            <div className='md:pb-16'>
              <Button
                type='button'
                onClick={handleStartClick}
                tooltipMessage={getTranslatedString(
                  language,
                  multiLangLabels.watch_the_video_to_move_forward
                )}
                disabled={!hasWatchedEnough}
              >
                {getTranslatedString(language, multiLangLabels.next)}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ContainerLayout
          headerText={getTranslatedString(
            language,
            multiLangLabels.instructions
          )}
          content={
            questionSet?.instruction_text ? (
              <p className='text-lg'>{questionSet.instruction_text}</p>
            ) : (
              <div className='text-lg'>
                <MultiLangText
                  component='p'
                  labelMap={multiLangLabels.instructions_for_the_questions}
                />
                <ul>
                  <MultiLangText
                    component='li'
                    labelMap={multiLangLabels.read_each_question_carefully}
                  />
                  <MultiLangText
                    component='li'
                    labelMap={multiLangLabels.select_enter_the_correct_answer}
                  />
                  <MultiLangText
                    component='li'
                    labelMap={
                      multiLangLabels.click_next_to_proceed_to_the_next_question
                    }
                  />
                </ul>
              </div>
            )
          }
          buttonText={getTranslatedString(language, multiLangLabels.next)}
          onButtonClick={handleStartClick}
        />
      )}
    </>
  );
};

export default Instructions;
