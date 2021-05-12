import React, { Component } from 'react';
import { NativeModules, SafeAreaView, TouchableOpacity, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { IHelperModule } from '../Utils/IHelperModule';

const HelperModule: IHelperModule = NativeModules.HelperModule;

export class HomeScreenComp extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      isDarkMode: true,
      service: false,
      record: false,
    };
    console.log('constructor');
  }

  componentWillUnmount() {
    console.log('unmount');
  }

  componentDidMount() {
    console.log('mount');
    const status = HelperModule.getServiceStatus();
    if (status == 'running') {
      // HelperModule.startService('kanal 1');
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
            onPress={async () => {
              if (this.state.service) {
                await HelperModule.stopService();
                this.setState({ service: false });
              } else {
                await HelperModule.startService('kanal 1');
                this.setState({ service: true });
              }
            }}
            style={{
              backgroundColor: this.state.isDarkMode ? Colors.black : Colors.white,
              borderWidth: 2,
              height: 100,
              width: 100,
              borderRadius: 60,
              alignContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            <Icon
              name={this.state.service ? 'toggle-on' : 'toggle-off'}
              size={60}
              color={this.state.isDarkMode ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
          {this.state.service ? (
            <TouchableOpacity
              onPressIn={async () => {
                await HelperModule.startRecorder();
                this.setState({ record: true });
              }}
              onPressOut={async () => {
                await HelperModule.stopRecorder();
                this.setState({ record: false });
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
          ) : null}
        </View>
      </SafeAreaView>
    );
  }
}
