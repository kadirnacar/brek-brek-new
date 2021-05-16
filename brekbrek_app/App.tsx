/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { Component } from 'react';
import { Image } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { MenuProvider } from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/FontAwesome5';
import BatchedBridge from 'react-native/Libraries/BatchedBridge/BatchedBridge';
import channelIcon from './src/assets/channel.png';
import channelGrayIcon from './src/assets/channelgray.png';
import HeaderLabel from './src/Components/HeaderLabel';
import HeaderMenu from './src/Components/HeaderMenu';
import { Users } from './src/Models';
import { RealmService } from './src/realm/RealmService';
import { ChannelScreenComp } from './src/Screens/Channel';
import { ChannelsScreenComp } from './src/Screens/Channels';
import { ContactsScreenComp } from './src/Screens/Contacts';
import { ProfileComp } from './src/Screens/Profile';
import { RegisterComp } from './src/Screens/Register';
import { Colors } from './src/Utils/Colors';
import JavaJsModule from './src/Utils/JavaJsModule';

if (!BatchedBridge.getCallableModule('JavaJsModule')) {
  BatchedBridge.registerCallableModule('JavaJsModule', JavaJsModule);
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

interface AppState {
  isLogin: boolean;
}

const userRepo: RealmService<Users> = new RealmService<Users>('Users');

export default class App extends Component<any, AppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLogin: userRepo.getAll().length > 0,
    };
  }

  render() {
    return (
      <MenuProvider skipInstanceCheck={true}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={this.state.isLogin ? 'Channels' : 'Register'}
            headerMode="screen"
            mode="card"
            screenOptions={(props) => ({
              headerTitle: this.state.isLogin ? '' : 'BrekBrek',
              headerTransparent: true,
              headerTintColor: Colors.white,
              headerLeft: (propss) =>
                this.state.isLogin ? <HeaderLabel navigation={props.navigation} /> : null,
              headerRight: (propss) =>
                this.state.isLogin ? <HeaderMenu navigation={props.navigation} /> : null,
            })}>
            <Stack.Screen name="Channels">
              {() => (
                <Tab.Navigator
                  initialRouteName="Channels"
                  tabBarOptions={{
                    activeBackgroundColor: Colors.darker,
                    activeTintColor: Colors.white,
                    inactiveBackgroundColor: Colors.dark,
                    inactiveTintColor: Colors.black,
                    labelPosition: 'below-icon',
                    labelStyle: { fontSize: 16 },
                    adaptive: true,
                    style: { height: 70 },
                    tabStyle: { padding: 10 },
                  }}
                  sceneContainerStyle={{ backgroundColor: Colors.darker }}>
                  <Tab.Screen
                    name="Channels"
                    options={{
                      tabBarLabel: 'Kanallar',
                      tabBarIcon: (props) => {
                        return (
                          <Image
                            resizeMode="cover"
                            resizeMethod="scale"
                            style={{ width: props.size, height: props.size }}
                            source={props.focused ? channelIcon : channelGrayIcon}
                          />
                        );
                      },
                    }}
                    component={ChannelsScreenComp}></Tab.Screen>
                  {/* 
                  <Tab.Screen
                    name="Contacts"
                    options={{
                      tabBarLabel: 'Kişiler',
                      tabBarIcon: (props) => {
                        return (
                          <Icon
                            name="users"
                            {...props}
                            color={props.focused ? Colors.primary : Colors.darker}
                          />
                        );
                      },
                    }}
                    component={ContactsScreenComp}></Tab.Screen> */}
                </Tab.Navigator>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Register"
              component={RegisterComp}
              listeners={{
                beforeRemove: () => {
                  this.setState({
                    isLogin: userRepo.getAll().length > 0,
                  });
                },
              }}
            />
            <Stack.Screen name="Channel" component={ChannelScreenComp} />
            <Stack.Screen name="Profile" component={ProfileComp} />
          </Stack.Navigator>
        </NavigationContainer>
      </MenuProvider>
    );
  }
}
