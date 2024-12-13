'use client'

import ItemCard from "./ItemCard";
import { CartItem } from '@/app/lib/data';
import { Fruit } from '@prisma/client';

export default function ShoppingInventory({
    inventory,
    isLoading,
    isError,
    searchValue,
    onCartItemAdded,
    onCartItemRemoved,
    onCartItemChanged
  }
  : {
    inventory: Array<Fruit>,
    isLoading: boolean,
    isError: boolean,
    searchValue: string,
    onCartItemAdded: (item: CartItem) => void
    onCartItemRemoved: (item: CartItem) => void
    onCartItemChanged: (item: CartItem) => void
  }) {

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Failed to retrieve data, please try again later.</p>

  return (
    <>
      {
        inventory
          .filter(fruit => fruit.name.toLowerCase().includes(searchValue))
          .map(fruit => {
            return (
              <ItemCard
                key={fruit.id}
                fruit={fruit}
                onCartItemAdded={onCartItemAdded}
                onCartItemRemoved={onCartItemRemoved}
                onCartItemChanged={onCartItemChanged}
              />
            );
          })
      }
    </>
  );
}