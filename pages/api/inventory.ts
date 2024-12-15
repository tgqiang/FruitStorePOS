import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/app/lib/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {
    if (req.method === 'GET') {
      const inventory = await prisma.fruit.findMany({
        orderBy: {
          id: 'asc'
        }
      });
      res.status(200).json(inventory);
    } else {
      res.status(400).json({ message: 'Method not available.', details: '' });
    }
}