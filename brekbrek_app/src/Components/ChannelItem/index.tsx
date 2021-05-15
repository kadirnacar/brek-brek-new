import { encode } from 'base64-arraybuffer';
import React, { Component } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import channelGrayIcon from '../../../src/assets/channelgray.png';
import { Channels } from '../../Models';
import { Colors } from '../../Utils/Colors';
import {
  Menu,
  MenuContextProps,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  withMenuContext,
} from 'react-native-popup-menu';

const { height, width } = Dimensions.get('window');

interface ChannelItemState {
  isMenuOpen: boolean;
}

interface ChannelItemProps {
  channel: Channels;
  onAction: (action: string, item: Channels) => void;
}

type Props = ChannelItemProps & MenuContextProps;

class ChannelItem extends Component<Props, ChannelItemState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isMenuOpen: false,
    };
  }

  render() {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onLongPress={() => {
          this.setState({ isMenuOpen: true });
        }}>
        <Menu
          opened={this.state.isMenuOpen}
          onBackdropPress={() => {
            // this.setState({ isMenuOpen: false });
          }}
          onSelect={(val) => {
            this.setState({ isMenuOpen: false });
            if (this.props.onAction) {
              this.props.onAction(val, this.props.channel);
            }
          }}
          onClose={() => {
            // this.setState({ isMenuOpen: false });
          }}>
          <MenuTrigger disabled={false}></MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            <MenuOption text="Sil" value={'delete'} />
          </MenuOptions>
        </Menu>
        <View
          style={{
            width: width / 3 - 30,
            height: width / 3 - 30,
            backgroundColor: Colors.dark,
            // backgroundColor: Colors.generateColor(info.item.Name),
            borderRadius: (width / 3 - 30) / 2,
            borderWidth: 5,
            borderColor: Colors.light,
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}>
          <Image
            resizeMode="center"
            style={{
              width: '70%',
              height: '70%',
              justifyContent: 'center',
              alignSelf: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}
            source={this.props.channel.Image ? encode(this.props.channel.Image) : channelGrayIcon}
          />
        </View>
        <Text style={styles.listItemLabel}>{this.props.channel.Name}</Text>
      </TouchableOpacity>
    );
  }
}

export default withMenuContext(ChannelItem);

const optionsStyles = {
  optionsContainer: {
    backgroundColor: Colors.darker,
    padding: 1,
  },
  optionsWrapper: {
    backgroundColor: Colors.dark,
  },
  optionWrapper: {
    backgroundColor: Colors.dark,
    padding: 10,
    borderBottomWidth: 1,
  },
  optionTouchable: {
    underlayColor: 'gold',
    activeOpacity: 70,
  },
  optionText: {
    color: Colors.lighter,
    fontSize: 16,
  },
};

const styles = StyleSheet.create({
  listItem: { margin: 10, width: width / 3 - 30 },
  listItemLabel: {
    color: Colors.light,
    flexWrap: 'wrap',
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
  },
});
