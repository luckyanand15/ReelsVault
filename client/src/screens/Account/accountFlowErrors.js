import routes from '../../routes/routes';
import { ERROR_CODES } from '../../constants/errorCodes';

// The reauth token from the password step expired (10 minutes) or the
// password changed since. Either way the flow has to start over.
export const isReauthRequired = (err) =>
  err?.response?.data?.code === ERROR_CODES.REAUTH_REQUIRED;

// Leaves the flow for Settings, which shows `notice` at the top.
export const exitToSettings = (navigation, resetAccountFlow, notice) => {
  navigation.popTo(routes.Settings, { notice });
  resetAccountFlow();
};
