import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './Header.styles';

export default function Header({ title = 'ReelsVault', onRightPress, rightIcon }) {
  return (
    <View style={styles?.container}>
      <View style={styles?.leftContainer}>
        <Text style={styles?.logoText}>{title}</Text>
      </View>
      {rightIcon && (
        <View style={styles?.rightContainer}>
          <TouchableOpacity onPress={onRightPress} activeOpacity={0.7}>
            {rightIcon}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}