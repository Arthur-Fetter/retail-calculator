import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../app/lib/prisma';

interface SaleItemData {
  productId: number;
  quantity: number;
  price: number;
}

interface SaleData {
  items: SaleItemData[];
  paymentMethodId: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sales = await prisma.sale.findMany({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        include: {
          paymentMethod: true,
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.status(200).json(sales);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      res.status(500).json({ error: 'Erro ao buscar vendas' });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { items, paymentMethodId }: SaleData = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items são obrigatórios' });
      }
      
      if (!paymentMethodId) {
        return res.status(400).json({ error: 'Método de pagamento é obrigatório' });
      }
      
      // Calcular totais - implementando o fluxo BPMN (etapa 4)
      let totalGross = 0;
      for (const item of items) {
        totalGross += item.price * item.quantity;
      }
      
      // Buscar taxa do método de pagamento
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: paymentMethodId }
      });
      
      if (!paymentMethod) {
        return res.status(404).json({ error: 'Método de pagamento não encontrado' });
      }
      
      const totalTax = totalGross * (paymentMethod.taxRate || 0) / 100;
      const totalNet = totalGross - totalTax;
      
      // Criar venda - implementando etapas 5 e 6 do fluxo BPMN
      const sale = await prisma.sale.create({
        data: {
          totalGross,
          totalTax,
          totalNet,
          paymentMethodId,
          items: {
            create: items.map((item: SaleItemData) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity
            }))
          }
        },
        include: {
          paymentMethod: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });
      
      res.status(201).json(sale);
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      res.status(500).json({ error: 'Erro ao criar venda' });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Método não permitido' });
  }
}