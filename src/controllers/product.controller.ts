import { Request, Response } from 'express';
import prisma from '@/prisma';

export class ProductController {
  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany();
      return res.status(200).send(products);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error retrieving products' });
    }
  }

  async getProductById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }

      return res.status(200).send(product);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error retrieving product' });
    }
  }

  async getProductByUser(req: Request, res: Response) {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    // Konversi query parameter ke angka
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
  
    // Hitung offset untuk pagination
    const offset = (pageNumber - 1) * limitNumber;
  
    try {
      // Fetch produk dengan pagination
      const products = await prisma.product.findMany({
        where: { userId: id },
        skip: offset,
        take: limitNumber,
      });
  
      // Hitung total produk untuk user tertentu
      const totalProducts = await prisma.product.count({
        where: { userId: id },
      });
  
      // Kirimkan data dengan informasi pagination
      return res.status(200).send({
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limitNumber),
        currentPage: pageNumber,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error retrieving product' });
    }
  }
  

  async createProduct(req: Request, res: Response) {
    const { userId, name, description, price } = req.body;

    try {
      const newProduct = await prisma.product.create({
        data: { userId, name, description, price },
      });

      return res.status(201).send(newProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error creating product' });
    }
  }

  async updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description, price } = req.body;

    try {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: { name, description, price },
      });

      return res.status(200).send(updatedProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error updating product' });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.product.delete({
        where: { id },
      });

      return res.status(200).send({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error deleting product' });
    }
  }
}
