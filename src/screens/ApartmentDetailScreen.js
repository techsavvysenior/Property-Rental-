import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Carousel from 'react-native-reanimated-carousel';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../assets/Colors';
import { ActivityIndicator } from 'react-native';

const ApartmentDetailScreen = ({ route }) => {
  const { apartmentId, index } = route.params;
  const [apartment, setApartment] = React.useState(null);
  const width = Dimensions.get('window').width;
  const navigation = useNavigation();

  React.useEffect(() => {
    const fetchApartment = async () => {
      const doc = await firestore().collection('apartments').doc(apartmentId).get();
      if (doc.exists) {
        setApartment(doc.data());
      }
    };

    fetchApartment();
  }, [apartmentId]);

  if (!apartment) {
    return <ActivityIndicator size='small' color={Colors.blue} />;
  }

  // Helper function to format the Firebase Timestamp to a readable date
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="keyboard-arrow-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Title {index != null ? `#${index + 1}` : ''}
        </Text>

      </View>
      <ScrollView style={{ padding: 10 }}>
        {/* Image Carousel */}
        <View style={{ height: 250, width: '100%' }}>
          <Carousel
            loop
            width={width - 20}
            height={250}
            autoPlay={true}
            data={apartment.images}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item }} style={styles.image} />
              </View>
            )}
          />
        </View>

        {/* Price */}
        <Text style={styles.price}>${apartment.price} / month</Text>

        {/* Description */}
        <Text style={styles.description}>
          Description: {apartment.description || 'No description available'}
        </Text>

        {/* Apartment Info Table with Boxes */}
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableHeader}>Area</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableText}>{apartment.size} FT²</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableHeader}>Bedrooms</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableText}>{apartment.rooms}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableHeader}>Added</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableText}>{formatDate(apartment.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableHeader}>Address</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableText}>{apartment.address || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Rent Button */}
        {apartment.availableToRent ? (
          <View style={styles.rentButton}>
            <Text style={styles.rentButtonText}>Rent</Text>
          </View>
        ) : (
          <View />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    margin: 5,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#000',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  tableText: {
    fontSize: 14,
    color: '#000',
  },
  rentButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 5,
    marginVertical: 20,
    alignItems: 'center',
    width: '65%',
    alignSelf: 'center',
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ApartmentDetailScreen;
