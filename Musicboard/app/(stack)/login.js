import { StyleSheet, Text, View, SafeAreaView, StatusBar, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { AntDesign } from 'react-native-vector-icons';
import axios from 'axios'
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import Loader from '../../components/Loader';

const login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })

    const handleLogin = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`http://10.0.51.34:8000/login`, {
                username, password
            })
            if (response.data.Message === "User logged in successfully!") {
                await AsyncStorage.setItem("isLoggedIn",JSON.stringify(true));
                await AsyncStorage.setItem("userId", response.data.userId)
                router.push("/")
            }
            else
                alert(response.data.Message);
        } catch (error) {
            console.log('Error: ', error);
            alert(error)
        } finally {
            setLoading(false)
        }
    }

    const navigateToRegister = async() => {
            try{
                router.push("/register");
            }catch(error){
                console.log('Error: ',error)
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
                <Text style={styles.rev}>Login</Text>
                <TextInput style={styles.ti2} onChangeText={(text) => setUsername(text)}
                    placeholder='Username' placeholderTextColor='grey' value={username}></TextInput>
                <TextInput style={styles.ti2} onChangeText={(text) => setPassword(text)}
                    placeholder='Password' placeholderTextColor='grey' value={password}></TextInput>
                <Text style={styles.logintext}>Don't have an account? <Text style={styles.spantext} onPress={navigateToRegister}>Register</Text></Text>
                <TouchableOpacity style={styles.btn} onPress={handleLogin}>
                    <Text style={styles.btntext}>Login</Text>
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
        height: 360,
        width: 350,
    },
    ti2: {
        height: "12%",
        width: "90%",
        textAlign: "left",
        borderWidth:2,
        borderRadius:12,
        borderColor:"grey",
        color: "white",
        marginTop: 20,
        fontFamily: "OpenSans",
        paddingLeft:10,
    },
    logintext: {
        height: "12%",
        width: "90%",
        textAlign: "center",
        color: "grey",
        marginTop: 20,
        fontFamily: "OpenSans",
        paddingLeft:10,
    },
    rev: {
        color: "white",
        fontFamily: "OpenSans-Bold",
        marginBottom: 20,
        fontSize: 20
    },
    spantext:{
        color:"white",
        fontFamily:"OpenSans-Bold",
        textDecorationLine:"underline"
    },
    btn: {
        height: 50,
        width: 140,
        padding: 4,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1DB954",
        color: "white",
        borderRadius: 10,
        position: "relative",
        top: 10
    },
    btntext: {
        fontSize: 12,
        color: "#",
        fontFamily: "OpenSans-Bold",
        fontWeight: "600"
    },
})