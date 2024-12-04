import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../assets/Colors';

const ListScreenHeader = ({ onFilterPress }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Apartments</Text>
      <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
        <Text style={styles.filterText}>Filter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#b3b3b3',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute', 
    left: 0,
    right: 0,
    textAlign: 'center',
    color: Colors.primary
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  filterText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListScreenHeader;
