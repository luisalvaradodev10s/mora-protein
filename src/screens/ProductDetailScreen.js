import React, { useState, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const [coverage, setCoverage] = useState(product.coverageOptions?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateAddButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const addProduct = () => {
    const options = product.coverageOptions?.length ? { coverage } : {};
    addToCart(product, options, quantity);
    alert(`Agregado al carrito: ${quantity} x ${product.name}${coverage ? ` (${coverage})` : ''}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.imageWrapper}>
        <Image
          source={product.image}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.flavor}>{product.flavor || ''}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.price}>${product.price}</Text>

        {product.coverageOptions?.length > 0 && (
          <View style={styles.coverageSection}>
            <Text style={styles.coverageTitle}>Cobertura</Text>
            <View style={styles.coverageRow}>
              {product.coverageOptions.map(option => (
                <TouchableOpacity
                  key={`${product.id}-${option}`}
                  style={[styles.coverageOption, coverage === option && styles.coverageOptionSelected]}
                  onPress={() => setCoverage(option)}
                >
                  <Text style={[styles.coverageOptionText, coverage === option && styles.coverageOptionTextSelected]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(prev => Math.max(1, prev - 1))}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(prev => prev + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addProduct}>
          <ShoppingCart color="#fff" size={18} />
          <Text style={styles.addButtonText}>Agregar {quantity} al carrito</Text>
        </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 14,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EFEFEF',
    marginVertical: 8,
  },
  productImage: {
    width: '100%',
    height: 220,
  },
  productInfo: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  category: {
    color: '#4a3c2f',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  flavor: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 10,
  },
  description: {
    color: '#4b4b4b',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  price: {
    color: '#1A1A1A',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 14,
  },
  coverageSection: {
    marginBottom: 14,
  },
  coverageTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4a4a4a',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  coverageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  coverageOption: {
    borderWidth: 1,
    borderColor: '#C4B9A5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  coverageOptionSelected: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  coverageOptionText: {
    fontSize: 12,
    color: '#4a4a4a',
    fontWeight: '700',
  },
  coverageOptionTextSelected: {
    color: '#fff',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  qtyBtn: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#C4B9A5',
    marginHorizontal: 10,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 28,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
  },
});