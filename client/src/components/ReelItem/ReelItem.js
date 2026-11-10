import React, { memo, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Linking, Image } from 'react-native';
import Icon from '../Icon/Icon';
import SourceIcon from '../SourceIcon/SourceIcon';
import { useTheme } from '../../context/ThemeContext';
import { reelSource, reelSourceId } from '../../utils/reelSource';
import styles from './ReelItem.styles';

// onThumbnailMissing fires when the reel has no thumbnail or its image fails
// to load (Instagram/TikTok links expire); the parent decides whether to ask
// the server for a fresh one.
// variant 'grid' renders a 9:16 card (source app logo on the thumbnail, title
// and category name below) sized by the parent through `style`; 'list' is the
// full-width row with a category pill and the source app logo (the host
// name for sites without one).
// onLongPress(reel) opens the parent's reel actions. title is the reel's
// title in the category being shown; icon and categoryLabel are that
// category's.
function ReelItem({
  reel,
  title,
  icon,
  categoryLabel,
  onThumbnailMissing,
  onLongPress,
  variant = 'list',
  style,
}) {
  const { colors } = useTheme();
  const isGrid = variant === 'grid';
  const thumbnailUrl = reel?.thumbnailUrl;
  // Remembers which URL failed, so a refreshed URL is tried again on its own.
  const [failedUrl, setFailedUrl] = useState(null);
  const showThumbnail = !!thumbnailUrl && thumbnailUrl !== failedUrl;
  const source = reelSource(reel?.url);
  const sourceId = reelSourceId(reel?.url);

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

  const thumbnail = (
    <View
      style={[
        isGrid ? styles?.gridThumbnail : styles?.thumbnail,
        { backgroundColor: colors?.surf, borderColor: colors?.outline },
      ]}
    >
      {showThumbnail ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles?.thumbnailImage}
          resizeMode="cover"
          onError={handleThumbnailError}
        />
      ) : (
        <Text style={isGrid ? styles?.fallbackIconGrid : styles?.fallbackIcon}>
          {icon || '🎬'}
        </Text>
      )}
      {isGrid && !!sourceId && (
        <View style={styles?.badge}>
          <SourceIcon source={sourceId} size={16} />
        </View>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      style={[
        isGrid
          ? styles?.gridContainer
          : [
              styles?.container,
              { backgroundColor: colors?.surf, borderColor: colors?.line },
            ],
        style,
      ]}
      onPress={handlePress}
      onLongPress={onLongPress ? () => onLongPress(reel) : undefined}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={[title, categoryLabel, source].filter(Boolean).join(', ')}
      accessibilityHint={onLongPress ? 'Long press for options' : undefined}
    >
      {thumbnail}

      {isGrid ? (
        <View style={styles?.gridTextContainer}>
          <Text style={[styles?.gridTitle, { color: colors?.fg }]} numberOfLines={2}>
            {title}
          </Text>
          {!!categoryLabel && (
            <Text style={[styles?.gridCategory, { color: colors?.mut }]} numberOfLines={1}>
              {categoryLabel}
            </Text>
          )}
        </View>
      ) : (
        <>
          <View style={styles?.textContainer}>
            <Text style={[styles?.title, { color: colors?.fg }]} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles?.metaRow}>
              {!!categoryLabel && (
                <View style={[styles?.pill, { backgroundColor: colors?.accent }]}>
                  {!!icon && <Text style={styles?.pillIcon}>{icon}</Text>}
                  <Text
                    style={[styles?.pillText, { color: colors?.ink }]}
                    numberOfLines={1}
                  >
                    {categoryLabel}
                  </Text>
                </View>
              )}
              {sourceId ? (
                <SourceIcon source={sourceId} size={16} />
              ) : (
                <Text style={[styles?.source, { color: colors?.mut }]} numberOfLines={1}>
                  {source}
                </Text>
              )}
            </View>
          </View>
          <Icon name="chevronRight" size={20} color={colors?.mut} />
        </>
      )}
    </TouchableOpacity>
  );
}

export default memo(ReelItem);
