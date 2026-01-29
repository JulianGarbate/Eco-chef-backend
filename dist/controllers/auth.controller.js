import prisma from "../prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { logger } from "../utils/logger.js";
const JWT_SECRET = process.env.JWT_SECRET;
export const register = async (req, res) => {
    const { email, password } = req.body;
    console.log('Register attempt - email:', email);
    // Validación de entrada
    if (!email || !password) {
        console.error('Registro sin email o contraseña');
        logger.warn('Intento de registro sin email o contraseña');
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }
    if (password.length < 6) {
        console.error('Contraseña débil:', email);
        logger.warn(`Intento de registro con contraseña débil: ${email}`);
        return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    try {
        console.log('Hasheando contraseña...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Creando usuario en BD...');
        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword, name: email.split('@')[0] },
        });
        console.log('Usuario registrado exitosamente:', newUser.id);
        logger.info(`Nuevo usuario registrado: ${email}`);
        res.status(201).json({ id: newUser.id, email: newUser.email });
    }
    catch (error) {
        console.error('Error al registrar:', error);
        // Si el email ya existe
        if (error.code === 'P2002') {
            console.error('Email ya existe:', email);
            logger.warn(`Intento de registro con email existente: ${email}`);
            return res.status(400).json({ error: "Este email ya está registrado" });
        }
        logger.error(`Error al registrar usuario: ${email}`, error);
        res.status(500).json({ error: "Error al registrar el usuario", details: String(error) });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt - email:', email);
    if (!email || !password) {
        console.error('Login sin email o contraseña');
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }
    try {
        console.log('Buscando usuario:', email);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.error('Usuario no encontrado:', email);
            return res.status(401).json({ error: "Credenciales inválidas" });
        }
        console.log('Usuario encontrado, verificando contraseña...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Contraseña válida:', isPasswordValid);
        if (!isPasswordValid) {
            console.error('Contraseña inválida para:', email);
            return res.status(401).json({ error: "Credenciales inválidas" });
        }
        if (!JWT_SECRET) {
            console.error('JWT_SECRET no configurado');
            return res.status(500).json({ error: "Configuración del servidor incompleta" });
        }
        console.log('Generando token para:', email);
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
        console.log('Login exitoso para:', email);
        res.status(200).json({ token });
    }
    catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};
export const me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.status(200).json({ id: user.id, email: user.email });
    }
    catch (error) {
        res.status(401).json({ error: "Token inválido" });
    }
};
//# sourceMappingURL=auth.controller.js.map