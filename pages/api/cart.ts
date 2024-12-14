import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/app/lib/prisma-client";
import { Fruit, Prisma } from "@prisma/client";
import { CartItem, CustomPostApiResponseData } from "@/app/lib/data";

/**
 * Validates a user-provided cart with a known (sub)inventory.
 * @param userCart
 * The cart provided by the user; should be pre-sorted by item `id`
 * @param targetItems The (sub)inventory to check against the requested quantities in the `userCart`;
 * should be pre-sorted by item `id`
 * @returns The intended response details in the form `[responseCode, responseData]`
 */
function validateUserCart(userCart: CartItem[], targetItems: Fruit[])
: [number, CustomPostApiResponseData] {
  const resBadRequestCode = 400;
  let resCode = 201;
  let resData: CustomPostApiResponseData = {
    message: 'Cart creation success',
    details: ''
  };

  // Reject if number of item (types) do not match the
  // item (type) count retrieved from inventory.
  if (targetItems.length !== userCart.length) {
    resData.message = 'Cart creation error.';
    resData.details = 'Invalid item in cart.';
    resCode = resBadRequestCode;
  } else {
    for (let i = 0; i < userCart.length; i++) {
      // Cart contains non-existent item
      if (userCart[i].id !== targetItems[i].id) {
        resData.message = 'Cart creation error.';
        resData.details = 'Invalid item in cart.';
        resCode = resBadRequestCode;
        break;
      }
      // Cart item requested qty exceeds available stock
      else if (userCart[i].quantity > targetItems[i].stock) {
        resData.message = 'Cart creation error.';
        resData.details = 'Cart item requested exceeds item availability.';
        resCode = resBadRequestCode;
        break;
      }
    }
  }

  return [resCode, resData];
}

/**
 * Computes the new (sub)inventory after a valid deduction from a user's cart.
 * @param userCart
 * The cart provided by the user; should be pre-sorted by item `id` *and validated*
 * @param targetItems The (sub)inventory to check against the requested quantities in the `userCart`;
 * should be pre-sorted by item `id`
 * @returns An array representing the remaining (sub)inventory after the deduction
 */
function computeRemainingInventoryAfterCartDeduction(
  userCart: CartItem[], targetItems: Fruit[])
: Fruit[] {
  let remainingStock = targetItems.slice();
  for (let i = 0; i < remainingStock.length; i++) {
    remainingStock[i].stock -= userCart[i].quantity;
  }
  return remainingStock;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {
    // Query inventory with optional search params
    if (req.method === 'GET') {
      const unfulfilledCarts = await prisma.cart.findMany({
        where: {
          fulfilled: false
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      res.status(200).json(unfulfilledCarts);
    } else if (req.method === 'POST') {
      let userCart: CartItem[] = JSON.parse(req.body);
      userCart.sort((a, b) => a.id - b.id);

      const targetItems = await prisma.fruit.findMany({
        where: {
          id: {
            in: userCart.map((item: CartItem) => item.id)
          }
        },
        orderBy: {
          id: 'asc'
        }
      });

      const [resCode, resData] = validateUserCart(userCart, targetItems);

      if (resCode === 201) {
        const cartJson = userCart as Prisma.JsonArray;
        const remainingSubInventory = computeRemainingInventoryAfterCartDeduction(userCart, targetItems);
        const inventoryUpdates = remainingSubInventory.map((item: Fruit) => {
          return prisma.fruit.update({
            where: {
              id: item.id
            },
            data: {
              stock: item.stock
            }
          });
        });
        await prisma.$transaction([
          prisma.cart.create({
            data: {
              closed: true,
              items: cartJson
            }
          }),
          ...inventoryUpdates
        ])
        .then((_data: any) => {
          res.status(resCode).json(resData);
        })
        .catch((_err: any) => {
          res.status(400).json({ message: 'Cart creation error.', details: 'Internal error' });
        });
      }
    } else {
      res.status(400).json({ message: 'Method not available.', details: '' });
    }
}