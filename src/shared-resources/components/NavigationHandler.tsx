/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const location = useLocation();

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
      localStorage.setItem(
        `${questionSet.identifier}_${Date.now()}`,
        'STARTING INTERMEDIATE SYNC'
      );
      console.log(
        `${
          questionSet.identifier
        }_${Date.now()} STARTING INTERMEDIATE SYNC ${new Date().toDateString()}`
      );
      dispatch(syncLearnerResponse(learnerId, questionSet.identifier));
    }
  };

  const clearCallBackQueue = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (location.pathname.includes('login')) {
      clearCallBackQueue();
    }
  }, [location]);

  useEffect(
    () => () => {
      clearCallBackQueue();
    },
    []
  );

  useEffect(() => {
    if (
      learnerId &&
      questionSet &&
      !timeoutRef.current &&
      !intervalRef.current
    ) {
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(syncLearnerResponseData, 120000);
        syncLearnerResponseData();
      }, 120000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnerId, questionSet]);

  return <>{children}</>; // Render the children
};

export default NavigationHandler;
