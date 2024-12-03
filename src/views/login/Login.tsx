/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { fetchCSRFToken } from 'store/actions/csrfToken.action';
import { localStorageService } from 'services/LocalStorageService';
import { authErrorSelector } from 'store/selectors/auth.selector';
import useEnterKeyHandler from 'hooks/useEnterKeyHandler';
import { authLoginAction } from '../../store/actions/auth.action';
import FormikInput from '../../shared-resources/components/Input/FormikInput';
import Button from '../../shared-resources/components/Button/Button';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const errorCode = useSelector(authErrorSelector);
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    if (
      errorCode === 'INVALID_CREDENTIALS' ||
      errorCode === 'LEARNER_NOT_FOUND'
    ) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [errorCode]);

  const csrfTokenDeleted = (attemptCount = 0): boolean => {
    if (attemptCount >= 10) {
      return false;
    }
    if (
      localStorageService.getCSRFToken() ||
      document.cookie.includes('_csrf')
    ) {
      localStorageService.removeCSRFToken();
      document.cookie = '_csrf=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return csrfTokenDeleted(attemptCount + 1);
    }
    return true;
  };

  useEffect(() => {
    localStorageService.removeCSRFToken();
    if (!localStorageService.getCSRFToken()) {
      dispatch(fetchCSRFToken());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialValues = {
    username: '',
    password: '',
  };

  const handleSubmit = (values: { username: string; password: string }) => {
    const loginValues = {
      password: values.password,
      username: values.username?.toLowerCase(),
    };
    dispatch(authLoginAction(loginValues));
  };

  return (
    <div className='flex flex-col h-full pl-20 pr-20'>
      <p className='md:w-[65%] md:text-start text-3xl md:text-4xl font-semibold text-headingTextColor pt-6 pb-4'>
        Welcome to Assisted Math Learning
      </p>

      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={yup.object().shape({
          username: yup.string().required('Username is required'),
          password: yup.string().required('Password is required'),
        })}
        validateOnChange // Disable validation on every keystroke
        validateOnBlur={false} // Validate only when the field loses focus (onBlur)
      >
        {(formikProps) => {
          const areFieldsFilled =
            !!formikProps.values.username && !!formikProps.values.password;
          const handleKeyDown = (event: KeyboardEvent) => {
            event.preventDefault();
            formikProps.handleSubmit();
          };

          useEnterKeyHandler(handleKeyDown, [formikProps.isValid]);

          return (
            <Form className='h-full'>
              <div className='flex flex-col md:flex-row gap-6 items-center md:items-end justify-between p-6 pl-0 overflow-y-auto md:h-[80%] max-h-full'>
                {/* Input container */}
                <div className='w-full h-full md:w-[65%] p-8 border border-black mt-6 flex flex-col gap-6 md:gap-14 items-center justify-center'>
                  {/* Title */}
                  <p className='text-2xl md:text-3xl font-semibold text-headingTextColor py-2 text-center'>
                    LOGIN
                  </p>

                  {/* Username & Password Inputs */}
                  <div className='flex flex-col gap-6 md:gap-8 w-full max-w-96 px-4 md:px-0'>
                    <div className='flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between'>
                      <p className='text-lg md:text-2xl w-full md:w-36 text-headingTextColor'>
                        USERNAME
                      </p>
                      <FormikInput
                        name='username'
                        className='w-full md:w-[236px]'
                        onBlur={formikProps.handleBlur}
                        autoComplete='new-username'
                      />
                    </div>

                    <div className='flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between'>
                      <p className='text-lg md:text-2xl w-full md:w-36 text-headingTextColor'>
                        PASSWORD
                      </p>
                      <FormikInput
                        name='password'
                        type='password'
                        className='w-full md:w-[236px]'
                        onBlur={formikProps.handleBlur}
                        autoComplete='new-password'
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {showError && (
                    <div className='flex flex-col text-sm text-red-500 font-semibold text-center'>
                      <span>Your username or password is incorrect.</span>
                      <span>Please try again.</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className='w-full md:w-auto mt-8 mb-10 md:mt-0 flex justify-center'>
                  <Button
                    type='submit'
                    className='w-[236px]' // Maintaining button size
                    disabled={!areFieldsFilled}
                  >
                    Login
                  </Button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Login;
