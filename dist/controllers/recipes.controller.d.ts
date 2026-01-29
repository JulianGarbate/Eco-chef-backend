import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
export declare const buscarReceta: (req: Request, res: Response) => Promise<void>;
export declare const guardarReceta: (req: AuthRequest, res: Response) => Promise<void>;
export declare const obtenerRecetas: (req: AuthRequest, res: Response) => Promise<void>;
export declare const eliminarReceta: (req: AuthRequest, res: Response) => Promise<void>;
export declare const obtenerTodasLasRecetas: (req: AuthRequest, res: Response) => Promise<void>;
export declare const obtenerDetalleReceta: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=recipes.controller.d.ts.map