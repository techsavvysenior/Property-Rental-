import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For the error icon
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo
import Toast from 'react-native-root-toast';
import { Colors } from '../assets/Colors';

const LoginScreen = () => {
  const { signIn } = React.useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Check internet connectivity on component mount
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password too short').required('Password is required'),
  });
  const handleLogin = async (values) => {
    if (!isConnected) {
      Toast.show('No internet connection. Please check your network settings.', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }

    setLoading(true);
    try {
      const loginSuccess = await signIn(values.email, values.password);

      if (loginSuccess) {
        Toast.show('Login Successful!', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        navigation.navigate('Tabs');
      } else {
        Toast.show('Email does not exist. Please sign up first.', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      }
    } catch (error) {
      Toast.show('Login Failed. Please try again.', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false);
    }
  };


  // const handleLogin = async (values) => {
  //   if (!isConnected) {
  //     Toast.show('No internet connection. Please check your network settings.', {
  //       duration: Toast.durations.LONG,
  //       position: Toast.positions.BOTTOM,
  //     });
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     await signIn(values.email, values.password);
  //     Toast.show('Login Successful!', {
  //       duration: Toast.durations.LONG,
  //       position: Toast.positions.BOTTOM,
  //     });
  //     navigation.navigate('Tabs');
  //   } catch (error) {
  //     Toast.show('Login Failed. Please try again.', {
  //       duration: Toast.durations.LONG,
  //       position: Toast.positions.BOTTOM,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
            <Text style={styles.welcomeText}>Welcome Back</Text>

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={(values) => handleLogin(values)}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
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

                  {/* Login Button */}
                  <TouchableOpacity style={styles.loginButton} onPress={handleSubmit} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color={Colors.light} />
                    ) : (
                      <Text style={styles.loginButtonText}>Login</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>NEW USER? <Text style={{ fontWeight: 'bold' }}>SIGN UP HERE</Text></Text>
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
    borderColor: '#ccc',
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
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 5,
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 7,
    marginBottom: 4
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  registerLink: {
    alignSelf: 'flex-end',
  },
  registerText: {
    fontSize: 14,
    color: '#000',
  },
});

export default LoginScreen;
