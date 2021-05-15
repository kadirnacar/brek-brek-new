import { NavigationProp } from '@react-navigation/core';
import { StackHeaderTitleProps } from '@react-navigation/stack';
import React, { Component } from 'react';
import { NativeModules, SafeAreaView, Text, View } from 'react-native';
import HeaderLabel from '../Components/HeaderLabel';
import { Users } from '../Models';
import { RealmService } from '../realm/RealmService';
import { IHelperModule } from '../Utils/IHelperModule';

const HelperModule: IHelperModule = NativeModules.HelperModule;

interface ContactsProps {
  navigation: NavigationProp<any>;
}

type Props = ContactsProps;
export class ContactsScreenComp extends Component<Props, any> {
  constructor(props: Props) {
    super(props);

    const userRepo: RealmService<Users> = new RealmService<Users>('Users');
    const users = userRepo.getAll();
    const user = users[users.length - 1];
    this.state = {
      isDarkMode: true,
      service: false,
      record: false,
      user: user,
    };
  }

  async componentDidMount() {
    const status = HelperModule.getServiceStatus();

    if (status == 'running') {
      this.setState({ service: true });
    }
  }

  render() {
    return (
      <SafeAreaView>
        <View
          style={{
            flex: 1,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Contacts</Text>
        </View>
      </SafeAreaView>
    );
  }
}
