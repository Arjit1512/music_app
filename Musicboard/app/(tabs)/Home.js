import { StyleSheet, Text, View, SafeAreaView, ScrollView, StatusBar, Image } from 'react-native'
import React, { useState } from 'react'
import { FontAwesome } from 'react-native-vector-icons';
import Loader from '../../components/Loader'
import { useFonts } from 'expo-font';
import { useFocusEffect } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
    const [loading, setLoading] = useState(false);
    const [feed, setFeed] = useState([]);

    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {
            const getFeed = async () => {
                setLoading(true)
                try {
                    const response = await axios.get(`http://10.0.51.34:8000/reviews`)
                    const reviews = response.data.reviews;

                    const updatedReviews = await Promise.all(
                        reviews.map(async (review) => {
                            const answer = await getAlbumInfo(review.spotifyId, review.type);
                            return {
                                ...review,
                                artistName: answer.artistName,
                                rd: answer.rd,
                                albumName: answer.name
                            }
                        }))

                    setFeed(updatedReviews)
                } catch (error) {
                    console.log('Error: ', error)
                    // alert(error)
                } finally {
                    setLoading(false)
                }
            }

            const getAlbumInfo = async (spotifyId, type) => {
                setLoading(true)
                const token = 'BQCx_O54Udjm2R_FYqhanbg0eUQQOhR3JMg5-fpRmqq8QD5zJKvEQN8M9FSvGD36Ao8U0cXWlxA5OcBncZy9UVfZlIGgkZme1pkmSxfmFvw29LnyTWdxpfwxxiaajxPoSptMGn3XqRY';

            

                await AsyncStorage.setItem('token', token)


                try {
                    if (!token) return { name: "", rd: "", artistName: "" };
                    let response = '';
                    if (type === 'album') {
                        response = await axios.get(`https://api.spotify.com/v1/albums/${spotifyId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                    }
                    else if (type === 'track') {
                        response = await axios.get(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                    }

                    const object = {
                        name: response.data.name,
                        rd: response.data.release_date,
                        artistName: response.data.artists[0].name
                    }
                    return object;
                } catch (error) {
                    console.log('Error: ', error)
                    // alert(error)
                    return { name: "", rd: "", artistName: "" };
                } finally {
                    setLoading(false)
                }
            }
            getFeed();
        }, [])
    )


    if (loading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <StatusBar barStyle="light-content" backgroundColor="#151515" />
                <Text style={styles.ta}>Feed</Text>
                <View style={styles.wholecol}>
                    {Array.isArray(feed) && feed.map((item, index) => {
                        return (
                            <View style={[styles.each,{borderColor: (item.type==='album') ? '#FF6500' : '#1DB954'}]} key={index}>
                                <View style={styles.whitediv}>
                                    <Image style={styles.dp} source={{ uri: item.img }}></Image>
                                    <View style={styles.whitecoldiv}>
                                        <Text style={styles.resultb}>{item.albumName}</Text>
                                        <Text style={styles.p}>{item.artistName} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>

                                    </View>
                                </View>
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
                                    <Text style={styles.result}>{item?.comment || ''}</Text>
                                    <Text style={styles.span}>• Posted by {item?.username} at {new Date(item.date).toLocaleDateString()}</Text>
                                </View>
                            </View>
                        )
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#151515",
        height: "100%"
    },
    wholecol: {
        display: "flex",
        flexDirection: "column",
    },
    each: {
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#252525",
        width: "95%",
        borderWidth:0.2,
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
        marginTop: 10,
    },
    col: {
        display: "flex",
        flexDirection: "column",
        marginLeft: 12,
        justifyContent: "center",
        flex: 1,
    },
    result: {
        color: '#E2DFD0',
        fontSize: 12,
        paddingVertical: 5,
        lineHeight: 18,
    },
    resultb: {
        color: 'white',
        fontSize: 12,
        width: "90%",
        fontFamily: "OpenSans-Bold",
        paddingVertical: 5,
        lineHeight: 18,
    },
    p: {
        color: 'grey',
        fontSize: 12,
        paddingVertical: 5,
        lineHeight: 18,
    },
    dp: {
        width: 55,
        height: 55,
        borderRadius: 6,
        marginLeft: 6,
        borderWidth: 1,
        borderColor: "grey",
        marginVertical: 6
    },
    whitediv: {
        backgroundColor: "#414141",
        borderRadius: 6,
        display: "flex",
        flexDirection: "row"
    },
    whitecoldiv: {
        display: "flex",
        flexDirection: "column",
        marginLeft: 12,
    },
    ta: {
        color: "white",
        textTransform: "uppercase",
        fontFamily: 'OpenSans-Bold',
        textAlign: "left",
        fontSize: 22,
        marginLeft: 12,
        marginVertical: 15,
        letterSpacing: 1,
    },
    span: {
        fontSize: 10,
        color: "grey",
        marginTop: 6,
        fontStyle: "italic"
    }
})