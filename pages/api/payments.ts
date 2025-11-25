import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../app/lib/prisma';

interface PaymentMethodData {
  name: string;
  taxRate: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const paymentMethods = await prisma.paymentMethod.findMany({
        orderBy: { name: 'asc' }
      });
      res.status(200).json(paymentMethods);
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      res.status(500).json({ error: 'Erro ao buscar métodos de pagamento' });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { name, taxRate }: PaymentMethodData = req.body;
      
      if (!name || taxRate === undefined) {
        return res.status(400).json({ error: 'Nome e taxa são obrigatórios' });
      }
      
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          name,
          taxRate: parseFloat(taxRate.toString())
        }
      });
      
      res.status(201).json(paymentMethod);
    } catch (error) {
      console.error('Erro ao criar método de pagamento:', error);
      res.status(500).json({ error: 'Erro ao criar método de pagamento' });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Método não permitido' });
  }
}