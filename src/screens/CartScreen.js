import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Linking, ImageBackground } from 'react-native';
import { Zap, Tag, Check, MessageCircle, Trash2, Plus, Minus } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';

// Hardcoded discount codes
const DISCOUNT_CODES = {
  'MORA10': { discount: 0.10, message: '10% de descuento aplicado' },
  'FUTURO20': { discount: 0.20, message: '20% de descuento (Bono Futurista)' },
  'AFILIADO50': { discount: 0.50, message: '50% de descuento de Afiliado' },
  'FREESHIP': { discount: 0, message: 'Envío Gratis Aplicado' } 
};

export default function CartScreen({ navigation }) {
  const { cart, incrementQuantity, decrementQuantity, removeItem } = useContext(CartContext);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState({ code: '', amount: 0, message: '' });

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (subtotal * appliedDiscount.amount);
  };

  const applyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (DISCOUNT_CODES[code]) {
      setAppliedDiscount({
        code: code,
        amount: DISCOUNT_CODES[code].discount,
        message: DISCOUNT_CODES[code].message
      });
      alert(DISCOUNT_CODES[code].message);
    } else {
      setAppliedDiscount({ code: '', amount: 0, message: '' });
      alert('Código no válido o expirado');
    }
  };

  const sendOrderWhatsapp = () => {
    const number = '+56954099576';
    let text = '/// NUEVO PEDIDO MORA PROTEIN ///\n\n';
    
    cart.forEach(item => {
      text += `[x${item.quantity}] ${item.name}`;
      if (item.coverage) text += ` (${item.coverage})`;
      text += ` -> $${item.price * item.quantity}\n`;
    });
    
    const subtotal = calculateSubtotal();
    text += `\n>> SUBTOTAL: $${subtotal}`;

    if (appliedDiscount.amount > 0 || appliedDiscount.code === 'FREESHIP') {
      text += `\n>> CÓDIGO APLICADO: ${appliedDiscount.code}`;
      text += `\n>> DESCUENTO: -$${subtotal * appliedDiscount.amount}`;
    }
    
    text += `\n\n== TOTAL FINAL: $${calculateTotal()} ==`;
    
    const url = `whatsapp://send?text=${encodeURIComponent(text)}&phone=${number}`;
    Linking.openURL(url).catch(() => {
      alert('Asegúrate de tener WhatsApp instalado');
    });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <View style={styles.cartItemContent}>
          <Text style={styles.cartItemName}>{item.name}</Text>
          {item.coverage ? <Text style={styles.cartItemCoverage}>{item.coverage}</Text> : null}
          <Text style={styles.cartItemPriceUnit}>${item.price} c/u</Text>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.cartItemId)}>
          <Trash2 color="#EF4444" size={20} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cartItemFooter}>
        <View style={styles.quantityControl}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementQuantity(item.cartItemId)}>
            <Minus color="#1A1A1A" size={16} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementQuantity(item.cartItemId)}>
            <Plus color="#1A1A1A" size={16} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cartItemPriceTotal}>${item.price * item.quantity}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../assets/fondo.jpg')} // Textura chocolate/barra
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlayContainer}>
        <Text style={styles.title}>Resumen de Compra</Text>
        
        <FlatList
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={item => item.cartItemId || item.id}
          style={styles.cartList}
        />

        <View style={styles.couponSection}>
          <View style={styles.inputWrapper}>
            <Tag color="#1A1A1A" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.couponInput}
              placeholder="CÓDIGO DE DESCUENTO"
              placeholderTextColor="#888"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity style={styles.applyButton} onPress={applyCoupon}>
            <Text style={styles.applyButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </View>

        {appliedDiscount.code !== '' && (
          <View style={styles.discountBadge}>
            <Check color="#A09385" size={16} />
            <Text style={styles.discountText}>{appliedDiscount.message}</Text>
          </View>
        )}

        <View style={styles.totalSection}>
          <Text style={styles.subtotalText}>Subtotal: ${calculateSubtotal()}</Text>
          <Text style={styles.totalText}>Total: ${calculateTotal()}</Text>
        </View>

        <TouchableOpacity style={styles.whatsappButton} onPress={sendOrderWhatsapp}>
          <MessageCircle color="#fff" size={24} style={{marginRight: 10}} />
          <Text style={styles.whatsappButtonText}>Pedir por WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(249, 248, 246, 0.85)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    marginTop: 10,
  },
  cartList: {
    flexGrow: 0,
    marginBottom: 20,
  },
  cartItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cartItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cartItemContent: {
    flex: 1,
  },
  cartItemName: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cartItemCoverage: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cartItemPriceUnit: {
    color: '#A09385',
    fontSize: 13,
  },
  removeBtn: {
    padding: 6,
    backgroundColor: '#FEF2F2', // Light red background for trash
    borderRadius: 8,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  qtyBtn: {
    padding: 8,
    paddingHorizontal: 12,
  },
  qtyText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  cartItemPriceTotal: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  couponSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    marginRight: 10,
    paddingLeft: 10,
  },
  inputIcon: {
    marginRight: 5,
  },
  couponInput: {
    flex: 1,
    color: '#1A1A1A',
    padding: 15,
    fontSize: 14,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EBE1', // Light beige
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  discountText: {
    color: '#A09385',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    paddingVertical: 20,
    alignItems: 'flex-end',
  },
  subtotalText: {
    color: '#888888',
    fontSize: 15,
    marginBottom: 5,
  },
  totalText: {
    color: '#1A1A1A',
    fontSize: 26,
    fontWeight: '900',
  },
  whatsappButton: {
    backgroundColor: '#25D366', // WhatsApp green
    flexDirection: 'row',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
