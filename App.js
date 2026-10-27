import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PaperProvider, MD3DarkTheme, Button, Text, Surface } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Tema personalizado da Calculadora do Bruno (tons de roxo)
const temaBruno = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#9C6BFF',
    secondaryContainer: '#2A2440',
    onSecondaryContainer: '#EDE7FF',
  },
};

// Layout do teclado da calculadora
const TECLAS = [
  ['C', '⌫', '/', '*'],
  ['7', '8', '9', '-'],
  ['4', '5', '6', '+'],
  ['1', '2', '3', '='],
  ['0', '.'],
];

const OPERACOES = ['+', '-', '*', '/'];

// Essa função realiza o processo de montar a tela principal da Calculadora do Bruno.
export default function App() {
  // Hooks de estado (useState) que guardam os dados da calculadora
  const [tela, setTela] = useState('0');
  const [primeiroValor, setPrimeiroValor] = useState(null);
  const [operacao, setOperacao] = useState(null);
  const [aguardandoNumero, setAguardandoNumero] = useState(true);
  const [historico, setHistorico] = useState('');

  // Essa função realiza o processo de executar a operação matemática (+, -, *, /) entre dois números.
  const executarOperacao = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? null : a / b;
      default: return b;
    }
  };

  // Essa função realiza o processo de arredondar o resultado para evitar erros de casas decimais (ex: 0.1 + 0.2).
  const formatarNumero = (n) => String(Math.round(n * 1e10) / 1e10);

  // Essa função realiza o processo de mostrar "Erro" na tela quando há divisão por zero.
  const mostrarErro = () => {
    zerarCalculadora();
    setTela('Erro');
  };

  // Essa função realiza o processo de zerar a calculadora (botão C).
  const zerarCalculadora = () => {
    setTela('0');
    setPrimeiroValor(null);
    setOperacao(null);
    setAguardandoNumero(true);
    setHistorico('');
  };

  // Essa função realiza o processo de apagar o último dígito digitado (botão ⌫).
  const apagarDigito = () => {
    if (aguardandoNumero) return;
    setTela(tela.length > 1 ? tela.slice(0, -1) : '0');
  };

  // Essa função realiza o processo de inserir um número ou ponto decimal na tela.
  const inserirDigito = (digito) => {
    if (aguardandoNumero) {
      setTela(digito === '.' ? '0.' : digito);
      setAguardandoNumero(false);
      return;
    }
    if (digito === '.' && tela.includes('.')) return;
    setTela(tela === '0' && digito !== '.' ? digito : tela + digito);
  };

  // Essa função realiza o processo de selecionar uma operação e calcular contas encadeadas (ex: 2 + 3 + 4).
  const selecionarOperacao = (op) => {
    const atual = parseFloat(tela);
    let base = atual;

    if (primeiroValor !== null && operacao && !aguardandoNumero) {
      const resultado = executarOperacao(primeiroValor, atual, operacao);
      if (resultado === null) return mostrarErro();
      base = resultado;
      setTela(formatarNumero(resultado));
    }

    setPrimeiroValor(base);
    setOperacao(op);
    setHistorico(`${formatarNumero(base)} ${op}`);
    setAguardandoNumero(true);
  };

  // Essa função realiza o processo de calcular o resultado final (botão =).
  const calcularResultado = () => {
    if (operacao === null || primeiroValor === null) return;
    const segundo = parseFloat(tela);
    const resultado = executarOperacao(primeiroValor, segundo, operacao);
    if (resultado === null) return mostrarErro();

    setHistorico(`${formatarNumero(primeiroValor)} ${operacao} ${formatarNumero(segundo)} =`);
    setTela(formatarNumero(resultado));
    setPrimeiroValor(null);
    setOperacao(null);
    setAguardandoNumero(true);
  };

  // Essa função realiza o processo de identificar qual tecla foi pressionada e chamar a função correta.
  const tratarTecla = (tecla) => {
    if (tecla === 'C') zerarCalculadora();
    else if (tecla === '⌫') apagarDigito();
    else if (tecla === '=') calcularResultado();
    else if (OPERACOES.includes(tecla)) selecionarOperacao(tecla);
    else inserirDigito(tecla);
  };

  // Essa função realiza o processo de definir o estilo do botão (destaque para operações).
  const modoDoBotao = (tecla) =>
    OPERACOES.includes(tecla) || tecla === '=' ? 'contained' : 'contained-tonal';

  return (
    <PaperProvider theme={temaBruno}>
      <View style={styles.container}>
        <StatusBar style="light" />

        <Text variant="headlineSmall" style={styles.titulo}>
          Calculadora do Bruno
        </Text>

        <Surface style={styles.visor} elevation={4}>
          <Text variant="titleMedium" style={styles.historico} numberOfLines={1}>
            {historico}
          </Text>
          <Text variant="displayMedium" style={styles.textoVisor} numberOfLines={1} adjustsFontSizeToFit>
            {tela}
          </Text>
        </Surface>

        <View style={styles.teclado}>
          {TECLAS.map((linha, i) => (
            <View key={i} style={styles.linha}>
              {linha.map((tecla) => (
                <Button
                  key={tecla}
                  mode={modoDoBotao(tecla)}
                  style={[styles.botao, tecla === '0' && styles.botaoDuplo]}
                  contentStyle={styles.conteudoBotao}
                  labelStyle={styles.rotuloBotao}
                  onPress={() => tratarTecla(tecla)}
                >
                  {tecla}
                </Button>
              ))}
            </View>
          ))}
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0B1A', padding: 16, justifyContent: 'flex-end' },
  titulo: { color: '#9C6BFF', textAlign: 'center', marginBottom: 'auto', marginTop: 48, fontWeight: 'bold' },
  visor: { padding: 24, marginBottom: 16, borderRadius: 20, alignItems: 'flex-end', justifyContent: 'center', minHeight: 140 },
  historico: { opacity: 0.6, textAlign: 'right' },
  textoVisor: { textAlign: 'right' },
  teclado: { gap: 10 },
  linha: { flexDirection: 'row', gap: 10 },
  botao: { flex: 1, borderRadius: 20 },
  botaoDuplo: { flex: 2 },
  conteudoBotao: { height: 70 },
  rotuloBotao: { fontSize: 24 },
});
