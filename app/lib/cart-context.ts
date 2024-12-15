import { createContext } from "react";
import { CartItem } from "./data";

export const cartIdKey = 'cartId';
export const cartItemsKey = 'cartItems';

export const CartContext = createContext(Array<CartItem>(0));
export const CartEventContext = createContext<{
  onCartItemAdded: (item: CartItem) => void,
  onCartItemRemoved: (item: CartItem) => void,
  onCartItemChanged: (item: CartItem) => void,
  clearCart: () => void
}>({
  onCartItemAdded: (_item) => {},
  onCartItemRemoved: (_item) => {},
  onCartItemChanged: (_item) => {},
  clearCart: () => {}
});