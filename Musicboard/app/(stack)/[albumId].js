import { StyleSheet, Text, View, SafeAreaView, ScrollView, StatusBar, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFonts } from 'expo-font';
import { BlurView } from 'expo-blur';
import { FontAwesome, AntDesign } from 'react-native-vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Loader from '../../components/Loader'
import { Linking } from 'react-native';

const Songs = () => {
    const { albumId } = useLocalSearchParams();
    const [songs, setSongs] = useState([]);
    const [albumInfo, setAlbumInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState(false);
    const [song, setSong] = useState({});

    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
        "OpenSans-Italic": require("../../assets/fonts/OpenSans-Italic.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {
            const getSongs = async () => {
                setLoading(true)
                const token = await AsyncStorage.getItem('token');
                console.log('Album ID: ', albumId)
                if (!albumId) {
                    alert("No album selected!")
                    return;
                }
                try {
                    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    setSongs(response.data.tracks.items.map((song) => ({
                        name: song.name,
                        id: song.id,
                        singer: song.artists[0].name
                    })))
                    setAlbumInfo({
                        length: response.data.tracks.items.length,
                        dp: response.data.images[0].url,
                        title: response.data.name,
                        rd: response.data.release_date
                    });


                } catch (error) {
                    console.log('Error: ', error);
                }
                finally {
                    setLoading(false);
                }
            }

            getSongs();
        }, [])
    )

    const handlePress = async () => {
        setLoading(true)
        try {
            await AsyncStorage.setItem('albumId', albumId);
            await AsyncStorage.setItem('albumDp', albumInfo.dp)
            router.push("/rating");
        } catch (error) {
            console.log('Error: ', error)
        }
        finally {
            setLoading(false);
        }
    }

    console.log('Song: ', song)

    const openPopup = async (songId) => {
        setLoading(true)
        const token = await AsyncStorage.getItem("token");
        try {
            if (!token) return;
            setPopup(true)
            console.log('Popup clicked!');
            const response = await axios.get(`https://api.spotify.com/v1/tracks/${songId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const object = {
                name: response.data.name,
                duration: parseFloat(response.data.duration_ms / 60000).toFixed(2),
                artistName: response.data.artists[0].name,
                link: response.data.uri,
                img: response.data.album.images[0].url
            }
            setSong(object);
        } catch (error) {
            console.log('Error: ', error)
        }
        finally {
            setLoading(false);
        }
    }

    const navigateTo = async (songId) => {
        try {
            Linking.openURL(songId);
        } catch (error) {
            console.log('Error: ', error)
            alert(error)
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
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#151515" />
                <View style={styles.back}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign style={styles.back} name="arrowleft" size={32} color="white" />
                    </TouchableOpacity>
                </View>

                {popup && (
                    <View style={styles.fullScreenContainer}>
                        <BlurView intensity={50} tint="dark" style={styles.blurBackground} />
                        <View style={styles.popupContainer}>
                            <Text style={styles.ta2}>Song Info</Text>
                            <TouchableOpacity style={styles.into} onPress={() => setPopup(false)}>
                                <AntDesign name="close" size={24} color="white" />
                            </TouchableOpacity>
                            <Image style={styles.dp2} source={{ uri: song.img }} />
                            <View style={styles.songInfoContainer}>
                                <Text style={styles.songText}>Name: <Text style={styles.span}> {song.name}</Text></Text>
                                <Text style={styles.songText}>Duration: <Text style={styles.span}> {song.duration}min</Text></Text>
                                <Text style={styles.songText}>Artist: <Text style={styles.span}> {song.artistName}</Text></Text>
                                <TouchableOpacity style={styles.btn2} onPress={() => navigateTo(song.link)}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Text style={styles.btntext2}>Listen on Spotify</Text>
                                        <FontAwesome name="spotify" size={24} style={{ marginLeft: 6 }} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                )}

                <Image style={styles.dp} source={{ uri: albumInfo.dp }}></Image>
                <Text style={styles.ta}>{albumInfo.title}</Text>
                <Text style={styles.p}>Album • {albumInfo.rd} • {albumInfo.length === 1 ? `${albumInfo.length} track` : `${albumInfo.length} tracks`}</Text>
                <TouchableOpacity style={styles.btn} onPress={handlePress}>
                    <Text style={styles.btntext}>Rate Album</Text>
                </TouchableOpacity>
                <View>
                    <View>

                    </View>
                </View>
                <View style={styles.col}>
                    <Text style={styles.tr}>Tracks</Text>
                    {songs.map((song, index) => {
                        return (
                            <TouchableOpacity key={index} style={styles.eachcol} onPress={() => openPopup(song.id)}>
                                <Text style={styles.result}>{index + 1}. {song.name}</Text>
                                <Text style={styles.no}>{song.singer}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Songs

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#151515"
    },
    back: {
        position: "absolute",
        right: "85%",
        top: "1%",
        zIndex: 10,
        borderRadius: 4,
        height: 34,
        width: 24
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
        marginTop: "2%"
    },
    btntext: {
        fontSize: 12,
        color: "#",
        fontFamily: "OpenSans-Bold",
        fontWeight: "700"
    },
    dp: {
        width: 250,
        height: 270,
        borderRadius: 12,
        marginTop: 15,
        borderColor: "grey",
        borderWidth: 1,
        elevation: 10
    },
    container: {
        backgroundColor: "#151515",
        display: "flex",
        width: "100%",
        alignItems: "center",
        paddingBottom: 0
    },
    ta: {
        color: "white",
        textTransform: "uppercase",
        fontFamily: 'OpenSans-Bold',
        textAlign: "center",
        fontSize: 20,
        marginTop: 10
    },
    tr: {
        color: "white",
        fontFamily: 'OpenSans-Bold',
        textAlign: "left",
        fontSize: 20,
        marginBottom: 10
    },
    p: {
        color: "grey",
        fontSize: 14,
        marginVertical: 8
    },
    col: {
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'space-between',
        backgroundColor: '#151515',
        width: "100%",
        padding: 8
    },
    eachcol: {
        backgroundColor: "black",
        borderWidth: 2,
        borderColor: "grey",
        borderRadius: 12,
        padding: 6,
        marginBottom: 12
    },
    diffrow: {
        display: "flex",
        flex: 1,
        flexDirection: 'column',
    },
    albimage: {
        width: 90,
        height: 90,
        objectFit: "cover"
    },
    no: {
        color: "grey",
        fontSize: 12,
    },
    result: {
        color: 'white',
        fontSize: 14,
        padding: 5,
    },
    fullScreenContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    blurBackground: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    popupContainer: {
        width: 350,
        height: "max-content",
        paddingBottom: 24,
        backgroundColor: "#151515",
        opacity: 1,
        borderRadius: 12,
        borderColor: "white",
        borderWidth: 1,
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        alignSelf: "center",
        position: "absolute",
        top: 180,
        left: 20,
    },
    ta2: {
        color: "white",
        textTransform: "uppercase",
        fontFamily: 'OpenSans-Bold',
        textAlign: "center",
        fontSize: 22,
        marginTop: 12,
        letterSpacing: 1,
    },
    dp2: {
        width: 150,
        height: 170,
        borderRadius: 12,
        marginTop: 15,
        borderColor: "black",
        borderWidth: 1,
        alignSelf: "center"
    },
    into: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 100,
    },
    songInfoContainer: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#323232",
        width: "94%",
        alignSelf: "center",
        borderRadius: 6,
        marginTop: 12,
        padding: 12
    },
    songText: {
        color: "white",
        fontFamily: "OpenSans-Bold",
        fontWeight: "800"
    },
    btn2: {
        height: 50,
        width: 150,
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6500",
        color: "white",
        borderRadius: 10,
        marginTop: "4%",
        borderColor: "black",
        borderWidth: 1,
        alignSelf: "center"
    },
    span: {
        color: "grey",
        fontFamily: "OpenSans-Bold",
        fontSize: 13
    },
    btntext2: {
        fontSize: 12,
        color: "#",
        fontFamily: "OpenSans-Bold",
        fontWeight: "700",
        position: "relative",
        bottom: 0
    }
})