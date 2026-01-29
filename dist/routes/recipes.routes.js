import { Router } from 'express';
import { buscarReceta, guardarReceta, obtenerRecetas, eliminarReceta, obtenerTodasLasRecetas, obtenerDetalleReceta } from '../controllers/recipes.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const recipesRouter = Router();
recipesRouter.post('/buscar', buscarReceta);
recipesRouter.post('/guardar', authMiddleware, guardarReceta);
recipesRouter.get('/todas', authMiddleware, obtenerTodasLasRecetas);
recipesRouter.get('/usuario/:userId', authMiddleware, obtenerRecetas);
recipesRouter.get('/:id', obtenerDetalleReceta);
recipesRouter.delete('/eliminar', authMiddleware, eliminarReceta);
export default recipesRouter;
//# sourceMappingURL=recipes.routes.js.map