import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../assets/Colors';

const ApartmentCard = ({ apartment, index }) => {
  const thumbnailImage = Array.isArray(apartment.images) && apartment.images.length > 0
    ? apartment.images[0]
    : apartment.images;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Title #{index + 1}</Text>
      </View>

      {thumbnailImage && (
        <Image source={{ uri: String(thumbnailImage) }} style={styles.image} />
      )}

      <View style={styles.info}>
        <Text style={styles.price}>${apartment.price}/mo</Text>

        <View style={styles.verticalSeparator} />

        <Text style={styles.details}>{apartment.rooms} bed</Text>

        <View style={styles.verticalSeparator} />

        <Text style={styles.details}>{apartment.size} FT²</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  verticalSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: Colors.primary

  },
  details: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
});

export default ApartmentCard;
