import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../assets/Colors';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../context/AuthContext';


const SettingsScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation();
    const { role } = useContext(AuthContext);

    const handleSignOut = async () => {
        await signOut();
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="keyboard-arrow-left" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>
            <View style={{ marginTop: '20%' }}>
                <Text style={styles.greeting}>Hello,</Text>
                <Text style={styles.email}>{user ? user.email : 'User not logged in'}</Text>
                {
                    (role === "realtor" || role === "Realtor") && (
                        <TouchableOpacity style={styles.touchableContainer} onPress={() => navigation.navigate('Profile')}>
                            <View style={styles.rowContainer}>
                                <Text style={styles.appName}>My Rentals</Text>
                                <Text style={styles.arrow}>></Text>
                            </View>
                        </TouchableOpacity>
                    )}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 20,
        backgroundColor: '#f5f5f5',
        // justifyContent: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#b3b3b3',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 22,
        color: Colors.black,
        textAlign: 'center',
        flex: 1,
    },
    appName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'left',
        borderBottomWidth: 2,
        borderBottomColor: 'black',
        paddingBottom: 5,
    },
    greeting: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    email: {
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center',
        color: '#555',
    },
    signOutButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 30,
        width: '65%',
        alignSelf: 'center'
    },
    signOutButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    touchableContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    appName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    arrow: {
        fontSize: 16,
        color: '#000',
        paddingLeft: 10,
    },
});

export default SettingsScreen;
