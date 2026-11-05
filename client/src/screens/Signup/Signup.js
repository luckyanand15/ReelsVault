import React, { useState } from 'react';
import { View } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { useSignupFlow } from '../../context/SignupFlowContext';
import styles from './Signup.styles';

export default function Signup({ navigation }) {
  const { continueWithFirstName } = useSignupFlow();
  const [firstName, setFirstName] = useState('');
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

    continueWithFirstName({ firstName: firstName.trim() });
    navigation.navigate(routes.SignupLastName);
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
      <AuthHeading step="Step 1 of 5" title={'What\'s your\nfirst name?'}>
        Enter your first name to get started.
      </AuthHeading>

      <View style={styles?.fields}>
        <TextField
          label="First Name"
          required
          error={error}
          value={firstName}
          onChangeText={handleFirstNameChange}
          placeholder="Enter your first name"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          autoFocus
          onSubmitEditing={handleArrowPress}
          submitBehavior="submit"
        />
      </View>
    </AuthLayout>
  );
}
