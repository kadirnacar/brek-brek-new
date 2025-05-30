import { NavigationProp } from '@react-navigation/core';
import { ObjectId } from 'bson';
import React, { Component } from 'react';
import { FlatList, StyleSheet, ToastAndroid, View } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ContactItem from '../Components/ContactItem';
import { Users } from '../Models';
import { InviteService, UserService } from '../Services';
import { Colors } from '../Utils/Colors';
import { config } from '../Utils/config';

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
    this.shareInvite = this.shareInvite.bind(this);
    this.handleItemAction = this.handleItemAction.bind(this);
    this.handleContactItemPress = this.handleContactItemPress.bind(this);

    this.state = {
      contacts: undefined,
    };
  }

  async handleItemAction(action: string, item: Users) {
    if (action === 'delete') {
      await UserService.delete(item.id);
      const data = UserService.getContacts();
      this.setState({
        contacts: data,
      });
    }
  }

  async shareInvite() {
    const user = UserService.getSystemUser();

    const postUrl = `${config.serverUrl}/invite`;
    const inviteResponse = await fetch(postUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: user?.Name, refId: user?.refId, id: user?.id.toHexString() }),
    });

    if (inviteResponse.ok) {
      const resp = await inviteResponse.json();

      if (resp.inviteId) {
        const shareUrl = `${config.inviteUrl}/${resp.inviteId}`;
        await InviteService.save({ id: new ObjectId(resp.inviteId) });

        try {
          const result = await Share.open({
            title: 'Kanal Daveti',
            message: 'Davet Et',
            subject: 'Davet',
            url: shareUrl,
          });
          if (!result.success) {
            try {
              await fetch(postUrl, {
                method: 'DELETE',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: resp.inviteId,
                }),
              });
              await InviteService.delete(resp.inviteId);
            } catch {}
          }
        } catch (err) {
          try {
            await fetch(postUrl, {
              method: 'DELETE',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: resp.inviteId,
              }),
            });
            await InviteService.delete(resp.inviteId);
          } catch {}
        }
      }
    } else {
      ToastAndroid.show('İnternet bağlantı hatası', 500);
    }
  }

  async componentDidMount() {
    const contacts = UserService.getContacts();
    if (contacts) {
      this.setState({
        contacts: contacts || [],
      });
    }
  }

  handleContactItemPress(contact: Users) {
    this.props.navigation.navigate('Channel', { type: 'Contact', id: contact.id.toHexString() });
  }

  render() {
    const data = this.state.contacts ? this.state.contacts : [];
    // data.push(...data);
    // data.push(...data);
    // data.push(...data);
    // data.push(...data);
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <FlatList
            data={data}
            style={{ width: '100%' }}
            contentContainerStyle={{
              width: '100%',
            }}
            numColumns={4}
            renderItem={(info) => {
              return (
                <ContactItem
                  onPress={this.handleContactItemPress}
                  onAction={this.handleItemAction}
                  key={info.index}
                  contact={info.item}
                />
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
          onPressItem={async (name) => {
            if (name === 'invite') {
              await this.shareInvite();
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
