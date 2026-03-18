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
    animateAddButton();
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
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>${product.price}</Text>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.flavor}>{product.flavor || ''}</Text>
        <Text style={styles.description}>{product.description}</Text>

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

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity style={styles.addButton} onPress={addProduct}>
            <ShoppingCart color="#fff" size={18} />
            <Text style={styles.addButtonText}>Agregar {quantity} al carrito</Text>
          </TouchableOpacity>
        </Animated.View>
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
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
    marginVertical: 8,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  priceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backdropFilter: 'blur(4px)',
  },
  priceBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  productInfo: {
    marginTop: 16,
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
  category: {
    backgroundColor: '#F0E6D7',
    color: '#4A3C2F',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  flavor: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 12,
  },
  description: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  price: {
    color: '#1A1A1A',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 14,
  },
  coverageSection: {
    marginBottom: 16,
  },
  coverageTitle: {
    fontSize: 11,
    color: '#999',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  coverageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coverageOption: {
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    backgroundColor: '#FDFDFD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coverageOptionSelected: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  coverageOptionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  coverageOptionTextSelected: {
    color: '#FFF',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: 16,
  },
  addButton: {
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});