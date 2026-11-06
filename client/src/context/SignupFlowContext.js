import React, { createContext, useContext, useMemo, useState } from 'react';

export const SignupStep = {
  FirstName: 0,
  LastName: 1,
  Email: 2,
  Otp: 3,
  Password: 4,
  ConfirmPassword: 5,
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
  // Held only between the two password screens; cleared once the account
  // is created.
  password: '',
  // When the last code was sent to `email`. Lets the email screen skip
  // re-sending (and hitting the server's 30s cooldown) when the user goes
  // back and continues with the same address.
  otpSentAt: null,
};

const SignupFlowContext = createContext(null);

export function SignupFlowProvider({ children }) {
  const [signupData, setSignupData] = useState(initialSignupData);
  const [currentStep, setCurrentStep] = useState(SignupStep.FirstName);

  const value = useMemo(
    () => ({
      signupData,
      canAccessStep: (step) => currentStep >= step,
      // Starts the flow afresh but keeps any last name already typed, so
      // going back to fix the first name doesn't wipe it.
      continueWithFirstName: ({ firstName }) => {
        setSignupData((currentData) => ({
          ...initialSignupData,
          firstName,
          lastName: currentData.lastName,
        }));
        setCurrentStep(SignupStep.LastName);
      },
      continueWithLastName: ({ lastName }) => {
        setSignupData((currentData) => ({
          ...currentData,
          lastName,
        }));
        setCurrentStep(SignupStep.Email);
      },
      continueWithEmail: ({ email, otpSentAt }) => {
        setSignupData((currentData) => ({
          ...currentData,
          userId: '',
          email,
          isEmailVerified: false,
          verificationToken: '',
          password: '',
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
      continueWithPassword: ({ password }) => {
        setSignupData((currentData) => ({
          ...currentData,
          password,
        }));
        setCurrentStep(SignupStep.ConfirmPassword);
      },
      completeSignup: ({ userId }) => {
        setSignupData((currentData) => ({
          ...currentData,
          userId,
          verificationToken: '',
          password: '',
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
