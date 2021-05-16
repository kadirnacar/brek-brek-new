import { encode } from 'base64-arraybuffer';
import React, { Component } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import channelGrayIcon from '../../../src/assets/channelgray.png';
import { Channels, Users } from '../../Models';
import { Colors } from '../../Utils/Colors';
import {
  Menu,
  MenuContextProps,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  withMenuContext,
} from 'react-native-popup-menu';
import { NavigationProp } from '@react-navigation/core';

const { height, width } = Dimensions.get('window');

interface UserItemState {
  isMenuOpen: boolean;
}

interface UserItemProps {
  navigation: NavigationProp<any>;
  user: Users;
  onAction: (action: string, item: Users) => void;
}

type Props = UserItemProps & MenuContextProps;

class UserItem extends Component<Props, UserItemState> {
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
        onPress={() => {
          // this.props.navigation.navigate('User', { id: this.props.user.id.toHexString() });
        }}
        onLongPress={() => {
          this.setState({ isMenuOpen: true });
        }}>
        <View
          style={{
            width: width / 3 - 30,
            height: width / 3 - 30,
            backgroundColor: Colors.dark,
            borderRadius: (width / 3 - 30) / 2,
            borderWidth: 5,
            borderColor: Colors.light,
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}>
          <Menu
            opened={this.state.isMenuOpen}
            onBackdropPress={() => {
              this.setState({ isMenuOpen: false });
            }}
            onSelect={(val) => {
              this.setState({ isMenuOpen: false });
              if (this.props.onAction) {
                this.props.onAction(val, this.props.user);
              }
            }}
            onClose={() => {
              this.setState({ isMenuOpen: false });
            }}>
            <MenuTrigger disabled={false}></MenuTrigger>
            <MenuOptions customStyles={optionsStyles}>
              <MenuOption text="Düzenle" value={'edit'} />
              <MenuOption text="Sil" value={'delete'} />
            </MenuOptions>
          </Menu>
          <Image
            resizeMode="cover"
            resizeMethod="scale"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: (width / 3 - 30) / 2,
              justifyContent: 'center',
              alignSelf: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}
            source={
              this.props.user.Image
                ? { uri: `data:image/png;base64,${encode(this.props.user.Image)}` }
                : channelGrayIcon
            }
          />
        </View>
        <Text style={styles.listItemLabel}>{this.props.user.Name}</Text>
      </TouchableOpacity>
    );
  }
}

export default withMenuContext(UserItem);

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
