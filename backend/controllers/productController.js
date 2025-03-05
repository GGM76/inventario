const db = require('../config');

const addProduct = async (req, res) => {
  const { name, quantity, price } = req.body;
  try {
    const newProduct = {
      name,
      quantity,
      price,
      createdAt: new Date(),
    };

    // Guardar el producto en Firestore
    const productRef = await db.collection('products').add(newProduct);
    res.status(201).json({ message: "Producto agregado", productId: productRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addProduct };
