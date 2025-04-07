import { StyleSheet, Text, View, SafeAreaView, StatusBar, TextInput, TouchableOpacity, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react'
import { AntDesign } from 'react-native-vector-icons';
import axios from 'axios'
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import Loader from '../../components/Loader';
import Constants from 'expo-constants';

const login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(false);
    const API_URL = Constants.expoConfig.extra.API_URL;

    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
        "OpenSans-Italic": require("../../assets/fonts/OpenSans-Italic.ttf"),
    })

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setProfilePic(result.assets[0]);
        }
    };


    const handleLogin = async () => {
        setLoading(true)

        const formdata = new FormData();
        formdata.append('username', username);
        formdata.append('password', password);
        formData.append('dp', {
            uri: profilePic,
            name: 'profile.jpg',
            type: 'image/jpeg',
          });

        try {
            const response = await axios.post(`${API_URL}/register`, {
                headers: {
                    'Content-Type': 'muiltipart/form-data'
                },
                method: 'POST',
                body: formdata
            })



            if (response.data.Message === "User added successfully!") {
                await AsyncStorage.setItem("isLoggedIn", JSON.stringify(true));
                await AsyncStorage.setItem("userId", response.data.userId)
                router.push("/")
            }
            else{
                console.log('username: ',username)
                console.log('password: ',password)
                alert(response.data.Message);
            }
        } catch (error) {
            console.log('Error: ', error);
            alert(error)
        } finally {
            setLoading(false)
        }
    }

    const navigateToLogin = async () => {
        try {
            router.push("/login");
        } catch (error) {
            console.log('Error: ', error)
            alert(error)
        }
    }

    if (loading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#151515" />
            <View style={styles.back}>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign style={styles.back} name="arrowleft" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <View style={styles.maindiv}>
                <Text style={styles.rev}>Register</Text>
                <TextInput style={styles.ti2} onChangeText={(text) => setUsername(text)}
                    placeholder='Username' placeholderTextColor='grey' value={username}></TextInput>
                <TextInput style={styles.ti2} onChangeText={(text) => setPassword(text)}
                    placeholder='Password' placeholderTextColor='grey' value={password}></TextInput>

                <View style={styles.flexrow}>
                    <TouchableOpacity style={styles.btn2} onPress={pickImage}>
                        <Text style={styles.btntext2}>Upload DP</Text>
                    </TouchableOpacity>

                    {profilePic && (
                        <Text style={styles.span}>Image uploaded.</Text>
                    )}
                </View>

                <Text style={styles.logintext}>Already have an account? <Text style={styles.spantext} onPress={navigateToLogin}>Login</Text></Text>
                <TouchableOpacity style={styles.btn} onPress={handleLogin}>
                    <Text style={styles.btntext}>Register</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default login

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#151515",
        height: "100%",
        display: "flex",
        alignItems: "center",
    },
    back: {
        position: "absolute",
        left: "3%",
        top: "6%",
        zIndex: 10
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
        height: 380,
        width: 350,
    },
    ti2: {
        height: "12%",
        width: "90%",
        textAlign: "left",
        borderWidth: 2,
        borderRadius: 12,
        borderColor: "grey",
        color: "white",
        marginTop: 20,
        fontFamily: "OpenSans",
        paddingLeft: 10,
    },
    logintext: {
        height: "12%",
        width: "90%",
        textAlign: "center",
        color: "grey",
        marginTop: 30,
        fontFamily: "OpenSans",
        paddingLeft: 10,
    },
    rev: {
        color: "white",
        fontFamily: "OpenSans-Bold",
        marginBottom: 20,
        fontSize: 20
    },
    spantext: {
        color: "white",
        fontFamily: "OpenSans-Bold",
        textDecorationLine: "underline"
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
    },
    btntext: {
        fontSize: 12,
        color: "#",
        fontFamily: "OpenSans-Bold",
        fontWeight: "600"
    },
    flexrow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 20,
        gap:20,
        marginBottom:25
    },
    btn2: {
        height: 30,
        width:70,
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        borderWidth:1,
        borderColor:"white",
        color: "white",
        position:"absolute",
        right:65
    },
    btntext2: {
        fontSize: 10,
        color: "grey",
        fontFamily: "OpenSans-Bold",
        fontWeight: "600"
    },
    span: {
        color: "grey",
        fontStyle: "italic",
        fontSize: 11,
        marginTop:8,
        position:"absolute",
        left:-55,
        fontFamily: "OpenSans-Italic"
    }
})