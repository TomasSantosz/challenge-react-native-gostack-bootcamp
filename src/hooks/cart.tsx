import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const getProducts = await AsyncStorage.getItem('@GoMarketplace:products');
      if (getProducts) {
        setProducts(JSON.parse(getProducts));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const getProducts = [...products];
      const product = getProducts.find(item => item.id === id);
      const productId = getProducts.findIndex(item => item.id === id);

      if (product) {
        getProducts.splice(productId, 1);
      } else {
        throw new Error('Product not found');
      }
      product.quantity += 1;

      getProducts.push(product);

      setProducts(getProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const getProducts = [...products];
      const product = getProducts.find(item => item.id === id);
      const productId = getProducts.findIndex(item => item.id === id);

      if (product) {
        getProducts.splice(productId, 1);
      } else {
        throw new Error('Product not found');
      }
      product.quantity -= 1;

      getProducts.push(product);

      setProducts(getProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const idProduct = products.findIndex(item => item.id === product.id);

      if (idProduct !== -1) {
        increment(idProduct);
        return;
      }
      product.quantity = 1;
      products.push(product);
      setProducts([...products]);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products, increment],
  );
  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
