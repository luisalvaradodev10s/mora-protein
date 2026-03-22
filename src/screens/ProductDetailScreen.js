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
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 15,
  },
  backText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  imageWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    marginVertical: 8,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 350,
  },
  priceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#D2B48C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  priceBadgeText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: '900',
  },
  productInfo: {
    marginTop: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 25,
  },
  category: {
    color: '#D2B48C',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  flavor: {
    color: '#ADADAD',
    fontSize: 16,
    marginBottom: 15,
  },
  description: {
    color: '#ADADAD',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 25,
  },
  coverageSection: {
    marginBottom: 20,
  },
  coverageTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  coverageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  coverageOption: {
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  coverageOptionSelected: {
    backgroundColor: '#D2B48C',
    borderColor: '#D2B48C',
  },
  coverageOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ADADAD',
  },
  coverageOptionTextSelected: {
    color: '#121212',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 20,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#D2B48C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  addButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
