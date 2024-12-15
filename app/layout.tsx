'use client'

//import type { Metadata } from "next";
import Link from "next/link";
import {
  useEffect,
  useState
} from "react";
import { inter } from "./ui/fonts";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import {
  CartContext,
  CartEventContext,
  cartIdKey,
  cartItemsKey
} from "@/app/lib/cart-context";
import { CartItem } from "@/app/lib/data";
import Cart from "@/app/ui/components/Cart";
import { InventoryContext } from "@/app/lib/inventory-context";
import { Cherry } from "lucide-react";

// export const metadata: Metadata = {
//   title: "Fruit Store",
//   description: "Fruit Store (RAiD Software Engineering Challenge)",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadInventory, setReloadInventory] = useState(true);

  const [cartItems, setCartItems] = useState(Array<CartItem>(0));
  let cartSessionId: string | null = null;

  useEffect(() => {
    // Fetch the fruit inventory
    if (reloadInventory) {
      fetch('/api/inventory')
        .then((res) => res.json())
        .then((data) => {
          setInventory(data);
          setIsLoading(false);
        })
        .catch((_reason) => {
          setIsError(true);
          setIsLoading(false);
        });
      setReloadInventory(false);
    }

    if (typeof window !== 'undefined') {
      // Retrieve an active session cart, if it exists.
      cartSessionId = localStorage.getItem(cartIdKey);
      if (cartSessionId) {
        setCartItems(JSON.parse(localStorage.getItem(cartItemsKey) || '[]'));
      } else {
        // Saves the current session cart in Local Storage.
        // TODO: generate a DB-unique ID for this cart
        cartSessionId = '1';
        localStorage.setItem(cartIdKey, cartSessionId);
        localStorage.setItem(cartItemsKey, JSON.stringify(cartItems));
      }
    }
  }, [reloadInventory]);

  // ===== PARENT CART LOGIC ===== //
  function onCartItemAdded(item: CartItem) {
    const newCartItems = cartItems.slice();
    newCartItems.push(item);
    syncCartToLocalStorage(newCartItems);
  }

  function onCartItemRemoved(item: CartItem) {
    const targetItemIdx = cartItems.findIndex((cartItem) => cartItem.id === item.id);
    const newCartItems = cartItems.slice();
    newCartItems.splice(targetItemIdx, 1);
    syncCartToLocalStorage(newCartItems);
  }

  function onCartItemChanged(item: CartItem) {
    const targetItemIdx = cartItems.findIndex((cartItem) => cartItem.id === item.id);
    const newCartItems = cartItems.slice();
    newCartItems[targetItemIdx] = item;
    syncCartToLocalStorage(newCartItems);
  }

  function syncCartToLocalStorage(newCartItems: CartItem[]) {
    localStorage.setItem(cartItemsKey, JSON.stringify(newCartItems));
    setCartItems(newCartItems);
  }

  function clearCart() {
    localStorage.removeItem(cartIdKey);
    localStorage.removeItem(cartItemsKey);
    setReloadInventory(true);
    setCartItems([]);
  }
  
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <CartContext.Provider value={cartItems}>
          <CartEventContext.Provider value={{
              onCartItemAdded,
              onCartItemRemoved,
              onCartItemChanged,
              clearCart
            }}
          >
            <InventoryContext.Provider value={{
                inventory,
                isLoading,
                isError
              }}
            >
              <div className="flex flex-col justify-start items-center justify-items-center min-w-screen min-h-screen">
                <header className="sticky top-0 z-10 bg-white flex flex-col w-full h-1/5 items-center justify-between p-4 md:p-8 space-y-4">
                  <div className="flex flex-row w-full h-1/5 items-center justify-between">
                    <Link className="flex flex-row space-x-2" href="/">
                      <Cherry />
                      <h1 className="text-xl font-bold">Fruit Store</h1>
                    </Link>
                    <div className="flex flex-row space-x-2 items-center justify-between">
                        <Cart />
                      {/* <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar> */}
                      {/* <Button>Login</Button> */}
                    </div>
                  </div>
                </header>
                <main className="w-full h-4/5">
                  {children}
                </main>
              </div>
              <Toaster />
            </InventoryContext.Provider>
          </CartEventContext.Provider>
        </CartContext.Provider>
      </body>
    </html>
  );
}
