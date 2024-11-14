/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { navigationPathSelector } from 'store/selectors/navigation.selector';
import { learnerIdSelector } from 'store/selectors/auth.selector';
import { syncLearnerResponse } from 'store/actions/syncLearnerResponse.action';
import {
  isIntermediateSyncInProgressSelector,
  isSyncInProgressSelector,
} from '../../store/selectors/syncResponseSelector';
import { questionsSetSelector } from '../../store/selectors/questionSet.selector';

// Define props for NavigationHandler
type NavigationHandlerProps = {
  children: React.ReactNode; // To accept any children passed to the component
};

const NavigationHandler: React.FC<NavigationHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const learnerId = useSelector(learnerIdSelector);

  const navigationPath = useSelector(navigationPathSelector);
  const isSyncing = useSelector(isSyncInProgressSelector);
  const isIntermediateSyncing = useSelector(
    isIntermediateSyncInProgressSelector
  );

  const questionSet = useSelector(questionsSetSelector);

  useEffect(() => {
    if (navigationPath) {
      navigate(navigationPath); // Perform the navigation
      dispatch({ type: 'CLEAR_NAVIGATION_PATH' }); // Clear the navigation path after navigating
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationPath, navigate]);

  // Function to sync learner response data
  const syncLearnerResponseData = () => {
    if (learnerId && !isSyncing && !isIntermediateSyncing && questionSet) {
      dispatch(syncLearnerResponse(learnerId, questionSet.identifier));
    }
  };

  useEffect(() => {
    // Declare a variable to hold the interval ID
    let intervalId: any | null = null;

    if (learnerId) {
      intervalId = setTimeout(() => {
        const repeatedSyncInterval = setInterval(
          syncLearnerResponseData,
          120000
        );
        syncLearnerResponseData();

        intervalId = repeatedSyncInterval;
      }, 120000);
    }

    return () => {
      if (intervalId) {
        clearTimeout(intervalId);
        clearInterval(intervalId);
      }
    };
  }, [learnerId]);

  return <>{children}</>; // Render the children
};

export default NavigationHandler;
