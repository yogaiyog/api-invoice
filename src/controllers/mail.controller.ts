import prisma from "@/prisma";
import ejs from "ejs";
import path from "path";
import { Request, Response } from "express";
import { transporter } from "@/helpers/nodemailer";

export class MailController {
  async SendInvoiceMail(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          user: true,
          client: true,
          invoiceItems: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      

      if (!invoice) {
        return res.status(404).send({ message: "Invoice not found" });
      }
      

      const templatePath = path.join(__dirname, "../templates/invoice.ejs");

      const emailHtml = await ejs.renderFile(templatePath, {
        client: invoice.client,
        invoiceItems: invoice.invoiceItems,
        dueDate: invoice.dueDate,
      });

      const info = await transporter.sendMail({
        from: 'Anvoice', 
        to: invoice.client.email, 
        subject: `Invoice #${id}`, 
        html: emailHtml, 
      });

      console.log("Email sent: %s", info.messageId);
      console.log(invoice.client.email);
      return res.status(200).send({ message: "Email has been sent" , invoice});
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).send({ message: "Error sending email" });
    }
  }

  async VerifyEmail(req: Request, res: Response) {
    const { email } = req.query; // Ambil email dari query parameter

    if (!email) {
      return res.status(400).send({ message: "Email is required for verification" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email: String(email) } });

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).send({ message: "Email is already verified" });
      }

      await prisma.user.update({
        where: { email: String(email) },
        data: { emailVerified: true },
      });

      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Email Verified</title>
          </head>
          <body><center>
            <h1>Email has been successfully verified!</h1>
            <p>You may close this page now.</p>
          </center></body>
        </html>
      `);
    } catch (error) {
      console.error("Error verifying email:", error);
      return res.status(500).send({ message: "Error verifying email" });
    }
  }
}

console.log("mail")