import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../prisma.js';

export const buscarReceta = async (req: Request, res: Response) => {
    const ingredients: string[] = req.body.ingredients;
    console.log('=== BUSCAR RECETA ===');
    console.log('Ingredientes recibidos:', ingredients);
    try {
        // Usar Groq para generar recetas
        console.log('1. Generando recetas con Groq...');
        try {
            console.log('2. Importando groqService...');
            const groqModule = await import('../services/groqService.js');
            console.log('3. groqService importado exitosamente');
            console.log('4. Propiedades del módulo:', Object.keys(groqModule));
            
            const { generateRecipesWithGroq } = groqModule;
            if (!generateRecipesWithGroq) {
                throw new Error('generateRecipesWithGroq no encontrada en groqService');
            }
            
            console.log('5. Llamando a generateRecipesWithGroq...');
            const recipes = await generateRecipesWithGroq(ingredients);
            console.log('6. Recetas generadas exitosamente:', recipes.length);
            
            // 7. Guardar recetas en la BD automáticamente
            console.log('7. Guardando recetas en la BD...');
            const savedRecipes = await Promise.all(
                recipes.map(async (recipe) => {
                    try {
                        const saved = await prisma.recipe.upsert({
                            where: { spoonacularId: String(recipe.id) },
                            update: {
                                title: recipe.title,
                                description: recipe.description || '',
                                ingredients: recipe.ingredients || [],
                                instructions: recipe.instructions || [],
                                ingredientMeasures: recipe.ingredientMeasures ? recipe.ingredientMeasures as any : undefined,
                                readyInMinutes: recipe.readyInMinutes || 0,
                                type: recipe.type || '',
                                image: recipe.image,
                            },
                            create: {
                                spoonacularId: String(recipe.id),
                                title: recipe.title,
                                description: recipe.description || '',
                                ingredients: recipe.ingredients || [],
                                instructions: recipe.instructions || [],
                                ingredientMeasures: recipe.ingredientMeasures ? recipe.ingredientMeasures as any : undefined,
                                readyInMinutes: recipe.readyInMinutes || 0,
                                type: recipe.type || '',
                                image: recipe.image,
                            }
                        });
                        console.log(`✅ Receta guardada: ${recipe.title} (ID: ${recipe.id})`);
                        return saved;
                    } catch (err) {
                        console.error(`❌ Error guardando receta ${recipe.title}:`, err);
                        return null;
                    }
                })
            );
            
            const successCount = savedRecipes.filter(r => r !== null).length;
            console.log(`8. ${successCount}/${recipes.length} recetas guardadas en la BD`);
            
            // Retornar las recetas originales de Groq
            res.status(200).json(recipes);
        } catch (importError) {
            console.error('❌ Error durante importación o generación:', importError);
            throw importError;
        }
    } catch (error) {
        console.error('❌ Error en buscarReceta:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('Detalles del error:', { errorMessage, errorStack });
        res.status(500).json({ 
            error: 'Error al generar recetas', 
            details: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
        });
    }   
};

export const guardarReceta = async (req: AuthRequest, res: Response) => {
    const { recipe } = req.body;
    const userId = req.userId;
    
    console.log('guardarReceta - userId:', userId, 'recipeId:', recipe?.id);
    
    if (!userId) {
        console.error('No userId in request');
        res.status(401).json({ error: 'No autorizado - Sin userId' });
        return;
    }
    
    if (!recipe || !recipe.id) {
        console.error('No recipe or recipe.id in request body');
        res.status(400).json({ error: 'Recipe es requerido' });
        return;
    }
    
    try {
        // Solo crear la asociación en SavedRecipe (la receta ya está guardada en Recipe desde buscarReceta)
        const savedReceta = await prisma.savedRecipe.upsert({
            where: { 
                userId_recipeId: {
                    userId: userId,
                    recipeId: String(recipe.id)
                }
            },
            update: {
                // Si ya existe, actualizar el título e imagen
                title: recipe.title,
                image: recipe.image,
            },
            create: {
                userId: userId,
                recipeId: String(recipe.id),
                title: recipe.title,
                image: recipe.image,
            }
        });

        console.log('✅ Receta guardada en SavedRecipe:', savedReceta.id);
        res.status(201).json({
            message: 'Receta guardada exitosamente',
            savedRecipe: savedReceta
        });
    } catch (error) {
        console.error('Error al guardar la receta:', error);
        res.status(500).json({ error: 'Error al guardar la receta', details: String(error) });
    }
};

export const obtenerRecetas = async (req: AuthRequest, res: Response) => {
    const userId = req.params.userId;
    const requestUserId = req.userId;
    
    console.log('obtenerRecetas - params userId:', userId, 'req.userId:', requestUserId);
    
    // Verificar que el usuario solo puede ver sus propias recetas
    if (userId !== requestUserId) {
        console.error('Unauthorized - userId mismatch');
        res.status(403).json({ error: 'No autorizado' });
        return;
    }
    
    try {
        if (typeof userId !== 'string') {
            res.status(400).json({ error: 'userId must be a string' });
            return;
        }
        const recetas = await prisma.savedRecipe.findMany({
            where: { userId: userId }
        });
        console.log('Recetas encontradas:', recetas.length);
        res.status(200).json(recetas);
    } catch (error) {
        console.error('Error al obtener las recetas:', error);
        res.status(500).json({ error: 'Error al obtener las recetas' });
    }
};

export const eliminarReceta = async (req: AuthRequest, res: Response) => {
    const { recipeId } = req.body;
    const userId = req.userId;
    
    if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
    }
    
    try {
        await prisma.savedRecipe.deleteMany({
            where: {
                userId: userId,
                recipeId: recipeId
            }
        });
        res.status(200).json({ message: 'Receta eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la receta:', error);
        res.status(500).json({ error: 'Error al eliminar la receta' });
    }
};

export const obtenerTodasLasRecetas = async (req: AuthRequest, res: Response) => {
    try {
        const todasLasRecetas = await prisma.savedRecipe.findMany({
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });
        res.status(200).json(todasLasRecetas);
    } catch (error) {
        console.error('Error al obtener todas las recetas:', error);
        res.status(500).json({ error: 'Error al obtener todas las recetas' });
    }
};

export const obtenerDetalleReceta = async (req: Request, res: Response) => {
    const id = typeof req.params.id === 'string' ? req.params.id : undefined;
    console.log('Obteniendo detalles de receta con ID:', id);
    
    if (!id) {
        return res.status(400).json({ error: 'ID de receta inválido' });
    }
    
    try {
        // Buscar en la BD por spoonacularId (que es el ID que viene del frontend)
        const recipe = await prisma.recipe.findUnique({
            where: { spoonacularId: id }
        });

        if (!recipe) {
            console.log('Receta no encontrada en BD para ID:', id);
            return res.status(404).json({ error: 'Receta no encontrada' });
        }

        res.status(200).json(recipe);
    } catch (error) {
        console.error('Error al obtener detalles de receta:', error);
        res.status(500).json({ error: 'Error al obtener detalles de la receta' });
    }
};