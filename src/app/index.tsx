import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { DivisorCuenta } from '@/components/Divisor-cuentas';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <DivisorCuenta />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
});
