import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'; 

const SplashScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        // Check if user is authenticated or not
        const unsubscribe = auth().onAuthStateChanged((user) => {
            console.log("SplashUSer", user)
            if (user) {
                // User is logged in, navigate to Home (Tabs)
                navigation.replace('Tabs');
            } else {
                // User not logged in, navigate to Login
                navigation.replace('Login');
            }
        });

        // Cleanup the auth state change listener
        return () => unsubscribe();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/splash.png')} 
                style={styles.logo}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', 
    },
    logo: {
        width: '80%',
        height: 140,
        resizeMode: 'contain', 
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 20,
    },
    tagline: {
        fontSize: 18,
        color: '#000',
        marginTop: 10,
    },
});

export default SplashScreen;
