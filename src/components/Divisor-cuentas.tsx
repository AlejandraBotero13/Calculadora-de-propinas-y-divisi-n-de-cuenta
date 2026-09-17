import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


const ACENTO = '#2E7D32';

const PORCENTAJES_FIJOS = [10, 15, 20] as const;

type Moneda = 'COP' | 'USD';

const CONFIG_MONEDA: Record<Moneda, { locale: string; currency: string; decimales: number }> = {
  COP: { locale: 'es-CO', currency: 'COP', decimales: 0 },
  USD: { locale: 'en-US', currency: 'USD', decimales: 2 },
};

function formatearMoneda(valor: number, moneda: Moneda): string {
  const config = CONFIG_MONEDA[moneda];
  if (!Number.isFinite(valor)) valor = 0;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.decimales,
    maximumFractionDigits: config.decimales,
  }).format(valor);
}

export function DivisorCuenta() {
  const theme = useTheme();

  const [moneda, setMoneda] = useState<Moneda>('COP');
  const [totalCuenta, setTotalCuenta] = useState('');
  const [numeroPersonas, setNumeroPersonas] = useState('');
  const [porcentajePropina, setPorcentajePropina] = useState<number>(15);
  const [modalOtroVisible, setModalOtroVisible] = useState(false);
  const [valorOtroTemp, setValorOtroTemp] = useState('');

  const totalNumerico = parseFloat(totalCuenta.replace(',', '.'));
  const personasNumerico = parseInt(numeroPersonas, 10);

  const totalValido = !Number.isNaN(totalNumerico) && totalNumerico > 0;
  const personasValido = !Number.isNaN(personasNumerico) && personasNumerico > 0;
  const formularioValido = totalValido && personasValido;

  const { montoPropina, totalFinal, montoPorPersona } = useMemo(() => {
    if (!formularioValido) {
      return { montoPropina: 0, totalFinal: 0, montoPorPersona: 0 };
    }
    const propina = totalNumerico * (porcentajePropina / 100);
    const final = totalNumerico + propina;
    return {
      montoPropina: propina,
      totalFinal: final,
      montoPorPersona: final / personasNumerico,
    };
  }, [totalNumerico, personasNumerico, porcentajePropina, formularioValido]);

  const esPorcentajePersonalizado = !PORCENTAJES_FIJOS.includes(
    porcentajePropina as (typeof PORCENTAJES_FIJOS)[number]
  );

  function abrirModalOtro() {
    setValorOtroTemp(esPorcentajePersonalizado ? String(porcentajePropina) : '');
    setModalOtroVisible(true);
  }

  function confirmarPorcentajeOtro() {
    const valor = parseFloat(valorOtroTemp.replace(',', '.'));
    if (!Number.isNaN(valor) && valor >= 0 && valor <= 100) {
      setPorcentajePropina(valor);
    }
    setModalOtroVisible(false);
  }

  function cancelarModalOtro() {
    setModalOtroVisible(false);
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText type="title" style={styles.titulo}>
        Calcula y Divide
      </ThemedText>

      <ThemedText type="smallBold" style={styles.etiqueta}>
        Moneda:
      </ThemedText>
      <View style={styles.filaBotones}>
        {(['COP', 'USD'] as Moneda[]).map((opcion) => {
          const activo = moneda === opcion;
          return (
            <Pressable key={opcion} onPress={() => setMoneda(opcion)} style={styles.botonFlex}>
              <ThemedView
                type={activo ? 'backgroundSelected' : 'backgroundElement'}
                style={[styles.botonPorcentaje, activo && { borderColor: ACENTO, borderWidth: 2 }]}
              >
                <ThemedText type="smallBold">
                  {opcion === 'COP' ? 'Peso Colombiano' : 'Dólar (USD)'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </View>

      <ThemedText type="smallBold" style={styles.etiqueta}>
        Total de la Cuenta:
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.inputWrapper}>
        <ThemedText themeColor="textSecondary" style={styles.simbolo}>
          {moneda === 'COP' ? '$' : 'US$'}
        </ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={theme.textSecondary}
          value={totalCuenta}
          onChangeText={setTotalCuenta}
        />
      </ThemedView>

      <ThemedText type="smallBold" style={styles.etiqueta}>
        Número de Personas:
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          keyboardType="number-pad"
          placeholder="1"
          placeholderTextColor={theme.textSecondary}
          value={numeroPersonas}
          onChangeText={setNumeroPersonas}
        />
      </ThemedView>

      <ThemedText type="smallBold" style={styles.etiqueta}>
        Porcentaje de Propina:
      </ThemedText>
      <View style={styles.filaBotones}>
        {PORCENTAJES_FIJOS.map((valor) => {
          const activo = porcentajePropina === valor;
          return (
            <Pressable key={valor} onPress={() => setPorcentajePropina(valor)} style={styles.botonFlex}>
              <ThemedView
                type={activo ? 'backgroundSelected' : 'backgroundElement'}
                style={[styles.botonPorcentaje, activo && { borderColor: ACENTO, borderWidth: 2 }]}
              >
                <ThemedText type="smallBold">{valor}%</ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
        <Pressable onPress={abrirModalOtro} style={styles.botonFlex}>
          <ThemedView
            type={esPorcentajePersonalizado ? 'backgroundSelected' : 'backgroundElement'}
            style={[
              styles.botonPorcentaje,
              esPorcentajePersonalizado && { borderColor: ACENTO, borderWidth: 2 },
            ]}
          >
            <ThemedText type="smallBold">
              {esPorcentajePersonalizado ? `${porcentajePropina}%` : 'Otro...'}
            </ThemedText>
          </ThemedView>
        </Pressable>
      </View>

      <Pressable style={[styles.botonCalcular, { backgroundColor: ACENTO }]} disabled={!formularioValido}>
        <ThemedText type="smallBold" style={styles.textoBotonCalcular}>
          CALCULAR
        </ThemedText>
      </Pressable>

      <ThemedView type="backgroundElement" style={styles.panelResultado}>
        <ThemedText type="small" themeColor="textSecondary">
          Total a Pagar por Persona:
        </ThemedText>
        <ThemedText type="subtitle" style={[styles.montoPrincipal, { color: ACENTO }]}>
          {formularioValido ? formatearMoneda(montoPorPersona, moneda) : '—'}
        </ThemedText>

        <View style={styles.detalles}>
          <FilaDetalle
            etiqueta="Total Cuenta:"
            valor={formatearMoneda(totalValido ? totalNumerico : 0, moneda)}
          />
          <FilaDetalle
            etiqueta={`Propina (${porcentajePropina}%):`}
            valor={formatearMoneda(montoPropina, moneda)}
          />
          <FilaDetalle etiqueta="Total Final:" valor={formatearMoneda(totalFinal, moneda)} negrita />
          <FilaDetalle etiqueta="Por persona:" valor={formatearMoneda(montoPorPersona, moneda)} negrita />
        </View>

        {!formularioValido && (totalCuenta.length > 0 || numeroPersonas.length > 0) && (
          <ThemedText type="small" style={styles.textoError}>
            Ingresa un monto de cuenta y un número de personas válidos (mayores a 0).
          </ThemedText>
        )}
      </ThemedView>

      
      <Modal visible={modalOtroVisible} transparent animationType="fade" onRequestClose={cancelarModalOtro}>
        <View style={styles.overlay}>
          <ThemedView type="background" style={styles.tarjetaModal}>
            <ThemedText type="subtitle" style={styles.tituloModal}>
              Porcentaje personalizado
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                keyboardType="decimal-pad"
                placeholder="Ej. 18"
                placeholderTextColor={theme.textSecondary}
                value={valorOtroTemp}
                onChangeText={setValorOtroTemp}
                autoFocus
              />
              <ThemedText themeColor="textSecondary" style={styles.simbolo}>
                %
              </ThemedText>
            </ThemedView>
            <View style={styles.filaBotonesModal}>
              <Pressable onPress={cancelarModalOtro} style={styles.botonSecundario}>
                <ThemedText>Cancelar</ThemedText>
              </Pressable>
              <Pressable
                onPress={confirmarPorcentajeOtro}
                style={[styles.botonPrimario, { backgroundColor: ACENTO }]}
              >
                <ThemedText style={styles.textoBotonCalcular}>Aplicar</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ScrollView>
  );
}

function FilaDetalle({ etiqueta, valor, negrita }: { etiqueta: string; valor: string; negrita?: boolean }) {
  return (
    <View style={styles.filaDetalle}>
      <ThemedText type={negrita ? 'smallBold' : 'small'}>{etiqueta}</ThemedText>
      <ThemedText type={negrita ? 'smallBold' : 'small'}>{valor}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  contenedor: { padding: Spacing.four, paddingTop: Spacing.four * 3, paddingBottom: Spacing.four * 4 },
  titulo: { textAlign: 'center' },
  subtitulo: { textAlign: 'center', marginBottom: Spacing.three },
  etiqueta: { marginTop: Spacing.three, marginBottom: Spacing.one },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    height: 46,
  },
  simbolo: { marginHorizontal: Spacing.half },
  input: { flex: 1, fontSize: 16, height: '100%' },
  filaBotones: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.half },
  botonFlex: { flex: 1 },
  botonPorcentaje: { borderRadius: Spacing.two, paddingVertical: Spacing.two, alignItems: 'center' },
  botonCalcular: { marginTop: Spacing.four, borderRadius: Spacing.three, paddingVertical: Spacing.three, alignItems: 'center' },
  textoBotonCalcular: { color: '#ffffff' },
  panelResultado: { marginTop: Spacing.four, borderRadius: Spacing.three, padding: Spacing.three },
  montoPrincipal: { marginBottom: Spacing.two },
  detalles: { gap: Spacing.half },
  filaDetalle: { flexDirection: 'row', justifyContent: 'space-between' },
  textoError: { marginTop: Spacing.two, color: '#c0392b' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.four },
  tarjetaModal: { width: '100%', maxWidth: 340, borderRadius: Spacing.three, padding: Spacing.four },
  tituloModal: { marginBottom: Spacing.three },
  filaBotonesModal: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two, marginTop: Spacing.four },
  botonSecundario: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.one },
  botonPrimario: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.one },
});