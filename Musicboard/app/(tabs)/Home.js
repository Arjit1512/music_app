import { StyleSheet, Text, View, SafeAreaView, ScrollView, StatusBar, Image, TouchableOpacity, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Pressable, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome } from 'react-native-vector-icons';
import Loader from '../../components/Loader'
import { useFonts } from 'expo-font';
import { useFocusEffect, router } from 'expo-router';
import axios from 'axios';
import { encode } from "base-64";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
    const [loading, setLoading] = useState(false);
    const [feed, setFeed] = useState([]);

    const SPOTIFY_CLIENT_ID = Constants.expoConfig.extra.SPOTIFY_CLIENT_ID;
    const SPOTIFY_CLIENT_SECRET = Constants.expoConfig.extra.SPOTIFY_CLIENT_SECRET;
    const API_URL = Constants.expoConfig.extra.API_URL;
    // console.log('SCI: ',SPOTIFY_CLIENT_ID);
    console.log('API URL: ', API_URL);

    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })

    useEffect(() => {
        // Call getToken immediately on mount
        getToken();

        // Set up token refresh interval (every hour)
        const tokenRefreshInterval = setInterval(() => {
            getToken();
        }, 60 * 60 * 1000); // Refresh token every hour

        // Clear interval when the component unmounts
        return () => clearInterval(tokenRefreshInterval);
    }, []);


    const getToken = async () => {
        try {
            console.log("Fetching new Spotify token...");
            const credentials = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`;
            const encodedCredentials = encode(credentials); // Use base-64 encoding

            const response = await axios.post(
                "https://accounts.spotify.com/api/token",
                new URLSearchParams({ grant_type: "client_credentials" }).toString(),
                {
                    headers: {
                        "Authorization": `Basic ${encodedCredentials}`,
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            const token = response.data.access_token;

            console.log("Spotify Token:", token);
            await AsyncStorage.setItem('token', token);
            return token;
        } catch (error) {
            console.error("Error fetching Spotify token:", error.response?.data || error.message);
        }
    };


    useFocusEffect(
        React.useCallback(() => {
            const getFeed = async () => {
                setLoading(true)
                try {
                    const response = await axios.get(`${API_URL}/reviews`)
                    //console.log('API Response:', response.data);
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


                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.log("Token not available, fetching new one...");
                    await getToken();
                    return { name: "", rd: "", artistName: "" };
                }


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

    //console.log('Feed: ', feed);

    const handleNavigate = async (type, id) => {
        try {
            if (type === 'album') {
                await AsyncStorage.setItem('albumId', id);
                router.push(`album/${id}`);
                return;
            }
            else if (type === 'track') {
                await AsyncStorage.setItem('songId', id);
                router.push(`song/${id}`);
                return;
            }
        } catch (error) {
            console.log('Error: ', error)
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
                <Text style={styles.ta}>Musicboard</Text>
                <View style={styles.wholecol}>
                    {Array.isArray(feed) && feed.map((item, index) => {
                        return (
                            <View key={index} >
                                <TouchableOpacity onPress={() => handleNavigate(item.type, item.spotifyId)}>
                                    <View style={[styles.each, { borderColor: (item.type === 'album') ? '#FF6500' : '#1DB954' }]} key={index}>
                                        <View style={[styles.whitediv]}>
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
                                                        color={(item.type === 'album') ? "#FF6500" : "#1DB954"}
                                                    />
                                                ))}
                                            </View>
                                            <Text style={styles.result}>{item?.comment || ''}</Text>
                                            {/* <TouchableWithoutFeedback onPress={()=> router.push("/otherprofile")}> */}
                                            <Text style={styles.span}>• Posted by {item?.username} at {new Date(item.date).toLocaleDateString()}</Text>
                                            {/* </TouchableWithoutFeedback> */}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                {(index!==0 && index % 20 == 0) && (
                                    <TouchableOpacity onPress={() => Linking.openURL("https://2-0-ochre.vercel.app")}>
                                        <Image source={require("../../assets/images/th.png")} style={styles.ad} />
                                    </TouchableOpacity>
                                )
                                }
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
        borderWidth: 0.2,
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
        fontFamily: "OpenSans",
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
        flexDirection: "row",
        borderWidth:0.2,
        
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
    },
    ad:{
        height:120,
        width:"94%",
        alignSelf:"center",
        borderColor:"white",
        borderRadius: 12,
        marginBottom: 15,
        backgroundColor: "#252525",
        borderWidth: 1,
        alignSelf: "center",
    }
})