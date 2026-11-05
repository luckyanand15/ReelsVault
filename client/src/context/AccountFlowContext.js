import React, { createContext, useContext, useMemo, useState } from 'react';

// Which account change the shared password and code screens are part of.
export const AccountFlow = {
  Email: 'email',
  Password: 'password',
};

const initialAccountData = {
  flow: null,
  // From the current-password step; the server needs it for every later step.
  reauthToken: '',
  // Email flow: where the code was sent.
  newEmail: '',
  // When the last code was sent, so the resend timer survives going back.
  otpSentAt: null,
  // Password flow: from the verified code, spent when the password is set.
  changeToken: '',
};

const AccountFlowContext = createContext(null);

export function AccountFlowProvider({ children }) {
  const [accountData, setAccountData] = useState(initialAccountData);

  const value = useMemo(
    () => ({
      accountData,
      startAccountFlow: ({ flow, reauthToken }) => {
        setAccountData({ ...initialAccountData, flow, reauthToken });
      },
      markOtpSent: ({ newEmail, otpSentAt = Date.now() } = {}) => {
        setAccountData((currentData) => ({
          ...currentData,
          newEmail: newEmail ?? currentData.newEmail,
          otpSentAt,
          changeToken: '',
        }));
      },
      confirmPasswordOtp: ({ changeToken }) => {
        setAccountData((currentData) => ({ ...currentData, changeToken }));
      },
      resetAccountFlow: () => setAccountData(initialAccountData),
    }),
    [accountData],
  );

  return (
    <AccountFlowContext.Provider value={value}>
      {children}
    </AccountFlowContext.Provider>
  );
}

export function useAccountFlow() {
  const context = useContext(AccountFlowContext);
  if (!context) {
    throw new Error('useAccountFlow must be used within an AccountFlowProvider');
  }
  return context;
}
