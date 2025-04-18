import express from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { CategoryService } from '../services/CategoryService';
const categoryRoute = express.Router();
const categoryService = new CategoryService
const categoryController = new CategoryController(categoryService)

categoryRoute.post('/', authenticateToken, (req, res) =>
  categoryController.createCategory(req, res)
);
categoryRoute.get('/', authenticateToken, (req, res) =>
  categoryController.listCategories(req, res)
);
categoryRoute.get('/:id', authenticateToken, (req, res) =>
  categoryController.getCategory(req, res)
);
categoryRoute.put('/:id', authenticateToken, (req, res) =>
  categoryController.updateCategory(req, res)
);
categoryRoute.delete('/:id', authenticateToken, (req, res) =>
  categoryController.deleteCategory(req, res)
);

export default categoryRoute;