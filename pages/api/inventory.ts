import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/app/lib/prisma-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {
    // Query inventory with optional search params
    if (req.method === 'GET') {
      const inventory = await prisma.fruit.findMany({});
      res.status(200).json(inventory);
    } else {
      res.status(400).json({ message: 'Method not available.' });
    }
}