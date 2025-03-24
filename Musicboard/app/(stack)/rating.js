import { StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, ScrollView, StatusBar } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import Loader from '../../components/Loader'

const rating = () => {
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState('');
    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })

    const handleSubmit = async () => {
        const albumId = await AsyncStorage.getItem('albumId');
        const userId = await AsyncStorage.getItem('userId');
        const albumDp = await AsyncStorage.getItem('albumDp');
        setLoading(true)
        try {
            if (!userId) {
                alert("Please login to add rating!")
                router.push("/login");
                return;
            }
            if (!rating) {
                alert("Please add a rating!")
                return;
            }
            const response = await axios.post(`http://10.0.51.34:8000/${userId}/add-review/${albumId}`, {
                spotifyId: albumId,
                img: albumDp,
                type:'album',
                stars: rating,
                comment: comment || ''
            })
            if (response.data.Message === "Review added successfully") {
                setComment('');
                setRating(0);
                router.back()
            }
            alert(response.data.Message)
            console.log(response.data.message)
        } catch (error) {
            console.log('Error: ', error)
        }
        finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <StatusBar barStyle="light-content" backgroundColor="#151515" />
                <View style={styles.back}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign style={styles.back} name="arrowleft" size={32} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.maindiv}>
                    <Text style={styles.rev}>Add a Review!</Text>
                    <View style={styles.starContainer}>
                        {[1, 2, 3, 4, 5].map((item) => (
                            <TouchableOpacity key={item} onPress={() => setRating(item)}>
                                <FontAwesome
                                    name={rating >= item ? "star" : "star-o"}
                                    size={32}
                                    color={rating >= item ? "#FF6500" : "grey"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput style={styles.ti2} onChangeText={(text) => setComment(text)}
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
    back: {
        position: "absolute",
        top: "3%",
        zIndex: 10,
        borderRadius: 4,
        height: 34,
        width: 34
    },
    rev: {
        color: "white",
        fontFamily: "OpenSans-Bold",
        marginBottom: 20,
        fontSize: 20
    },
    starContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
        gap: 10
    },
    btn: {
        height: 50,
        width: 140,
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6500",
        color: "white",
        borderRadius: 10,
        position: "relative",
        top: 20
    },
    btntext: {
        fontSize: 12,
        color: "#",
        fontFamily: "OpenSans-Bold",
        fontWeight: "600"
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
        height: "max-content",
        width: "90%",
        textAlign: "left",
        borderRadius: 12,
        color: "white",
        marginTop: 20,
        fontFamily: "OpenSans"
    }
})