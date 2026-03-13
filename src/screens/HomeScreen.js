import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Linking, Dimensions, ImageBackground } from 'react-native';
import { products } from '../data/products';
import { ShoppingCart, Instagram, Zap } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { addToCart, getCartCount } = useContext(CartContext);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.overlay} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${item.price}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              addToCart(item);
              alert('Agregado al carrito: ' + item.name);
            }}
          >
            <ShoppingCart color="#fff" size={16} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/mora.protein');
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1549007953-2f2dc0b24019?q=80&w=1080' }} // Textura chocolate/barra
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlayContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.brandMora}>Mora<Text style={styles.brandProtein}>Protein</Text></Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={openInstagram} style={styles.iconButton}>
              <Instagram color="#1A1A1A" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.iconButton}>
              <View>
                <ShoppingCart color="#1A1A1A" size={24} />
                {getCartCount() > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{getCartCount()}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Nuestros Productos</Text>

        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
        />
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
    backgroundColor: 'rgba(249, 248, 246, 0.85)', // Semi-transparent premium cream
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 235, 0.5)',
  },
  logoContainer: {
    backgroundColor: '#D7CFC2', // Beige background from the image
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  brandMora: {
    color: '#000000', // Black
    fontWeight: '900',
    fontSize: 26,
    letterSpacing: -1,
  },
  brandProtein: {
    color: '#FFFFFF', // White
    fontWeight: '900',
    fontSize: 26,
    letterSpacing: -1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 20,
    padding: 8,
  },
  badgeContainer: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#000000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#D7CFC2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#1A1A1A',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 25,
    marginBottom: 5,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 40,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 15,
    width: (width / 2) - 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0F0F0',
    resizeMode: 'cover',
  },
  overlay: {
    display: 'none',
  },
  cardContent: {
    padding: 12,
  },
  productName: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  productDescription: {
    color: '#888888',
    fontSize: 11,
    marginBottom: 12,
    height: 30,
    lineHeight: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
