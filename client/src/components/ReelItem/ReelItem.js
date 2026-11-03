import React, { memo, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Linking, Image } from 'react-native';
import styles from './ReelItem.styles';

const getHost = url =>
  url?.match(/^https?:\/\/(?:www\.)?([^/?#]+)/i)?.[1] || url;

// onThumbnailMissing fires when the reel has no thumbnail or its image fails
// to load (Instagram/TikTok links expire); the parent decides whether to ask
// the server for a fresh one.
function ReelItem({ reel, icon, onThumbnailMissing }) {
  const thumbnailUrl = reel?.thumbnailUrl;
  // Remembers which URL failed, so a refreshed URL is tried again on its own.
  const [failedUrl, setFailedUrl] = useState(null);
  const showThumbnail = !!thumbnailUrl && thumbnailUrl !== failedUrl;

  useEffect(() => {
    if (!thumbnailUrl) {
      onThumbnailMissing?.(reel);
    }
    // Only re-check when the thumbnail itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnailUrl]);

  const handleThumbnailError = () => {
    setFailedUrl(thumbnailUrl);
    onThumbnailMissing?.(reel);
  };

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
      <View style={styles?.thumbnail}>
        {showThumbnail ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles?.thumbnailImage}
            resizeMode="cover"
            onError={handleThumbnailError}
          />
        ) : (
          <Text style={styles?.icon}>{icon || '🎬'}</Text>
        )}
      </View>
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
