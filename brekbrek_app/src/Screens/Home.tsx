import React, { Component } from 'react';
import {
  NativeModules,
  SafeAreaView,
  TouchableOpacity,
  View,
  ViewStyle,
  DeviceEventEmitter,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const { HelperModule } = NativeModules;

export class HomeScreenComp extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      isDarkMode: true,
    };
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('getMessage', (event) => {
      console.log('MyCustomEvent -->', event);
      console.log('MyCustomEvent MyCustomEventParam -->', event.message);
      // Add your Business Logic over here
    });
  }

  render() {
    const backgroundStyle: ViewStyle = {
      backgroundColor: this.state.isDarkMode ? Colors.darker : Colors.lighter,
      flex: 1,
    };
    return (
      <SafeAreaView style={backgroundStyle}>
        <View
          style={{
            flex: 1,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              console.log(HelperModule.getDeviceId());
            }}
            style={{
              backgroundColor: this.state.isDarkMode ? Colors.black : Colors.white,
              height: 100,
              width: 100,
              borderRadius: 60,
              alignContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            <Icon
              name="microphone"
              size={60}
              color={this.state.isDarkMode ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}
