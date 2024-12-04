import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import MapView, { Callout } from 'react-native-maps';
import MapCluster from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
import ApartmentCard from '../components/ApartmentCard';
import { cacheApartments } from '../utils/storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import Filter from '../components/Filter';
import BottomSheet from '@gorhom/bottom-sheet';
import { Icon } from 'react-native-elements';
import ListScreenHeader from '../components/ListScreenHeader';
import firestore from '@react-native-firebase/firestore';
import { Colors } from '../assets/Colors';
import { AuthContext } from '../context/AuthContext';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-root-toast';
const CustomFAB = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon name="add" color={Colors.primary} size={60} />
      </View>
    </TouchableOpacity>
  );
};

const ApartmentListScreen = () => {
  const [apartments, setApartments] = useState([]);
  const [originalApartments, setOriginalApartments] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const navigation = useNavigation();
  const { user, role } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Liststatenetinfo", state)
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);
  const fetchApartments = async () => {
    try {
      const snapshot = await firestore().collection('apartments').orderBy('createdAt', 'desc').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApartments(data);
      setOriginalApartments(data);
      cacheApartments(data);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      fetchApartments();
    }, [])
  );
  const handleApartmentPress = (apartmentId, index) => {
    navigation.navigate('ApartmentDetailScreen', { apartmentId, index });
  };

  const handleAddApartment = () => {
    if (!isConnected) {
      Toast.show('No internet connection. Please check your network settings.', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return; // Early return if there's no internet
    }
    navigation.navigate('AddApartment');
  };

  const toggleView = () => {
    setViewMode(viewMode === 'list' ? 'map' : 'list');
  };

  const handleApplyFilters = (filters) => {
    console.log("handleApplyFilters", filters);
    const { price, area, rooms } = filters;

    const filteredApartments = originalApartments.filter(apartment => {
      const isPriceMatch = price ? (apartment.price >= price[0] && apartment.price <= price[1]) : true;
      const isAreaMatch = area ? (apartment.size >= area[0] && apartment.size <= area[1]) : true; // Assuming `size` is the correct property
      const isRoomsMatch = rooms ? (apartment.rooms >= rooms[0] && apartment.rooms <= rooms[1]) : true;

      console.log(`Apartment ID: ${apartment.id}, isPriceMatch: ${isPriceMatch}, isAreaMatch: ${isAreaMatch}, isRoomsMatch: ${isRoomsMatch}`);

      return isPriceMatch && isAreaMatch && isRoomsMatch;
    });

    console.log("Filtered Apartments:", filteredApartments);
    setApartments(filteredApartments.length > 0 ? filteredApartments : originalApartments);
    setFilterModalVisible(false);
    bottomSheetRef.current?.close();
  };



  const handleResetFilters = () => {
    setApartments(originalApartments);
    setFilterModalVisible(false);
    bottomSheetRef.current?.close();
    console.log("Filters reset to original apartments:", originalApartments);
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
    bottomSheetRef.current?.expand();
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
    bottomSheetRef.current?.close();
  };

  console.log("roleLIst",role)
  return (
    <View style={styles.container}>
      <ListScreenHeader onFilterPress={openFilterModal} />
      {
        filterModalVisible == false ?
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={toggleView}
              style={[styles.toggleButton, viewMode === 'list' ? styles.activeButton : styles.inactiveButton]}
            >
              <Text style={[styles.toggleText, { color: viewMode === 'list' ? Colors.light : Colors.black }]}>
                List View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleView}
              style={[styles.toggleButton, viewMode === 'map' ? styles.activeButton : styles.inactiveButton]}
            >
              <Text style={[styles.toggleText, { color: viewMode === 'map' ? Colors.light : Colors.black }]}>
                Map View
              </Text>
            </TouchableOpacity>
          </View>
          : null
      }

      {
        viewMode === 'list' ? (
          apartments.length > 0 ? (
            <FlatList
              style={{ margin: 10 }}
              data={apartments}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => handleApartmentPress(item.id, index)}>
                  <ApartmentCard apartment={item} index={index} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.noApartmentsContainer}>
              <Text style={styles.noApartmentsText}>No apartments found</Text>
            </View>
          )
        ) : (
          <MapCluster
            region={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            style={styles.map}
          >
            {apartments.map((apartment, index) => (
              <Marker
                key={apartment.id}
                coordinate={{
                  latitude: apartment.lat || 37.78825,
                  longitude: apartment.long || -122.4324,
                }}
              >
                <Callout onPress={() => handleApartmentPress(apartment.id)}>
                  <View style={styles.callout}>
                    <Text style={styles.title}>Title #{index + 1}</Text>
                    <Text style={styles.description}>View ></Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapCluster>
        )
      }

      {
        (role === "realtor" || role === "Realtor") && (
          <CustomFAB
            onPress={() => {
              console.log("isConnected", isConnected);
              if (!isConnected) {
                Toast.show('No internet connection. Please check your network settings.', {
                  duration: Toast.durations.LONG,
                  position: Toast.positions.BOTTOM,
                });
              } else {
                handleAddApartment();
              }
            }}
          />
        )
      }

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => setFilterModalVisible(false)}
        style={{ overflow: 'hidden', borderTopRightRadius: 60, borderWidth: 2, borderTopLeftRadius: 60 }}
      >
        <View style={styles.bottomSheetContent}>
          <Filter
            visible={filterModalVisible}
            onClose={closeFilterModal}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </View>
      </BottomSheet>
    </View>
  );

};

const styles = StyleSheet.create({
  callout: {
    width: 150,
    height: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: Colors.primary,
    margin: 0

  },
  title: {
    fontWeight: 'bold',
  },
  description: {
    color: 'gray',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center'
  },
  toggleButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    position: 'absolute',
    top: 88,
    zIndex: 80,
    right: 5,
  },
  toggleButton: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
  inactiveButton: {
    backgroundColor: '#ddd',
  },
  toggleText: {
    fontWeight: 'bold',
    fontSize: 12
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: Colors.light,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightIcon: {
    marginLeft: 5,
  },

  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  noApartmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noApartmentsText: {
    fontSize: 18,
    color: '#666',
  },
});

export default ApartmentListScreen;
