import UserDTO from "../dto/user.dto.js";
import AdminUserDTO from "../dto/adminUser.dto.js";
import CreateUserDTO from "../dto/createUser.dto.js";
import UpdateUserDTO from "../dto/updateUser.dto.js";
import AdminUpdateUserDTO from "../dto/adminUpdateUser.dto.js";
import UserResponseDTO from "../dto/userResponse.dto.js";
import { createHash, isValidPassword } from "../utils/hash.js"
   
export default class UsersController{
    constructor(userService){
        this.userService = userService;
    }

    getUsers =  async (req, res) => {
        try {
            const { page = 1, limit = 10, search = "", role } = req.query;
            const result = await this.userService.getPaginated({
                page: Number(page),
                limit: Number(limit),
                search,
                role
            });
            const usersDTO = result.users.map(user => new UserResponseDTO(user));
            res.status(200).json({
                status: "success",
                payload: usersDTO,
                total: result.total,
                page: Number(page),
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error) {
            res.status(500).json({ status: "error", error: error.message });
        }
    };

    getUserById = async (req, res) => {
        try {
            const user = await this.userService.getUserById(req.params.uid);
            if (!user) {
                return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
            }

         const dto = req.user.role === "admin" ? new AdminUserDTO(user) : new UserDTO(user);
            
            res.status(200).json({ status: "success", payload: dto });
        } catch (error) {
            res.status(500).json({ status: "error", error: error.message });
        }
    };

    createUser = async (req,res) => {
        try {
            //limpiar el body para evitar campos no deseados
            const userDTO = new CreateUserDTO(req.body);

            //hashear la contraseña antes de guardar
            const userData = {...userDTO,
                password: createHash(req.body.password),
                role: "user"
            };

            //crear el usuario a través del manager
            const newUser = await this.userService.createUser(userData);
            res.status(201).json({ status: "success", payload: newUser });

        } catch (error) {
            res.status(500).json({ status: "error", error: error.message });
        }
    }

    updateUser = async (req, res) => {
        try {
              const dto = req.user.role === "admin"
              ? new AdminUpdateUserDTO(req.body)
              : new UpdateUserDTO(req.body);

              if (Object.keys(dto).length === 0) {
                  return res.status(400).json({ status: "error", error: "No hay campos para actualizar" });
              }

            const updatedUser = await this.userService.updateUser(req.params.uid, dto);
            if (!updatedUser) {
                return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
            }
            res.status(200).json({ status: "success", payload: updatedUser });
        } catch (error) {
            res.status(500).json({ status: "error", error: error.message });
        }
    };

    deleteUser = async (req, res) => {
        try {
            const deletedUser = await this.userService.deleteUser(req.params.uid);
            if (!deletedUser) {
                return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
            }
            res.status(200).json({ status: "success", message: "Usuario eliminado" });
        } catch (error) {
            res.status(500).json({ status: "error", error: error.message });
        }
    }

    // Nuevo método para contar usuarios
    countUsers = async (req, res) => {
        try {
            const count = await this.userService.countUsers();
            res.json({ count });
        } catch (error) {
            res.status(500).json({ error: "Error al contar usuarios" });
        }
    }

    // Cambiar email
    changeEmail = async (req, res) => {
        try {
            const { newEmail, currentPassword } = req.body;
            const { uid } = req.params;
            const user = await this.userService.getUserById(uid);

            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            if (!isValidPassword(currentPassword, user.password)) {
                return res.status(400).json({ error: "Contraseña actual incorrecta" });
            }

            const emailExists = await this.userService.getByEmail(newEmail);
            if (emailExists) {
                return res.status(400).json({ error: "El email ya está en uso" });
            }

            await this.userService.updateUser(uid, { email: newEmail });

            res.json({ status: "success", message: "Email actualizado correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Cambiar contraseña
    changePassword = async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const { uid } = req.params;
            const user = await this.userService.getUserById(uid);

            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            if (!isValidPassword(currentPassword, user.password)) {
                return res.status(400).json({ error: "Contraseña actual incorrecta" });
            }

            if (isValidPassword(newPassword, user.password)) {
                return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior" });
            }

            const hashed = createHash(newPassword);
            await this.userService.updateUser(uid, { password: hashed });

            res.json({ status: "success", message: "Contraseña actualizada correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };


}