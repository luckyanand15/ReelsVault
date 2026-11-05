import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { useSignupFlow } from '../../context/SignupFlowContext';
import styles from './Signup.styles';

export default function Signup({ navigation }) {
  const { continueWithName } = useSignupFlow();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [error, setError] = useState('');
  const lastNameRef = useRef(null);

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

    if (firstNameFocused) {
      lastNameRef.current?.focus();
      return;
    }

    continueWithName({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    navigation.navigate(routes.SignupEmail);
  };

  return (
    <AuthLayout
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isFirstNameValid}
          accessibilityLabel="Next step"
        />
      }
    >
      <AuthHeading step="Step 1 of 4" title={'What\'s your\nname?'}>
        Enter your first and last name to get started.
      </AuthHeading>

      <View style={styles?.fields}>
        {/* First Name (Mandatory) */}
        <TextField
          label="First Name"
          required
          error={error}
          value={firstName}
          onChangeText={handleFirstNameChange}
          onFocus={() => setFirstNameFocused(true)}
          onBlur={() => setFirstNameFocused(false)}
          placeholder="Enter your first name"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          autoFocus
          onSubmitEditing={() => lastNameRef.current?.focus()}
          submitBehavior="submit"
        />

        {/* Last Name (Optional) */}
        <TextField
          inputRef={lastNameRef}
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
        />
      </View>
    </AuthLayout>
  );
}
