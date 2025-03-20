import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { Entypo, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function TabsLayout(){
    return (
        <Tabs screenOptions={{tabBarStyle:styles.tab}}>
            <Tabs.Screen name="Home" options={{headerShown:false , tabBarIcon: ({size,color}) => 
            <Entypo name='home' size={size} color={color} />
            }}/>

            <Tabs.Screen name='Search' options={{headerShown:false, tabBarIcon: ({size,color}) => 
            <FontAwesome5 name='search' size={size} color={color} />
            }}/>
            
            <Tabs.Screen name='Profile' options={{headerShown:false, tabBarIcon: ({size,color}) => 
            <FontAwesome5 name='user' size={size} color={color} />
            }}/>

        </Tabs>
    );
}

const styles = StyleSheet.create({
    tab:{
        backgroundColor:"black"
    }
})