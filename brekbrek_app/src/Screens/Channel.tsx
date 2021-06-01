import { NavigationProp, RouteProp } from '@react-navigation/core';
import { encode } from 'base64-arraybuffer';
import React, { Component } from 'react';
import { FlatList, NativeModules, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import Icon from 'react-native-vector-icons/FontAwesome5';
import channelGrayIcon from '../../src/assets/channelgray.png';
import noAvatar from '../../src/assets/no-avatar.png';
import HeaderLabel from '../Components/HeaderLabel';
import UserItem from '../Components/UserItem';
import { Users } from '../Models';
import { ChannelService, UserService } from '../Services';
import { Colors } from '../Utils/Colors';
import { IHelperModule } from '../Utils/IHelperModule';
import JavaJsModule from '../Utils/JavaJsModule';

const HelperModule: IHelperModule = NativeModules.HelperModule;
interface ChannelState {
  contacts: Users[];
  onlines: string[];
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
    this.navigationRefresh = this.navigationRefresh.bind(this);
    this.state = {
      contacts: [],
      onlines: [],
    };
    this.props.navigation.addListener('state', this.navigationRefresh);
  }

  async componentDidMount() {
    const params = this.props.route.params ? this.props.route.params : {};
    const user = UserService.getSystemUser();
    if (params.type == 'Contact') {
      const contact = UserService.getUser(params.id);

      if (contact) {
        // this.props.navigation.setOptions({
        //   headerLeft: (propss: any) => (
        //     <HeaderLabel
        //       navigation={this.props.navigation}
        //       name={contact.Name}
        //       image={
        //         contact.Image
        //           ? {
        //               uri: `data:image/png;base64,${encode(contact.Image)}`,
        //             }
        //           : noAvatar
        //       }
        //     />
        //   ),
        // });

        this.setState({ contacts: [contact] });
        await HelperModule.startService(contact.Name || '', `${user?.refId}/${contact.refId}`);
      }
    } else if (params.type == 'Channel') {
      const channel = ChannelService.get(params.id);
      if (channel) {
        // this.props.navigation.setOptions({
        //   headerLeft: (propss: any) => (
        //     <HeaderLabel
        //       navigation={this.props.navigation}
        //       name={channel.Name}
        //       image={
        //         channel.Image
        //           ? {
        //               uri: `data:image/png;base64,${encode(channel.Image)}`,
        //             }
        //           : channelGrayIcon
        //       }
        //     />
        //   ),
        // });

        if (channel.Contacts) {
          this.setState({ contacts: channel.Contacts });
        }
        await HelperModule.startService(channel.Name, channel.id.toHexString());
      }
    }
  }

  async componentWillUnmount() {
    await HelperModule.stopService();
    this.props.navigation.removeListener('state', this.navigationRefresh);
  }

  navigationRefresh(e: any) {
    const d = UserService.getSystemUser();
    if (this.props.route.params?.contactId) {
      const { onlines } = this.state;
      if (this.props.route.params?.status == 'online') {
        onlines.push(this.props.route.params?.contactId);
      } else if (onlines.indexOf(this.props.route.params?.contactId) > -1) {
        onlines.splice(onlines.indexOf(this.props.route.params?.contactId), 1);
      }
      this.setState({ onlines });
    }
  }

  async handleItemAction(action: string, item: Users) {
    if (action === 'delete') {
    } else if (action === 'edit') {
    }
  }

  async shareChannel() {
    // RNFS.writeFile(
    //   `file:///${RNFS.CachesDirectoryPath}/channel.brekbrek`,
    //   JSON.stringify({
    //     id: this.state.channel?.id.toHexString(),
    //     Name: this.state.channel?.Name,
    //     refId: this.state.channel?.refId,
    //     Image:
    //       this.state.channel && this.state.channel.Image ? encode(this.state.channel.Image) : '',
    //   })
    // );
    // const result = await Share.open({
    //   title: 'Kanal Daveti',
    //   message: 'Davet Et',
    //   url: `file:///${RNFS.CachesDirectoryPath}/channel.brekbrek`,
    // });
  }

  render() {
    return (
      <View style={styles.screen}>
        <FlatList
          data={this.state.contacts ? this.state.contacts : []}
          style={{ width: '100%' }}
          contentContainerStyle={{
            width: '100%',
            alignItems: 'center',
          }}
          numColumns={3}
          renderItem={(info) => {
            return (
              <UserItem
                navigation={this.props.navigation}
                onAction={this.handleItemAction}
                key={info.index}
                user={info.item}
                isOnline={this.state.onlines.indexOf(info.item.refId || '') > -1}
              />
            );
          }}
        />
        <TouchableOpacity
          onPressIn={async () => {
            await JavaJsModule.startRecord();
          }}
          onPressOut={async () => {
            await JavaJsModule.stopRecord();
          }}
          style={{
            alignContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            borderWidth: 1,
            borderColor: Colors.white,
            padding: 20,
            borderRadius: 40,
            width: 80,
            height: 80,
          }}>
          <Icon name="microphone" size={30} color={Colors.white}></Icon>
        </TouchableOpacity>
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
              JavaJsModule.rtcConnection.sendMessage({ type: 'ping' });
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
