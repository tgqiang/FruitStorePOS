'use client'

import Image from "next/image";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useContext, useState } from "react";
import { Fruit } from "@prisma/client";
import { CartItem } from "@/app/lib/data";
import { CartContext } from "@/app/lib/cart-context";

export default function ItemCard({
    fruit,
    onCartItemAdded,
    onCartItemRemoved,
    onCartItemChanged
  }
  : {
    fruit: Fruit,
    onCartItemAdded: (item: CartItem) => void
    onCartItemRemoved: (item: CartItem) => void
    onCartItemChanged: (item: CartItem) => void
  }) {
  const cartItems = useContext(CartContext);
  // Update the shopping inventory UI based on the current active-cart state
  const [addedToCart, setAddedToCart] = useState(cartItems.some((item: CartItem) => item.id === fruit.id));
  const [quantity, setQuantity] = useState(cartItems.find((item: CartItem) => item.id === fruit.id)?.quantity || 0);
  const nameLowerCase = fruit.name.toLowerCase();

  function addToCart(_event: any) {
    setQuantity(1);
    setAddedToCart(true);
    onCartItemAdded({
      id: fruit.id,
      price: fruit.price,
      quantity: 1
    });
  }

  function removeFromCart(_event: any) {
    setAddedToCart(false);
    setQuantity(0);
    onCartItemRemoved({
      id: fruit.id,
      price: fruit.price,
      quantity: 0
    });
  }

  function onQuantityManualChange(event: ChangeEvent<HTMLInputElement>) {
    const newQuantity = parseInt(event.target.value);
    if (Number.isNaN(newQuantity)) return;
    const clampedQuantity = newQuantity <= 0
      ? 0
      : newQuantity > fruit.stock
        ? fruit.stock
        : newQuantity;
    if (clampedQuantity <= 0) {
      removeFromCart(null);
    } else {
      setQuantity(clampedQuantity);
      onCartItemChanged({
        id: fruit.id,
        price: fruit.price,
        quantity: clampedQuantity
      });
    }
  }

  return (
    <>
      <Card.Card className="m-2">
        <Card.CardHeader>
          <Card.CardTitle>{fruit.name}</Card.CardTitle>
          <Card.CardDescription>Fresh delicious {nameLowerCase}s</Card.CardDescription>
        </Card.CardHeader>
        <Card.CardContent className="flex flex-col">
          <Image
            className="dark:invert rounded-xl"
            src={`/fruits/${nameLowerCase}.webp`}
            alt={`${nameLowerCase}`}
            width={200}
            height={200}
            priority
          />
          <p className="text-center p-2"><b>Price:</b> ${fruit.price.toFixed(2)}</p>
          <p className="text-center p-2"><b>Stock available:</b> {fruit.stock}</p>
        </Card.CardContent>
        <Card.CardFooter className="flex justify-center">
          {
            addedToCart
              ? <div className="w-44 flex flex-row justify-between items-center justify-items-center">
                  <Button
                    onClick={removeFromCart}
                  >
                    Remove
                  </Button>
                  <Input
                    className="w-16"
                    value={quantity}
                    type="number"
                    min={0}
                    max={fruit.stock}
                    onChange={onQuantityManualChange}
                  />
                </div>
              : <Button onClick={addToCart}>
                Add To Cart
              </Button>
          }
        </Card.CardFooter>
      </Card.Card>
    </>
  );
}