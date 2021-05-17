import { NavigationProp } from '@react-navigation/native';
import { decode, encode } from 'base64-arraybuffer';
import React, { Component } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import noAvatar from '../assets/no-avatar.png';
import { FormModal } from '../Components/FormModal';
import HeaderLabel from '../Components/HeaderLabel';
import { Users } from '../Models/Channels';
import { RealmService } from '../realm/RealmService';
import { Colors } from '../Utils/Colors';
import icon from '../../src/assets/icon.png';

const userRepo: RealmService<Users> = new RealmService<Users>('Users');

interface ProfileState {
  showImageSelector: boolean;
  user?: Users;
}

interface ProfileProps {
  navigation: NavigationProp<any>;
}

type Props = ProfileProps;

export class ProfileComp extends Component<Props, ProfileState> {
  constructor(props: Props) {
    super(props);
    this.showImageModal = this.showImageModal.bind(this);
    this.cancelImageSelector = this.cancelImageSelector.bind(this);
    this.setImageSelector = this.setImageSelector.bind(this);
    this.setCameraSelector = this.setCameraSelector.bind(this);
    this.saveUser = this.saveUser.bind(this);

    this.state = {
      showImageSelector: false,
      user: undefined,
    };
    this.touchableInactive = false;
  }

  touchableInactive: boolean;

  componentDidMount() {
    const user = userRepo.getAll()?.find((x) => x.isSystem);
    this.setState({
      user: user
        ? { id: user?.id, isSystem: true, Image: user?.Image, Name: user?.Name }
        : undefined,
    });
    this.props.navigation.setOptions({
      headerLeft: (propss: any) => (
        <HeaderLabel navigation={this.props.navigation} image={icon} name={'BrekBrek'} />
      ),
    });
  }

  showImageModal() {
    this.setState({ showImageSelector: true });
  }

  cancelImageSelector() {
    this.setState({ showImageSelector: false });
  }

  setImageSelector() {
    this.setState({ showImageSelector: false });
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true, maxHeight: 500, maxWidth: 500, quality: 0.7 },
      (response) => {
        if (response.base64 && this.state.user) {
          const { user } = this.state;
          user.Image = decode(response.base64);
          this.setState({ user });
        }
      }
    );
  }

  setCameraSelector() {
    this.setState({ showImageSelector: false });
    launchCamera(
      { mediaType: 'photo', includeBase64: true, maxHeight: 500, maxWidth: 500, quality: 0.7 },
      async (response) => {
        if (response.base64 && this.state.user) {
          const { user } = this.state;
          user.Image = decode(response.base64);
          this.setState({ user });
        }
      }
    );
  }

  async saveUser() {
    if (!this.touchableInactive) {
      this.touchableInactive = true;

      if (this.state.user) {
        await userRepo.update(this.state.user.id, this.state.user);
      }
      ToastAndroid.showWithGravity('Bilgileriniz Kaydedilmiştir', 1000, ToastAndroid.TOP);
      this.touchableInactive = false;
    }
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        <FormModal
          show={this.state.showImageSelector}
          hideOkButton={true}
          onCancelPress={this.cancelImageSelector}
          onCloseModal={this.cancelImageSelector}
          title="Resim Seçiniz">
          <View style={styles.imageSelectorContainer}>
            <TouchableOpacity onPress={this.setImageSelector} style={styles.imageSelectorItem}>
              <Text style={styles.imageSelectorItemText}>Galeri</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.setCameraSelector} style={styles.imageSelectorItem}>
              <Text style={styles.imageSelectorItemText}>Kamera</Text>
            </TouchableOpacity>
          </View>
        </FormModal>
        <View style={styles.content}>
          <TouchableOpacity onPress={this.showImageModal} style={styles.imageContainer}>
            <Image
              resizeMode="cover"
              source={
                this.state.user && this.state.user.Image
                  ? { uri: `data:image/png;base64,${encode(this.state.user.Image)}` }
                  : noAvatar
              }
              style={styles.image}
            />
            <Text style={styles.imageLabel}>Resim Seç</Text>
          </TouchableOpacity>
          <Text style={styles.label}>Rumuz</Text>
          <TextInput
            value={this.state.user ? this.state.user.Name : ''}
            onChangeText={(text) => {
              const { user } = this.state;

              if (user) {
                user.Name = text;
                this.setState({ user });
              }
            }}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.enterButton}
            onPress={this.saveUser}
            disabled={!this.state.user || !this.state.user.Name}>
            <Text style={styles.enterButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  label: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 16,
    fontWeight: 'bold',
    borderRadius: 30,
    color: Colors.black,
    paddingHorizontal: 20,
    textAlign: 'center',
    backgroundColor: Colors.lighter,
    width: '100%',
    fontFamily: 'Nunito-Regular',
    textAlignVertical: 'center',
    marginTop: 4,
  },
  imageContainer: {
    marginBottom: 50,
  },
  imageLabel: {
    color: Colors.white,
    textAlign: 'center',
  },
  image: {
    height: 180,
    width: 180,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.lighter,
    marginBottom: 10,
  },
  imageSelectorContainer: {
    flex: 1,
  },
  imageSelectorItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  imageSelectorItemText: {
    color: Colors.light,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  enterButtonText: {
    color: Colors.lighter,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  enterButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: Colors.dark,
    width: '100%',
    fontFamily: 'Nunito-Regular',
    textAlignVertical: 'center',
    marginTop: 20,
  },
});
