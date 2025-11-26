import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '../../../app/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    let { id } = req.query
    const productId = Number(id)
    try {
      const deletedProduct = await prisma.product.delete({
        where: {
          id: productId
        }
      })

      res.status(200).json(deletedProduct);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }
}
