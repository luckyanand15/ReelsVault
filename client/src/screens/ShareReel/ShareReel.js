import React, { useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AddReelModal from '../../components/AddReelModal/AddReelModal';
import { ThemeProvider } from '../../context/ThemeContext';
import {
  getRefreshToken,
  setSessionHandlers,
  setSessionTokens,
} from '../../api/axiosClient';
import { createReel } from '../../api/reel.api';
import { createCategory, fetchCategories } from '../../api/category.api';
import { mapCategory } from '../../utils/mapCategory';
import { loadSession, saveSession } from '../../utils/secureSession';

const URL_IN_TEXT = /https?:\/\/\S+/i;

// Finishes the share activity, back to the app that shared the link.
const close = () => BackHandler.exitApp();

// Opened from another app's share sheet (Android, see ShareActivity): just
// the Add Reel drawer, prefilled with the shared link. Registered as its own
// root (index.js), so it needs its own providers.
export default function ShareReel(props) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ShareReelDrawer {...props} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ShareReelDrawer({ sharedText }) {
  // null until loaded, so the drawer doesn't open with no categories.
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // The app may already be running in the background with a session.
        if (!getRefreshToken()) {
          const session = await loadSession();
          if (!session) {
            Alert.alert('Not logged in', 'Open ReelsVault and log in first.', [
              { text: 'OK', onPress: close },
            ], { cancelable: false });
            return;
          }
          setSessionTokens(session);
          setSessionHandlers({
            onTokensRefreshed: tokens =>
              saveSession({ userId: session.userId, ...tokens }),
          });
        }
        const list = await fetchCategories();
        setCategories(list.map(mapCategory));
      } catch (error) {
        console.error('Failed to load categories:', error?.message);
        setCategories([]);
      }
    })();
  }, []);

  const addCategory = async ({ label, icon }) => {
    try {
      const created = mapCategory(await createCategory({ title: label, icon }));
      setCategories(prev => [created, ...prev]);
      return created;
    } catch (error) {
      console.error('Failed to create category:', error?.message);
      return null;
    }
  };

  return (
    <AddReelModal
      visible={categories !== null}
      onClose={close}
      onSave={createReel}
      onAddCategory={addCategory}
      categories={categories || []}
      defaultUrl={sharedText?.match(URL_IN_TEXT)?.[0] || ''}
    />
  );
}
