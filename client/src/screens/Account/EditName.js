import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import routes from '../../routes/routes';
import { updateName } from '../../api/account.api';
import styles from './EditName.styles';

// Saves straight away: changing your name needs no password or code.
export default function EditName({ navigation, route }) {
  const [firstName, setFirstName] = useState(route?.params?.firstName ?? '');
  const [lastName, setLastName] = useState(route?.params?.lastName ?? '');
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastNameRef = useRef(null);

  const isFirstNameValid = firstName.trim().length > 0;

  const handleFirstNameChange = (text) => {
    setFirstName(text);
    if (error) {
      setError('');
    }
  };

  const handleSave = async () => {
    if (!isFirstNameValid) {
      setError('First name is required.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await updateName({ firstName: firstName.trim(), lastName: lastName.trim() });
      navigation.popTo(routes.Settings, { notice: 'Your name has been updated.' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header onLeftPress={() => navigation?.goBack?.()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles?.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles?.container}>
            <View style={styles?.headerContent}>
              <Text style={styles?.title}>Your name</Text>
              <Text style={styles?.subtitle}>This is how your name appears in ReelsVault.</Text>
            </View>

            <View style={styles?.form}>
              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>
                    First Name <Text style={styles?.star}>*</Text>
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles?.input,
                    firstNameFocused && styles?.inputFocused,
                    !!error && styles?.inputError,
                  ]}
                  value={firstName}
                  onChangeText={handleFirstNameChange}
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => setFirstNameFocused(false)}
                  placeholder="Enter your first name"
                  placeholderTextColor="#A3A3A3"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={50}
                  returnKeyType="next"
                  autoFocus
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  submitBehavior="submit"
                />
                {!!error && <Text style={styles?.errorText}>{error}</Text>}
              </View>

              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>Last Name</Text>
                </View>
                <TextInput
                  ref={lastNameRef}
                  style={[styles?.input, lastNameFocused && styles?.inputFocused]}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                  placeholder="Enter your last name"
                  placeholderTextColor="#A3A3A3"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>
            </View>

            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  (!isFirstNameValid || isSubmitting) && styles?.arrowButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!isFirstNameValid || isSubmitting}
                activeOpacity={0.8}
                accessibilityLabel="Save name"
                accessibilityState={{ disabled: !isFirstNameValid || isSubmitting }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={styles?.arrowIcon?.color} />
                ) : (
                  <Text
                    style={[styles?.arrowIcon, !isFirstNameValid && styles?.arrowIconDisabled]}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
