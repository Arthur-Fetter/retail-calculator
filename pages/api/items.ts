import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../app/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const items = await prisma.item.findMany({
        orderBy: {
          id: 'asc',
        },
      });
      res.status(200).json(items);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { title } = req.body;

      const newItem = await prisma.item.create({
        data: {
          title: title,
        },
      });
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Failed to create item:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
