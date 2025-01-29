import { Request, Response } from 'express';
import prisma from '@/prisma';

export class ClientController {
  async getAllClient(req: Request, res: Response) {
    try {
      const clients = await prisma.product.findMany();
      return res.status(200).send(clients);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error retrieving client' });
    }
  }

  async getClienttById(req: Request, res: Response) {
    const { id, userId } = req.params;

    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (product?.userId !== userId)
        return res
          .status(404)
          .send({ message: 'this client not belongs to this user' });

      if (!product) {
        return res.status(404).send({ message: 'client not found' });
      }

      return res.status(200).send(product);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error retrieving client' });
    }
  }

  async getClientByUser(req: Request, res: Response) {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    try {
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const offset = (pageNumber - 1) * pageSize;
  
      const totalCount = await prisma.client.count({
        where: { userId },
      });
  
      const clients = await prisma.client.findMany({
        where: { userId: userId },
        skip: offset,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { invoices: true }, // Count the number of invoices related to each client
          },
        },
      });
  

  
      return res.status(200).send({
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalItems: totalCount,
        clients: clients,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error retrieving client' });
    }
  }
  

  async createClient(req: Request, res: Response) {
    const { userId, name, address, email, paymentTerms } = req.body;

    try {
      const newProduct = await prisma.client.create({
        data: {
          userId,
          name,
          address,
          email,
          paymentTerms,
        },
      });

      return res.status(201).send(newProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error creating client' });
    }
  }

  async updateClient(req: Request, res: Response) {
    const { id } = req.params;
    console.log(req.body);
    const { name, address, contactInfo: email, paymentTerms } = req.body;

    try {
      const updatedClient = await prisma.client.update({
        where: { id },
        data: {
          name,
          address,
          email,
          paymentTerms,
        },
      });

      return res.status(200).send(updatedClient);
    } catch (error: any) {
      console.error(error);

      if (error.code === 'P2025') {
        return res.status(404).send({ message: 'Client not found' });
      }

      return res.status(500).send({ message: 'Error updating client' });
    }
  }

  async deleteClient(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.client.delete({
        where: { id },
      });

      return res.status(200).send({ message: 'client deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error deleting client' });
    }
  }

  async searchClientByName(req: Request, res: Response) {
    const { name } = req.query;

    if (!name || typeof name !== 'string') {
      return res.status(400).send({
        message: 'Name query parameter is required and must be a string.',
      });
    }

    try {
      const clients = await prisma.client.findMany({
        where: {
          name: {
            contains: name, // Mencari nama yang mengandung string 'name'
            mode: 'insensitive', // Membuat pencarian tidak case-sensitive
          },
        },
      });

      if (clients.length === 0) {
        return res
          .status(404)
          .send({ message: 'No clients found with the given name.' });
      }

      return res.status(200).json(clients);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: 'Error searching clients by name.' });
    }
  }

  
}
