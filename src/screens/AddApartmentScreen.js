import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Image, ScrollView, StyleSheet, Platform, Switch, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import MapView, { Marker } from 'react-native-maps';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import { Icon } from 'react-native-elements';
import { Colors } from '../assets/Colors';

const AddApartmentScreen = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState({ lat: '', long: '' });
  const [availableToRent, setAvailableToRent] = useState(false); 
  const navigation = useNavigation();
  const route = useRoute();
  const apartment = route.params?.apartment;
  const [isUploading, setIsUploading] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(40); 
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (apartment) {
      setSelectedImages(apartment.images || []);
      setSelectedLocation({ lat: apartment.lat, long: apartment.long });
      setRegion({
        latitude: apartment.lat,
        longitude: apartment.long,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setAvailableToRent(apartment.availableToRent || false); // Initialize toggle state
    } else {
      setSelectedImages([]);
      setSelectedLocation({ lat: '', long: '' });
      setRegion({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [apartment]);

  const ApartmentSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    size: Yup.number().min(1, 'Size must be greater than 0').required('Size is required'),
    rooms: Yup.number().min(1, 'At least 1 room required').required('Rooms are required'),
    price: Yup.number().min(1, 'Price must be greater than 0').required('Price is required'),
  });

 
  const getFilePathForPlatform = (response) => {
    if (Platform.OS === 'ios') {
      return response.uri;
    } else {
      return response.path ? "file://" + response.path : response.uri;
    }
  };
  const pickImages = async () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const imageUris = response.assets.map(asset => getFilePathForPlatform(asset));
        const normalizedUris = await Promise.all(imageUris.map(async (uri) => {
          if (Platform.OS === 'ios') {
            const normalizedUri = uri.replace('file://', '');
            const fileExists = await RNFS.exists(normalizedUri);
            if (!fileExists) {
              alert(`File does not exist or cannot be accessed at ${normalizedUri}`);
              return null;
            }
            return normalizedUri;
          }
          return uri;
        }));

        const uploadPromises = normalizedUris.filter(uri => uri !== null).map(uploadImageToFirebase);
        const imageUrls = await Promise.all(uploadPromises);
        const successfulImageUrls = imageUrls.filter(url => url !== null);

        if (successfulImageUrls.length > 0) {
          console.log("successfulImageUrls", successfulImageUrls)
          setSelectedImages((prevImages) => [...successfulImageUrls, ...prevImages]);
          setIsUploading(false);

        } else {
          alert('Failed to upload any images');
        }
      } else {
        console.log('Image selection was canceled or failed.');
      }
    });
  };

  const uploadImageToFirebase = async (imageUri) => {
    if (!imageUri) {
      console.error('Image URI is undefined');
      return null;
    }

    try {
      const user = auth().currentUser;
      if (!user) {
        alert('User not signed in');
        return null;
      }
      setIsUploading(true);
      const filename = `apartment_images/${Date.now()}_${imageUri.substring(imageUri.lastIndexOf('/') + 1)}`;
      const uploadUri = Platform.OS === 'ios' ? 'file://' + imageUri : imageUri;

      const reference = storage().ref(filename);
      reference.cacheControl = 'no-cache';

      const task = reference.putFile(uploadUri);

      return new Promise((resolve, reject) => {
        task.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error('Upload failed:', error.code, error.message);
            reject(null);
          },
          async () => {
            try {
              const downloadUrl = await reference.getDownloadURL();
              console.log('File available at:', downloadUrl);
              resolve(downloadUrl);
            } catch (error) {
              console.error('Failed to retrieve download URL:', error);
              reject(null);
            }
          }
        );
      });
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const addOrUpdateApartment = async (values) => {
    console.log("addOrUpdateApartment", values)
    setLoading(true)

    try {
      const user = auth().currentUser;
      if (!user) {
        alert('User not signed in');
        return;
      }

      const apartmentData = {
        ...values,
        images: selectedImages,
        userId: user.uid,
        availableToRent, 
        createdAt: firestore.FieldValue.serverTimestamp(),
        lat: selectedLocation.lat,
        long: selectedLocation.long

      };

      if (apartment) {
        await firestore().collection('apartments').doc(apartment.id).update(apartmentData);
        alert('Apartment updated successfully');
        setLoading(false)
        navigation.navigate('ApartmentDetailScreen', { apartmentId: apartment.id });
      } else {
        const docRef = await firestore().collection('apartments').add(apartmentData);
        alert('Apartment added successfully');
        setLoading(false)
        navigation.navigate('ApartmentDetailScreen', { apartmentId: docRef.id });

      }
    } catch (error) {
      console.error('Failed to add/update apartment:', error.message);
      alert(`Failed to add/update apartment: ${error.message}`);
    }
  };
  console.log("selectedImages,", selectedImages)
  const imagesPerRow = 3; // Number of images per row
  const imageHeight = 100; // Height of each image

  // Calculate total height based on number of images, ensuring a minimum height of 200
  const totalHeight = Math.max(250, Math.ceil(selectedImages.length / imagesPerRow) * imageHeight);
  const fetchPlaces = async (text) => {
    if (text.length > 2) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=AIzaSyAaUwLnEmLlUS5B_tHjLvesYARTheTktus`
        );
        const data = await response.json();
        setSuggestions(data.predictions);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = async (description, placeId) => {
    setAddress(description);
    setSuggestions([]); // Clear suggestions after selection

    // Fetch place details to get lat and long
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyAaUwLnEmLlUS5B_tHjLvesYARTheTktus`
      );
      const data = await response.json();
      const location = data.result.geometry.location;
      console.log("handleSelect", location)
      setSelectedLocation({ lat: location.lat, long: location.lng });
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };
  const handleDeleteImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages); // Update the images state after deletion
  };

  return (

    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="keyboard-arrow-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add / Edit Apartment</Text>
      </View>
      <ScrollView style={{ padding: 10 }}>

        {loading ? <ActivityIndicator color={Colors.primary} size={'small'} />
          :
          <Formik
            initialValues={{
              description: apartment?.description || '',
              size: apartment?.size || '',
              rooms: apartment?.rooms || '',
              price: apartment?.price || '',
              address: apartment?.address || '',
              lat: selectedLocation.lat || '',
              long: selectedLocation.long || '',
            }}
            validationSchema={ApartmentSchema}
            onSubmit={(values) => addOrUpdateApartment(values)}

          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View style={{ marginBottom: 20 }}>
                <TouchableOpacity style={{
                  height: totalHeight, width: '100%', borderWidth: 2, position: 'relative', padding: 5, marginBottom: 12, borderColor: '#ccc'
                }}
                  onPress={pickImages}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', }}>

                    {selectedImages.map((uri, index) => (
                      <View key={index} style={{ width: '33.33%', height: imageHeight, position: 'relative' }}>
                        <Image
                          source={{ uri }}
                          style={{ width: '100%', height: '100%' }}
                        />
                        {/* Delete button positioned at the top-right corner */}
                        <TouchableOpacity
                          onPress={() => handleDeleteImage(index)}
                          style={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: 15,
                            padding: 5,
                          }}
                        >
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>X</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  {isUploading && (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                      <ActivityIndicator size="large" color={Colors.blue} />
                      <Text style={{ marginTop: 10 }}>Uploading...</Text>
                    </View>
                  )}
                  <Text
                    style={{ position: 'absolute', bottom: 0, left: 2, margin: 5, color: '#000', fontWeight: 'bold', fontSize: 18 }}
                    onPress={pickImages}
                  >
                    Add Photo
                  </Text>
                </TouchableOpacity>


                <Text style={styles.heading}>Description</Text>
                <TextInput
                  placeholder="Description"
                  multiline
                  style={[styles.input, {
                    borderColor: '#ccc',
                    borderWidth: 2,
                    height: descriptionHeight,
                    padding: 10, 
                  }]}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  value={values.description}
                  onContentSizeChange={(event) => {
                    const { contentSize } = event.nativeEvent; 
                    setDescriptionHeight(contentSize.height);
                  }}
                />

                {touched.description && errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                <Text style={styles.heading}>Address</Text>
                <View style={{ flex: 1 }}>

                  <TextInput
                    placeholder="Start typing..."
                    style={styles.input}
                    value={values.address} 
                    onChangeText={(text) => {
                      setAddress(text); 
                      fetchPlaces(text); 
                      setFieldValue('address', text); 
                    }}
                    onBlur={handleBlur('address')}
                  />

                  {suggestions.length > 0 && ( 
                    <FlatList
                      data={suggestions}
                      keyExtractor={(item) => item.place_id}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelect(item.description, item.place_id)}>

                          <Text style={styles.suggestion}>{item.description}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.suggestionsList}
                      nestedScrollEnabled={true} 

                    />
                  )}

                </View>
                {touched.address && errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

                <Text style={styles.heading}>Price / month</Text>

                <TextInput
                  placeholder="$560"
                  style={styles.input}
                  onChangeText={handleChange('price')}
                  onBlur={handleBlur('price')}
                  value={values.price}
                  keyboardType="numeric"
                />
                {touched.price && errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                <Text style={styles.heading}>Floor area</Text>
                <TextInput
                  placeholder="415 FT2"
                  style={styles.input}
                  onChangeText={handleChange('size')}
                  onBlur={handleBlur('size')}
                  value={values.size}
                  keyboardType="numeric"
                />
                {touched.size && errors.size && <Text style={styles.errorText}>{errors.size}</Text>}
                <Text style={styles.heading}>Number of Rooms</Text>
                <TextInput
                  placeholder="2"
                  style={styles.input}
                  onChangeText={handleChange('rooms')}
                  onBlur={handleBlur('rooms')}
                  value={values.rooms}
                  keyboardType="numeric"
                />
                {touched.rooms && errors.rooms && <Text style={styles.errorText}>{errors.rooms}</Text>}

                <View style={styles.toggleContainer}>
                  <Text style={styles.heading}>Available to Rent ?</Text>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[styles.optionBox, availableToRent === true && styles.selectedOption]}
                      onPress={() => {
                        setAvailableToRent(true);
                        setFieldValue('availableToRent', true);
                      }}
                    >
                      <Text style={[styles.optionText, availableToRent == false && { color: Colors.black }]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.optionBox, availableToRent === false && styles.selectedOption]}
                      onPress={() => {
                        setAvailableToRent(false);
                        setFieldValue('availableToRent', false);
                      }}
                    >
                      <Text style={[styles.optionText, availableToRent != false && { color: Colors.black }]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={{ alignSelf: 'center', backgroundColor: Colors.primary, padding: 15, margin: 10, width: '60%', marginTop: 25 }}
                  onPress={handleSubmit}>
                  <Text style={{ color: "#fff", textAlign: 'center' }}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>}

      </ScrollView>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  suggestionsList: {
    width: '100%',
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 2,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  heading: { fontWeight: 'bold', margin: 2, color: '#000', fontSize: 18, marginBottom: 5 },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 300,
  },

  toggleContainer: {
    width: '50%',
  },
  toggleLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: Colors.primary, 
  },
  optionText: {
    fontSize: 16,
    color: Colors.light
  },

});

export default AddApartmentScreen;
