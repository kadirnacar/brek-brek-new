/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackHeaderProps } from '@react-navigation/stack';
import React, { Component } from 'react';
import { Text, View } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import Icon from 'react-native-vector-icons/FontAwesome5';
import BatchedBridge from 'react-native/Libraries/BatchedBridge/BatchedBridge';
import HeaderMenu from './src/Components/HeaderMenu';
import { Users } from './src/Models';
import { RealmService } from './src/realm/RealmService';
import { HomeScreenComp } from './src/Screens/Home';
import { ProfileComp } from './src/Screens/Profile';
import { RegisterComp } from './src/Screens/Register';
import { Colors } from './src/Utils/Colors';
import JavaJsModule from './src/Utils/JavaJsModule';
import { MenuProvider } from 'react-native-popup-menu';

if (!BatchedBridge.getCallableModule('JavaJsModule')) {
  BatchedBridge.registerCallableModule('JavaJsModule', JavaJsModule);
}

const Stack = createStackNavigator();

interface AppState {
  isLogin: boolean;
}
export default class App extends Component<any, AppState> {
  constructor(props: any) {
    super(props);
    const userRepo: RealmService<Users> = new RealmService<Users>('Users');
    this.state = {
      isLogin: userRepo.getAll().length > 0,
    };
  }

  render() {
    return (
      <MenuProvider skipInstanceCheck={true}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={this.state.isLogin ? 'Home' : 'Register'}
            headerMode="screen"
            mode="modal"
            screenOptions={{
              headerTitle: 'BrekBrek',
              headerTransparent: true,
              headerTintColor: Colors.white,
              headerLeft: () => null,
              headerRight: (props) => <HeaderMenu />,
            }}>
            <Stack.Screen name="Home" component={HomeScreenComp} />
            <Stack.Screen name="Register" component={RegisterComp} />
            <Stack.Screen name="Profile" component={ProfileComp} />
          </Stack.Navigator>
        </NavigationContainer>
      </MenuProvider>
    );
  }
}
