
import React, { useEffect, useState } from 'react';
import ItemDetail from '../ItemDetail/ItemDetail';
import { useParams } from 'react-router-dom';

const API_URL = "http://localhost:8080/api/products"; // Cambia el puerto si tu backend usa otro

const ItemDetailContainer = () => {
  const [producto, setProducto] = useState(null);
  const { itemId } = useParams();

  useEffect(() => {
    if (!itemId) return;
    fetch(`${API_URL}/${itemId}`)
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener producto");
        return res.json();
      })
      .then(data => {
        setProducto(data.payload);
      })
      .catch(error => {
        console.log(error);
        setProducto(null);
      });
  }, [itemId]);

  if (!producto) return <div>Cargando...</div>;

  return (
    <div>
      <ItemDetail {...producto} />
    </div>
  );
};

export default ItemDetailContainer;