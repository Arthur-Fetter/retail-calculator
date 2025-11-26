import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../app/lib/prisma';

interface ProductData {
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { name, price, category, imageUrl }: ProductData = req.body;
      
      if (!name || !price) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }
      
      const product = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price.toString()),
          category: category || null,
          imageUrl: imageUrl || null
        }
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Método não permitido' });
  }
}
