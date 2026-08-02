import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from './LinearFallback';
import { colors } from '../theme';

/** Full-screen brand backdrop with NexCRM watermark */
export function BrandBackground({
  children,
  style
}) {
  return <View style={[styles.root, style]}>
      <LinearGradient colors={['#0a1020', '#101a33', '#1a0a12', '#070b16']} style={StyleSheet.absoluteFill} />
      <View style={styles.glowRed} />
      <View style={styles.glowBlue} />
      <Text style={[styles.mark, styles.mark1]} pointerEvents="none">NexCRM</Text>
      <Text style={[styles.mark, styles.mark2]} pointerEvents="none">NexCRM</Text>
      <Text style={[styles.mark, styles.mark3]} pointerEvents="none">N</Text>
      <View style={styles.content}>{children}</View>
    </View>;
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg
  },
  content: {
    flex: 1
  },
  glowRed: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(228,37,39,0.18)'
  },
  glowBlue: {
    position: 'absolute',
    bottom: 40,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(59,158,255,0.12)'
  },
  mark: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.045)',
    fontWeight: '800',
    letterSpacing: -1
  },
  mark1: {
    fontSize: 78,
    top: '16%',
    left: 12,
    transform: [{
      rotate: '-12deg'
    }],
    color: 'rgba(255,255,255,0.07)'
  },
  mark2: {
    fontSize: 68,
    bottom: '20%',
    right: -8,
    transform: [{
      rotate: '8deg'
    }],
    color: 'rgba(255,255,255,0.06)'
  },
  mark3: {
    fontSize: 170,
    top: '38%',
    left: '26%',
    color: 'rgba(228,37,39,0.09)'
  }
});