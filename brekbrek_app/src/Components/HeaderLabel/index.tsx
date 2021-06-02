import { NavigationProp } from '@react-navigation/native';
import { encode } from 'base64-arraybuffer';
import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import noAvatar from '../../assets/no-avatar.png';
import { Users } from '../../Models';
import { UserService } from '../../Services';
import { Colors } from '../../Utils/Colors';

interface HeaderLabelState {
  user?: Users;
}

interface HeaderLabelProps {
  navigation: NavigationProp<any>;
  image?: ArrayBuffer;
  name?: string;
}

type Props = HeaderLabelProps;

export class HeaderLabel extends Component<Props, HeaderLabelState> {
  constructor(props: HeaderLabelProps) {
    super(props);
    const user = UserService.getSystemUser();
    this.state = { user: user };
  }

  render() {
    const user = UserService.getSystemUser();
    return (
      <View style={styles.container}>
        {this.props.navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'chevron-left'} style={styles.backButton} size={20} color={Colors.white} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={() => {
            if (!this.props.name) {
              this.props.navigation.navigate('Profile');
            }
          }}>
          <Image
            resizeMode="cover"
            resizeMethod="scale"
            source={
              this.props.image
                ? this.props.image
                : user?.Image
                ? {
                    uri: `data:image/png;base64,${encode(user.Image)}`,
                  }
                : noAvatar
            }
            style={styles.avatar}></Image>
        </TouchableOpacity>
        <Text style={styles.title}>{this.props.name ? this.props.name : user?.Name}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'baseline',
    marginLeft: 10,
  },
  backButton: {
    marginRight: 10,
    width: 30,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: '100%',
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lighter,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlignVertical: 'center',
  },
});

export default HeaderLabel;
