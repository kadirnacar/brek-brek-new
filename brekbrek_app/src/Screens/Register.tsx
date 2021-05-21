import { NavigationProp } from '@react-navigation/native';
import { decode } from 'base64-arraybuffer';
import { ObjectId } from 'bson';
import React, { Component } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import noAvatar from '../assets/no-avatar.png';
import { FormModal } from '../Components/FormModal';
import { Users } from '../Models/Channels';
import { RealmService } from '../realm/RealmService';
import { UserService } from '../Services';
import { Colors } from '../Utils/Colors';
import { uuidv4 } from '../Utils/Tools';

interface RegisterState {
  showImageSelector: boolean;
  selectedImage?: string;
  selectedNickname?: string;
}

interface RegisterProps {
  navigation: NavigationProp<any>;
}

type Props = RegisterProps;

export class RegisterComp extends Component<Props, RegisterState> {
  constructor(props: any) {
    super(props);
    this.showImageModal = this.showImageModal.bind(this);
    this.cancelImageSelector = this.cancelImageSelector.bind(this);
    this.setImageSelector = this.setImageSelector.bind(this);
    this.setCameraSelector = this.setCameraSelector.bind(this);
    this.saveUser = this.saveUser.bind(this);

    this.state = {
      showImageSelector: false,
    };

    this.props.navigation.setOptions({
      headerTitle: 'BrekBrek',
      headerTitleStyle: { textAlign: 'center', color: Colors.white },
    });
    this.touchableInactive = false;
  }

  touchableInactive: boolean;

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
        this.setState({ selectedImage: response.base64 });
      }
    );
  }

  setCameraSelector() {
    this.setState({ showImageSelector: false });
    launchCamera(
      { mediaType: 'photo', includeBase64: true, maxHeight: 500, maxWidth: 500, quality: 0.7 },
      async (response) => {
        this.setState({ selectedImage: response.base64 });
      }
    );
  }

  async saveUser() {
    if (!this.touchableInactive) {
      this.touchableInactive = true;
      await UserService.save({
        refId: uuidv4(),
        Name: this.state.selectedNickname ? this.state.selectedNickname : '',
        Image: this.state.selectedImage ? decode(this.state.selectedImage) : undefined,
      });
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'Channels' }],
      });
      this.props.navigation.navigate('Channels');
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
                this.state.selectedImage
                  ? { uri: `data:image/png;base64,${this.state.selectedImage}` }
                  : noAvatar
              }
              style={styles.image}
            />
            <Text style={styles.imageLabel}>Resim Seç</Text>
          </TouchableOpacity>
          <Text style={styles.label}>Rumuz</Text>
          <TextInput
            value={this.state.selectedNickname}
            onChangeText={(text) => {
              this.setState({ selectedNickname: text });
            }}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.enterButton}
            onPress={this.saveUser}
            disabled={!this.state.selectedNickname}>
            <Text style={styles.enterButtonText}>Giriş</Text>
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
