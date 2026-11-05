import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import ScreenBackground from '../../components/ScreenBackground/ScreenBackground';
import SettingsGroup, { SettingsRow } from '../../components/SettingsGroup/SettingsGroup';
import Icon from '../../components/Icon/Icon';
import styles from './Settings.styles';
import routes from '../../routes/routes';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AccountFlow } from '../../context/AccountFlowContext';
import { getMe } from '../../api/auth.api';

export default function Settings({ navigation, route }) {
  const { logout } = useAuth();
  const { colors } = useTheme();
  const [user, setUser] = useState(null);

  // Set by the profile screens when they come back here after a change.
  const notice = route?.params?.notice;

  // Refetched on every visit, so a name or email just changed shows up.
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getMe()
        .then((me) => {
          if (isActive) {
            setUser(me);
          }
        })
        .catch((error) => console.error('Failed to load profile:', error?.message));
      return () => {
        isActive = false;
      };
    }, []),
  );

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: routes.Welcome }],
    });
  };

  return (
    <View style={[styles?.root, { backgroundColor: colors?.bg }]}>
      <ScreenBackground variant="inner" circleColor={colors?.yellow} />

      <SafeAreaView style={styles?.safeArea}>
        <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

        <ScrollView
          style={styles?.container}
          contentContainerStyle={styles?.content}
          showsVerticalScrollIndicator={false}
        >
          {!!notice && (
            <TouchableOpacity
              style={[
                styles?.notice,
                { backgroundColor: colors?.surf, borderColor: colors?.accent },
              ]}
              onPress={() => navigation.setParams({ notice: undefined })}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${notice}. Dismiss message`}
            >
              <Text style={[styles?.noticeText, { color: colors?.fg }]}>{notice}</Text>
              <Icon name="close" size={18} strokeWidth={2.8} color={colors?.mut} />
            </TouchableOpacity>
          )}

          <SettingsGroup label="Profile" shadowColor={colors?.accent}>
            <SettingsRow
              icon="user"
              tileColor={colors?.accent}
              title="Name"
              subtitle={fullName || ' '}
              onPress={() =>
                navigation.navigate(routes.EditName, {
                  firstName: user?.firstName ?? '',
                  lastName: user?.lastName ?? '',
                })
              }
            />
            <SettingsRow
              icon="mail"
              tileColor={colors?.cyan}
              title="Email"
              subtitle={user?.email || ' '}
              onPress={() => navigation.navigate(routes.AccountPassword, { flow: AccountFlow.Email })}
            />
            <SettingsRow
              icon="lock"
              tileColor={colors?.yellow}
              title="Password"
              subtitle="Change your password"
              onPress={() =>
                navigation.navigate(routes.AccountPassword, { flow: AccountFlow.Password })
              }
            />
          </SettingsGroup>

          <SettingsGroup label="Categories" shadowColor={colors?.cyan}>
            <SettingsRow
              icon="tag"
              tileColor={colors?.pink}
              title="Manage Category"
              subtitle="View and organize your categories"
              onPress={() => navigation.navigate(routes.ManageCategories)}
            />
          </SettingsGroup>

          <SettingsGroup label="Account" shadowColor={colors?.pink}>
            <SettingsRow
              icon="logout"
              tileColor={colors?.fg}
              iconColor={colors?.bg}
              title="Log out"
              titleColor={colors?.pinkText}
              showChevron={false}
              onPress={handleLogout}
            />
          </SettingsGroup>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
