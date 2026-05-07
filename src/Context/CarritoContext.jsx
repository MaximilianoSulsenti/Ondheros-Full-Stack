import { useState, useEffect, createContext } from "react";

export const CarritoContext = createContext({
    carrito: [],
    total: 0,
    cantidadTotal: 0,
    agregarAlCarrito: () => {},
    eliminarProducto: () => {},
    vaciarCarrito: () => {},
    cargarCarrito: () => {},
});

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);
    const [total, setTotal] = useState(0);
    const [cantidadTotal, setCantidadTotal] = useState(0);
    const [cartId, setCartId] = useState(() => {
        const id = localStorage.getItem("cartId");
        return id && id !== "undefined" ? id : null;
    });

    // Cargar carrito al iniciar
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (cartId && cartId !== "undefined" && token) {
            cargarCarrito();
        }
    }, [cartId]);

    // Crear carrito si no existe
    const crearCarrito = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${backendUrl}/api/carts`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error("No se pudo crear el carrito");
            const data = await res.json();
            const newCartId = data.payload?._id;
            setCartId(newCartId);
            localStorage.setItem("cartId", newCartId);
            return newCartId;
        } catch (error) {
            console.error(error);
        }
    };

    // Obtener carrito del backend (adaptado a 'productos')
    const cargarCarrito = async () => {
        const token = localStorage.getItem("token");
        if (!cartId || cartId === "undefined" || !token) return;
        try {
            const res = await fetch(`${backendUrl}/api/carts/${cartId}`, {
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error("No se pudo obtener el carrito");
            const data = await res.json();
            // El backend devuelve data.payload.productos
            const productos = data.payload?.productos || [];
            setCarrito(productos);
            // Calcular total y cantidad
            let total = 0;
            let cantidad = 0;
            productos.forEach((prod) => {
                // prod.product puede ser objeto (populado) o id
                const precio = prod.product?.precio || 0;
                total += precio * prod.quantity;
                cantidad += prod.quantity;
            });
            setTotal(total);
            setCantidadTotal(cantidad);
        } catch (error) {
            console.error(error);
        }
    };

    // Agregar producto al carrito
    const agregarAlCarrito = async (item, cantidad, talla) => {
        let id = cartId;
        if (!id) {
            id = await crearCarrito();
            if (!id) return;
        }
        if (!item.id) {
            console.error("El producto no tiene id válido", item);
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${backendUrl}/api/carts/${id}/product/${item.id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ cantidad, talla }),
            });
            if (!res.ok) throw new Error("No se pudo agregar el producto al carrito");
            await cargarCarrito();
        } catch (error) {
            console.error(error);
        }
    };

    // Eliminar producto del carrito (por id y talle)
    const eliminarProducto = async (idProducto, talla) => {
        if (!cartId) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${backendUrl}/api/carts/${cartId}/product/${idProducto}?talla=${encodeURIComponent(talla || '')}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error("No se pudo eliminar el producto");
            await cargarCarrito();
        } catch (error) {
            console.error(error);
        }
    };

    // Vaciar carrito
    const vaciarCarrito = async () => {
        if (!cartId) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${backendUrl}/api/carts/${cartId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error("No se pudo vaciar el carrito");
            setCarrito([]);
            setCantidadTotal(0);
            setTotal(0);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <CarritoContext.Provider
            value={{
                carrito,
                total,
                cantidadTotal,
                agregarAlCarrito,
                eliminarProducto,
                vaciarCarrito,
                cargarCarrito,
            }}
        >
            {children}
        </CarritoContext.Provider>
    );
};