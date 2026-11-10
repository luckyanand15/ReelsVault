import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { useTheme } from '../../context/ThemeContext';
import { updateName } from '../../api/account.api';
import styles from './EditName.styles';

// Saves straight away: changing your name needs no password or code.
export default function EditName({ navigation, route }) {
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState(route?.params?.firstName ?? '');
  const [lastName, setLastName] = useState(route?.params?.lastName ?? '');
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
    <AuthLayout
      circleColor={colors?.accent}
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          icon="check"
          onPress={handleSave}
          active={isFirstNameValid}
          loading={isSubmitting}
          accessibilityLabel="Save name"
        />
      }
    >
      <AuthHeading title={'Your name'}>
        This is how your name appears in ReelsVault.
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
          maxLength={50}
          returnKeyType="next"
          autoFocus
          onSubmitEditing={() => lastNameRef.current?.focus()}
          submitBehavior="submit"
        />

        <TextField
          inputRef={lastNameRef}
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={50}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
      </View>
    </AuthLayout>
  );
}
