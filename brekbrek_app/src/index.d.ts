declare module '*.jpg';
declare module '*.png';
declare module 'rn-colorful-avatar' {
  import { StyleProp, TextStyle, ViewStyle } from 'react-native';
  import { Component } from 'react';
  interface Props {
    name: string;
    size?: number;
    radius?: number;
    style?: { avatar?: StyleProp<ViewStyle>; text?: StyleProp<TextStyle> };
    circle?: boolean;
    lang?: string;
  }

  export default class Avatar extends Component<Props> {}
}
