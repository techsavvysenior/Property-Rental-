import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Colors } from '../assets/Colors';

const Filter = ({ visible, onClose, onApply, onReset }) => {
    const [price, setPrice] = useState([0, 4999]);
    const [area, setArea] = useState([0, 4999]);
    const [rooms, setRooms] = useState([0, 9]);

    const handleApply = () => {
        onApply({ price, area, rooms });
        onClose();
    };

    const handleReset = () => {
        setPrice([0, 4999]);
        setArea([0, 4999]);
        setRooms([0, 9]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={{ flex: 1 }}>
                    <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Filters</Text>
                <View style={{ flex: 1 }} />
            </View>

            {/* Price Filter */}
            <Text style={styles.label}>Price / month</Text>
            <MultiSlider
                values={[price[0], price[1]]}
                min={0}
                max={4999}
                step={50}
                onValuesChange={setPrice}
                sliderLength={330}
                selectedStyle={{ backgroundColor: 'black' }}
                unselectedStyle={{ backgroundColor: 'gray' }}
                trackStyle={{ backgroundColor: 'black' }}
                thumbStyle={{ backgroundColor: 'black', width: 25, height: 25, borderRadius: 15 }} // Round thumb
                markerStyle={{ backgroundColor: 'black', width: 25, height: 25, borderRadius: 15 }} // Round marker
            />
            <View style={styles.sliderContainer}>
                <Text style={styles.valueText}>${price[0]}</Text>
                <Text style={styles.valueText}>${price[1]}</Text>
            </View>

            {/* Area Filter */}
            <Text style={styles.label}>Area</Text>
            <MultiSlider
                values={[area[0], area[1]]}
                min={0}
                max={4999}
                step={50}
                onValuesChange={setArea}
                sliderLength={330}
                selectedStyle={{ backgroundColor: 'black' }}
                unselectedStyle={{ backgroundColor: 'gray' }}
                trackStyle={{ backgroundColor: 'black' }}
                thumbStyle={{ backgroundColor: 'black', width: 25, height: 25, borderRadius: 15 }} // Round thumb
                markerStyle={{ backgroundColor: 'black', width: 25, height: 25, borderRadius: 15 }} // Round marker
            />
            <View style={styles.sliderContainer}>
                <Text style={styles.valueText}>{area[0]} FT²</Text>
                <Text style={styles.valueText}>{area[1]} FT²</Text>
            </View>

            {/* Rooms Filter */}
            <Text style={styles.label}>No. of Rooms</Text>
            <MultiSlider
                values={[rooms[0], rooms[1]]}
                min={0}
                max={9}
                step={1}
                onValuesChange={setRooms}
                sliderLength={330}
                selectedStyle={{ backgroundColor: 'black' }}
                unselectedStyle={{ backgroundColor: 'gray' }}
                trackStyle={{ backgroundColor: 'black' }}
                thumbStyle={{ backgroundColor: 'black', width: 25, height: 25, borderRadius: 15 }} // Round thumb
                markerStyle={{ backgroundColor: 'black', width: 25, height: 25, borderRadius: 15 }} // Round marker
            />
            <View style={styles.sliderContainer}>
                <Text style={styles.valueText}>{rooms[0]}</Text>
                <Text style={styles.valueText}>{rooms[1]}+</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.clearButton} onPress={handleReset}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    closeButton: {
        fontSize: 18,
        color: '#000',
        textAlign: 'left',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.primary
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.primary,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    valueText: {
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    clearButton: {
        backgroundColor: '#fff',
        borderColor: '#000',
        borderWidth: 1,
        padding: 15,
        borderRadius: 5,
        width: '65%',
        alignItems: 'center',
        marginBottom: 12,
    },
    clearButtonText: {
        color: '#000',
        fontSize: 16,
    },
    applyButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 5,
        width: '65%',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Filter;
