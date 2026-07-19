import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import Categories from '../../components/Categories/Categories';
import styles from './Dashboard.styles';

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header />
      <Categories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <View style={styles?.content}>
        <Text style={styles?.text}>Welcome to Reels Vault</Text>
      </View>
    </SafeAreaView>
  );
}
