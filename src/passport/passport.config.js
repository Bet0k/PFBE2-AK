import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { JWT_SECRET } from '../utils/index.js';

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: (req) => req.cookies['token'],  // Extraer el token de la cookie
            secretOrKey: JWT_SECRET,  // Clave secreta para verificar el token
        },
        async (payload, done) => {
            try {
                const user = payload.user;  // El usuario debe estar dentro del payload
                if (!user) {
                    return done(null, false);  // Si no hay usuario, rechazamos la autenticación
                }
                return done(null, user);  // Si el usuario está presente, pasamos la autenticación
            } catch (error) {
                return done(error, false);  // En caso de error, rechazamos la autenticación
            }
        }
    )
);

