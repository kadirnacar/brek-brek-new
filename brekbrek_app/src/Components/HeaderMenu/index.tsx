import React, { Component } from 'react';
import { NavigationProp } from '@react-navigation/core';
import { TouchableOpacity } from 'react-native';
import {
  Menu,
  MenuContextProps,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  withMenuContext,
} from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Colors } from '../../Utils/Colors';

interface HeaderMenuState {
  isMenuOpen: boolean;
}

interface HeaderMenuProps {
  navigation: NavigationProp<any>;
}

type Props = HeaderMenuProps & MenuContextProps;

class HeaderMenu extends Component<Props, HeaderMenuState> {
  constructor(props: Props) {
    super(props);
    this.state = { isMenuOpen: false };
  }
  componentWillUnmount() {
    this.props.ctx.menuActions.closeMenu();
  }
  render() {
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            this.setState({ isMenuOpen: true });
          }}>
          <Icon
            name={'ellipsis-v'}
            style={{
              marginRight: 5,
              width: 30,
              alignContent: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              textAlign: 'center',
              textAlignVertical: 'center',
              height: '100%',
            }}
            size={20}
            color={Colors.white}
          />
        </TouchableOpacity>
        <Menu
          style={{ marginTop: -10 }}
          opened={this.state.isMenuOpen}
          onBackdropPress={() => {
            this.setState({ isMenuOpen: false });
          }}
          onSelect={(val) => {
            if (val === 'profile') {
              this.props.navigation.navigate('Profile');
            }
            this.setState({ isMenuOpen: false });
          }}
          onClose={() => {
            this.setState({ isMenuOpen: false });
          }}>
          <MenuTrigger disabled={false}></MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            <MenuOption text="Profil" value={'profile'} />
          </MenuOptions>
        </Menu>
      </>
    );
  }
}

export default withMenuContext(HeaderMenu);

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
