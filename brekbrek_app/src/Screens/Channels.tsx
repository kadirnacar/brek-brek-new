import { NavigationProp, RouteProp } from '@react-navigation/core';
import { ObjectId } from 'bson';
import React, { Component } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Results } from 'realm';
import ChannelForm from '../Components/ChannelForm';
import ChannelItem from '../Components/ChannelItem';
import FormModal from '../Components/FormModal';
import { Channels, Users } from '../Models';
import { RealmService } from '../realm/RealmService';
import { ChannelService, UserService } from '../Services';
import { Colors } from '../Utils/Colors';
import { uuidv4 } from '../Utils/Tools';

interface ChannelsState {
  channels?: Results<Channels>;
  showAddModal: boolean;
  newChannel: Channels;
}

interface ChannelsProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any, any>;
}

type Props = ChannelsProps;
export class ChannelsScreenComp extends Component<Props, ChannelsState> {
  constructor(props: Props) {
    super(props);

    this.cancelAddModal = this.cancelAddModal.bind(this);
    this.saveNew = this.saveNew.bind(this);
    this.openAddModal = this.openAddModal.bind(this);
    this.handleItemAction = this.handleItemAction.bind(this);

    this.addInputRef = React.createRef<TextInput>();

    const newChannel = new Channels();
    this.state = {
      channels: undefined,
      showAddModal: false,
      newChannel: newChannel,
    };
  }

  addInputRef: React.RefObject<TextInput>;

  async componentDidMount() {
    const channels = ChannelService.getChannels();
    if (channels) {
      this.setState({
        channels: channels || [],
      });
    }
  }

  componentDidUpdate(prevProp: Props, prevState: ChannelsState) {}

  cancelAddModal() {
    this.setState({ showAddModal: false });
  }

  async saveNew() {
    const { newChannel } = this.state;

    if (!newChannel.id) {
      newChannel.id = new ObjectId();
      const user = UserService.getSystemUser();
      if (user) {
        newChannel.refId = uuidv4();
        newChannel.Contacts = [];
        newChannel.Contacts?.push(user);
        await ChannelService.save(newChannel);
      }
    } else {
      await ChannelService.update(newChannel);
    }

    this.setState({
      showAddModal: false,
      channels: ChannelService.getChannels(),
    });
  }

  openAddModal() {
    const newChannel = new Channels();
    this.setState({ newChannel: newChannel, showAddModal: true }, () => {
      this.addInputRef.current?.focus();
    });
  }

  async handleItemAction(action: string, item: Channels) {
    if (action === 'delete') {
      await ChannelService.delete(item.id);
      const data = ChannelService.getChannels();
      this.setState({
        channels: data,
      });
    } else if (action === 'edit') {
      this.setState({ newChannel: item, showAddModal: true }, () => {
        this.addInputRef.current?.focus();
      });
    }
  }

  render() {
    return (
      <View style={styles.screen}>
        <FormModal
          show={this.state.showAddModal}
          onOkPress={this.saveNew}
          onCancelPress={this.cancelAddModal}
          onCloseModal={this.cancelAddModal}
          title={!this.state.newChannel.id ? 'Yeni Kanal' : 'Kanal Düzenle'}>
          <View style={styles.addModalContainer}>
            <ChannelForm channel={this.state.newChannel} onAction={() => {}} />
          </View>
        </FormModal>
        <View style={styles.content}>
          <FlatList
            data={this.state.channels ? this.state.channels.toJSON() : []}
            style={{ width: '100%' }}
            contentContainerStyle={{
              width: '100%',
            }}
            numColumns={3}
            renderItem={(info) => {
              return (
                <ChannelItem
                  navigation={this.props.navigation}
                  onAction={this.handleItemAction}
                  key={info.index}
                  channel={info.item}
                />
              );
            }}
          />
        </View>
        <FloatingAction
          actions={[
            {
              name: 'add',
              icon: <Icon name="plus" />,
              text: 'Yeni kanal ekle',
              color: Colors.primary,
            },
          ]}
          onPressItem={(name) => {
            if (name === 'add') {
              this.openAddModal();
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
  content: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalContainer: {
    flex: 1,
  },
});
