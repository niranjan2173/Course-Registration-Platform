import colors from './colors';
import spacing from './spacing';
import typography from './typography';

const theme = {
  colors,
  spacing,
  typography,
  radius: {
    sm: 12,
    md: 16,
    lg: 18,
    xl: 20,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 16,
      elevation: 4,
    },
  },
  touchTarget: {
    minHeight: 44,
  },
};

export { colors, spacing, typography };
export default theme;
