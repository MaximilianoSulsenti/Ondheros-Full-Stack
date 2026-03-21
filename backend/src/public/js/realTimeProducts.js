const socket = io();
const lista = document.getElementById("lista-productos");


socket.on("productos_actualizados", (productos) => {
    lista.innerHTML = "";
    productos.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.descripcion} - $${p.precio} (Stock: ${p.stock})`;
        lista.appendChild(li);
    });
});

// FORMULARIO AGREGAR 
document.getElementById("form-add").addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    socket.emit("nuevo_producto", data);

    e.target.reset();
});

// FORMULARIO ELIMINAR
document.getElementById("form-delete").addEventListener("submit", e => {
    e.preventDefault();
    const { id } = Object.fromEntries(new FormData(e.target));
    socket.emit("eliminar_producto", id);

    e.target.reset();
});