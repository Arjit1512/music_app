import { StyleSheet, Text, View, Image, ScrollView, StatusBar, Linking, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { FontAwesome, AntDesign } from 'react-native-vector-icons';
import { useFonts } from 'expo-font'
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../components/Loader'

const { width } = Dimensions.get('window');

const artist = () => {

    const [albums, setAlbums] = useState([]);
    const [dp, setDp] = useState('');
    const [artist, setArtist] = useState([]);
        const [loading,setLoading] = useState(false);
    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })

    useFocusEffect(
        React.useCallback(() => {

            const getData = async () => {
                setLoading(true)
                const artistId = await AsyncStorage.getItem('artistId');
                const token = await AsyncStorage.getItem('token');
                const dp = await AsyncStorage.getItem('dp');
                setDp(dp);
                try {
                    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const albumsData = response.data.items.map((item) => ({
                        id: item.id,
                        name: item.name,
                        rd: item.release_date,
                        type: item.type,
                        image: item.images[0].url
                    }))
                    setAlbums(albumsData);

                } catch (error) {
                    console.log('Error: ', error)
                }
                finally{
                    setLoading(false);
                }
            }

            const getArtistData = async () => {
                setLoading(true)
                const artistId = await AsyncStorage.getItem('artistId');
                const token = await AsyncStorage.getItem('token');
                try {
                    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    setArtist({
                        name: response.data.name,
                        fans: response.data.followers.total || 0,
                        popu: response.data.popularity
                    });
                } catch (error) {
                    console.log('Error: ', error)
                }
                finally{
                    setLoading(false);
                }
            }

            getData();
            getArtistData();
        }, [])
    )
    const handlePress = async (albumId) => {
        await AsyncStorage.setItem('albumId', albumId)
        console.log('Navigating to ', albumId);
        router.push(`/${albumId}`);
    }

    const navigateToSpotify = async () => {
        setLoading(true)
        const artistId = await AsyncStorage.getItem('artistId');
        try {
            const url = `spotify:artist:${artistId}`;
            Linking.openURL(url);
        } catch (error) {
            console.log('Error: ', error)
        }
        finally{
            setLoading(false);
        }
    }
    console.log('TITLE: ', artist.name);

    if(loading){
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
                                        <AntDesign style={styles.back} name="left" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                                <Image style={styles.dp} source={{ uri: dp }} />
                <Text style={styles.an}>{artist.name}</Text>
                <Text style={styles.ta}>Top Albums</Text>
                <View style={styles.wholediv}>
                    {albums.map((album, index) => (
                        album.type === 'album' && (
                            <View key={index}>
                                <TouchableOpacity style={styles.row} onPress={() => handlePress(album?.id || '')}>
                                    <Image style={styles.albimage} source={{ uri: album.image }} />
                                    <View style={styles.diffrow}>
                                        <Text style={styles.result}>{index + 1}. {album.name.length > 31 ? `${album.name.substring(0, 31)}...` : album.name}</Text>
                                        <Text style={styles.no}>{album.rd}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    ))}
                </View>
                <View style={styles.artistdiv}>
                    <Text style={styles.title}>Know more about the artist</Text>
                    <TouchableOpacity onPress={navigateToSpotify}>
                        <Text style={styles.artistName}>{artist.name}</Text>
                    </TouchableOpacity>
                    <Text style={styles.artistInfo}>
                        {`${Math.round(parseFloat(artist.fans) / 1000)}K`} followers and belongs to the top <Text style={{ fontWeight: "800" }}>{100 - parseInt(artist.popu)}%</Text> artists on Spotify.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default artist

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#151515"
    },
    container: {
        backgroundColor: "#151515",
        display: "flex",
        width: "100%",
        alignItems: "center",
    },
    back:{
        position:"absolute",
        right:"85%",
        top:"0.5%",
        zIndex:10,
        borderRadius:4,
        height:34,
        width:24
    },
    dp: {
        width: 170,
        height: 170,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "grey"
    },
    ta: {
        color: "#1DB954",
        textTransform: "uppercase",
        fontFamily: 'OpenSans-Bold',
        textAlign: "left",
        fontSize: 26,
        position: 'relative',
        top: 10,
        left:5,
        width:"100%"
    },
    an: {
        color: "white",
        fontFamily: 'OpenSans-Bold',
        textAlign: "center",
        fontSize: 14,
        marginTop: 12
    },
    wholediv: {
        marginTop: "5%"
    },
    name: {
        color: "white",
        fontFamily: 'OpenSans'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#151515',
        width: "100%",
        padding: 8
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
        position: 'absolute',
        left: 15,
        top: 10
    },
    result: {
        color: 'white',
        fontSize: 14,
        padding: 5,
        position: 'absolute',
        left: 10,
        bottom: 5
    },
    artistdiv: {
        backgroundColor: '#1DB954',
        padding: 16,
        borderRadius: 12,
        marginVertical: 10,
        width:"94%",
        justifyContent:"center",
        alignItems:"center"
    },
    title: {
        fontFamily: "OpenSans-Bold",
        textTransform: "uppercase",
        fontSize: 18,
        width: "100%",
        textAlign: "center"
    },
    artistName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3F7D58',
        marginBottom: 6,
        fontFamily: "Opensans"
    },
    p: {
        fontSize: 8,
        fontWeight: "200",
        color: "white",
        fontFamily: "OpenSans"
    },
    artistInfo: {
        fontSize: 16,
        color: '#fff',
        marginTop: 4,
        opacity: 0.9,
    }
})