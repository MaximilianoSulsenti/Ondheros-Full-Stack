import { useState, useEffect } from "react";

const ProductModal = ({ show, onClose, onSave, editingProduct }) => {

    const [form, setForm] = useState({
        title: "",
        price: "",
        category: "",
        stock: "",
        image: "",
        description: ""
    });

    useEffect(() => {
        if (editingProduct) {
            setForm(editingProduct);
        }
    }, [editingProduct]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const method = editingProduct ? "PUT" : "POST";
        const url = editingProduct
            ? `http://localhost:8080/api/products/${editingProduct._id || editingProduct.id}`
            : "http://localhost:8080/api/products";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(form)
        });

        if (!res.ok) {
            alert("Error al guardar el producto");
            return;
        }

        const data = await res.json();
        onSave(data.payload || form);

        setForm({
            title: "",
            price: "",
            category: "",
            stock: "",
            image: "",
            description: ""
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
                        name="title"
                        placeholder="Nombre del producto"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="price"
                        type="number"
                        placeholder="Precio"
                        value={form.price}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="category"
                        placeholder="Categoría"
                        value={form.category}
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
                        placeholder="URL imagen"
                        value={form.image}
                        onChange={handleChange}
                    />

                    {form.image && (
                        <div className="image-preview">
                            <img src={form.image} alt="preview" />
                        </div>
                    )}


                    <textarea
                        name="description"
                        placeholder="Descripción"
                        value={form.description}
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
