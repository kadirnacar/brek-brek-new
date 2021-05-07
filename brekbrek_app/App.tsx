/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  TouchableOpacity,
  NativeModules,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import Icon from 'react-native-vector-icons/FontAwesome5';

const { HelperModule } = NativeModules;
const Section: React.FC<{
  title: string;
}> = ({ children, title }) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            color: isDarkMode ? Colors.white : Colors.black,
            padding: 10,
          },
        ]}>
        {title}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle: ViewStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <Section title="BrekBrek"></Section>
      <View
        style={{
          flex: 1,
          padding: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => {
            console.log(HelperModule.getDeviceId());
          }}
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            height: 100,
            width: 100,
            borderRadius: 60,
            alignContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="microphone" size={60} color={isDarkMode ? Colors.white : Colors.black} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {},
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
