import React, { createContext, useContext, useMemo, useState } from 'react';

export const SignupStep = {
  Name: 0,
  Email: 1,
  Otp: 2,
  Pin: 3,
};

const initialSignupData = {
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  isEmailVerified: false,
};

const SignupFlowContext = createContext(null);

export function SignupFlowProvider({ children }) {
  const [signupData, setSignupData] = useState(initialSignupData);
  const [currentStep, setCurrentStep] = useState(SignupStep.Name);

  const value = useMemo(
    () => ({
      signupData,
      canAccessStep: (step) => currentStep >= step,
      continueWithName: ({ firstName, lastName }) => {
        setSignupData({
          ...initialSignupData,
          firstName,
          lastName,
        });
        setCurrentStep(SignupStep.Email);
      },
      continueWithEmail: ({ email }) => {
        setSignupData((currentData) => ({
          ...currentData,
          userId: '',
          email,
          isEmailVerified: false,
        }));
        setCurrentStep(SignupStep.Otp);
      },
      confirmEmailVerification: ({ userId }) => {
        setSignupData((currentData) => ({
          ...currentData,
          userId,
          isEmailVerified: true,
        }));
        setCurrentStep(SignupStep.Pin);
      },
    }),
    [currentStep, signupData],
  );

  return (
    <SignupFlowContext.Provider value={value}>
      {children}
    </SignupFlowContext.Provider>
  );
}

export function useSignupFlow() {
  const context = useContext(SignupFlowContext);
  if (!context) {
    throw new Error('useSignupFlow must be used within a SignupFlowProvider');
  }
  return context;
}
