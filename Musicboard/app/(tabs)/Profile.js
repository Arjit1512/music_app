import { StyleSheet, Text, View, SafeAreaView, Image, StatusBar, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts } from 'expo-font'
import { router, useFocusEffect } from 'expo-router'



const Profile = () => {
    const [user, setUser] = useState({});
    const [ratings, setRatings] = useState([]);

    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {
            const getData = async () => {
                try {
                    const userId = '67d016b58e54df15c0998421'
                    const response = await axios.get(`http://10.0.51.34:8000/get-details/${userId}`)
                    console.log(response.data);
                    AsyncStorage.setItem('userId', userId)
                    setUser(response.data.Message);
                } catch (error) {
                    console.log('Error: ', error);
                    alert(error);
                }
            }

            const getRatings = async () => {
                try {
                    const userId = '67d016b58e54df15c0998421'
                    const response = await axios.get(`http://10.0.51.34:8000/${userId}/reviews`)
                    console.log('Response: ', response.data);
                    setRatings(response.data || []);
                    // Use Promise.all to resolve all album requests in parallel
                    const albums = await Promise.all(
                        response.data.map(async (item) => {
                            const albumData = await getAlbumsInfo(item.album);
                            return {
                                ...item,
                                dp: albumData?.images[0]?.url || '',
                                albumName: albumData?.name || 'Unknown',
                            };
                        }))

                        setRatings(albums.sort((a, b) => new Date(b.date) - new Date(a.date)));
                } catch (error) {
                    console.log('Error: ', error);
                    alert(error)
                }
            }

            const getAlbumsInfo = async (albumId) => {
                const token = await AsyncStorage.getItem('token');
                console.log('Album ID: ', albumId)
                try {
                    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    return response.data

                } catch (error) {
                    console.log('Error: ', error);
                }
            }

            getData();
            getRatings();
        }, [])
    );
    console.log('User: ', user)
    console.log('Ratings: ', ratings);

    const navigateToSongs = async(albumId) => {
        try{
            router.push(`/${albumId}`);
        }catch(error){
            console.log('Error: ',error)
            alert(error);
        }
    } 

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#151515" />

            <View style={styles.heading}>
                <Text style={styles.h1}>{user?.username}</Text>
                <Image source={require("../../assets/images/dp.png")} style={styles.img} />
            </View>
            <View style={styles.greybox}>
                <View style={styles.flexcol}>
                    <Text style={styles.greytext}>{user?.reviews?.length}</Text>
                    <Text style={styles.greytext}>Reviews</Text>
                </View>
                <View style={styles.flexcol}>
                    <Text style={styles.greytext}>{user?.friends?.length}</Text>
                    <Text style={styles.greytext}>Followers</Text>
                </View>
            </View>
            <View style={styles.ratediv}>
                <Text style={styles.ratetext}>Recently Rated Albums:</Text>
                <View style={styles.ratingdiv}>
                    {ratings?.slice(0,3).map((rating, index) => (
                        <TouchableOpacity style={styles.singlediv} key={index} onPress={() => navigateToSongs(rating.album)}>
                            <Image style={styles.albumImg} source={{ uri: rating.dp }} />
                            <Text style={styles.rtitle}>{rating.albumName?.length >10 ? `${rating.albumName.substr(0,10)}...` : rating.albumName}</Text>
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
    heading: {
        paddingTop: "3%"
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
        paddingTop:10
    },
    ratetext: {
        color: "white",
        fontSize: 18,
        textAlign: "left",
        fontWeight: "800",
        fontFamily: "OpenSans-Bold"
    },
    ratingdiv: {
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        gap: 15,
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
        alignItems:"center"
    },
    rtitle: {
        color: "white",
        fontSize: 10,
        marginTop:6,
        fontFamily:"OpenSans-Bold"
    },
    albumImg: {
        width: 90,
        height: 90,
        borderRadius:8
    }
})