import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import routes from '../../routes/routes';
import { useSignupFlow } from '../../context/SignupFlowContext';
import styles from './Signup.styles';

export default function Signup({ navigation }) {
  const { continueWithName } = useSignupFlow();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [error, setError] = useState('');

  const isFirstNameValid = firstName.trim().length > 0;

  const handleFirstNameChange = (text) => {
    setFirstName(text);
    if (error && text.trim().length > 0) {
      setError('');
    }
  };

  const handleArrowPress = () => {
    if (!isFirstNameValid) {
      setError('First name is required.');
      return;
    }

    continueWithName({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    navigation.navigate(routes.SignupEmail);
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
            {/* Header Content */}
            <View style={styles?.headerContent}>
              <Text style={styles?.stepIndicator}>Step 1 of 3</Text>
              <Text style={styles?.title}>What's your name?</Text>
              <Text style={styles?.subtitle}>
                Enter your first and last name to get started.
              </Text>
            </View>

            {/* Input Form */}
            <View style={styles?.form}>
              {/* First Name Input (Mandatory) */}
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
                  returnKeyType="next"
                />
                {!!error && <Text style={styles?.errorText}>{error}</Text>}
              </View>

              {/* Last Name Input (Optional) */}
              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>Last Name</Text>
                </View>
                <TextInput
                  style={[
                    styles?.input,
                    lastNameFocused && styles?.inputFocused,
                  ]}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                  placeholder="Enter your last name"
                  placeholderTextColor="#A3A3A3"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Footer with Arrow Button */}
            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  !isFirstNameValid && styles?.arrowButtonDisabled,
                ]}
                onPress={handleArrowPress}
                disabled={!isFirstNameValid}
                activeOpacity={0.8}
                accessibilityLabel="Next step"
                accessibilityState={{ disabled: !isFirstNameValid }}
              >
                <Text
                  style={[
                    styles?.arrowIcon,
                    !isFirstNameValid && styles?.arrowIconDisabled,
                  ]}
                >
                  ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
