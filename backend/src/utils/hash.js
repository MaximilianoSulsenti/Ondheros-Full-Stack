import bcrypt from "bcrypt";


export function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function isValidPassword(password, hashedPassword) {
       if (!password || !hashedPassword) return false;

    return bcrypt.compareSync(password, hashedPassword);
}

