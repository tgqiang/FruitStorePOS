import { NextApiRequest, NextApiResponse } from "next";
import { createHash } from 'node:crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {
    // Query inventory with optional search params
    if (req.method === 'POST') {
      const data : { key: string } = JSON.parse(req.body);
      const hash = createHash('sha-256').update(data.key).digest('hex');

      if (hash === process.env.OWNER_SECRET_KEY_HASH) {
        res.status(201).json({ message: 'Validated.', details: '' });
      } else {
        res.status(403).json({ message: 'Not validated.', details: '' });
      }
    } else {
      res.status(400).json({ message: 'Method not available.', details: '' });
    }
}