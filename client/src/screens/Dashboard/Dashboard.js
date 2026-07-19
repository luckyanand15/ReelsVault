import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import styles from './Dashboard.styles';

export default function Dashboard() {
  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header />
      <View style={styles?.content}>
        <Text style={styles?.text}>Welcome to Reels Vault</Text>
      </View>
    </SafeAreaView>
  );
}
