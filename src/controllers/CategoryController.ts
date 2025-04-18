import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
    private categoryService: CategoryService;

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService;
    }

    async createCategory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.body.id;
            const categoryData = { ...req.body, userId };
            const category = await this.categoryService.createCategory(categoryData);
            res.status(201).json(category);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create category' });
        }
    }

    async getCategory(req: Request, res: Response): Promise<void> {
        try {
            const categoryId = req.params.id;
            const category = await this.categoryService.getCategoryById(categoryId);
            if (category) {
                res.json(category);
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to get category' });
        }
    }

    async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            const categoryId = req.params.id;
            const categoryData = req.body;
            const updatedCategory = await this.categoryService.updateCategory(categoryId, categoryData);
            if (updatedCategory) {
                res.json(updatedCategory);
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to update category' });
        }
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            const categoryId = req.params.id;
            const deleted = await this.categoryService.deleteCategory(categoryId);
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete category' });
        }
    }

    async listCategories(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.body.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
              }
            const categories = await this.categoryService.listCategories(userId);
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: 'Failed to list categories' });
        }
    }
}
