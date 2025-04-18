import { Request, Response } from 'express';
import { userService } from '../services/UserService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/env';
import { v4 as uuidv4} from 'uuid';
import emailService from '../services/EmailService'
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";


export class UserController {


  async register(req: Request, res: Response): Promise<void> {
    const { username,name, email, password } = req.body;
    

    try {
      const user: User = {
        id: uuidv4(),
        username,
        name,
        email,
        password,
        refreshToken: null,
      };
      
      const createdUser = await userService.createUser(user);
      res.status(201).json(createdUser);
    } catch (error) {
      console.error("error",error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response): Promise<any> {
    const { email, password } = req.body;
    try {
      const user = await userService.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
      

      await userService.updateRefreshToken(user.id, refreshToken);

      res.json({ accessToken, refreshToken });
      return user.id;
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const user = await userService.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const allowedFields: (keyof User)[] = ['name', 'email', 'username', 'avatar']; 
      const updateData: Partial<User> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updateData[key] = req.body[key] as any;
        }
      }
      
      if (req.file) {
        updateData.avatar = req.file.path;
      }
      
  
      const updatedUser = await userService.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    try {
      const token = await userService.generateResetToken(email);
      await emailService.sendPasswordResetEmail(email, token);
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;
    try {
      const user = await userService.resetPassword(token, newPassword);

      if (!user) {
        res.status(400).json({ error: 'Invalid or expired token' });
        return;
      }

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

}