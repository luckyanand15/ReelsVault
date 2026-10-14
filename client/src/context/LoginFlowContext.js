import React, { createContext, useContext, useMemo, useState } from 'react';

export const LoginStep = {
  Email: 0,
  Password: 1,
};

const initialLoginData = {
  email: '',
};

const LoginFlowContext = createContext(null);

export function LoginFlowProvider({ children }) {
  const [loginData, setLoginData] = useState(initialLoginData);
  const [currentStep, setCurrentStep] = useState(LoginStep.Email);

  const value = useMemo(
    () => ({
      loginData,
      canAccessStep: (step) => currentStep >= step,
      confirmEmailChecked: ({ email }) => {
        setLoginData({ email });
        setCurrentStep(LoginStep.Password);
      },
      resetLoginFlow: () => {
        setLoginData(initialLoginData);
        setCurrentStep(LoginStep.Email);
      },
    }),
    [currentStep, loginData],
  );

  return (
    <LoginFlowContext.Provider value={value}>
      {children}
    </LoginFlowContext.Provider>
  );
}

export function useLoginFlow() {
  const context = useContext(LoginFlowContext);
  if (!context) {
    throw new Error('useLoginFlow must be used within a LoginFlowProvider');
  }
  return context;
}
