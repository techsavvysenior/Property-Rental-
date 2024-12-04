import React, { createContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // State to store user role

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            setRole(userDoc.data().role); // Set the role from Firestore
            console.log('User role set:', userDoc.data().role); // Add log
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUser(null);
        setRole(null); // Reset role when the user logs out
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, role, navigation) => {
    try {
      const signInMethods = await auth().fetchSignInMethodsForEmail(email);

      if (signInMethods.length > 0) {
        return false; // Email is already in use
      }

      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const currentUser = userCredential.user;

      console.log("signUpData", email, password, role);
      setRole(role);
      await firestore().collection('users').doc(currentUser.uid).set({
        email: currentUser.email,
        role: role,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log('User document created in Firestore');
      navigation.navigate('Tabs');
      return true; // Sign up successful
    } catch (error) {
      console.error('Sign-up error:', error.message);
      return false; // Sign-up failed
    }
  };


  // const signIn = async (email, password) => {
  //   try {
  //     await auth().signInWithEmailAndPassword(email, password);
  //     console.log('User signed in successfully');
  //     return true;
  //   } catch (error) {
  //     console.error('Sign-in error:', error.message);
  //     return false;
  //   }
  // };
  const signIn = async (email, password) => {
    try {
      const signInMethods = await auth().fetchSignInMethodsForEmail(email);

      if (signInMethods.length === 0) {
        console.error('Email does not exist.');
        return false; // Email not registered
      }

      // Email exists, attempt to sign in
      await auth().signInWithEmailAndPassword(email, password);
      console.log('User signed in successfully');
      return true;

    } catch (error) {
      console.error('Sign-in error:', error.message);
      return false;
    }
  };


  const signOut = async () => {
    try {
      await auth().signOut();
      console.log('User signed out successfully');
      setRole(null); // Reset role on sign out
    } catch (error) {
      console.error('Sign-out error:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
