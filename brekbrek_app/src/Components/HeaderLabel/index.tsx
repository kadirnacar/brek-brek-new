import { encode } from 'base64-arraybuffer';
import React, { Component } from 'react';
import { Image, Text, View } from 'react-native';
import { Users } from '../../Models';
import { Colors } from '../../Utils/Colors';
import noAvatar from '../../assets/no-avatar.png';

interface HeaderLabelState {}

interface HeaderLabelProps {
  user: Users;
}

export class HeaderLabel extends Component<HeaderLabelProps, HeaderLabelState> {
  constructor(props: HeaderLabelProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { user } = this.props;
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'baseline',
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
