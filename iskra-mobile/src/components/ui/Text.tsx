import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { typography, colors } from '../../theme/tokens';

type Weight = keyof typeof typography.fontFamily;
type Size = keyof typeof typography.sizes;

interface IskraTextProps extends TextProps {
  weight?: Weight;
  size?: Size;
  color?: string;
  italic?: boolean;
  style?: TextStyle | TextStyle[];
}

export function Text({
  weight = 'regular',
  size = 'base',
  color = colors.text,
  italic = false,
  style,
  children,
  ...props
}: IskraTextProps) {
  return (
    <RNText
      style={[
        {
          fontFamily: typography.fontFamily[weight],
          fontSize: typography.sizes[size],
          color,
          fontStyle: italic ? 'italic' : 'normal',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
