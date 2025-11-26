// pages/api/products.js - VERSÃO CORRIGIDA COM TIPAGEM
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../app/lib/prisma';

/**
 * API para cadastro de produtos conforme User Story 1:
 * "Cadastrar produto - nome, preço, categoria"
 */
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
      const { name, unitPrice, kgPrice, category } = req.body;
      
      // Validação conforme User Story 1: "Cadastrar produto"
      if (!name || !category) {
        return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
      }
      
      // Fluxo BPMN: "1. Selecionar produtos → 2. Definir quantidades"
      // Usar unitPrice se fornecido, senão usar kgPrice
      const price = unitPrice || kgPrice;
      
      if (!price) {
        return res.status(400).json({ error: 'Informe pelo menos um preço (unidade ou quilo)' });
      }
      
      // Criar produto conforme escopo MVP: "Cadastro simples de produtos"
      const product = await prisma.product.create({
        data: {
          name: name.trim(),
          price: parseFloat(price.toString()),
          category: category || null,
          imageUrl: null // Para implementar upload posteriormente
        }
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ 
        error: 'Erro ao criar produto',
        message: errorMessage
      });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Método ${req.method} não permitido` });
  }
}