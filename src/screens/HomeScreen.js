import React, { useContext, useEffect, useState, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, ImageBackground, useWindowDimensions, Modal } from 'react-native';
import { products } from '../data/products';
import { brands } from '../data/brands';
import { ShoppingCart, Instagram, ChevronLeft, ChevronRight } from 'lucide-react-native';
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

  const [brandIndex, setBrandIndex] = useState(0);
  const autoPlayResumeRef = useRef(null);
  const animationRef = useRef(null);
  const currentOffsetRef = useRef(0);

  const brandItemWidth = Math.min(240, width * 0.6);
  const brandGap = 16;
  const brandScrollWidth = (brandItemWidth + brandGap) * brands.length;

  const scrollAnim = useRef(new Animated.Value(0)).current;

  const runMarquee = () => {
    if (animationRef.current) return;

    const current = currentOffsetRef.current;
    const end = -brandScrollWidth;
    const remaining = end - current;
    const duration = Math.max(4000, (Math.abs(remaining) / brandScrollWidth) * 8000);

    animationRef.current = Animated.timing(scrollAnim, {
      toValue: end,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animationRef.current.start(({ finished }) => {
      animationRef.current = null;
      if (!finished) return;

      scrollAnim.setValue(0);
      currentOffsetRef.current = 0;
      setBrandIndex(0);
      runMarquee();
    });
  };

  const pauseAutoPlay = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    if (autoPlayResumeRef.current) clearTimeout(autoPlayResumeRef.current);
    autoPlayResumeRef.current = setTimeout(() => {
      runMarquee();
    }, 4500);
  };

  const goToBrand = (index) => {
    pauseAutoPlay();
    const target = -index * (brandItemWidth + brandGap);
    Animated.timing(scrollAnim, {
      toValue: target,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      currentOffsetRef.current = target;
    });
  };

  const nextBrand = () => {
    const nextIndex = (brandIndex + 1) % brands.length;
    goToBrand(nextIndex);
    setBrandIndex(nextIndex);
  };

  const prevBrand = () => {
    const prevIndex = (brandIndex - 1 + brands.length) % brands.length;
    goToBrand(prevIndex);
    setBrandIndex(prevIndex);
  };

  useEffect(() => {
    const listenerId = scrollAnim.addListener(({ value }) => {
      currentOffsetRef.current = value;
      const index = Math.round(Math.abs(value) / (brandItemWidth + brandGap)) % brands.length;
      setBrandIndex(index);
    });

    return () => {
      scrollAnim.removeListener(listenerId);
      if (autoPlayResumeRef.current) clearTimeout(autoPlayResumeRef.current);
      if (animationRef.current) animationRef.current.stop();
    };
  }, [brandItemWidth, brandGap]);

  useEffect(() => {
    runMarquee();
  }, [brandScrollWidth]);

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

  // Configuración responsive para los cards del menú
  const cardWidth = 280;
  const cardGap = 16;

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
        source={require('../../assets/logo-cuadrado-snacks.jpeg')}
        style={styles.backgroundImage}
        imageStyle={styles.imageOpacity}
        resizeMode="cover"
      >
        <View style={styles.overlayContainer}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/logo-circular.png')} style={styles.headerLogo} resizeMode="contain" />
            </View>
            <View style={styles.navLinks}>
              <TouchableOpacity onPress={() => scrollToSection('Inicio')}><Text style={styles.navLinkText}>Inicio</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAboutVisible(true)}><Text style={styles.navLinkText}>Nosotros</Text></TouchableOpacity>
              <TouchableOpacity onPress={openWhatsApp}><Text style={styles.navLinkText}>Contacto</Text></TouchableOpacity>
              <TouchableOpacity onPress={openInstagram} style={styles.iconLink}>
                <Instagram color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.buyButton}>
              <ShoppingCart color="#FFFFFF" size={20} />
              {getCartCount() > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{getCartCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Snacks de proteína{"\n"}100% naturales</Text>
              <Text style={styles.heroSubtitle}>Deliciosas. Nutritivas. Sin azúcar.</Text>
              <TouchableOpacity 
                style={styles.heroCTA}
                onPress={() => scrollToSection(categories[0])}
              >
                <Text style={styles.heroCTAText}>Ver productos</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryNav}
            >
              <TouchableOpacity 
                style={[styles.navButton, !selectedCategory && styles.navButtonActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.navButtonText, !selectedCategory && styles.navButtonTextActive]}>Ver Todos</Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={`nav-${cat}`} 
                  style={[styles.navButton, selectedCategory === cat && styles.navButtonActive]}
                  onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                >
                  <Text style={[styles.navButtonText, selectedCategory === cat && styles.navButtonTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.titleContainer}>
              <Text style={styles.menuTitle}>Nuestro Menú</Text>
              <View style={styles.titleUnderline} />
            </View>

            <View style={styles.brandSection}>
              <Text style={styles.brandTitle}>Marcas con las que trabajamos</Text>
              <View
                style={styles.brandCarouselWrapper}
                onTouchStart={pauseAutoPlay}
                onStartShouldSetResponder={() => true}
              >
                <Animated.View
                  style={[
                    styles.brandRow,
                    {
                      transform: [{ translateX: scrollAnim }],
                    },
                  ]}
                >
                  {[...brands, ...brands].map((brand, idx) => (
                    <View
                      key={`${brand.id}-${idx}`}
                      style={[
                        styles.brandCard,
                        { width: brandItemWidth, marginRight: idx === brands.length * 2 - 1 ? 0 : brandGap },
                      ]}
                    >
                      <Image source={brand.logo} style={styles.brandLogo} resizeMode="contain" />
                      <Text style={styles.brandName}>{brand.name}</Text>
                    </View>
                  ))}
                </Animated.View>

                <TouchableOpacity
                  style={[styles.brandNavButton, styles.brandNavButtonLeft]}
                  onPress={prevBrand}
                  activeOpacity={0.8}
                >
                  <ChevronLeft color="#FFF" size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.brandNavButton, styles.brandNavButtonRight]}
                  onPress={nextBrand}
                  activeOpacity={0.8}
                >
                  <ChevronRight color="#FFF" size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.brandDots}>
                {brands.map((_, idx) => (
                  <View key={idx} style={[styles.brandDot, idx === brandIndex && styles.brandDotActive]} />
                ))}
              </View>
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

                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalProducts}
                  >
                    {categoryProducts.map(product => renderProduct(product))}
                  </ScrollView>
                </View>
              );
            })}

            <View style={styles.workWithUsSection}>
              <ImageBackground
                source={require('../../assets/imagen-horizontal-de.png')}
                style={styles.workWithUsBg}
                imageStyle={{ borderRadius: 20 }}
              >
                <View style={styles.workWithUsOverlay}>
                  <Text style={styles.workWithUsTitle}>Trabaja con Nosotros</Text>
                  <Text style={styles.workWithUsSubtitle}>¿Quieres distribuir Mora Protein en tu local o gimnasio? Conversemos.</Text>
                  <TouchableOpacity style={styles.workWithUsButton} onPress={openWhatsApp}>
                    <Text style={styles.workWithUsButtonText}>Contactar por WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>

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
            <Image 
              source={require('../../assets/logo-cuadrado.png')} 
              style={styles.modalLogo} 
              resizeMode="contain" 
            />
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

                  <Text style={styles.modalProductPrice}>${selectedProduct.price}</Text>

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
    backgroundColor: '#000000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageOpacity: {
    opacity: 0.3,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  header: {
    paddingTop: 40,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  headerLogo: {
    width: 60,
    height: 60,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 20,
    display: 'flex',
  },
  navLinkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  iconLink: {
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: 'rgba(210, 180, 140, 0.2)',
    borderWidth: 1,
    borderColor: '#D2B48C',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buyButtonText: {
    display: 'none',
  },
  heroSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 50,
    maxWidth: 900,
    width: '100%',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 56,
    letterSpacing: -1,
  },
  heroSubtitle: {
    color: '#ADADAD',
    fontSize: 18,
    marginTop: 15,
    fontWeight: '400',
  },
  heroCTA: {
    backgroundColor: '#D2B48C',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignSelf: 'flex-start',
    marginTop: 30,
  },
  heroCTAText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  categoryNav: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  navButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  navButtonTextActive: {
    color: '#121212',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#D2B48C',
    marginTop: 8,
  },
  categorySection: {
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  categoryLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 15,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: '#1E1E1E',
    margin: 8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  imageContainer: {
    aspectRatio: 1,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#D2B48C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceBadgeText: {
    color: '#121212',
    fontWeight: '900',
    fontSize: 16,
  },
  cardContent: {
    padding: 16,
  },
  categoryTag: {
    color: '#ADADAD',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  productDescription: {
    color: '#888888',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 10,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    color: '#FFFFFF',
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
  },
  addToCartButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  brandSection: {
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  brandCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 80,
    height: 40,
  },
  brandName: {
    color: '#ADADAD',
    fontSize: 12,
    marginTop: 10,
  },
  footerContainer: {
    padding: 40,
    backgroundColor: '#111111',
    marginTop: 40,
  },
  footerTitle: {
    color: '#D2B48C',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
  },
  footerText: {
    color: '#888888',
    fontSize: 14,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 32,
    padding: 30,
    position: 'relative',
    maxWidth: 550,
    width: '100%',
    alignItems: 'center',
  },
  modalLogo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalDescription: {
    color: '#ADADAD',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
  },
  // Modal de producto
  productModalContent: {
    backgroundColor: '#121212',
    borderRadius: 32,
    maxWidth: 550,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalProductImage: {
    width: '100%',
    height: 250,
  },
  modalProductInfo: {
    padding: 25,
  },
  modalProductCategory: {
    color: '#D2B48C',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalProductName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
  modalProductDescription: {
    color: '#ADADAD',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  modalProductPrice: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 20,
  },
  modalQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    gap: 20,
  },
  modalQtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalQtyBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalQtyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalButtonsRow: {
    marginTop: 30,
    gap: 12,
  },
  modalAddToCartButton: {
    backgroundColor: '#D2B48C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  modalAddToCartText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalViewDetailsButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalViewDetailsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  badgeContainer: {
    marginLeft: 8,
    backgroundColor: '#D2B48C',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#121212',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoContainer: {
    // Logo circular circular
  },
  coverageContainer: {
    marginBottom: 16,
  },
  optionsLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  coverageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coverageOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  coverageSelected: {
    backgroundColor: '#D2B48C',
    borderColor: '#D2B48C',
  },
  coverageText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
  },
  coverageTextSelected: {
    color: '#121212',
  },
  horizontalProducts: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 30,
  },
  workWithUsSection: {
    paddingHorizontal: 20,
    marginVertical: 40,
    alignItems: 'center',
  },
  workWithUsBg: {
    width: '100%',
    maxWidth: 1000,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
  },
  workWithUsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workWithUsTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  workWithUsSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  workWithUsButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  workWithUsButtonText: {
    color: '#121212',
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  brandCarouselWrapper: {
    overflow: 'hidden',
    position: 'relative',
    height: 120,
    marginVertical: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  brandNavButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  brandNavButtonLeft: {
    left: -10,
  },
  brandNavButtonRight: {
    right: -10,
  },
  brandDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  brandDotActive: {
    backgroundColor: '#D2B48C',
    width: 12,
  },
  modalCoverageSection: {
    marginTop: 20,
    marginBottom: 5,
  },
  modalCoverageTitle: {
    color: '#ADADAD',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  modalCoverageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCoverageOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modalCoverageSelected: {
    backgroundColor: '#D2B48C',
    borderColor: '#D2B48C',
  },
  modalCoverageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalCoverageSelectedText: {
    color: '#121212',
  },
});
