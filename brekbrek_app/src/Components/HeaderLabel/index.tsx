import { NavigationProp } from '@react-navigation/native';
import { encode } from 'base64-arraybuffer';
import React, { Component } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import noAvatar from '../../assets/no-avatar.png';
import { Users } from '../../Models';
import { Colors } from '../../Utils/Colors';

interface HeaderLabelState {}

interface HeaderLabelProps {
  user: Users;
  navigation: NavigationProp<any>;
}

type Props = HeaderLabelProps;

export class HeaderLabel extends Component<Props, HeaderLabelState> {
  constructor(props: HeaderLabelProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { user } = this.props;
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'baseline',
        }}>
        {this.props.navigation.canGoBack() ? (
          <Icon
            name={'chevron-left'}
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
            onPress={() => {
              this.props.navigation.goBack();
            }}
          />
        ) : null}
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('Profile');
          }}>
          <Image
            resizeMode="cover"
            source={user.Image ? { uri: `data:image/png;base64,${encode(user.Image)}` } : noAvatar}
            style={{
              height: 40,
              width: 40,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: Colors.lighter,
              marginRight: 10,
            }}></Image>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.white,
            textAlignVertical: 'center',
          }}>
          {user.Name}
        </Text>
      </View>
    );
  }
}

export default HeaderLabel;
