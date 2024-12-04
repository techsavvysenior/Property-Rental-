import React, { useContext, useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ApartmentCard from '../components/ApartmentCard';
import { getCachedApartments, cacheApartments } from '../utils/storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const ProfileScreen = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();
  const { signOut } = useAuth();

  const fetchUserApartments = async () => {
    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) {
        alert('User not signed in');
        setLoading(false);
        return;
      }

      setUserInfo({
        email: user.email,
        createdAt: new Date(user.metadata.creationTime).toLocaleDateString(),
      });

      const snapshot = await firestore()
        .collection('apartments')
        .where('userId', '==', user.uid)
        .get();

      const data = snapshot.docs.map(doc => {
        const apartmentData = { id: doc.id, ...doc.data() };
        if (!apartmentData.images) {
          apartmentData.images = [];
        } else if (!Array.isArray(apartmentData.images)) {
          apartmentData.images = [apartmentData.images];
        }
        return apartmentData;
      });

      setApartments(data);
      cacheApartments(data);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      alert('Failed to fetch apartments');
      const cachedData = await getCachedApartments();
      setApartments(cachedData);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserApartments();
    }, [])
  );

  const handleEditApartment = (apartment) => {
    navigation.navigate('AddApartment', { apartment });
  };

  const handleDeleteApartment = async (apartmentId) => {
    try {
      await firestore().collection('apartments').doc(apartmentId).delete();
      setApartments((prev) => prev.filter(apartment => apartment.id !== apartmentId));
      alert('Apartment deleted successfully');
    } catch (error) {
      console.error('Error deleting apartment:', error);
      alert('Failed to delete apartment');
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this apartment?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => handleDeleteApartment(id)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {userInfo && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Email: {userInfo.email}</Text>
          <Text style={styles.userInfoText}>Login Date: {userInfo.createdAt}</Text>
        </View>
      )}

      {loading ? (
        <Text>Loading...</Text>
      ) : apartments.length === 0 ? (
        <Text style={styles.noApartmentsText}>No apartments added</Text>
      ) : (
        <FlatList
          data={apartments}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.apartmentCardContainer}>
              <TouchableOpacity onPress={() => handleEditApartment(item)}>
                <ApartmentCard apartment={item} index={index} />
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => handleEditApartment(item)} style={styles.editButton}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  userInfo: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noApartmentsText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'grey',
  },
  apartmentCardContainer: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  editButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
    flex: 1,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProfileScreen;
