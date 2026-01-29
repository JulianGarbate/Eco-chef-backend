import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    // Intentar obtener el token del header Authorization primero
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const parts = authHeader.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1];
        }
        else {
            console.error('Invalid authorization header format:', authHeader);
            return res.status(401).json({ error: "No autorizado - Formato inválido" });
        }
    }
    else {
        // Si no hay header Authorization, intentar obtener de las cookies
        token = req.cookies?.token;
        if (!token) {
            console.error('No authorization header or token cookie found');
            return res.status(401).json({ error: "No autorizado - Sin token" });
        }
    }
    const jwtSecretFromEnv = process.env.JWT_SECRET;
    if (!jwtSecretFromEnv) {
        console.error('JWT_SECRET not configured');
        return res.status(500).json({ error: "Configuración del servidor incompleta" });
    }
    try {
        // @ts-ignore - jwtSecretFromEnv is guaranteed to be a string after the above check
        const decoded = jwt.verify(token, jwtSecretFromEnv);
        req.userId = decoded.userId;
        console.log('Auth successful for user:', req.userId);
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ error: "Token inválido" });
    }
};
//# sourceMappingURL=auth.middleware.js.map