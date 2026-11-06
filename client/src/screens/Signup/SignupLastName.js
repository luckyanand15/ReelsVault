import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { SignupStep, useSignupFlow } from '../../context/SignupFlowContext';
import styles from './Signup.styles';

export default function SignupLastName({ navigation }) {
  const { canAccessStep, continueWithLastName, signupData } = useSignupFlow();
  const canAccessLastNameStep = canAccessStep(SignupStep.LastName);

  const [lastName, setLastName] = useState(signupData?.lastName ?? '');

  useEffect(() => {
    if (!canAccessLastNameStep) {
      navigation.replace(routes.Signup);
    }
  }, [canAccessLastNameStep, navigation]);

  // Last name is optional, so the arrow is always ready to go.
  const handleArrowPress = () => {
    continueWithLastName({ lastName: lastName.trim() });
    navigation.navigate(routes.SignupEmail);
  };

  if (!canAccessLastNameStep) {
    return null;
  }

  return (
    <AuthLayout
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active
          accessibilityLabel="Next step"
        />
      }
    >
      <AuthHeading step="Step 2 of 5" title={'What\'s your\nlast name?'}>
        This is optional — you can skip it.
      </AuthHeading>

      <View style={styles?.fields}>
        <TextField
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
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
