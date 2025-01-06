/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { navigationPathSelector } from 'store/selectors/navigation.selector';
import { syncLearnerResponse } from 'store/actions/syncLearnerResponse.action';

// Define props for NavigationHandler
type NavigationHandlerProps = {
  children: React.ReactNode; // To accept any children passed to the component
};

const NavigationHandler: React.FC<NavigationHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigationPath = useSelector(navigationPathSelector);

  const intervalRef = useRef<any>(null);
  // const timeoutRef = useRef<any>(null);

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
    dispatch(syncLearnerResponse());
  };

  const clearCallBackQueue = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // if (timeoutRef.current) {
    //   clearTimeout(timeoutRef.current);
    //   timeoutRef.current = null;
    // }
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
    // if (
    //   !timeoutRef.current &&
    //   !intervalRef.current &&
    //   !location.pathname.includes('login')
    // ) {
    //   timeoutRef.current = setTimeout(() => {
    //     intervalRef.current = setInterval(syncLearnerResponseData, 120000);
    //     syncLearnerResponseData();
    //   }, 120000);
    // }
    if (!intervalRef.current && !location.pathname.includes('login')) {
      intervalRef.current = setInterval(syncLearnerResponseData, 120000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return <>{children}</>; // Render the children
};

export default NavigationHandler;
