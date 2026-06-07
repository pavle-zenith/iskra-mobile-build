import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { colors } from '../src/theme/tokens';

// Auth gate: checks session, then routes to onboarding or home.
export default function Index() {
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/onboarding/splash');
        return;
      }

      // Check if onboarding completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/splash');
      }
    };

    check();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.ember} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
