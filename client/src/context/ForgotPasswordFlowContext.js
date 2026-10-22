import React, { createContext, useContext, useMemo, useState } from 'react';

export const ForgotPasswordStep = {
  Email: 0,
  Otp: 1,
  Reset: 2,
};

const initialForgotPasswordData = {
  email: '',
  // When the last code was requested for `email`. Lets the email screen skip
  // re-requesting (and hitting the server's 30s cooldown) when the user goes
  // back and continues with the same address.
  otpSentAt: null,
  resetToken: '',
};

const ForgotPasswordFlowContext = createContext(null);

export function ForgotPasswordFlowProvider({ children }) {
  const [forgotPasswordData, setForgotPasswordData] = useState(initialForgotPasswordData);
  const [currentStep, setCurrentStep] = useState(ForgotPasswordStep.Email);

  const value = useMemo(
    () => ({
      forgotPasswordData,
      canAccessStep: (step) => currentStep >= step,
      continueWithEmail: ({ email, otpSentAt }) => {
        setForgotPasswordData({ ...initialForgotPasswordData, email, otpSentAt });
        setCurrentStep(ForgotPasswordStep.Otp);
      },
      markOtpResent: () => {
        setForgotPasswordData((currentData) => ({
          ...currentData,
          otpSentAt: Date.now(),
        }));
      },
      confirmOtp: ({ resetToken }) => {
        setForgotPasswordData((currentData) => ({ ...currentData, resetToken }));
        setCurrentStep(ForgotPasswordStep.Reset);
      },
      // Also used when the reset token is rejected, so the user starts over
      // with a fresh code instead of being stuck on the password screen.
      resetForgotPasswordFlow: () => {
        setForgotPasswordData(initialForgotPasswordData);
        setCurrentStep(ForgotPasswordStep.Email);
      },
    }),
    [currentStep, forgotPasswordData],
  );

  return (
    <ForgotPasswordFlowContext.Provider value={value}>
      {children}
    </ForgotPasswordFlowContext.Provider>
  );
}

export function useForgotPasswordFlow() {
  const context = useContext(ForgotPasswordFlowContext);
  if (!context) {
    throw new Error('useForgotPasswordFlow must be used within a ForgotPasswordFlowProvider');
  }
  return context;
}
