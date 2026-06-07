import { Tabs } from 'expo-router';
import { colors } from '../../src/theme/tokens';

// Custom tab bar is rendered inside each tab screen via BottomNav component.
// Expo Router tabs still needed for routing — hide the default tab bar.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Using custom BottomNav
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="milestoni" />
      <Tabs.Screen name="saznaj" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
