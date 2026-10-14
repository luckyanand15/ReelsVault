import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  getRefreshToken,
  setSessionHandlers,
  setSessionTokens,
} from '../api/axiosClient';
import { logout as logoutRequest } from '../api/auth.api';
import { resetTo } from '../navigation/navigationRef';
import routes from '../routes/routes';
import * as secureSession from '../utils/secureSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // The refresh handler is registered once, so it reads the user id from a
  // ref rather than a stale closure over state.
  const userIdRef = useRef(null);

  const applySession = useCallback(session => {
    userIdRef.current = session?.userId ?? null;
    setSessionTokens(session);
    setUserId(session?.userId ?? null);
  }, []);

  const clearSession = useCallback(async () => {
    applySession(null);
    await secureSession.clearSession();
  }, [applySession]);

  useEffect(() => {
    setSessionHandlers({
      onTokensRefreshed: tokens =>
        secureSession.saveSession({ userId: userIdRef.current, ...tokens }),
      onSessionExpired: () => {
        clearSession().catch(error =>
          console.error('Failed to clear session:', error?.message),
        );
        resetTo(routes.Welcome);
      },
    });

    (async () => {
      try {
        const session = await secureSession.loadSession();
        if (session) {
          applySession(session);
        }
      } catch (error) {
        console.error('Failed to restore session:', error?.message);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => setSessionHandlers(null);
  }, [applySession, clearSession]);

  const authLogin = async ({ user, accessToken, refreshToken }) => {
    if (!user?.id || !accessToken || !refreshToken) {
      return;
    }
    const session = { userId: user.id, accessToken, refreshToken };
    await secureSession.saveSession(session);
    applySession(session);
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Best effort: revoke server-side, but never block logging out locally
      // just because the network is down.
      await logoutRequest(refreshToken).catch(error =>
        console.error('Failed to revoke session:', error?.message),
      );
    }
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ userId, isLoading, authLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
