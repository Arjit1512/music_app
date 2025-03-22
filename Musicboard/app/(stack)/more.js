import { StyleSheet, Text, View, SafeAreaView, ScrollView, StatusBar, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Loader from '../../components/Loader';
import { FontAwesome, AntDesign } from 'react-native-vector-icons';
import { useFonts } from 'expo-font';
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';

const more = () => {
    const [loading, setLoading] = useState(false);
    let fontsLoaded = useFonts({
        "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
        "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
    })


    const handleLogout = async () => {
        setLoading(true)
        try {
            await AsyncStorage.setItem("isLoggedIn", JSON.stringify(false));
            await AsyncStorage.removeItem('userId');
            router.push("/")
        } catch (error) {
            console.log('Error: ', error);
            alert(error)
        } finally {
            setLoading(false)
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
                <View style={styles.back}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign style={styles.back} name="arrowleft" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.maindiv}>
                    <Text style={styles.rev}>Do you want to logout?</Text>
                    <TouchableOpacity style={styles.btn} onPress={handleLogout}>
                        <Text style={styles.btntext}>Logout</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default more

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#151515",
        height: "100%",
        display: "flex",
        width: "100%",
        alignItems: "center"
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
    rev: {
        color: "white",
        fontFamily: "OpenSans-Bold",
        marginBottom: 20,
        fontSize: 20
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