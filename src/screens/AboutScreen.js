import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function AboutScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.aboutContainer}>
        <Text style={styles.title}>Quiénes Somos</Text>
        <Text style={styles.description}>
          Mora Protein es una empresa dedicada a ofrecer productos proteicos de alta calidad,
          elaborados con ingredientes naturales y sin conservantes artificiales.
          Nuestro compromiso es promover un estilo de vida saludable a través de snacks
          deliciosos y nutritivos.
        </Text>
        <Text style={styles.description}>
          Fundada en [Año], Mora Protein nació de la pasión por la nutrición y el bienestar.
          Creemos que una alimentación balanceada es la base de una vida plena, y por eso
          nos esforzamos en crear productos que no solo sean sabrosos, sino también beneficiosos
          para tu salud.
        </Text>
        <Text style={styles.description}>
          Nuestros valores:
          - Calidad en cada producto
          - Innovación constante
          - Compromiso con la salud
          - Sostenibilidad ambiental
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F6',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 16,
  },
  aboutContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4a3c2f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(215, 207, 194, 0.3)',
  },
  title: {
    color: '#1A1A1A',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#666666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});