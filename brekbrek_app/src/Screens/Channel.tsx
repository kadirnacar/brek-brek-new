import { NavigationProp, RouteProp } from '@react-navigation/core';
import { encode } from 'base64-arraybuffer';
import { ObjectId } from 'bson';
import React, { Component } from 'react';
import { FlatList, NativeModules, StyleSheet, View } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import * as RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/FontAwesome5';
import channelGrayIcon from '../../src/assets/channelgray.png';
import HeaderLabel from '../Components/HeaderLabel';
import UserItem from '../Components/UserItem';
import { Channels, Users } from '../Models';
import { RealmService } from '../realm/RealmService';
import { ChannelService } from '../Services';
import { Colors } from '../Utils/Colors';
import { IHelperModule } from '../Utils/IHelperModule';
import JavaJsModule from '../Utils/JavaJsModule';

const HelperModule: IHelperModule = NativeModules.HelperModule;
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
    this.shareChannel = this.shareChannel.bind(this);
    this.state = {
      channel: undefined,
    };
  }

  async componentDidMount() {
    const params = this.props.route.params ? this.props.route.params : {};

    const channel = ChannelService.get(params.id);
    if (channel) {
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
      HelperModule.startService(channel.Name, channel.id.toHexString());
    }
  }

  componentWillUnmount() {
    HelperModule.stopService();
  }

  async handleItemAction(action: string, item: Users) {
    if (action === 'delete') {
    } else if (action === 'edit') {
    }
  }

  async shareChannel() {
    RNFS.writeFile(
      `file:///${RNFS.CachesDirectoryPath}/channel.brekbrek`,
      JSON.stringify({
        id: this.state.channel?.id.toHexString(),
        Name: this.state.channel?.Name,
        refId: this.state.channel?.refId,
        Image:
          this.state.channel && this.state.channel.Image ? encode(this.state.channel.Image) : '',
      })
    );
    const result = await Share.open({
      title: 'Kanal Daveti',
      message: 'Davet Et',
      url: `file:///${RNFS.CachesDirectoryPath}/channel.brekbrek`,
    });
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

        <FloatingAction
          actions={[
            {
              name: 'add',
              icon: <Icon name="plus" />,
              text: 'Kişi ekle',
              color: Colors.primary,
            },
            {
              name: 'invite',
              icon: <Icon name="share-alt" color={Colors.white} />,
              text: 'Davet et',
              color: Colors.primary,
            },
            {
              name: 'ping',
              icon: <Icon name="plus" />,
              text: 'ping',
              color: Colors.primary,
            },
          ]}
          onPressItem={async (name) => {
            if (name == 'ping' && JavaJsModule.rtcConnection) {
              JavaJsModule.rtcConnection.sendMessage('ddd', { type: 'ping' });
            } else if (name === 'invite') {
              await this.shareChannel();
            }
          }}
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
