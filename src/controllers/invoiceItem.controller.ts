import { Request, Response } from "express";
import prisma from "@/prisma";


export class InvoiceItemController {
  async createInvoiceItem(req: Request, res: Response) {
    const { invoiceId, productId, quantity, price } = req.body;

    try {
      const newInvoiceItem = await prisma.invoiceItem.create({
        data: {
          invoiceId,
          productId,
          quantity,
          price,
        },
      });

      return res.status(201).json(newInvoiceItem);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Error creating invoice item" });
    }
  }

  async createManyInvoiceItems(req: Request, res: Response) {
    const { invoiceItems } = req.body; 

    if (!Array.isArray(invoiceItems) || invoiceItems.length === 0) {
      return res.status(400).send({ message: "Invoice items must be a non-empty array" });
    }

    try {
      const createdItems = await prisma.invoiceItem.createMany({
        data: invoiceItems,
        skipDuplicates: true, // Opsi ini akan melewati duplikasi berdasarkan unique constraint
      });

      return res.status(201).json({
        message: "Invoice items created successfully",
        count: createdItems.count, // Jumlah item yang berhasil dibuat
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Error creating invoice items" });
    }
  }

  async getAllInvoiceItems(req: Request, res: Response) {
    try {
      const invoiceItems = await prisma.invoiceItem.findMany();
      return res.status(200).json(invoiceItems);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Error fetching invoice items" });
    }
  }

  async getInvoiceItemById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const invoiceItem = await prisma.invoiceItem.findUnique({
        where: { id },
      });

      if (!invoiceItem) {
        return res.status(404).send({ message: "Invoice item not found" });
      }

      return res.status(200).json(invoiceItem);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Error fetching invoice item" });
    }
  }

  async updateInvoiceItem(req: Request, res: Response) {
    const { id } = req.params;
    const { quantity, price } = req.body;

    try {
      const updatedInvoiceItem = await prisma.invoiceItem.update({
        where: { id },
        data: {
          quantity,
          price,
        },
      });

      return res.status(200).json(updatedInvoiceItem);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Error updating invoice item" });
    }
  }

  // Delete InvoiceItem
  async deleteInvoiceItem(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.invoiceItem.delete({
        where: { id },
      });

      return res.status(200).send({ message: "Invoice item deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Error deleting invoice item" });
    }
  }
}
