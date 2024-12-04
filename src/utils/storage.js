import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheApartments = async (apartments) => {
  try {
    await AsyncStorage.setItem('apartments', JSON.stringify(apartments));
  } catch (e) {
    console.log('Failed to cache apartments', e);
  }
};

export const getCachedApartments = async () => {
  try {
    const data = await AsyncStorage.getItem('apartments');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log('Failed to get cached apartments', e);
    return [];
  }
};
