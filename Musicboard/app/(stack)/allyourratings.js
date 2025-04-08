import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FontAwesome, AntDesign, MaterialIcons } from 'react-native-vector-icons';
import axios from 'axios'
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useFocusEffect } from 'expo-router'
import Loader from '../../components/Loader'
import Constants from 'expo-constants';

const allyourratings = () => {

    const [ratings, setRatings] = useState([]);
    const [flag, setFlag] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_URL = Constants.expoConfig.extra.API_URL;
    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {
            getRatings();
        }, [])
    )

    useEffect(() => {
        getRatings();
    }, [flag,setFlag])

    const getRatings = async () => {
        setLoading(true)
        const userId = await AsyncStorage.getItem('userId');
        console.log("Fetched User ID:", userId);
        try {
            if (!userId) {
                alert("Please login!")
                return;
            }
            const response = await axios.get(`${API_URL}/${userId}/reviews`);

            const sortedArray = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRatings(sortedArray);

        } catch (error) {
            console.log('Error: ', error)
            alert(error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleDelete = async (userId, reviewId) => {
        console.log('Delete clicked');
        setLoading(true)
        try {
            if (!userId) {
                alert("Please login!")
                return;
            }
            const response = await axios.delete(`${API_URL}/${userId}/delete-review/${reviewId}`);
            console.log(response.data.Message);
            setRatings((ratings) => ratings.filter((r) => r._id != r.reviewId))
            setFlag((prev) => [...prev, 1]);
        } catch (error) {
            console.log('Error: ', error);
        } finally {
            setLoading(false)
        }
    }


    console.log('RATINGS: ', ratings);
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
                        <AntDesign style={styles.back} name="left" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.ta}>YOUR RATINGS</Text>
                {ratings.map((item, index) => {
                    return (
                        <View style={styles.each} key={index}>
                            <Image style={styles.dp} source={{ uri: item.img }}></Image>
                            <View style={styles.col} key={index}>
                                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                    <View style={styles.stars}>
                                        {[...Array(5)].map((_, i) => (
                                            <FontAwesome
                                                key={i}
                                                name={i < item.stars ? 'star' : 'star-o'}
                                                size={16}
                                                color={(item.type === 'album') ? "#FF6500" : "#1DB954"}
                                            />
                                        ))}
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(item.userId, item._id)}>
                                        <MaterialIcons name='delete' size={24} color='grey' />
                                    </TouchableOpacity>


                                </View>
                                <Text style={styles.result}>{item?.comment || ''} <Text style={{ fontFamily: 'OpenSans-Italic' }}>({item.type})</Text></Text>


                            </View>
                        </View>
                    )
                })}
            </ScrollView>
        </SafeAreaView>
    )
}

export default allyourratings

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#151515",
        height: "100%",
        display: "flex",
        width: "100%",
        padding: 10,
    },
    back: {
        position: "absolute",
        left: "2%",
        top: "2.3%",
        zIndex: 10
    },
    ta: {
        color: "white",
        textTransform: "uppercase",
        fontFamily: 'OpenSans-Bold',
        textAlign: "center",
        fontSize: 22,
        marginVertical: 15,
        letterSpacing: 1,
    },
    each: {
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#252525",
        width: "95%",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        alignItems: "left"
    },
    stars: {
        display: "flex",
        flexDirection: "row",
        marginVertical: 5,
    },
    col: {
        display: "flex",
        flexDirection: "column",
        marginLeft: 12,
        justifyContent: "center",
        flex: 1,
    },
    result: {
        color: 'grey',
        fontSize: 12,
        paddingVertical: 5,
        lineHeight: 18,
    },
    dp: {
        width: 55,
        height: 75,
        borderRadius: 6,
        marginTop: 5,
        borderWidth: 1,
        borderColor: "#444",
    },
})
