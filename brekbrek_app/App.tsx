import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { decode } from 'base64-arraybuffer';
import { ObjectId } from 'bson';
import React, { Component } from 'react';
import { AppState, AppStateStatus, Image, Linking, ToastAndroid } from 'react-native';
import * as RNFS from 'react-native-fs';
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { MenuProvider } from 'react-native-popup-menu';
import BatchedBridge from 'react-native/Libraries/BatchedBridge/BatchedBridge';
import channelIcon from './src/assets/channel.png';
import channelGrayIcon from './src/assets/channelgray.png';
import HeaderLabel from './src/Components/HeaderLabel';
import HeaderMenu from './src/Components/HeaderMenu';
import { Channels, Users } from './src/Models';
import { RealmService } from './src/realm/RealmService';
import { ChannelScreenComp } from './src/Screens/Channel';
import { ChannelsScreenComp } from './src/Screens/Channels';
import { ProfileComp } from './src/Screens/Profile';
import { RegisterComp } from './src/Screens/Register';
import { Colors } from './src/Utils/Colors';
import JavaJsModule from './src/Utils/JavaJsModule';

if (!BatchedBridge.getCallableModule('JavaJsModule')) {
  BatchedBridge.registerCallableModule('JavaJsModule', JavaJsModule);
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

interface ApplicationState {
  isLogin: boolean;
}

const userRepo: RealmService<Users> = new RealmService<Users>('Users');
const channelRepo: RealmService<Channels> = new RealmService<Channels>('Channels');

export default class App extends Component<any, ApplicationState> {
  constructor(props: any) {
    super(props);
    this.navigationRef = React.createRef<NavigationContainerRef>();
    this.importChannelData = this.importChannelData.bind(this);
    const user = userRepo.getAll()?.find((x) => x.isSystem);
    this.state = {
      isLogin: !!user,
    };
    AppState.addEventListener('change', this.onStateChange.bind(this));
    Linking.addEventListener('url', async (event: { url: string }) => {
      if (this.linkinUrl !== event.url) {
        this.linkinUrl = event.url;
        await this.importChannelData(this.linkinUrl);
      }
    });
  }

  linkinUrl: string;

  componentWillUnmount() {
    AppState.removeEventListener('change', this.onStateChange);
  }

  async onStateChange(state: AppStateStatus) {
    if (state == 'active') {
      const url = await Linking.getInitialURL();
      if (url && this.linkinUrl !== url) {
        this.linkinUrl = url ? url : '';
        await this.importChannelData(this.linkinUrl);
      }
    }
  }

  async importChannelData(url: string) {
    try {
      const dataString = await RNFS.readFile(url);
      const data = JSON.parse(dataString);
      const d = channelRepo.getById(new ObjectId(data.id));
      if (!d) {
        await channelRepo.save({
          id: new ObjectId(data.id),
          Name: data.Name,
          Image: data.Image ? decode(data.Image) : undefined,
          refId: data.refId,
        });
        this.setState({});
        this.navigationRef.current?.navigate('Channels', { refresh: new Date() });
        ToastAndroid.show('Kanal bilgisi başarıyla yüklendiii', 1000);
      }
    } catch (err) {
      console.error(err);
      ToastAndroid.show('Kanal bilgisi yüklenemedi', 1000);
    }
    this.linkinUrl = '';
  }

  navigationRef: React.RefObject<NavigationContainerRef>;

  render() {
    return (
      <MenuProvider skipInstanceCheck={true}>
        <NavigationContainer ref={this.navigationRef}>
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
                  const user = userRepo.getAll()?.find((x) => x.isSystem);
                  this.setState({
                    isLogin: !!user,
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
