import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header/Header';
import styles from './Settings.styles';
import routes from '../../routes/routes';
import { useAuth } from '../../context/AuthContext';
import { AccountFlow } from '../../context/AccountFlowContext';
import { getMe } from '../../api/auth.api';

function SettingRow({ emoji, title, subtitle, onPress, isLast = false }) {
  return (
    <TouchableOpacity
      style={[styles?.settingItem, !isLast && styles?.settingItemDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles?.itemLeft}>
        <View style={styles?.itemIconContainer}>
          <Text style={styles?.itemIconEmoji}>{emoji}</Text>
        </View>
        <View style={styles?.itemTextContainer}>
          <Text style={styles?.itemTitle}>{title}</Text>
          {!!subtitle && (
            <Text style={styles?.itemSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Text style={styles?.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function Settings({ navigation, route }) {
  const { logout } = useAuth();
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
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Settings" onLeftPress={() => navigation.goBack()} />

      <ScrollView style={styles?.container} contentContainerStyle={styles?.content}>
        {!!notice && (
          <TouchableOpacity
            style={styles?.notice}
            onPress={() => navigation.setParams({ notice: undefined })}
            activeOpacity={0.7}
            accessibilityLabel="Dismiss message"
          >
            <Text style={styles?.noticeText}>{notice}</Text>
            <Text style={styles?.noticeDismiss}>✕</Text>
          </TouchableOpacity>
        )}

        <View style={styles?.section}>
          <Text style={styles?.sectionTitle}>Profile</Text>

          <View style={styles?.sectionCard}>
            <SettingRow
              emoji="👤"
              title="Name"
              subtitle={fullName || ' '}
              onPress={() =>
                navigation.navigate(routes.EditName, {
                  firstName: user?.firstName ?? '',
                  lastName: user?.lastName ?? '',
                })
              }
            />
            <SettingRow
              emoji="✉️"
              title="Email"
              subtitle={user?.email || ' '}
              onPress={() => navigation.navigate(routes.AccountPassword, { flow: AccountFlow.Email })}
            />
            <SettingRow
              emoji="🔒"
              title="Password"
              subtitle="Change your password"
              onPress={() =>
                navigation.navigate(routes.AccountPassword, { flow: AccountFlow.Password })
              }
              isLast
            />
          </View>
        </View>

        <View style={styles?.section}>
          <Text style={styles?.sectionTitle}>Categories</Text>

          <View style={styles?.sectionCard}>
            <TouchableOpacity
              style={styles?.settingItem}
              onPress={() => navigation.navigate(routes.ManageCategories)}
              activeOpacity={0.7}
            >
              <View style={styles?.itemLeft}>
                <View style={styles?.itemIconContainer}>
                  <Text style={styles?.itemIconEmoji}>🏷️</Text>
                </View>
                <View style={styles?.itemTextContainer}>
                  <Text style={styles?.itemTitle}>Manage Category</Text>
                  <Text style={styles?.itemSubtitle}>View and organize your categories</Text>
                </View>
              </View>
              <Text style={styles?.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles?.section}>
          <Text style={styles?.sectionTitle}>Account</Text>

          <View style={styles?.sectionCard}>
            <TouchableOpacity
              style={styles?.settingItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles?.itemLeft}>
                <View style={styles?.itemIconContainer}>
                  <Text style={styles?.itemIconEmoji}>🚪</Text>
                </View>
                <View style={styles?.itemTextContainer}>
                  <Text style={styles?.itemTitle}>Log out</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
