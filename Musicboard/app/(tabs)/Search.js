import { StyleSheet, StatusBar, Text, TextInput, View, SafeAreaView, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useFonts } from 'expo-font';
import { router, useFocusEffect } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader'


const SearchPage = () => {
  const [search, setSearch] = useState('');
  const [option, setOption] = useState('tracks');
  const [searchPressed, setSearchPressed] = useState(false)
  const [artists, setArtists] = useState([{
    name: '',
    dp: '',
    id: ''
  }]);


  let fontsLoaded = useFonts({
    "OpenSans": require("../../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-Bold": require("../../assets/fonts/OpenSans-Bold.ttf"),
  })


  const getArtists = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`https://api.spotify.com/v1/search?q=${search}&type=artist,album,track`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let artistsArray = [];
      if (option === 'artists') {
        artistsArray = response.data.artists?.items?.map((item) => ({
          name: item.name,
          id: item.id,
          dp: item.images[0]?.url || null
        })) || [];
      }
      let tracksArray = [];
      if (option === 'tracks') {
        tracksArray = response.data.tracks?.items?.map((item) => ({
          name: item.name,
          id: item.id,
          dp: item.album?.images[0]?.url || null
        })) || [];
      }
      let albumsArray = [];
      if (option === 'albums') {
        albumsArray = response.data.albums?.items?.map((item) => ({
          name: item.name,
          id: item.id,
          dp: item.images[0]?.url || null
        })) || [];
      }
      const finalArray = [...tracksArray, ...albumsArray, ...artistsArray];
      setArtists(finalArray)
    } catch (error) {
      console.log('Error: ', error)
    }
  }
  const handleChange = async () => {
    const token = await AsyncStorage.getItem("token");
    if (token) getArtists();
  }

  const handlePress = async (artistId, dp) => {
    await AsyncStorage.setItem('artistId', artistId)
    await AsyncStorage.setItem('dp', dp)

    router.push("/artist");
  }

  const handleClick = async (message) => {
    try {
      setOption(message)
    } catch (error) {
      console.log('Error: ', error);
      alert(error)
    }
  }

  useEffect(() => {
    handleChange();
  }, [option])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <StatusBar barStyle="light-content" backgroundColor="#151515" />
        <View style={searchPressed ? styles.sdiv : styles.searchdiv} onChange={handleChange}>
          <TextInput style={styles.bar} onPress={() => setSearchPressed(true)} onChangeText={(text) => setSearch(text)} value={search} placeholder=' search' placeholderTextColor='#888'></TextInput>
          {searchPressed && (
            <View style={styles.cancel} >
              <Text style={{ color: "grey" }} onPress={() => { setSearchPressed(false), setSearch('') }} >cancel</Text>
            </View>
          )}
        </View>
        <View>
          {searchPressed && (
            <View style={styles.div}>
              <TouchableOpacity onPress={() => handleClick('tracks')}>
                <View style={[styles.bxContainer, option === 'tracks' && styles.active]}>
                  <Text style={styles.bx}>Tracks</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleClick('albums')}>
                <View style={[styles.bxContainer, option === 'albums' && styles.active]}>
                  <Text style={styles.bx}>Albums</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleClick('artists')}>
                <View style={[styles.bxContainer, option === 'artists' && styles.active]}>
                  <Text style={styles.bx}>Artists</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
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
    position: 'relative',
    left: "1%"
  },
  sdiv: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: "5%",
    position: 'relative',
    left: "1%"
  },
  bar: {
    borderWidth: 2,
    borderColor: "grey",
    color: 'white',
    width: 310,
    backgroundColor: "black",
    height: 30,
    borderRadius: 10
  },
  cancel: {
    marginLeft: 5,
    marginTop: 5
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
    borderRadius: 25,
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
  },
  //search filters
  div: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "",
    position: 'relative',
    height: 25,
    bottom: 10,
    zIndex: 100,
    alignItems: "center",
    justifyContent: 'center',
    width: "100%",
    gap: 100
  },
  bxContainer: {
    paddingBottom: 5,
  },
  bx: {
    color: "white",
    width: "100%",
    textAlign: "center",
  },
  active: {
    borderBottomWidth: 3,
    borderBottomColor: "#FF6500",
  }
})