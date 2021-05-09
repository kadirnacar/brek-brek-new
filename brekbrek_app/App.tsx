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
import { createStackNavigator } from '@react-navigation/stack';
import React, { Component } from 'react';
import 'react-native-gesture-handler';
import BatchedBridge from 'react-native/Libraries/BatchedBridge/BatchedBridge';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { HomeScreenComp } from './src/Screens/Home';
import JavaJsModule from './src/Utils/JavaJsModule';

if (!BatchedBridge.getCallableModule('JavaJsModule')) {
  BatchedBridge.registerCallableModule('JavaJsModule', JavaJsModule);
}

const Stack = createStackNavigator();
export default class App extends Component<any, any> {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          headerMode="screen"
          mode="modal"
          screenOptions={{
            title: 'BrekBrek',
            headerStyle: { backgroundColor: Colors.black },
            headerTitleStyle: { color: Colors.white },
          }}>
          <Stack.Screen name="Home" component={HomeScreenComp} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
