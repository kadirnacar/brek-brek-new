import React, { Component } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../Utils/Colors';

interface IFormModalState {
  show?: boolean;
}

interface IFormModalProps {
  show?: boolean;
  title?: string;
  hideOkButton?: boolean;
  onCloseModal?: () => void;
  onCancelPress?: () => void;
  onOkPress?: () => void;
}

export class FormModal extends Component<IFormModalProps, IFormModalState> {
  constructor(props: IFormModalProps) {
    super(props);
    this.state = { show: false };
  }

  componentDidMount() {
    this.setState({ show: this.props.show });
  }

  render() {
    return (
      <Modal
        visible={this.props.show || false}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (this.props.onCloseModal) {
            this.props.onCloseModal();
          }
        }}>
        <View style={[styles.container, styles.horizontal]}>
          <View style={styles.formContainer}>
            <View style={styles.formActionBar}>
              <Text style={styles.title}>{this.props.title}</Text>
            </View>

            <View style={styles.formContent}>{this.props.children}</View>
            <View style={styles.formActionBar}>
              <TouchableOpacity
                style={styles.cancelAction}
                onPress={() => {
                  if (this.props.onCancelPress) {
                    this.props.onCancelPress();
                  }
                }}>
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              {!this.props.hideOkButton ? (
                <TouchableOpacity
                  style={styles.okAction}
                  onPress={() => {
                    if (this.props.onOkPress) {
                      this.props.onOkPress();
                    }
                  }}>
                  <Text style={styles.buttonText}>Tamam</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

export default FormModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.dark + '80',
    alignContent: 'center',
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  title: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: Colors.black,
    color: Colors.lighter,
    marginTop: -10,
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: Colors.darker,
    borderRadius: 20,
    color: Colors.light,
    width: '100%',
    padding: 10,
  },
  formContent: {
    width: '100%',
    padding: 5,
    paddingTop: 15,
    flexDirection: 'row',
  },
  formActionBar: {
    marginBottom: -10,
    marginRight: -10,
    marginLeft: -10,
    flexDirection: 'row',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: Colors.black,
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 16,
    borderRadius: 20,
    fontWeight: 'bold',
  },
  cancelAction: {
    flexDirection: 'column',
    flex: 1,
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
    width: '100%',
  },
  okAction: {
    backgroundColor: Colors.black,
    borderRadius: 20,

    flexDirection: 'column',
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
