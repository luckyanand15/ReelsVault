import React from 'react';
import { View, Text, TextInput } from 'react-native';
import HardShadow from '../HardShadow/HardShadow';
import { useTheme } from '../../context/ThemeContext';
import styles from './TextField.styles';

// Label + input + error text. `labelAccessory` sits at the right of the label
// row (e.g. Show/Hide). `hint` shows under the input while there's no error.
// `inputRef` reaches the TextInput (e.g. to focus the next field). Other
// props go to TextInput.
// variant: 'login' (outline border, surf fill, accent hard shadow) or
// 'sheet' (quiet line border, bg fill, no shadow: used inside bottom sheets).
// floatingError: the error sits in the space below the field without adding
// to its height, so nothing under the field moves when it appears. The hint
// floats in the same spot, so swapping hint for error doesn't move anything.
export default function TextField({
  label,
  required = false,
  error,
  floatingError = false,
  labelAccessory,
  hint,
  inputRef,
  variant = 'login',
  ...inputProps
}) {
  const { colors } = useTheme();
  const isSheet = variant === 'sheet';

  const input = (
    <TextInput
      ref={inputRef}
      style={[
        styles?.input,
        isSheet && styles?.inputSheet,
        {
          backgroundColor: isSheet ? colors?.bg : colors?.surf,
          borderColor: error
            ? colors?.pinkText
            : isSheet
              ? colors?.line
              : colors?.outline,
          color: colors?.fg,
        },
      ]}
      placeholderTextColor={colors?.mut}
      selectionColor={colors?.pink}
      cursorColor={colors?.fg}
      {...inputProps}
    />
  );

  return (
    <View style={styles?.group}>
      <View style={styles?.labelRow}>
        <Text style={[styles?.label, { color: colors?.fg }]}>
          {label}
          {required && <Text style={{ color: colors?.pinkText }}> *</Text>}
        </Text>
        {labelAccessory}
      </View>

      {isSheet ? (
        input
      ) : (
        <HardShadow color={colors?.accent} offset={4} borderRadius={18}>
          {input}
        </HardShadow>
      )}

      {error ? (
        <Text
          style={[
            styles?.errorText,
            floatingError && styles?.errorTextFloating,
            { color: colors?.pinkText },
          ]}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          style={[
            styles?.hintText,
            floatingError && styles?.errorTextFloating,
            { color: colors?.mut },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
