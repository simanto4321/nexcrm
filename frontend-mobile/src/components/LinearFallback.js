import React from 'react';
import { View } from 'react-native';

/** Lightweight gradient stand-in (no extra native dep) */
export function LinearGradient({
  colors: _colors,
  style,
  children
}) {
  return <View style={[{
    backgroundColor: _colors[0] || '#070b16'
  }, style]}>{children}</View>;
}