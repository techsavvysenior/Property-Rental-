import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-root-toast';
import { Colors } from '../assets/Colors';

const RegisterScreen = () => {
  const { signUp } = React.useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);
  // Validation schema using Yup
  const RegisterSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password too short').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Password confirmation is required'),
    role: Yup.string().required('Role is required'),
  });

  const handleSignup = async (values) => {
    if (!isConnected) {
      Toast.show('No internet connection. Please check your network settings.', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return; // Early return if there's no internet
    }

    try {
      setLoading(true);
      const signUpResult = await signUp(values.email, values.password, values.role, navigation);
      if (signUpResult) {
        Toast.show('Registration Successful!', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        navigation.navigate('Tabs'); // Navigate only if signup was successful
      } else {
        // If signUpResult is false, the email is already in use
        Toast.show('Email already in use. Please try a different email.', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      }
    } catch (error) {
      Toast.show('Registration Failed. Please try again.', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Formik
              initialValues={{ email: '', password: '', confirmPassword: '', role: 'user' }}
              validationSchema={RegisterSchema}
              onSubmit={(values) => handleSignup(values)} // Use signUp here
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <View style={styles.form}>
                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
                      placeholder="Email"
                      placeholderTextColor="#999"
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      value={values.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {touched.email && errors.email && (
                      <Icon name="error" size={20} color="red" style={styles.errorIcon} />
                    )}
                  </View>
                  {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, touched.password && errors.password ? styles.inputError : null]}
                      placeholder="Password"
                      placeholderTextColor="#999"
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      secureTextEntry
                    />
                    {touched.password && errors.password && (
                      <Icon name="error" size={20} color="red" style={styles.errorIcon} />
                    )}
                  </View>
                  {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                  {/* Confirm Password Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, touched.confirmPassword && errors.confirmPassword ? styles.inputError : null]}
                      placeholder="Confirm Password"
                      placeholderTextColor="#999"
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                      secureTextEntry
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Icon name="error" size={20} color="red" style={styles.errorIcon} />
                    )}
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                  {/* Role Selection */}
                  <View style={styles.roleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        values.role === 'user' && styles.selectedRoleButton,
                      ]}
                      onPress={() => setFieldValue('role', 'user')}
                    >
                      <Text style={[styles.roleButtonText, values.role === 'user' && { color: '#fff' }]}>I am looking for apartments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        values.role === 'realtor' && styles.selectedRoleButton,
                      ]}
                      onPress={() => setFieldValue('role', 'realtor')}
                    >
                      <Text style={[styles.roleButtonText, values.role === 'realtor' && { color: '#fff' }]}>I am a realtor</Text>
                    </TouchableOpacity>
                  </View>
                  {touched.role && errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

                  {/* Sign Up Button */}
                  <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit}>
                    {loading ? (
                      <ActivityIndicator color={Colors.light} />
                    ) : (
                      <Text style={styles.signUpButtonText}>Sign up</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
            <TouchableOpacity style={styles.signInLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInText}>ALREADY HAVE AN ACCOUNT? <Text style={{ fontWeight: 'bold' }}>SIGN IN HERE</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '5%',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  errorIcon: {
    marginLeft: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRoleButton: {
    backgroundColor: '#000',
  },
  roleButtonText: {
    color: '#000',
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 5,
    // marginTop:7,
    alignItems: 'center',
    marginTop: 7,
    marginBottom: 4
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  signInLink: {
    // marginTop: 20,
    alignSelf: 'flex-end',
  },
  signInText: {
    fontSize: 14,
    color: '#000',
  },
});

export default RegisterScreen;
