import { StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, ScrollView, StatusBar } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

const rating = () => {
    const [rating, setRating] = useState({});

    const handleSubmit = async () => {
        const albumId = await AsyncStorage.getItem('albumId');
        const userId = await AsyncStorage.getItem('userId');

        try {
            if (!userId) {
                alert("Please login!")
                return;
            }
            if(!rating.title || !rating.comment){
                alert("Please add both title and review!")
                return;
            } 
            const response = await axios.post(`http://10.0.51.34:8000/${userId}/add-review/${albumId}`, {
                album: albumId,
                title: rating.title,
                comment: rating.comment
            })
            if (response.data.Message === "Review added successfully") {
                setRating({
                    album: '', title: '', comment: ''
                })
                router.back()
            }
            alert(response.data.Message)
            console.log(response.data.message)
        } catch (error) {
            console.log('Error: ', error)
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <StatusBar barStyle="light-content" backgroundColor="#151515" />

                <View style={styles.maindiv}>
                    <Text style={styles.rev}>Add a Review!</Text>
                    <TextInput style={styles.ti} onChangeText={(text) => setRating(prev => ({ ...prev, title: text }))}
                        placeholder='Title' placeholderTextColor='grey' value={rating.title}></TextInput>
                    <TextInput style={styles.ti2} onChangeText={(text) => setRating(prev => ({ ...prev, comment: text }))}
                        placeholder='Write a Review...' placeholderTextColor='grey' value={rating.comment}></TextInput>
                    <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
                        <Text style={styles.btntext} >Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default rating

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#151515",
        height: "100%",
        display: "flex",
        width: "100%",
        alignItems: "center"
    },
    rev: {
        color: "white",
        fontFamily: "OpenSans-Bold",
        marginBottom: 20,
        fontSize: 20
    },
    btn: {
        height: 50,
        width: 140,
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1DB954",
        color: "white",
        borderRadius: 10,
        position: "relative",
        top: 20
    },
    btntext: {
        fontSize: 12,
        color: "#",
        fontFamily: "OpenSans-Bold"
    },
    maindiv: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 145,
        borderWidth: 2,
        borderRadius: 12,
        borderColor: "grey",
        padding: 15,
        height: 360,
        width: 350
    },
    ti: {
        height: 45,
        width: "90%",
        textAlign: "left",
        borderWidth: 2,
        borderRadius: 12,
        borderColor: "grey",
        color: "white",
        fontFamily: "OpenSans"
    },
    ti2: {
        height: 105,
        width: "90%",
        textAlign: "left",
        borderWidth: 2,
        borderRadius: 12,
        borderColor: "grey",
        color: "white",
        marginTop: 20,
        fontFamily: "OpenSans"
    }
})