import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import ManageCategories from '../ManageCategories/ManageCategories';
import styles from './Settings.styles';

export default function Settings({
  categories = [],
  onUpdateCategories,
  onBack,
}) {
  const [currentView, setCurrentView] = useState('main');

  if (currentView === 'manageCategories') {
    return (
      <ManageCategories
        categories={categories}
        onUpdateCategories={onUpdateCategories}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Settings" onLeftPress={onBack} />

      <ScrollView style={styles?.container} contentContainerStyle={styles?.content}>
        <View style={styles?.section}>
          <Text style={styles?.sectionTitle}>Categories</Text>

          <View style={styles?.sectionCard}>
            <TouchableOpacity
              style={styles?.settingItem}
              onPress={() => setCurrentView('manageCategories')}
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
      </ScrollView>
    </SafeAreaView>
  );
}
