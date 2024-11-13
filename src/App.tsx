import ENV_CONFIG from 'constant/env.config';
import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import store from 'store';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NavigationHandler from 'shared-resources/components/NavigationHandler';
import { ToastContainer } from 'react-toastify';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { errorBoundaryHelper } from './utils/helpers/errorBoundary.helper';
import ErrorFallbackComponent from './utils/components/ErrorFallbackComponent';
import Loader from './shared-resources/components/Loader/Loader';
import RouteWrapper from './RouteWrapper';
import Layout from './views/layout/layout';
import { LAYOUT_ROUTES } from './routes';
import AuthenticatedRouteHOC from './HOC/AuthenticatedRoute';
import UnauthenticatedRouteHOC from './HOC/UnauthenticatedRoute';
import Login from './views/login/Login';
import AML404Component from './utils/components/AML404Component';
import 'react-toastify/dist/ReactToastify.css';

Sentry.init({
  dsn: ENV_CONFIG.VITE_SENTRY_DSN,
  autoSessionTracking: true,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: ENV_CONFIG.APP_ENV,
});

const App: React.FC = () => (
  <Provider store={store}>
    <ToastContainer
      hideProgressBar
      pauseOnFocusLoss={false}
      toastClassName='relative flex p-2 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer font-medium'
    />
    <ErrorBoundary
      FallbackComponent={ErrorFallbackComponent}
      onError={(error, info) => {
        Sentry.captureException(error); // Capture the error in Sentry
        errorBoundaryHelper(error, info); // Your custom error handler
      }}
    >
      <Suspense fallback={<Loader />}>
        <BrowserRouter>
          <NavigationHandler>
            <RouteWrapper>
              <Routes>
                <Route path='/' element={<Layout />}>
                  {LAYOUT_ROUTES.map((route) => (
                    <Route
                      path={route.path}
                      key={route.key}
                      Component={
                        route.component &&
                        AuthenticatedRouteHOC(route.component)
                      }
                    />
                  ))}
                  <Route
                    path='/login'
                    Component={UnauthenticatedRouteHOC(Login)}
                  />
                  <Route path='*' Component={AML404Component} />
                </Route>
              </Routes>
            </RouteWrapper>
          </NavigationHandler>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  </Provider>
);

export default App;
