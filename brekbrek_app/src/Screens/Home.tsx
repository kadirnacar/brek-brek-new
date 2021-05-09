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
      service: false,
      record: false,
    };
    DeviceEventEmitter.addListener('getMessage', (event) => {
      console.log('service message', event.message);
    });
  }

  componentDidMount() {
    const status = HelperModule.getServiceStatus();
    if (status == 'stopped') {
      HelperModule.startService('kanal 1');
      this.setState({ service: true });
    }
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
              if (this.state.record) {
                HelperModule.stopRecorder();
                this.setState({ record: false });
              } else {
                HelperModule.startRecorder();
                this.setState({ record: true });
              }
            }}
            style={{
              backgroundColor: this.state.isDarkMode ? Colors.black : Colors.white,
              borderWidth: 2,
              borderColor: this.state.record ? Colors.white : Colors.black,
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
