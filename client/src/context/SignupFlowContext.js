import React, { createContext, useContext, useMemo, useState } from 'react';

export const SignupStep = {
  Name: 0,
  Email: 1,
  Otp: 2,
  Password: 3,
};

// Mirrors OTP_TTL_MINUTES on the server: how long a sent code stays usable.
export const OTP_VALID_MS = 10 * 60 * 1000;

// Mirrors SEND_COOLDOWN_SECONDS on the server: minimum gap between sends.
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

const initialSignupData = {
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  isEmailVerified: false,
  verificationToken: '',
  // When the last code was sent to `email`. Lets the email screen skip
  // re-sending (and hitting the server's 30s cooldown) when the user goes
  // back and continues with the same address.
  otpSentAt: null,
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
      continueWithEmail: ({ email, otpSentAt }) => {
        setSignupData((currentData) => ({
          ...currentData,
          userId: '',
          email,
          isEmailVerified: false,
          verificationToken: '',
          otpSentAt,
        }));
        setCurrentStep(SignupStep.Otp);
      },
      markOtpResent: () => {
        setSignupData((currentData) => ({
          ...currentData,
          otpSentAt: Date.now(),
        }));
      },
      confirmEmailVerification: ({ verificationToken }) => {
        setSignupData((currentData) => ({
          ...currentData,
          isEmailVerified: true,
          verificationToken,
        }));
        setCurrentStep(SignupStep.Password);
      },
      completeSignup: ({ userId }) => {
        setSignupData((currentData) => ({
          ...currentData,
          userId,
          verificationToken: '',
        }));
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
