import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Linking, Dimensions, ImageBackground } from 'react-native';
import { products } from '../data/products';
import { ShoppingCart, Instagram, Zap } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { addToCart, getCartCount } = useContext(CartContext);
  const [selectedCoverage, setSelectedCoverage] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = ['Todas', ...new Set(products.map((p) => p.category))];
  const catalogData = selectedCategory === 'Todas'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const renderItem = ({ item }) => {
    const coverage = selectedCoverage[item.id] || item.coverageOptions?.[0];

    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
        <View style={styles.imageContainer}>
          <Image
            source={
              typeof item.image === 'number'
                ? item.image
                : { uri: item.image }
            }
            style={styles.productImage}
          />
          <View style={styles.overlay} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.categoryTag}>{item.category}</Text>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productFlavor} numberOfLines={1}>{item.flavor || item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>

          {item.coverageOptions?.length > 0 && (
            <View style={styles.coverageRow}>
              {item.coverageOptions.map(opt => (
                <TouchableOpacity
                  key={`${item.id}-${opt}`}
                  style={[styles.coverageOption, coverage === opt && styles.coverageSelected]}
                  onPress={() => setSelectedCoverage(prev => ({ ...prev, [item.id]: opt }))}
                >
                  <Text style={[styles.coverageText, coverage === opt && styles.coverageTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>${item.price}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                const options = item.coverageOptions?.length ? { coverage } : {};
                addToCart(item, options);
                alert(`Agregado al carrito: ${item.name}${coverage ? ` (${coverage})` : ''}`);
              }}
            >
              <ShoppingCart color="#fff" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };  

  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/mora.protein');
  };

  return (
    <ImageBackground 
      source={require('../../assets/fondo.jpg')} // Textura chocolate/barra
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
        <View style={styles.categoryRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={catalogData}
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
    marginBottom: 8,
    minHeight: 28,
    lineHeight: 14,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0e6d7',
    color: '#4a3c2f',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  productFlavor: {
    color: '#545454',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  coverageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  coverageOption: {
    borderWidth: 1,
    borderColor: '#d6cdbf',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  coverageSelected: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  coverageText: {
    color: '#4a4a4a',
    fontSize: 10,
    fontWeight: '700',
  },
  coverageTextSelected: {
    color: '#fff',
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#d6cdbf',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  categoryChipText: {
    color: '#4a4a4a',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
