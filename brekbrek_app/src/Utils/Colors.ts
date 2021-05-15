export const Colors = {
  primary: '#1292B4',
  white: '#FFFFFF',
  lighter: '#F3F3F3',
  light: '#DAE1E7',
  dark: '#444444',
  darker: '#222222',
  black: '#000000',
  generateColor: (string: string): string => {
    var hash = 0;
    if (string.length === 0) return hash.toString();
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      let value = (hash >> (i * 8)) & 255;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  },
};
