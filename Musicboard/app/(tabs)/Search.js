import { StyleSheet, StatusBar, Text, TextInput, View, SafeAreaView, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import axios from 'axios';
import { router, useFocusEffect } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SearchPage = () => {
  const [search, setSearch] = useState('');
  const [searchPressed, setSearchPressed] = useState(false)
  const [artists, setArtists] = useState([{
    name: '',
    dp: '',
    id: ''
  }]);



  const token = 'BQAcmnOaLMQcUORpZriAKg5tGdxsgaSAPpAzRjAc1avg-7QPsTE9rAuLggiBgnIxVBMfotMQ_h9pCNjg_4Xh8yPmsZ95Z2Z9aTht6JJwKuOrP3z_VoojVGogiFIB1L5-5sPOxKX1m28';

  const getArtists = async () => {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/search?q=${search}&type=artist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      await AsyncStorage.setItem('token', token)
      const artistsArray = response.data.artists?.items?.map((item) => ({
        name: item.name,
        id: item.id,
        dp: item.images[0]?.url || null
      })) || [];
      setArtists(artistsArray)
    } catch (error) {
      console.log('Error: ', error)
    }
  }
  const handleChange = () => {
    if (token) getArtists();
  }

  const handlePress = async (artistId, dp) => {
    await AsyncStorage.setItem('artistId', artistId)
    await AsyncStorage.setItem('dp', dp)

    router.push("/artist");
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <StatusBar barStyle="light-content" backgroundColor="#151515" />
        <View style={styles.searchdiv} onChange={handleChange}>
          <TextInput style={styles.bar} onPress={() => setSearchPressed(true)} onChangeText={(text) => setSearch(text)} value={search} placeholder=' search' placeholderTextColor='#888'></TextInput>
          {searchPressed && (
            <Text style={styles.cancel} onPress={() => { setSearchPressed(false), setSearch('') }} >cancel</Text>
          )}
        </View>
        <View>
          {(searchPressed && artists.length > 1) ? (artists?.map((item, index) => {
            return (
              <View style={styles.flexcol} key={index}>
                <TouchableOpacity style={styles.row} onPress={() => handlePress(item.id, item.dp)}>
                  <Image source={{ uri: item.dp }} style={styles.image} />
                  <Text style={styles.result}>{item.name}</Text>
                  <ChevronRight size={20} color="white" />
                </TouchableOpacity>
              </View>
            )
          })) : (
            <View>
              <View>
                <Text style={styles.heading}>Top Genres</Text>
                <View style={styles.container2}>
                  <Image style={styles.mainimg} source={require("../../assets/images/image3.png")}></Image>
                  <Image style={styles.mainimg} source={require("../../assets/images/image.png")}></Image>
                  <Image style={styles.mainimg} source={require("../../assets/images/image2.png")}></Image>
                  <Image style={styles.mainimg} source={require("../../assets/images/image1.png")}></Image>
                </View>
              </View>
              <View>
                <Text style={styles.heading}>Most Popular Artists</Text>
                <View style={styles.container2}>
                  <Image style={styles.mainimg} source={require("../../assets/images/klamar.jpeg")}></Image>
                  <Image style={styles.mainimg} source={require("../../assets/images/swift.jpeg")}></Image>
                  <Image style={styles.mainimg} source={require("../../assets/images/weeknd.jpg")}></Image>
                  <Image style={styles.mainimg} source={require("../../assets/images/ts.jpeg")}></Image>
                </View>
              </View>
            </View>
          )
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SearchPage

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#151515",
    height: "100%",
    display: "flex",
    width: "100%",
    alignItems: "center"
  },
  searchdiv: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: "5%",
    position:'relative',
    left:"0%"
  },
  bar: {
    borderWidth: 2,
    borderColor: "grey",
    color: 'white',
    width: "83%",
    backgroundColor: "black",
    height: "135%",
    borderRadius: 10
  },
  cancel: {
    color: "grey",
    marginLeft: "3%",
    marginTop: "1%"
  },
  icon: {
    marginRight: "5%"
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#151515',
    width: "100%",
    height: 60,
    padding: 8
  },
  result: {
    color: 'grey',
    fontSize: 16,
    padding: 5,
    position: 'absolute',
    left: 70
  },
  flexcol: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: "100%",
    objectFit: "cover"
  },
  heading: {
    textAlign: "left",
    width: "100%",
    color: "white",
    fontSize: 20,
    fontFamily: "OpenSans-Bold",
    fontWeight: "700"
  },
  container2: {
    display: "flex",
    flexDirection: 'row',
    flexWrap: "wrap",
    width: "100%",
    gap: 15,
    paddingBottom: "5%"
  },
  mainimg: {
    width: "45%",
    height: 120,
    borderRadius: 20,
    marginTop: "5%"
  }
})