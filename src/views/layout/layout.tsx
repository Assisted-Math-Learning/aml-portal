import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmationDialog from 'shared-resources/components/CustomDialog/ConfirmationDialog';
import { syncLearnerResponse } from 'store/actions/syncLearnerResponse.action';
import { AuthContext } from '../../context/AuthContext';
import { authLogoutAction } from '../../store/actions/auth.action';
import {
  isAuthLoadingSelector,
  learnerIdSelector,
  loggedInUserSelector,
} from '../../store/selectors/auth.selector';
import { webRoutes } from '../../utils/constants/webRoutes.constants';
import Header from './Header';
import {
  isIntermediateSyncInProgressSelector,
  isSyncInProgressSelector,
} from '../../store/selectors/syncResponseSelector';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isUserLoading = useSelector(isAuthLoadingSelector);
  const learnerId = useSelector(learnerIdSelector);
  const userSelector = useSelector(loggedInUserSelector);
  const isSyncing = useSelector(isSyncInProgressSelector);
  const isIntermediateSyncing = useSelector(
    isIntermediateSyncInProgressSelector
  );

  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === '/' && !isUserLoading && !learnerId) {
      navigate(webRoutes.auth.login());
    }
  }, [location, learnerId, isUserLoading, navigate]);

  const syncLearnerResponseData = () => {
    if (learnerId) {
      dispatch(syncLearnerResponse(learnerId));
    }
  };

  const onLogout = () => {
    if (!isSyncing && !isIntermediateSyncing) {
      syncLearnerResponseData();
      dispatch(authLogoutAction());
    } else {
      // TODO: Show toast: Sync in progress
    }
  };

  const handleLogoutClick = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleConfirmLogout = () => {
    onLogout();
    setDialogOpen(false);
  };

  const authContextValue = useMemo(() => ({ onLogout: handleLogoutClick }), []);

  return isUserLoading ? null : (
    <AuthContext.Provider value={authContextValue}>
      <div className='flex flex-col h-full'>
        <Header learnerId={learnerId} username={userSelector?.username} />
        <div className='flex-1'>
          <Outlet />
        </div>

        <ConfirmationDialog
          open={isDialogOpen}
          title='Logout?'
          description='Your progress will be saved automatically'
          onClose={handleCloseDialog}
          onConfirm={handleConfirmLogout}
        />
      </div>
    </AuthContext.Provider>
  );
};

export default Layout;
