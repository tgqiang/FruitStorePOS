'use client'

import { useContext } from "react";
import Link from "next/link";
import { CartContext } from "@/app/lib/cart-context";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export default function Cart() {
  const items = useContext(CartContext);

  return (
    <>
      <Link href="/cart">
        <ShoppingCart width={24} height={24} />
      </Link>
      <Badge>{items.length}</Badge>
      <Badge>${items.reduce((prev, curr) => prev + curr.price * curr.quantity, 0).toFixed(2)}</Badge>
    </>
  );
}