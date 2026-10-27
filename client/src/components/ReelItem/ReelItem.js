import React, { memo } from 'react';
import { Text, View, TouchableOpacity, Linking } from 'react-native';
import styles from './ReelItem.styles';

const getHost = url =>
  url?.match(/^https?:\/\/(?:www\.)?([^/?#]+)/i)?.[1] || url;

function ReelItem({ reel, icon }) {
  const handlePress = () => {
    Linking.openURL(reel?.url).catch(error => {
      console.error('Failed to open reel:', error?.message);
    });
  };

  return (
    <TouchableOpacity
      style={styles?.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles?.icon}>{icon || '🎬'}</Text>
      <View style={styles?.textContainer}>
        <Text style={styles?.title} numberOfLines={2}>
          {reel?.title}
        </Text>
        <Text style={styles?.host} numberOfLines={1}>
          {getHost(reel?.url)}
        </Text>
      </View>
      <Text style={styles?.arrow}>›</Text>
    </TouchableOpacity>
  );
}

export default memo(ReelItem);
