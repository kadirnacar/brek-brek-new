import { encode } from 'base64-arraybuffer';
import React, { Component } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { Users } from '../../Models';
import noAvatar from '../../assets/no-avatar.png';

const { height, width } = Dimensions.get('window');

interface ContactItemState {
  isMenuOpen: boolean;
}

interface ContactItemProps {
  contact: Users;
  onAction: (action: string, item: Users) => Promise<void>;
  onPress: (item: Users) => void;
}

type Props = ContactItemProps & MenuContextProps;

class ContactItem extends Component<Props, ContactItemState> {
  constructor(props: Props) {
    super(props);
    this.onMenuBackdropPress = this.onMenuBackdropPress.bind(this);
    this.onMenuClose = this.onMenuClose.bind(this);
    this.onMenuSelect = this.onMenuSelect.bind(this);
    this.onNavigateLongPress = this.onNavigateLongPress.bind(this);
    this.onNavigatePress = this.onNavigatePress.bind(this);

    this.state = {
      isMenuOpen: false,
    };
  }

  onNavigatePress() {
    if (this.props.onPress) {
      this.props.onPress(this.props.contact);
    }
  }

  onNavigateLongPress() {
    this.setState({ isMenuOpen: true });
  }

  onMenuBackdropPress() {
    this.setState({ isMenuOpen: false });
  }

  async onMenuSelect(val: string) {
    this.setState({ isMenuOpen: false }, async () => {
      if (this.props.onAction) {
        await this.props.onAction(val, this.props.contact);
      }
    });
  }

  onMenuClose() {
    this.setState({ isMenuOpen: false });
  }
  render() {
    const itemSize = width / 4 - 30;
    return this.props.contact ? (
      <TouchableOpacity
        style={[{ width: itemSize }, styles.listItem]}
        onPress={this.onNavigatePress}
        onLongPress={this.onNavigateLongPress}>
        <View
          style={{
            width: itemSize,
            height: itemSize,
            backgroundColor: Colors.dark,
            // backgroundColor: Colors.generateColor(info.item.Name),
            borderRadius: itemSize / 2,
            borderWidth: 5,
            borderColor: Colors.light,
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}>
          <Menu
            opened={this.state.isMenuOpen}
            onBackdropPress={this.onMenuBackdropPress}
            onSelect={this.onMenuSelect}
            onClose={this.onMenuClose}>
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
              borderRadius: itemSize / 2,
              justifyContent: 'center',
              alignSelf: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}
            source={
              this.props.contact.Image
                ? { uri: `data:image/png;base64,${encode(this.props.contact.Image)}` }
                : noAvatar
            }
          />
        </View>
        <Text style={styles.listItemLabel}>{this.props.contact.Name}</Text>
      </TouchableOpacity>
    ) : null;
  }
}

export default withMenuContext(ContactItem);

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
  listItem: { margin: 10 },
  listItemLabel: {
    color: Colors.light,
    flexWrap: 'wrap',
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
  },
});
