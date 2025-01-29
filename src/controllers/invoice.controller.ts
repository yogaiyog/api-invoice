import { Request, Response } from 'express';
import prisma from '@/prisma';

export class InvoiceController {
  async getAllInvoices(req: Request, res: Response) {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default page = 1 dan limit = 10
  
    try {
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
  
      // Hitung offset untuk menentukan data yang akan diambil
      const offset = (pageNumber - 1) * pageSize;
  
      // Ambil total count data
      const totalCount = await prisma.invoice.count({
        where: { userId },
      });
  
      // Ambil data dengan limit dan offset
      const invoices = await prisma.invoice.findMany({
        where: { userId },
        include: {
          user: true,
          client: true,
          invoiceItems: true,
        },
        skip: offset,
        take: pageSize,
        orderBy: { createdAt: 'desc' }, // Optional: untuk mengurutkan data
      });
  
      return res.status(200).send({
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        totalItems: totalCount,
        invoices,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error retrieving invoices' });
    }
  }
  

  async getInvoiceById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          user: true,
          client: true,
          invoiceItems: true,
        },
      });

      if (!invoice) {
        return res.status(404).send({ message: 'Invoice not found' });
      }

      return res.status(200).send(invoice);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error retrieving invoice' });
    }
  }

  async createInvoice(req: Request, res: Response) {
    const { userId, clientId, dueDate, status, recurringSchedule, recurringEndDate } = req.body;
 console.log(recurringEndDate, recurringSchedule);
 
    let recurringActive = false

    if (recurringEndDate && recurringSchedule) {
        recurringActive = true
    }

    try {
      const newInvoice = await prisma.invoice.create({
        data: {
          userId,
          clientId,
          dueDate: new Date(dueDate),
          status,
          recurringSchedule,
          recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
          recurringActive
        },
      });

      return res.status(201).send(newInvoice);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error creating invoice' });
    }
  }

  async updateInvoice(req: Request, res: Response) {
    const { id } = req.params;
    const { dueDate, status, recurringSchedule, recurringEndDate } = req.body;

    try {
      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          dueDate: dueDate ? new Date(dueDate) : undefined,
          status,
          recurringSchedule,
          recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : undefined,
        },
      });

      return res.status(200).send(updatedInvoice);
    } catch (error:any) {
      console.error(error);

      if (error.code === 'P2025') {
        return res.status(404).send({ message: 'Invoice not found' });
      }

      return res.status(500).send({ message: 'Error updating invoice' });
    }
  }

  async deleteInvoice(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.invoice.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error:any) {
      console.error(error);

      // Jika invoice tidak ditemukan
      if (error.code === 'P2025') {
        return res.status(404).send({ message: 'Invoice not found' });
      }

      return res.status(500).send({ message: 'Error deleting invoice' });
    }
  }

  async getInvoiceStats(req: Request, res: Response) {
    const { userId } = req.params;
  
    try {
      const pendingInvoices = await prisma.invoice.count({
        where: { 
          status: 'PENDING',
          userId,
        },
      });
  
      const paidInvoices = await prisma.invoice.count({
        where: { 
          status: 'PAID',
          userId,
        },
      });
  
      const overdueInvoices = await prisma.invoice.count({
        where: { 
          status: 'OVERDUE',
          userId,
        },
      });
  
      const totalIncome = await prisma.invoiceItem.aggregate({
        _sum: {
          price: true,
        },
        where: {
          invoice: {
            userId,
          },
        },
      });
  
      const pendingIncome = await prisma.invoiceItem.aggregate({
        _sum: {
          price: true,
        },
        where: {
          invoice: {
            userId,
            status: {
              in: ['PENDING', 'OVERDUE'],
            },
          },
        },
      });
  
      // Return hasil
      res.json({
        totalPendingInvoices: pendingInvoices,
        totalPaidInvoices: paidInvoices,
        totalOverdueInvoices: overdueInvoices,
        totalIncome: totalIncome._sum.price || 0,
        pendingIncome: pendingIncome._sum.price || 0,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
  
}
