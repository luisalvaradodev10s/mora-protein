import React, { useContext, useEffect, useState, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, ImageBackground, useWindowDimensions, Modal } from 'react-native';
import { products } from '../data/products';
import { brands } from '../data/brands';
import { ShoppingCart, Instagram, ChevronLeft, ChevronRight, X, Minus, Plus, Trash2 } from 'lucide-react-native';
import WhatsAppCartIcon from '../components/WhatsAppCartIcon';
import { CartContext } from '../context/CartContext';

export default function HomeScreen({ navigation }) {
  const { cart, addToCart, incrementQuantity, decrementQuantity, removeItem, getCartCount } = useContext(CartContext);
  const [selectedCoverage, setSelectedCoverage] = useState({});
  const [selectedQuantity, setSelectedQuantity] = useState({});
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [isWorkModalVisible, setIsWorkModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCartDrawerVisible, setIsCartDrawerVisible] = useState(false);
  const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);
  const cartAnim = useRef(new Animated.Value(width)).current;
  const categoryMenuAnim = useRef(new Animated.Value(-100)).current;
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

  const toggleCartDrawer = (visible) => {
    if (visible) setIsCartDrawerVisible(true);
    Animated.timing(cartAnim, {
      toValue: visible ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) setIsCartDrawerVisible(false);
    });
  };

  const toggleCategoryMenu = (visible) => {
    if (visible) setIsCategoryMenuVisible(true);
    Animated.timing(categoryMenuAnim, {
      toValue: visible ? 0 : -120,
      duration: visible ? 300 : 200,
      easing: visible ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (!visible) setIsCategoryMenuVisible(false);
    });
  };

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

  const handleCheckout = () => {
    const phone = '+56954099576';
    let message = 'Hola Mora Protein! Me gustaría realizar el siguiente pedido:\n\n';
    
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name}${item.coverage ? ` (${item.coverage})` : ''} - $${item.price * item.quantity}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Total: $${total}*`;
    
    Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
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
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/logo-circular.png')} style={styles.headerLogo} resizeMode="contain" />
              </View>
              <TouchableOpacity style={styles.headerCTA} onPress={() => toggleCategoryMenu(true)}>
                <Text style={styles.headerCTAText}>VER PRODUCTOS</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.navLinks}>
              <TouchableOpacity onPress={() => setIsAboutVisible(true)}><Text style={styles.navLinkText}>QUIÉNES SOMOS</Text></TouchableOpacity>
              <TouchableOpacity onPress={openWhatsApp}><Text style={styles.navLinkText}>Contacto</Text></TouchableOpacity>
              <TouchableOpacity onPress={openInstagram} style={styles.iconLink}>
                <Instagram color="#D2B48C" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleCartDrawer(true)} style={styles.buyButton}>
                <WhatsAppCartIcon size={32} />
                {getCartCount() > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{getCartCount()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Snacks de proteína{"\n"}100% naturales</Text>
              <Text style={styles.heroSubtitle}>Deliciosas. Nutritivas. Sin azúcar.</Text>
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
            <Text style={styles.modalTitle}>QUIÉNES SOMOS</Text>
            <Text style={styles.modalDescription}>
              Mora Protein es una marca de snacks saludables hechos a mano, sin azúcar, altos en proteína y con opciones veganas.{"\n\n"}
              Desarrollamos productos artesanales, naturales y frescos, pensados para quienes buscan cuidarse sin dejar de disfrutar. Nuestra propuesta combina nutrición y sabor en formatos prácticos, accesibles y fáciles de integrar al día a día.
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

                </View>
              </ScrollView>
            )}
            {selectedProduct && (
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
      {/* Category Menu */}
      {isCategoryMenuVisible && (
        <View style={styles.categoryMenuOverlay}>
          <TouchableOpacity 
            activeOpacity={1} 
            style={StyleSheet.absoluteFill} 
            onPress={() => toggleCategoryMenu(false)} 
          />
          <Animated.View style={[styles.categoryMenu, { transform: [{ translateY: categoryMenuAnim }] }]}>
            <View style={styles.categoryMenuHeader}>
              <Text style={styles.categoryMenuTitle}>Snacks 100% Naturales</Text>
              <TouchableOpacity onPress={() => toggleCategoryMenu(false)}>
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.categoryMenuOptions}>
              <TouchableOpacity
                style={[styles.catMenuBtn, !selectedCategory && styles.catMenuBtnActive]}
                onPress={() => {
                  setSelectedCategory(null);
                  toggleCategoryMenu(false);
                  scrollToSection('Nuestro Menú');
                }}
              >
                <Text style={[styles.catMenuBtnText, !selectedCategory && styles.catMenuBtnTextActive]}>Ver Todos</Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity
                  key={`menu-cat-${cat}`}
                  style={[styles.catMenuBtn, selectedCategory === cat && styles.catMenuBtnActive]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    toggleCategoryMenu(false);
                    scrollToSection('Nuestro Menú');
                  }}
                >
                  <Text style={[styles.catMenuBtnText, selectedCategory === cat && styles.catMenuBtnTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      )}

      {/* Cart Drawer */}
      {isCartDrawerVisible && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.drawerOverlay} 
            onPress={() => toggleCartDrawer(false)} 
          />
          <Animated.View style={[styles.cartDrawer, { transform: [{ translateX: cartAnim }] }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Tu Carrito</Text>
              <TouchableOpacity onPress={() => toggleCartDrawer(false)} style={styles.drawerCloseBtn}>
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyDrawer}>
                <ShoppingCart color="rgba(255,255,255,0.1)" size={80} />
                <Text style={styles.emptyDrawerText}>Tu carrito está vacío</Text>
                <TouchableOpacity style={styles.startShoppingBtn} onPress={() => toggleCartDrawer(false)}>
                  <Text style={styles.startShoppingText}>Empezar a comprar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView style={styles.drawerScroll}>
                  {cart.map((item) => (
                    <View key={item.cartItemId} style={styles.drawerItem}>
                      <Image source={item.image} style={styles.drawerItemImage} />
                      <View style={styles.drawerItemInfo}>
                        <Text style={styles.drawerItemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.drawerItemOption}>{item.coverage || ''}</Text>
                        <Text style={styles.drawerItemPrice}>${item.price}</Text>
                        <View style={styles.drawerQtyRow}>
                          <TouchableOpacity 
                            style={styles.drawerQtyBtn} 
                            onPress={() => decrementQuantity(item.cartItemId)}
                          >
                            <Minus color="#FFF" size={14} />
                          </TouchableOpacity>
                          <Text style={styles.drawerQtyText}>{item.quantity}</Text>
                          <TouchableOpacity 
                            style={styles.drawerQtyBtn} 
                            onPress={() => incrementQuantity(item.cartItemId)}
                          >
                            <Plus color="#FFF" size={14} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.drawerRemoveBtn} 
                        onPress={() => removeItem(item.cartItemId)}
                      >
                        <Trash2 color="#FF4B4B" size={18} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.drawerFooter}>
                  <View style={styles.drawerTotalRow}>
                    <Text style={styles.drawerTotalLabel}>Total</Text>
                    <Text style={styles.drawerTotalValue}>
                      ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                    <Text style={styles.checkoutText}>Pedir por WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      )}
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
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerCTA: {
    backgroundColor: '#D2B48C',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 10,
  },
  headerCTAText: {
    color: '#121212',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  headerLogo: {
    width: 60,
    height: 60,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLinkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  iconLink: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginLeft: 8,
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
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    marginHorizontal: 20,
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

  scrollContent: {
    paddingBottom: 80,
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  imageContainer: {
    aspectRatio: 1,
    width: '100%',
    position: 'relative',
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  priceBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D2B48C',
    shadowColor: '#D2B48C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  priceBadgeText: {
    color: '#D2B48C',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
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
    color: '#5EDB8A',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(80, 220, 130, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '300',
    lineHeight: 22,
  },
  quantityText: {
    color: '#FFFFFF',
    marginHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  addToCartButton: {
    backgroundColor: '#D2B48C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  addToCartText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
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
    maxWidth: 360,
    width: '100%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalProductImage: {
    width: '100%',
    height: 170,
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
    color: '#D2B48C',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 15,
    backgroundColor: 'rgba(210, 180, 140, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#D2B48C',
    letterSpacing: 0.5,
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
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalQtyBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 26,
  },
  modalQtyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalButtonsRow: {
    marginTop: -20,
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  modalAddToCartButton: {
    flex: 1,
    backgroundColor: '#D2B48C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalAddToCartText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalViewDetailsButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalViewDetailsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#D2B48C',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#121212',
  },
  badgeText: {
    color: '#121212',
    fontSize: 9,
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  // Cart Drawer Styles
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 999,
  },
  cartDrawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#121212',
    zIndex: 1000,
    paddingTop: 40,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  drawerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  drawerCloseBtn: {
    padding: 5,
  },
  drawerScroll: {
    flex: 1,
    padding: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  drawerItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  drawerItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  drawerItemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  drawerItemOption: {
    color: '#ADADAD',
    fontSize: 10,
  },
  drawerItemPrice: {
    color: '#D2B48C',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  drawerQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  drawerQtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerQtyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  drawerRemoveBtn: {
    padding: 10,
  },
  emptyDrawer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyDrawerText: {
    color: '#ADADAD',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  startShoppingBtn: {
    backgroundColor: '#D2B48C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startShoppingText: {
    color: '#121212',
    fontWeight: '900',
  },
  drawerFooter: {
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  drawerTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerTotalLabel: {
    color: '#ADADAD',
    fontSize: 16,
    fontWeight: '600',
  },
  drawerTotalValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  checkoutBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  // Category Menu Styles
  categoryMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1100,
  },
  categoryMenu: {
    backgroundColor: '#1E1E1E',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#D2B48C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  categoryMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  categoryMenuTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryMenuOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  catMenuBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  catMenuBtnActive: {
    backgroundColor: '#D2B48C',
    borderColor: '#D2B48C',
  },
  catMenuBtnText: {
    color: '#ADADAD',
    fontSize: 13,
    fontWeight: '800',
  },
  catMenuBtnTextActive: {
    color: '#121212',
  },
});
