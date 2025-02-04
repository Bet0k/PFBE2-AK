import { Router } from "express";
import usersModel from "../models/users.model.js";
import passport from 'passport';
import { createHash, isValidPassword, generateToken, verifyToken } from "../utils/index.js";

const router = Router()

router.get('/', async (req, res) => {
    try {
        
        const users = await usersModel.find();
        //TODO: Validar si hay usuarios.

        if(users.length === 0){
            res.status(200).json({status: "success", message: "No hay usuarios registrados."})
        }
        res.status(200).json({status: "success", payload: users})

    } catch (error) {
        res.status(500).json({status: "error", message: error.message})
    }
});

router.post('/register', async (req, res) => {
    
    const { first_name, last_name, email, age, password, role } = req.body;
    
    try {
        if(!first_name || !last_name || !email || !password || !age ){
            return res.status(400).json({ status: "error", message: "Faltan ingresar datos obligatorios." });
        }

        const newUser = {
            first_name, 
            last_name, 
            email,
            age,
            password: createHash(password), 
        };

        if(role) newUser.role = role;
        
        await usersModel.create(newUser);
        return res.status(201).json({ status: "success", payload: newUser });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message })
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ status: "error", message: "Faltan ingresar datos obligatorios." });
        }

        const userFound = await usersModel.findOne({ email });

        if (!userFound) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        }

        const isPasswordValid = isValidPassword(password, userFound.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", message: "Contraseña incorrecta" });
        }

        const token = generateToken({ id: userFound._id, first_name: userFound.first_name, last_name: userFound.last_name, age: userFound.age, email: userFound.email });
        console.log('Login successful for:', userFound);
        res.cookie('token', token, { httpOnly: true, secure: false });
         res.json({ status: "success", message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

router.get('/profile', (req, res, next) => {
    console.log('Token en cookies:', req.cookies['token']);
    next();
}, passport.authenticate('jwt', { session: false }), (req, res) => {
    res.render('profile', { user: req.user });
});

router.get('/current', (req, res) => {
    const token = req.cookies['token'];

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'No token found in cookies' });
    }

    const decoded = verifyToken(token);
    console.log(decoded.user);
    

    if (!decoded) {
        return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
    }
    res.status(200).json({ status: 'success', user: decoded.user });
});

router.get('/auth/google', passport.authenticate('google', {scope: [ "email", "profile" ] }));

router.get('/api/users/auth/google/callback', 
    passport.authenticate('google', {
        successRedirect: '/profile',
    })
);

export default router;