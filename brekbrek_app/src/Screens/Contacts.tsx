import { NavigationProp } from '@react-navigation/core';
import React, { Component } from 'react';
import { FlatList, NativeModules, StyleSheet, Text, View } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Users } from '../Models';
import { RealmService } from '../realm/RealmService';
import { Colors } from '../Utils/Colors';
import { IHelperModule } from '../Utils/IHelperModule';

const HelperModule: IHelperModule = NativeModules.HelperModule;
const userRepo: RealmService<Users> = new RealmService<Users>('Users');

interface ContactsProps {
  navigation: NavigationProp<any>;
}

interface ContactState {
  contacts?: Users[];
}

type Props = ContactsProps;
export class ContactsScreenComp extends Component<Props, ContactState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      contacts: undefined,
    };
  }

  async componentDidMount() {
    const contacts = userRepo.getAll()?.filter((x) => !x.isSystem);
    if (contacts) {
      this.setState({
        contacts: contacts || [],
      });
    }
  }

  render() {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <FlatList
            data={this.state.contacts ? this.state.contacts : []}
            style={{ width: '100%' }}
            contentContainerStyle={{
              width: '100%',
            }}
            numColumns={3}
            renderItem={(info) => {
              return (
                <View>
                  <Text>{info.item.Name}</Text>
                </View>
              );
            }}
          />
        </View>
        <FloatingAction
          actions={[
            {
              name: 'invite',
              icon: <Icon color={Colors.white} name="share-alt" />,
              text: 'Kişi Davet Et',
              color: Colors.primary,
            },
          ]}
          onPressItem={(name) => {
            if (name === 'invite') {
              // this.openAddModal();
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
