import React from 'react';
import { View, Text, TextInput } from 'react-native';
import HardShadow from '../HardShadow/HardShadow';
import { useTheme } from '../../context/ThemeContext';
import styles from './TextField.styles';

// Label + hard-shadowed input (login style) + error text. `labelAccessory`
// sits at the right of the label row (e.g. Show/Hide). Other props go to TextInput.
export default function TextField({
  label,
  required = false,
  error,
  labelAccessory,
  ...inputProps
}) {
  const { colors } = useTheme();

  return (
    <View style={styles?.group}>
      <View style={styles?.labelRow}>
        <Text style={[styles?.label, { color: colors?.fg }]}>
          {label}
          {required && <Text style={{ color: colors?.pinkText }}> *</Text>}
        </Text>
        {labelAccessory}
      </View>

      <HardShadow color={colors?.accent} offset={4} borderRadius={18}>
        <TextInput
          style={[
            styles?.input,
            {
              backgroundColor: colors?.surf,
              borderColor: error ? colors?.pinkText : colors?.outline,
              color: colors?.fg,
            },
          ]}
          placeholderTextColor={colors?.mut}
          selectionColor={colors?.pink}
          cursorColor={colors?.fg}
          {...inputProps}
        />
      </HardShadow>

      {!!error && (
        <Text style={[styles?.errorText, { color: colors?.pinkText }]}>
          {error}
        </Text>
      )}
    </View>
  );
}
