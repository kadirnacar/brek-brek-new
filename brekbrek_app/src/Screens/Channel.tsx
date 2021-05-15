import { NavigationProp } from '@react-navigation/core';
import React, { Component } from 'react';
import { NativeModules, StyleSheet, View } from 'react-native';
import { Channels } from '../Models';
import { RealmService } from '../realm/RealmService';
import { Colors } from '../Utils/Colors';
import { IHelperModule } from '../Utils/IHelperModule';

const HelperModule: IHelperModule = NativeModules.HelperModule;
const channelRepo: RealmService<Channels> = new RealmService<Channels>('Channels');
interface ChannelState {}

interface ChannelProps {
  navigation: NavigationProp<any>;
}

type Props = ChannelProps;

export class ChannelScreenComp extends Component<Props, ChannelState> {
  constructor(props: Props) {
    super(props);
  }

  async componentDidMount() {
    HelperModule.startService("kanal 1");
  }

  componentWillUnmount(){
    HelperModule.stopService();
  }

  render() {
    return <View style={styles.screen}></View>;
  }
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.darker,
    flex: 1,
    paddingTop: 70,
  },
});
