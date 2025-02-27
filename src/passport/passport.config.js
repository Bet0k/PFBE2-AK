import passport from 'passport';
import {
    Strategy as JwtStrategy
} from 'passport-jwt';
import {
    JWT_SECRET
} from '../utils/index.js';
import {
    Strategy as GoogleStrategy
} from "passport-google-oauth2";
import usersModel from '../dao/models/users.model.js';

const clientGoogle = "892733688998-e8fdaqpoe9655h99l0u7dje83r05l2as.apps.googleusercontent.com";
const secretGoogle = "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";

passport.use(
    new JwtStrategy({
            jwtFromRequest: (req) => req.cookies['token'], // Extraer el token de la cookie
            secretOrKey: JWT_SECRET, // Clave secreta para verificar el token
        },
        async (payload, done) => {
            try {
                const user = payload.user; // El usuario debe estar dentro del payload
                if (!user) {
                    return done(null, false); // Si no hay usuario, rechazamos la autenticación
                }
                return done(null, user); // Si el usuario está presente, pasamos la autenticación
            } catch (error) {
                return done(error, false); // En caso de error, rechazamos la autenticación
            }
        }
    )
);


passport.use('google',
    new GoogleStrategy({
        clientID: clientGoogle,
        clientSecret: secretGoogle,
        callbackURL: 'http://localhost:3000/api/users/auth/google/callback'
    }, async (request, accessToken, refreshToken, profile, done) => {
        try {
            const userExist = await usersModel.findOne({
                email: profile.emails[0]?.value
            }); //Google me devuelve muchos mails o 1 solo, depende la persona. En un array, entonces si o si 0 para que me de el primero
            if (userExist) {
                return done(null, userExist);
            }

            //Si no existe el user, lo crea.
            const newUser = {
                first_name: profile.name.givenName || "",
                last_name: profile.name.familyName || "",
                email: profile.emails[0]?.value || "",

                password: "", //Se deja vacio porque se autentica con Google
            };

            const user = await userModel.create(newUser);
            return done(null, user)

        } catch (error) {
            return done(error)
        }
    })
)