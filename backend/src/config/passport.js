import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils/hash.js";
import CreateUserDTO from "../dto/createUser.dto.js";


export function initializePassport() {


    passport.use("register", new LocalStrategy({

        passReqToCallback: true,
        usernameField: "email",
        session: false,

    },
        async (req, username, password, done) => {
            try {
                const user = await userModel.findOne({ email: username });
                if (user)
                    return done(null, false, { message: "El usuario ya existe" });

                const userDTO = new CreateUserDTO(req.body);

                const userData = {
                    ...userDTO,
                    password: createHash(password),
                    role: "user"
                }

                const newUser = await userModel.create(userData);

                return done(null, newUser);

            } catch (error) {
                return done(error);
            }
        }));


    passport.use("login", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        session: false,
    },
        async (email, password, done) => {
            try {
                const user = await userModel.findOne({ email: email });
                if (!user)
                    return done(null, false, { message: "Usuario no encontrado" });

                if (!isValidPassword(password, user.password))
                    return done(null, false, { message: "Contraseña incorrecta" });

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );


    passport.use("current", new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET_KEY,
    },
        async (jwt_payload, done) => {
            try {
                const user = await userModel.findById(jwt_payload.id);
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            } catch (error) {
                return done(error, false);
            }
        }
    ));

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:8080/api/auth/google/callback", // Ajusta el puerto si es necesario
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await userModel.findOne({ googleId: profile.id });
                    if (!user) {
                        // Si no existe, lo creamos
                        user = await userModel.create({
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            first_name: profile.name.givenName,
                            last_name: profile.name.familyName,
                            role: "user",
                            age: 18, // Valor por defecto
                            password: "google_oauth", // Valor por defecto, nunca se usará para login local
                            // Puedes agregar más campos si tu modelo lo requiere
                        });
                    }
                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );

};
