import React, { useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, ImageBackground, useWindowDimensions, Modal } from 'react-native';
import { products } from '../data/products';
import { ShoppingCart, Instagram } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';

export default function HomeScreen({ navigation }) {
  const { addToCart, getCartCount } = useContext(CartContext);
  const [selectedCoverage, setSelectedCoverage] = useState({});
  const [selectedQuantity, setSelectedQuantity] = useState({});
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [isWorkModalVisible, setIsWorkModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const sectionPositions = useRef({});

  const scrollToSection = (category) => {
    const y = sectionPositions.current[category];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: y - 10, animated: true });
    }
  };

  // Categorías extraídas automáticamente
  // Categorías extraídas automáticamente y ordenadas (Barras Proteicas primero)
  const categories = [...new Set(products.map((p) => p.category))].sort((a, b) => {
    if (a === 'Barras Proteicas') return -1;
    if (b === 'Barras Proteicas') return 1;
    return a.localeCompare(b);
  });

  const displayedCategories = selectedCategory ? [selectedCategory] : categories;

  // Hacer el diseño adaptable (responsive) con una lógica de columnas más robusta
  let columns = 1;
  if (width > 1200) columns = 4;
  else if (width > 800) columns = 3;
  else if (width > 500) columns = 2;

  // Cálculo Dinámico de Espaciado
  const outerPadding = 20;
  const gap = 16;
  const totalGapWidth = gap * (columns - 1);
  const cardWidth = (width - (outerPadding * 2) - totalGapWidth) / columns;

  const renderProduct = (item) => {
    const coverage = selectedCoverage[item.id] || item.coverageOptions?.[0];

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.8}
        style={[styles.card, { width: cardWidth }]}
        onPress={() => {
          setSelectedProduct(item);
          setIsProductModalVisible(true);
          setModalQuantity(1);
        }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>${item.price}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.categoryTag}>{item.category}</Text>
          </View>
          
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>

          {item.coverageOptions?.length > 0 && (
            <View style={styles.coverageContainer}>
              <Text style={styles.optionsLabel}>Cobertura:</Text>
              <View style={styles.coverageRow}>
                {item.coverageOptions.map(opt => (
                  <TouchableOpacity
                    key={`${item.id}-${opt}`}
                    style={[styles.coverageOption, coverage === opt && styles.coverageSelected]}
                    onPress={() => setSelectedCoverage(prev => ({ ...prev, [item.id]: opt }))}
                  >
                    <Text style={[styles.coverageText, coverage === opt && styles.coverageTextSelected]}>
                      {opt === 'Chocolate Negro' ? 'Negro' : opt === 'Chocolate Blanco' ? 'Blanco' : opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Cantidad:</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setSelectedQuantity(prev => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1) }))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{selectedQuantity[item.id] || 1}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setSelectedQuantity(prev => ({ ...prev, [item.id]: (prev[item.id] || 1) + 1 }))}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => {
              const options = item.coverageOptions?.length ? { coverage } : {};
              const qty = selectedQuantity[item.id] || 1;
              addToCart(item, options, qty);
              alert(`Agregado: ${qty} x ${item.name}${coverage ? ` (${coverage})` : ''}`);
            }}
          >
            <ShoppingCart color="#fff" size={16} />
            <Text style={styles.addToCartText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/mora.protein');
  };

  const openWhatsApp = () => {
    const phone = '+56954099576';
    const message = encodeURIComponent('Hola Mora Protein, me gustaría trabajar con ustedes.');
    Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`);
  };

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require('../../assets/logo-cuadrado.png')}
        style={styles.backgroundImage}
        imageStyle={styles.imageOpacity}
        resizeMode="cover"
      >
        <View style={styles.overlayContainer}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.logoContainer}>
                <Text style={styles.brandMora}>Mora<Text style={styles.brandProtein}>Protein</Text></Text>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity onPress={() => setIsWorkModalVisible(true)} style={[styles.aboutButton, styles.workHeaderButton]}>
                  <Text style={styles.workHeaderButtonText}>Trabaja con Nosotros</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsAboutVisible(true)} style={styles.aboutButton}>
                  <Text style={styles.aboutButtonText}>Quiénes Somos</Text>
                </TouchableOpacity>
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

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryNav}
            >
              {categories.map(cat => (
                <TouchableOpacity 
                  key={`nav-${cat}`} 
                  style={styles.navButton}
                  onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                >
                  <Text style={styles.navButtonText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>Nuestro Menú</Text>
              <Text style={styles.subtitle}>Descubre todos nuestros snacks separadas por categoría.</Text>
            </View>

            {displayedCategories.map((category) => {
              const categoryProducts = products.filter(p => p.category === category);
              return (
                <View 
                  key={category} 
                  style={styles.categorySection}
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    sectionPositions.current[category] = y;
                  }}
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryTitleContainer}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                    </View>
                    <View style={styles.categoryLine} />
                  </View>

                  <View style={styles.productsGrid}>
                    {categoryProducts.map(product => renderProduct(product))}
                  </View>
                </View>
              );
            })}

            <View style={styles.footerContainer}>
              <Text style={styles.footerTitle}>LA PROPUESTA</Text>
              <Text style={styles.footerText}>
                Incorporar Mora Protein en su vitrina permite sumar una
                alternativa saludable que dialoga de forma natural con el mundo
                del chocolate y el café. Es una propuesta que eleva la oferta
                saludable del local y ofrece una alternativa real frente a las barras
                industriales.

                Mora Protein es una propuesta versátil, pensada para acompañar
                distintos momentos del día —el café de la mañana, el post-entreno
                o la pausa de media tarde— aportando valor a la experiencia del
                cliente.
              </Text>

              <TouchableOpacity style={styles.workButton} onPress={() => setIsWorkModalVisible(true)}>
                <Text style={styles.workButtonText}>Trabaja con Nosotros</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>

      <Modal
        visible={isAboutVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAboutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setIsAboutVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Quiénes Somos</Text>
            <Text style={styles.modalDescription}>
              Mora Protein es una marca de snacks saludables{'\n'}
              hechos a mano, sin azúcar, altos en proteína y con{'\n'}
              opciones veganas.{'\n\n'}
              Desarrollamos productos artesanales, naturales y{'\n'}
              frescos, pensados para quienes buscan cuidarse{'\n'}
              sin dejar de disfrutar. Nuestra propuesta combina{'\n'}
              nutrición y sabor en formatos prácticos, accesibles{'\n'}
              y fáciles de integrar al día a día.
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isProductModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsProductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.productModalContent}>
            <TouchableOpacity onPress={() => setIsProductModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            {selectedProduct && (
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <Image
                  source={selectedProduct.image}
                  style={styles.modalProductImage}
                  resizeMode="cover"
                />
                <View style={styles.modalProductInfo}>
                  <Text style={styles.modalProductCategory}>{selectedProduct.category}</Text>
                  <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                  <Text style={styles.modalProductFlavor}>{selectedProduct.flavor || ''}</Text>
                  <Text style={styles.modalProductDescription}>{selectedProduct.description}</Text>
                  <Text style={styles.modalProductPrice}>${selectedProduct.price}</Text>

                  {selectedProduct.coverageOptions?.length > 0 && (
                    <View style={styles.modalCoverageSection}>
                      <Text style={styles.modalCoverageTitle}>Cobertura</Text>
                      <View style={styles.modalCoverageRow}>
                        {selectedProduct.coverageOptions.map(option => (
                          <TouchableOpacity
                            key={`${selectedProduct.id}-${option}`}
                            style={[styles.modalCoverageOption, selectedProduct.coverage === option && styles.modalCoverageSelected]}
                            onPress={() => setSelectedProduct(prev => ({ ...prev, coverage: option }))}
                          >
                            <Text style={[styles.modalCoverageText, selectedProduct.coverage === option && styles.modalCoverageSelectedText]}>
                              {option === 'Chocolate Negro' ? 'Negro' : option === 'Chocolate Blanco' ? 'Blanco' : option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.modalQuantityRow}>
                    <TouchableOpacity style={styles.modalQtyBtn} onPress={() => setModalQuantity(prev => Math.max(1, prev - 1))}>
                      <Text style={styles.modalQtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalQtyText}>{modalQuantity}</Text>
                    <TouchableOpacity style={styles.modalQtyBtn} onPress={() => setModalQuantity(prev => prev + 1)}>
                      <Text style={styles.modalQtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalButtonsRow}>
                    <TouchableOpacity
                      style={styles.modalAddToCartButton}
                      onPress={() => {
                        const options = selectedProduct.coverageOptions?.length ? { coverage: selectedProduct.coverage } : {};
                        addToCart(selectedProduct, options, modalQuantity);
                        alert(`Agregado: ${modalQuantity} x ${selectedProduct.name}${selectedProduct.coverage ? ` (${selectedProduct.coverage})` : ''}`);
                        setIsProductModalVisible(false);
                      }}
                    >
                      <ShoppingCart color="#fff" size={16} />
                      <Text style={styles.modalAddToCartText}>Agregar {modalQuantity}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalViewDetailsButton}
                      onPress={() => {
                        setIsProductModalVisible(false);
                        navigation.navigate('ProductDetail', { product: selectedProduct });
                      }}
                    >
                      <Text style={styles.modalViewDetailsText}>Ver Detalles</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isWorkModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsWorkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.workModalContent}>
            <TouchableOpacity onPress={() => setIsWorkModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Image
              source={require('../../assets/logo-cuadrado.png')}
              style={styles.workModalImage}
              resizeMode="contain"
            />
            <Text style={styles.workModalTitle}>Trabaja con Nosotros</Text>
            <Text style={styles.workModalText}>
              ¿Te interesa sumar Mora Protein a tu oferta? Escríbenos y conversemos sobre
              cómo podemos colaborar.
            </Text>
            <TouchableOpacity style={styles.workModalButton} onPress={openWhatsApp}>
              <Text style={styles.workModalButtonText}>Enviar WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9F8F6', // Color crema unificado como base
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageOpacity: {
    opacity: 0.55, // Aumentamos la opacidad para mayor nitidez
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(249, 248, 246, 0.4)', // Velo crema claro para no perder la lectura de las tarjetas
  },
  header: {
    paddingTop: 30,
    backgroundColor: 'rgba(249, 248, 246, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 235, 235, 0.5)',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryNav: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  navButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
  },
  logoContainer: {
    backgroundColor: '#D7CFC2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  brandMora: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 26,
    letterSpacing: -1,
  },
  brandProtein: {
    color: '#FFFFFF',
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
  aboutButton: {
    marginRight: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#D7CFC2',
    borderRadius: 16,
  },
  workHeaderButton: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
  },
  aboutButtonText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  workHeaderButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  mainTitle: {
    color: '#1A1A1A',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 5,
  },
  subtitle: {
    color: '#666666',
    fontSize: 14,
  },
  categorySection: {
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Suave contenedor por sección
    paddingVertical: 20,
    borderRadius: 24,
    marginHorizontal: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 20,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 15,
  },
  categoryTitle: {
    color: '#1A1A1A',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  categoryBadge: {
    backgroundColor: '#D7CFC2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  categoryLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#1A1A1A',
    opacity: 0.1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    gap: 16, // Usar gap para espaciado uniforme
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#4a3c2f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(215, 207, 194, 0.3)',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: '#F7F7F7',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(4px)', // Solo funciona en web pero es un buen detalle
  },
  priceBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  productDescription: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
    minHeight: 36,
  },
  categoryTag: {
    backgroundColor: '#F0E6D7',
    color: '#4A3C2F',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverageContainer: {
    marginBottom: 16,
  },
  optionsLabel: {
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
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coverageSelected: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  coverageText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
  },
  coverageTextSelected: {
    color: '#FFF',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '700',
    marginRight: 10,
    textTransform: 'uppercase',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: 15,
  },
  addToCartButton: {
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    maxWidth: 400,
    width: '90%',
  },
  productModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    maxWidth: 400,
    width: '90%',
    maxHeight: '90%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#1A1A1A',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescription: {
    color: '#666666',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  productModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    maxWidth: 400,
    width: '90%',
    maxHeight: '90%',
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalProductImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalProductInfo: {
    padding: 20,
  },
  modalProductCategory: {
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
  modalProductName: {
    color: '#1A1A1A',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  modalProductFlavor: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 10,
  },
  modalProductDescription: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalProductPrice: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },
  modalCoverageSection: {
    marginBottom: 16,
  },
  modalCoverageTitle: {
    fontSize: 11,
    color: '#999',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  modalCoverageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalCoverageOption: {
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    backgroundColor: '#FDFDFD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalCoverageSelected: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  modalCoverageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  modalCoverageSelectedText: {
    color: '#FFF',
  },
  modalQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  modalQtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalQtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalQtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalAddToCartButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  modalAddToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalViewDetailsButton: {
    flex: 1,
    backgroundColor: '#F0E6D7',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalViewDetailsText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '800',
  },
  footerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(215, 207, 194, 0.6)',
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: 1,
  },
  footerText: {
    fontSize: 14,
    color: '#4a4a4a',
    lineHeight: 22,
  },
  workButton: {
    marginTop: 18,
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  workButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  workModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    maxWidth: 400,
    width: '90%',
    padding: 20,
    alignItems: 'center',
  },
  workModalImage: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  workModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  workModalText: {
    fontSize: 14,
    color: '#4a4a4a',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  workModalButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  workModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
