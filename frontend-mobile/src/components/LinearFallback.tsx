import React, { type ReactNode } from 'react'
import { View, type ViewStyle } from 'react-native'

/** Lightweight gradient stand-in (no extra native dep) */
export function LinearGradient({
  colors: _colors,
  style,
  children,
}: {
  colors: string[]
  style?: ViewStyle | ViewStyle[]
  children?: ReactNode
}) {
  return <View style={[{ backgroundColor: _colors[0] || '#070b16' }, style]}>{children}</View>
}
