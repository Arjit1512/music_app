import { StyleSheet, Text, View, SafeAreaView, ScrollView, StatusBar, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

const Songs = () => {
    const { albumId } = useLocalSearchParams();
    const [songs, setSongs] = useState([]);
    const [albumInfo, setAlbumInfo] = useState({});

    useFocusEffect(
        React.useCallback(() => {
            const getSongs = async () => {
                const token = await AsyncStorage.getItem('token');
                console.log('Album ID: ', albumId)
                if(!albumId){
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
            }

            getSongs();
        }, [])
    )

    const handlePress = async() => {
        try{
            await AsyncStorage.setItem('albumId',albumId);
            router.push("/rating");
        }catch(error){
            console.log('Error: ',error)
        }
    }

    console.log('Songs: ', songs)
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#151515" />
                <Image style={styles.dp} source={{ uri: albumInfo.dp }}></Image>
                <Text style={styles.ta}>{albumInfo.title}</Text>
                <Text style={styles.p}>Album • {albumInfo.rd} • {albumInfo.length} Tracks</Text>
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
                            <TouchableOpacity key={index} style={styles.eachcol}>
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
    btn: {
        height: 50,
        width: 140,
        padding:4,
        textAlign:"center",
        alignItems:"center",
        justifyContent:"center",
        backgroundColor: "#1DB954",
        color: "white",
        borderRadius: 10,
    },
    btntext:{
        fontSize:12,
        color: "#",
        fontFamily:"OpenSans-Bold"
    },
    dp: {
        width: 250,
        height: 270,
        borderRadius: 12,
        marginTop: 15,
        borderColor: "grey",
        borderWidth: 3,
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
})