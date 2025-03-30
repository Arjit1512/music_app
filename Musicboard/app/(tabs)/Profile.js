import { StyleSheet, Text, View, SafeAreaView, Image, StatusBar, TouchableOpacity, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts } from 'expo-font'
import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router'
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import Loader from '../../components/Loader'


const Profile = () => {
    const [user, setUser] = useState({});
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_URL = Constants.expoConfig.extra.API_URL;

    const [isl, setIsl] = useState(false);

    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {
            const getData = async () => {
                setLoading(true)
                const isLoggedIn = JSON.parse(await AsyncStorage.getItem("isLoggedIn"));
                setIsl(isLoggedIn);
                if (!isLoggedIn) {
                    return;
                }
                try {
                    const userId = await AsyncStorage.getItem("userId");
                    const response = await axios.get(`${API_URL}/get-details/${userId}`)

                    AsyncStorage.setItem('userId', userId)
                    setUser(response.data.Message);
                } catch (error) {
                    console.log('Error: ', error);
                    alert(error);
                }
                finally {
                    setLoading(false);
                }
            }

            const getRatings = async () => {
                setLoading(true)
                try {
                    const userId = await AsyncStorage.getItem("userId");
                    if(!userId)return;
                    const response = await axios.get(`${API_URL}/${userId}/reviews`)
                    console.log('Response: ', response.data);
                    if(response.data.Message==="User does not exists!"){
                        setIsl(false);
                        return;
                    }
                        setRatings(response.data || []);
                    if (!Array.isArray(response.data)) {
                        console.error("Invalid response format:", response.data);
                        setRatings([]);
                        return;
                    }
                    // Use Promise.all to resolve all album requests in parallel
                    const albums = await Promise.all(
                        response.data.map(async (item) => {
                            const data = await getAlbumsInfo(item.spotifyId, item.type);
                            return {
                                ...item,
                                type: item.type,
                                dp: (item.type === 'album') ? data?.images[0]?.url : data?.album.images[0].url,
                                albumName: data?.name || 'Unknown',
                            };
                        }))

                    setRatings(albums.sort((a, b) => new Date(b.date) - new Date(a.date)));
                } catch (error) {
                    console.log('Error: ', error);
                    alert(error)
                }
                finally {
                    setLoading(false);
                }
            }

            const getAlbumsInfo = async (spotifyId, type) => {
                setLoading(true)
                const token = await AsyncStorage.getItem('token');
                console.log('Album ID: ', spotifyId)
                try {
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
                    return response.data

                } catch (error) {
                    console.log('Error: ', error);
                }
                finally {
                    setLoading(false);
                }
            }

            getData();
            getRatings();
        }, [])
    );

    const navigateToSongs = async (spotifyId, type) => {
        try {
            if (type === 'album') {
                router.push(`album/${spotifyId}`);
            } else if (type === 'track') {
                router.push(`song/${spotifyId}`);
            }
        } catch (error) {
            console.log('Error: ', error)
            alert(error);
        }
    }

    const navigateToAll = async () => {
        try {
            router.push(`/allyourratings`);
        } catch (error) {
            console.log('Error: ', error)
            alert(error);
        }
    }

    const navigateToLogin = async () => {
        try {
            router.push('/login');
        } catch (error) {
            console.log('Error: ', error)
            alert(error);
        }
    }

    if (loading) {
        return (
            <Loader />
        )
    }
    console.log('ISLOGGEDIN::::::::: ',isl);

    if (!isl) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#151515" />
                <View style={styles.notdiv}>
                    <Image source={require("../../assets/images/dp.png")} style={styles.notimg} />
                    <Text style={styles.nottext}>Oops, you have not logged in, please login to have a better experience on the app!</Text>
                    <TouchableOpacity style={styles.btn} onPress={navigateToLogin}>
                        <Text style={styles.btntext}>Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#151515" />
            <View style={styles.threedots}>
                <TouchableOpacity onPress={() => router.push("/more")}>
                    <AntDesign name="ellipsis1" size={24} color='white' />
                </TouchableOpacity>
            </View>
            <View style={styles.heading}>
                <Text style={styles.h1}>{user?.username}</Text>

                <Image source={require("../../assets/images/dp.png")} style={styles.img} />
            </View>

            <View style={styles.greybox}>
                <TouchableOpacity style={styles.flexcol} onPress={navigateToAll}>
                    <Text style={styles.greytext}>{user?.reviews?.length}</Text>
                    <Text style={styles.greytext}>Ratings</Text>
                </TouchableOpacity>
                <View style={styles.flexcol}>
                    <Text style={styles.greytext}>{user?.friends?.length}</Text>
                    <Text style={styles.greytext}>Followers</Text>
                </View>
            </View>
            <View style={styles.ratediv}>
                <Text style={styles.ratetext}>Recently Rated:</Text>
                <View style={styles.ratingdiv}>
                    {Array.isArray(ratings) && ratings?.slice(0, 3).map((rating, index) => (
                        <TouchableOpacity style={styles.singlediv} key={index} onPress={() => navigateToSongs(rating.spotifyId, rating.type)}>
                            <Image style={[styles.albumImg,
                            { borderColor: (rating.type === 'album') ? '#FF6500' : '#1DB954' },
                            { borderRadius: (rating.type === 'album') ? 8 : 100 },

                            ]} source={{ uri: rating.dp }} />
                            <Text style={styles.rtitle}>{rating.albumName?.length > 10 ? `${rating.albumName.substr(0, 10)}...` : rating.albumName}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#151515",
        height: "100%",
        display: "flex",
        alignItems: "center",
    },
    threedots: {
        position: "relative",
        left: "40%",
        top: "3.5%",
        width: "max-content"
    },
    h1: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
    },
    img: {
        objectFit: "cover",
        width: 80,
        height: 80,
        position: "relative",
        top: "25%",
        right: "35%",
        borderRadius: 100
    },
    greybox: {
        color: "grey",
        display: "flex",
        flexDirection: "row",
        gap: 40,
        position: "relative",
        left: "5%"
    },
    flexcol: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        bottom: "85%"
    },
    greytext: {
        color: "grey"
    },
    ratediv: {
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        position: "relative",
        top: "2%",
        width: "100%",
        paddingTop: 10
    },
    ratetext: {
        color: "white",
        fontSize: 18,
        marginLeft: "2%",
        textAlign: "left",
        fontWeight: "800",
        fontFamily: "OpenSans-Bold"
    },
    ratingdiv: {
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        gap: Platform.OS == 'ios' ? 10 : 0,
        width: "100%",
        marginTop: "2%"
    },
    singlediv: {
        display: "flex",
        flexDirection: "column",
        borderRadius: 12,
        height: 140,
        width: 120,
        padding: 12,
        alignItems: "center"
    },
    rtitle: {
        color: "white",
        fontSize: 10,
        marginTop: 6,
        fontFamily: "OpenSans-Bold"
    },
    albumImg: {
        width: 90,
        height: 90,
        // borderRadius: 8,
        borderWidth: 0
    },
    notdiv: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%"
    },
    notimg: {
        objectFit: "cover",
        width: 80,
        height: 80,
        borderRadius: 100,
        opacity: 0.6
    },
    nottext: {
        color: "grey",
        textAlign: "center",
        fontSize: 14,
        width: "75%",
        marginTop: "5%",
        fontFamily: "OpenSans"
    },
    btn: {
        height: 50,
        width: 140,
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
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
})