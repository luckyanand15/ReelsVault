import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './Header.styles';

const ThreeDotsIcon = () => (
  <View style={styles?.menuIconContainer}>
    <View style={styles?.dot} />
    <View style={styles?.dot} />
    <View style={styles?.dot} />
  </View>
);

export default function Header({
  title = 'ReelsVault',
  onLeftPress,
  leftIcon,
  onRightPress,
  rightIcon,
  showMenuIcon = false,
}) {
  const renderRightContent = () => {
    if (rightIcon) {
      return rightIcon;
    }
    if (showMenuIcon || onRightPress) {
      return <ThreeDotsIcon />;
    }
    return null;
  };

  const rightContent = renderRightContent();

  return (
    <View style={styles?.container}>
      <View style={styles?.leftContainer}>
        {onLeftPress && (
          <TouchableOpacity
            style={styles?.leftButton}
            onPress={onLeftPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {leftIcon || <Text style={styles?.backIconText}>←</Text>}
          </TouchableOpacity>
        )}
        <Text style={styles?.logoText}>{title}</Text>
      </View>
      {rightContent && (
        <View style={styles?.rightContainer}>
          <TouchableOpacity
            style={styles?.menuButton}
            onPress={onRightPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightContent}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}