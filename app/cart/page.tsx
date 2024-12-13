'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CartContext,
  CartEventContext,
} from "@/app/lib/cart-context";
import { useContext, useState } from "react";
import { Loader2 } from "lucide-react";
import { Fruit } from "@prisma/client";
import { InventoryContext } from "@/app/lib/inventory-context";
import { CartItem } from "@/app/lib/data";
import * as Table from "@/components/ui/table";

export default function Page() {
  const inventoryContext = useContext(InventoryContext);
  const cartItems = useContext(CartContext);
  const cartEventContext = useContext(CartEventContext);

  const [transformedCartData] = useState(
    cartItems.map((item: CartItem, idx: number) => {
      return {
        id: item.id,
        name: inventoryContext.inventory.find((fruit: Fruit) => fruit.id === item.id)?.name || '',
        price: item.price,
        quantity: item.quantity,
        sn: idx + 1,
        subtotal: item.price * item.quantity
      };
    })
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('Unsubmitted');

  function onCartSubmit(_event: any) {
    setIsSubmitting(true);
    // TODO: trigger POST request
    fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify(cartItems)
    })
      .then((res) => {
        if (res.ok) {
          onCartPostSubmit(null);
        } else {
          setIsSubmitting(false);
          setSubmitStatus('Error');
        }
      })
      .catch((_reason) => {
        setIsSubmitting(false);
        setSubmitStatus('Error');
      });
  }

  function onCartPostSubmit(_event: any) {
    cartEventContext.clearCart();
    setIsSubmitting(false);
    setSubmitStatus('Success');
  }
  
  return (
    <div className="w-full p-4 md:p-8">
      <h1 className="text-lg font-semibold py-2">My Cart</h1>
      <Table.Table>
        <Table.TableHeader>
          <Table.TableRow>
            <Table.TableHead className="w-[100px]">S/N</Table.TableHead>
            <Table.TableHead>Item</Table.TableHead>
            <Table.TableHead>Price</Table.TableHead>
            <Table.TableHead>Quantity</Table.TableHead>
            <Table.TableHead className="text-right">Subtotal</Table.TableHead>
          </Table.TableRow>
        </Table.TableHeader>
        <Table.TableBody>
          {
            transformedCartData.map((cartItem) => (
              <Table.TableRow key={cartItem.id}>
                <Table.TableCell className="font-medium">{cartItem.sn}</Table.TableCell>
                <Table.TableCell>{cartItem.name}</Table.TableCell>
                <Table.TableCell>${cartItem.price.toFixed(2)}</Table.TableCell>
                <Table.TableCell>{cartItem.quantity}</Table.TableCell>
                <Table.TableCell className="text-right">${(cartItem.subtotal).toFixed(2)}</Table.TableCell>
              </Table.TableRow>
            ))
          }
        </Table.TableBody>
        <Table.TableFooter>
          <Table.TableRow>
            <Table.TableCell colSpan={4}>Total</Table.TableCell>
            <Table.TableCell className="text-right">${transformedCartData.reduce((prev, curr) => prev + curr.subtotal, 0).toFixed(2)}</Table.TableCell>
          </Table.TableRow>
        </Table.TableFooter>
      </Table.Table>
      <div className="w-full flex flex-row justify-center items-center">
        <div className="w-full md:w-1/4 flex flex-row justify-between items-center justify-items-center my-4">
          <Link href="/">
            <Button variant={"secondary"}>Back</Button>
          </Link>
          {
            isSubmitting
              ? (
                <Button disabled={isSubmitting}>
                  <Loader2 className="animate-spin" />
                  Please wait
                </Button>
              )
            : (
              <Button
                disabled={submitStatus === 'Success'}
                onClick={onCartSubmit}
              >
                {submitStatus === 'Success' ? 'Submitted!' : 'Submit'}
              </Button>
              )
          }
        </div>
      </div>
    </div>
  );
}