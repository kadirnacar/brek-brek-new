import { decode, encode } from 'base64-arraybuffer';
import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { MenuContextProps, withMenuContext } from 'react-native-popup-menu';
import channelGrayIcon from '../../../src/assets/channelgray.png';
import { Channels } from '../../Models';
import { Colors } from '../../Utils/Colors';
import FormModal from '../FormModal';

const { height, width } = Dimensions.get('window');

interface ChannelFormState {
  showImageSelector: boolean;
  isMenuOpen: boolean;
}

interface ChannelFormProps {
  channel: Channels;
  onAction: (action: string, item: Channels) => void;
}

type Props = ChannelFormProps & MenuContextProps;

class ChannelForm extends Component<Props, ChannelFormState> {
  constructor(props: Props) {
    super(props);
    this.showImageModal = this.showImageModal.bind(this);
    this.cancelImageSelector = this.cancelImageSelector.bind(this);
    this.setImageSelector = this.setImageSelector.bind(this);
    this.setCameraSelector = this.setCameraSelector.bind(this);
    this.state = {
      isMenuOpen: false,
      showImageSelector: false,
    };
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
        if (response.base64) {
          const { channel } = this.props;
          channel.Image = decode(response.base64);
          this.setState({});
        }
      }
    );
  }

  setCameraSelector() {
    this.setState({ showImageSelector: false });
    launchCamera(
      { mediaType: 'photo', includeBase64: true, maxHeight: 500, maxWidth: 500, quality: 0.7 },
      async (response) => {
        if (response.base64) {
          const { channel } = this.props;
          channel.Image = decode(response.base64);
          this.setState({});
        }
      }
    );
  }
  render() {
    return (
      <>
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
                this.props.channel && this.props.channel.Image
                  ? { uri: `data:image/png;base64,${encode(this.props.channel.Image)}` }
                  : channelGrayIcon
              }
              style={styles.image}
            />
            <Text style={styles.imageLabel}>Resim Seç</Text>
          </TouchableOpacity>
          <TextInput
            placeholder="Kanal Adı"
            autoFocus={true}
            clearButtonMode="always"
            clearTextOnFocus
            placeholderTextColor={Colors.dark}
            value={this.props.channel.Name ? this.props.channel.Name : ''}
            onChangeText={(text) => {
              this.props.channel.Name = text;
              this.setState({});
            }}
            style={styles.addInput}
          />
        </View>
      </>
    );
  }
}

export default withMenuContext(ChannelForm);

const styles = StyleSheet.create({
  imageSelectorContainer: {
    flex: 1,
  },
  content: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  imageContainer: {
    marginBottom: 50,
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
  addInput: {
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
});
