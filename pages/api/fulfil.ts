import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/app/lib/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {
    // Query inventory with optional search params
    if (req.method === 'POST') {
      const order : { id: string } = JSON.parse(req.body);
      await prisma.cart.update({
        where: {
          id: order.id
        },
        data: {
          fulfilled: true
        }
      })
      .then((_data) => {
        res.status(201).json({ message: 'Order fulfilled.', details: '' });
      })
      .catch((_err) => {
        res.status(400).json({
          message: 'Order fulfil error.',
          details: 'Order may not exist, or could be an internal error.'
        });
      });
    } else {
      res.status(400).json({ message: 'Method not available.', details: '' });
    }
}