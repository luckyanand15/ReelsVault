import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYCHAIN_OPTIONS = {
  service: 'reelsvault.session',
  // Readable after the first unlock since boot (so a refresh can run while
  // the phone is locked), and never synced to iCloud or restored to another device.
  accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  // Android: Keystore-backed AES without a biometric prompt on every read.
  storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
};

// Where sessions lived before the keychain. Only read to migrate them once.
const LEGACY_KEYS = ['accessToken', 'refreshToken', 'userId'];

export const saveSession = async ({ userId, accessToken, refreshToken }) => {
  const saved = await Keychain.setGenericPassword(
    userId,
    JSON.stringify({ accessToken, refreshToken }),
    KEYCHAIN_OPTIONS,
  );
  if (!saved) {
    throw new Error('Could not save session to secure storage');
  }
};

const migrateLegacySession = async () => {
  const legacy = await AsyncStorage.getMany(LEGACY_KEYS);
  const { accessToken, refreshToken, userId } = legacy;

  if (accessToken && refreshToken && userId) {
    await saveSession({ userId, accessToken, refreshToken });
    await AsyncStorage.removeMany(LEGACY_KEYS);
    return { userId, accessToken, refreshToken };
  }

  // Partial leftovers (e.g. the old userId-only session) can't be used.
  await AsyncStorage.removeMany(LEGACY_KEYS);
  return null;
};

export const loadSession = async () => {
  const credentials = await Keychain.getGenericPassword(KEYCHAIN_OPTIONS);

  if (!credentials) {
    return migrateLegacySession();
  }

  const { accessToken, refreshToken } = JSON.parse(credentials.password);
  return { userId: credentials.username, accessToken, refreshToken };
};

export const clearSession = () => Keychain.resetGenericPassword(KEYCHAIN_OPTIONS);
