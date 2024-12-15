'use client'

import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage
// } from "@/components/ui/avatar";
import {
  ChangeEvent,
  useContext,
  useState
} from 'react';
import ShoppingInventory from "@/app/ui/components/ShoppingInventory";
import { CartEventContext } from "@/app/lib/cart-context";
import { InventoryContext } from "@/app/lib/inventory-context";

export default function Home() {
  const cartEventContext = useContext(CartEventContext);
  const inventoryContext = useContext(InventoryContext);
  const [searchValue, setSearchValue] = useState('');

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setSearchValue(event.target.value);
  }

  return (
    <>
      <div className="sticky top-10 z-10 bg-white w-full flex flex-row justify-center items-center justify-items-center px-4 py-2 space-x-4">
        <Label>Search: </Label>
        <Input
          className="w-1/2"
          type="text"
          placeholder="Search for fruit"
          onChange={handleSearch}
        />
      </div>
      <ScrollArea className="w-full flex flex-row flex-wrap justify-center items-center justify-items-center">
        <ShoppingInventory
          inventory={inventoryContext.inventory}
          isLoading={inventoryContext.isLoading}
          isError={inventoryContext.isError}
          searchValue={searchValue}
          onCartItemAdded={cartEventContext.onCartItemAdded}
          onCartItemRemoved={cartEventContext.onCartItemRemoved}
          onCartItemChanged={cartEventContext.onCartItemChanged}
        />
      </ScrollArea>
    </>
  );
}
