import { useState, useEffect } from "react";

const ProductModal = ({ show, onClose, onSave, editingProduct }) => {


    const [form, setForm] = useState({
        nombre: "",
        precio: "",
        categoria: "",
        stock: "",
        image: null,
        descripcion: ""
    });


    useEffect(() => {
        if (editingProduct) {
            setForm({
                ...editingProduct,
                image: null // No pre-cargar imagen como archivo
            });
        }
    }, [editingProduct]);


    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image" && files && files[0]) {
            setForm({ ...form, image: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const method = editingProduct ? "PUT" : "POST";
        const url = editingProduct
            ? `http://localhost:8080/api/products/${editingProduct._id || editingProduct.id}`
            : "http://localhost:8080/api/products";

        const formData = new FormData();
        formData.append("nombre", form.nombre);
        formData.append("precio", form.precio);
        formData.append("categoria", form.categoria);
        formData.append("stock", form.stock);
        formData.append("descripcion", form.descripcion);
        if (form.image && form.image instanceof File) {
            formData.append("image", form.image);
        }

        const res = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`
                // No pongas Content-Type, fetch lo pone solo con FormData
            },
            body: formData
        });

        if (!res.ok) {
            alert("Error al guardar el producto");
            return;
        }

        const data = await res.json();
        onSave(data.payload || form);

        setForm({
            nombre: "",
            precio: "",
            categoria: "",
            stock: "",
            image: null,
            descripcion: ""
        });

        onClose();
    };


    if (!show) return null;

    return (
        <div className="modal-overlay">

            <div className="modal-container">

                <h2>{editingProduct ? "Editar producto" : "Crear producto"}</h2>

                <form onSubmit={handleSubmit} className="modal-form">


                    <input
                        name="nombre"
                        placeholder="Nombre del producto"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="precio"
                        type="number"
                        placeholder="Precio"
                        value={form.precio}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="categoria"
                        placeholder="Categoría"
                        value={form.categoria}
                        onChange={handleChange}
                    />

                    <input
                        name="stock"
                        type="number"
                        placeholder="Stock"
                        value={form.stock}
                        onChange={handleChange}
                    />


                    <input
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                    />

                    {form.image && form.image instanceof File && (
                        <div className="image-preview">
                            <img src={URL.createObjectURL(form.image)} alt="preview" />
                        </div>
                    )}



                    <textarea
                        name="descripcion"
                        placeholder="Descripción"
                        value={form.descripcion}
                        onChange={handleChange}
                    />

                    <div className="modal-buttons">

                        <button type="submit" className="save-btn">
                            Guardar
                        </button>

                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancelar
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default ProductModal;
