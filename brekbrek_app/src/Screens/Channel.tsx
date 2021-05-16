import { NavigationProp, RouteProp } from '@react-navigation/core';
import { ObjectId } from 'bson';
import React, { Component } from 'react';
import { FlatList, NativeModules, StyleSheet, View } from 'react-native';
import HeaderLabel from '../Components/HeaderLabel';
import { Channels } from '../Models';
import { RealmService } from '../realm/RealmService';
import { Colors } from '../Utils/Colors';
import { IHelperModule } from '../Utils/IHelperModule';
import channelGrayIcon from '../../src/assets/channelgray.png';
import { encode } from 'base64-arraybuffer';
import UserItem from '../Components/UserItem';

const HelperModule: IHelperModule = NativeModules.HelperModule;
const channelRepo: RealmService<Channels> = new RealmService<Channels>('Channels');
interface ChannelState {
  channel?: Channels;
}

interface ChannelProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any, any>;
}

type Props = ChannelProps;

export class ChannelScreenComp extends Component<Props, ChannelState> {
  constructor(props: Props) {
    super(props);
    this.handleItemAction = this.handleItemAction.bind(this);
    this.state = {
      channel: undefined,
    };
  }

  async componentDidMount() {
    const params = this.props.route.params ? this.props.route.params : {};

    const channel = channelRepo.getById(new ObjectId(params.id));
    this.props.navigation.setOptions({
      headerLeft: (propss: any) => (
        <HeaderLabel
          navigation={this.props.navigation}
          name={channel.Name}
          image={
            channel.Image
              ? {
                  uri: `data:image/png;base64,${encode(channel.Image)}`,
                }
              : channelGrayIcon
          }
        />
      ),
    });

    this.setState({ channel: channel });
    HelperModule.startService(channel.Name);
  }

  componentWillUnmount() {
    HelperModule.stopService();
  }

  async handleItemAction(action: string, item: Channels) {
    if (action === 'delete') {
    } else if (action === 'edit') {
    }
  }

  render() {
    return (
      <View style={styles.screen}>
        <FlatList
          data={
            this.state.channel && this.state.channel.Contacts ? this.state.channel.Contacts : []
          }
          style={{ width: '100%' }}
          contentContainerStyle={{
            width: '100%',
          }}
          numColumns={3}
          renderItem={(info) => (
            <UserItem
              navigation={this.props.navigation}
              onAction={this.handleItemAction}
              key={info.index}
              user={info.item}
            />
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.darker,
    flex: 1,
    paddingTop: 70,
  },
});
