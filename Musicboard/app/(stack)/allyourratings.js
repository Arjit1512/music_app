import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { FontAwesome, AntDesign } from 'react-native-vector-icons';
import axios from 'axios'
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useFocusEffect } from 'expo-router'
import Loader from '../../components/Loader'

const allyourratings = () => {

    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(false);
    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {
            const getRatings = async () => {
                setLoading(true)
                const userId = await AsyncStorage.getItem('userId');
                console.log("Fetched User ID:", userId);
                try {
                    if (!userId) {
                        alert("Please login!")
                        return;
                    }
                    const response = await axios.get(`http://10.0.51.34:8000/${userId}/reviews`);

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


            getRatings();
        }, [])
    )
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
                                <View style={styles.stars}>
                                    {[...Array(5)].map((_, i) => (
                                        <FontAwesome
                                            key={i}
                                            name={i < item.stars ? 'star' : 'star-o'}
                                            size={16}
                                            color={(item.type==='album') ? "#FF6500" : "#1DB954"}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.result}>{item?.comment || ''} <Text style={{fontFamily:'OpenSans-Italic'}}>({item.type})</Text></Text>
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
