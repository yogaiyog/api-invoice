import { Request, Response } from 'express';
import prisma from '@/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ejs from "ejs";
import path from "path";
import { transporter } from "@/helpers/nodemailer";

const JWT_SECRET = process.env.JWT_SECRET || 'sangat rahasia'; // Simpan di .env file
const SALT_ROUNDS = 10;

export class UserController {

  async createUser(req: Request, res: Response) {
    const { email, password, fullName } = req.body;

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Buat user baru di database
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
        },
      });

      // Kirim email verifikasi
      const templatePath = path.join(__dirname, "../templates/verifyEmail.ejs");
      const verificationLink = `${process.env.NEXT_PUBLIC_BASE_API_URL}mail/verify-email?email=${encodeURIComponent(email)}`;

      const emailHtml = await ejs.renderFile(templatePath, {
        fullName,
        verificationLink,
      });

      await transporter.sendMail({
        from: '"Your Company" <your-email@example.com>', // Ganti dengan email pengirim
        to: email, // Email penerima
        subject: "Verify Your Email",
        html: emailHtml,
      });

      console.log(`Verification email sent to ${email}`);

      return res.status(201).json({
        message: "User created successfully. Verification email sent.",
        user: newUser,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).send({ message: "Error creating user" });
    }
  }
  
    async loginUser(req: Request, res: Response) {
      const { email, password } = req.body;
      console.log(email)
  
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });
  
        if (!user) {
          return res.status(404).send({ message: 'User not found' , email, password});
        }
  
        const isPasswordValid = await bcrypt.compare(password, user.password);
  
        if (!isPasswordValid) {
          return res.status(401).send({ message: 'Invalid email or password' });
        }

        const userId = user.id
  
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
          },
          JWT_SECRET,
          { expiresIn: '48h' }
        );
        return res.status(200).json({ message: 'Login successful', token , userId});
      } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error logging in user' });
      }
    }

  async getUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        include: {
          clients: true,
          invoices: true,
          product: true,
        },
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error fetching users' });
    }
  }


  async getUserById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          clients: true,
          invoices: true,
          product: true,
        },
      });

      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error fetching user' });
    }
  }


  

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { email, password, fullName, emailVerified } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email,
          password, 
          fullName,
          emailVerified,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error updating user' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.user.delete({
        where: { id },
      });

      return res.status(204).send(); 
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error deleting user' });
    }
  }
}
console.log('user')