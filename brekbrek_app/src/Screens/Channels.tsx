import { NavigationProp } from '@react-navigation/core';
import { ObjectId } from 'bson';
import React, { Component } from 'react';
import { Dimensions, FlatList, StyleSheet, TextInput, View } from 'react-native';
import FAB from 'react-native-fab';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ChannelItem from '../Components/ChannelItem';
import FormModal from '../Components/FormModal';
import { Channels, Users } from '../Models';
import { RealmService } from '../realm/RealmService';
import { Colors } from '../Utils/Colors';

const userRepo: RealmService<Users> = new RealmService<Users>('Users');
const channelRepo: RealmService<Channels> = new RealmService<Channels>('Channels');
const { height, width } = Dimensions.get('window');

interface ChannelsState {
  channels: Channels[];
  showAddModal: boolean;
  newChannel: Channels;
}

interface ChannelsProps {
  navigation: NavigationProp<any>;
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
      channels: [],
      showAddModal: false,
      newChannel: newChannel,
    };
  }

  addInputRef: React.RefObject<TextInput>;

  async componentDidMount() {
    this.setState({
      channels: channelRepo.getAll().toJSON(),
    });
  }

  cancelAddModal() {
    this.setState({ showAddModal: false });
  }

  async saveNew() {
    const { newChannel } = this.state;

    if (!newChannel.id) {
      newChannel.id = new ObjectId();
      await channelRepo.save(newChannel);
    }
    this.setState({
      showAddModal: false,
      channels: channelRepo.getAll().toJSON(),
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
      await channelRepo.delete(channelRepo.getById(item.id));
      this.setState({
        channels: channelRepo.getAll().toJSON(),
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
          title="Yeni Kanal">
          <View style={styles.addModalContainer}>
            <TextInput
              placeholder="Kanal Adı"
              autoFocus={true}
              clearButtonMode="always"
              clearTextOnFocus
              ref={this.addInputRef}
              placeholderTextColor={Colors.dark}
              value={this.state.newChannel.Name ? this.state.newChannel.Name : ''}
              onChangeText={(text) => {
                const { newChannel } = this.state;
                newChannel.Name = text;
                this.setState({ newChannel });
              }}
              style={styles.addInput}
            />
          </View>
        </FormModal>
        <View style={styles.content}>
          <FlatList
            data={this.state.channels}
            style={{ width: '100%' }}
            contentContainerStyle={{
              width: '100%',
            }}
            numColumns={3}
            renderItem={(info) => (
              <ChannelItem onAction={this.handleItemAction} key={info.index} channel={info.item} />
            )}
          />
        </View>

        <FAB
          buttonColor={Colors.primary}
          iconTextColor={Colors.white}
          onClickAction={this.openAddModal}
          visible={true}
          iconTextComponent={<Icon name="plus" />}
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
  addInput: {
    color: Colors.black,
    backgroundColor: Colors.lighter,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 7,
  },
});
