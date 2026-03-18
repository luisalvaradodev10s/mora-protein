import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, options = {}) => {
    const cartItemId = `${product.id}:${options.coverage || 'default'}`;

    setCart(currentCart => {
      const existingProduct = currentCart.find(item => item.cartItemId === cartItemId);
      if (existingProduct) {
        return currentCart.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { ...product, ...options, cartItemId, quantity: 1 }];
    });
  };

  const incrementQuantity = (cartItemId) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (cartItemId) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.cartItemId === cartItemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeItem = (cartItemId) => {
    setCart(currentCart => currentCart.filter(item => item.cartItemId !== cartItemId));
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      incrementQuantity,
      decrementQuantity,
      removeItem,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
