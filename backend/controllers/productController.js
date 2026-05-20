//controlles/productController.js
const { db } = require('../config/firebase');
const { admin } = require('../config/firebase');
const registerInventoryLog = require('../services/registerInventoryLog');

// Construye el listado de bodegas con stock para un producto dado.
const buildProductBodegas = async (productoId, empresa_id) => {
  let inventarioQuery = db.collection('inventario').where('producto_id', '==', productoId);
  if (empresa_id) {
    inventarioQuery = inventarioQuery.where('empresa_id', '==', empresa_id);
  }

  const inventarioSnapshot = await inventarioQuery.get();
  const bodegaMap = {};

  inventarioSnapshot.forEach((invDoc) => {
    const invData = invDoc.data();
    const bodegaId = invData.bodega_id;
    const cantidad = Number(invData.cantidad);

    if (!bodegaId || isNaN(cantidad) || cantidad <= 0) return;

    if (!bodegaMap[bodegaId]) {
      bodegaMap[bodegaId] = 0;
    }

    bodegaMap[bodegaId] += cantidad;
  });

  const bodegaIds = Object.keys(bodegaMap);
  if (bodegaIds.length === 0) return [];

  const bodegas = [];
  for (const bodegaId of bodegaIds) {
    const bodegaDoc = await db.collection('bodegas').doc(bodegaId).get();
    const bodegaData = bodegaDoc.exists ? bodegaDoc.data() : {};

    bodegas.push({
      id: bodegaId,
      bodegaId,
      nombre: bodegaData.nombre || bodegaData.bodegaNombre || '',
      bodegaNombre: bodegaData.nombre || bodegaData.bodegaNombre || '',
      ubicacion: bodegaData.ubicacion || '',
      cantidad: bodegaMap[bodegaId],
      cantidadDisponible: bodegaMap[bodegaId],
    });
  }

  return bodegas;
};

// Devuelve productos con su stock agrupado por bodega para una empresa.
const getProducts = async (req, res) => {
  const empresa_id = req.query.empresa_id;
  if (!empresa_id) {
    return res.status(400).json({ error: 'El parámetro "empresa_id" no está presente.' });
  }

  try {
    const productsSnapshot = await admin.firestore()
      .collection('productos')
      .where('empresa_id', '==', empresa_id)
      .get();

    if (productsSnapshot.empty) {
      return res.status(404).json({ error: 'No se encontraron productos para esta empresa.' });
    }

    const products = await Promise.all(
      productsSnapshot.docs.map(async (doc) => {
        const productData = doc.data();
        const bodegas = await buildProductBodegas(doc.id, empresa_id);
        const totalQuantity = bodegas.reduce((acc, item) => acc + item.cantidad, 0);
        return { id: doc.id, ...productData, bodegas, totalQuantity };
      })
    );

    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(400).json({ error: error.message });
  }
};
// Agrega un nuevo producto a la colección de productos.
const addProduct = async (req, res) => {
  try {
    const { clave, categoria, nombre, precio, empresa_id } = req.body;

    if (!empresa_id) {
      return res.status(400).json({ error: 'El parámetro "empresa_id" no está presente.' });
    }

    if (!clave || !categoria || !nombre || !precio) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    const newProduct = { 
      clave, 
      categoria, 
      nombre, 
      precio, 
      empresa_id
    };

    const docRef = await db.collection('productos').add(newProduct);
    res.status(201).json({ id: docRef.id, ...newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Error agregando producto' });
  }
};
// Actualiza los datos básicos de un producto.
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    await db.collection('productos').doc(id).update(updatedData);
    res.json({ id, ...updatedData });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando producto' });
  }
};
// Elimina un producto por su ID.
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('productos').doc(id).delete();
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando producto' });
  }
};

// Obtiene los detalles de un producto junto con las bodegas donde está disponible.
const getProductDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const productDoc = await db.collection('productos').doc(id).get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productData = productDoc.data();
    const empresaId = productData.empresa_id || req.query.empresa_id;
    const bodegas = await buildProductBodegas(id, empresaId);

    return res.json({ id: productDoc.id, ...productData, bodegas });

  } catch (error) {
    console.error('Error al obtener los detalles del producto:', error);
    return res.status(500).json({ error: 'Error al obtener los detalles del producto' });
  }
};


// Calcula la cantidad total de un producto en todas las bodegas de una empresa.
const getProductTotalQuantity = async (req, res) => {
  try {
    const { productoId, empresa_id } = req.query;

    const inventarioSnapshot = await db.collection('inventario')
      .where('producto_id', '==', productoId)
      .where('empresa_id', '==', empresa_id)
      .get();

    let totalQuantity = 0;

    inventarioSnapshot.forEach(doc => {
      const cantidad = doc.data().cantidad;
      if (cantidad !== null && cantidad !== undefined && !isNaN(cantidad) && cantidad >= 0) {
        totalQuantity += parseInt(cantidad, 10);
      } else if (cantidad !== 0) {
        console.warn(`Cantidad inválida en el inventario del producto ${productoId}:`, cantidad);
      }
    });

    return res.status(200).json({ totalQuantity });
  } catch (error) {
    console.error('Error al obtener la cantidad total del producto:', error);
    return res.status(500).json({ error: 'Hubo un error al obtener la cantidad total del producto.' });
  }
};

// Devuelve inventario por bodega para un producto y empresa.
const getProductInventory = async (req, res) => {
  const { productoId, empresa_id } = req.query;

  try {
    const bodegas = await buildProductBodegas(productoId, empresa_id);
    res.json({ bodegaInventarios: bodegas });
  } catch (error) {
    console.error('Error al obtener inventario del producto:', error.message);
    return res.status(500).json({ error: 'No se pudo obtener el inventario del producto.' });
  }
};

// Actualiza el inventario restando cantidades por bodega.
const updateProductInventory = async (req, res) => {
  const { productos } = req.body;
  try {
    await Promise.all(productos.map(async (producto) => {
      const productId = producto.id;
      const bodegasSeleccionadas = producto.bodegasSeleccionadas;

      await Promise.all(bodegasSeleccionadas.map(async (bodega) => {
        const { bodegaId, cantidadSeleccionada } = bodega;

        const inventarioSnapshot = await db.collection('inventario')
          .where('producto_id', '==', productId)
          .where('bodega_id', '==', bodegaId)
          .get();

        if (inventarioSnapshot.empty) {
          return res.status(404).json({ error: `No se encontró inventario para el producto ${productId} en la bodega ${bodegaId}` });
        }

        const inventarioDoc = inventarioSnapshot.docs[0];
        const nuevaCantidad = inventarioDoc.data().cantidad - cantidadSeleccionada;

        if (nuevaCantidad < 0) {
          return res.status(400).json({ error: `No hay suficiente inventario en la bodega ${bodegaId}` });
        }

        await db.collection('inventario').doc(inventarioDoc.id).update({
          cantidad: nuevaCantidad,
        });
        
        await registerInventoryLog({
          producto_id: productId,
          bodega_id: bodegaId,
          cantidad: cantidadSeleccionada,
          tipo: 'uso',
          usuario_id: req.user?.id || 'desconocido',
          empresa_id: req.user?.empresa || 'desconocida',
        });
        
      }));
    }));

    res.status(200).json({ message: 'Inventario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el inventario:', error);
    res.status(500).json({ error: 'Hubo un error al actualizar el inventario.' });
  }
};

// Ajusta manualmente las cantidades de inventario por bodega.
const updateInventoryManual = async (req, res) => {
  const { inventario } = req.body;

  try {
    await Promise.all(inventario.map(async (item) => {
      const { producto_id, bodega_id, nuevaCantidad } = item;

      const inventarioSnapshot = await db.collection('inventario')
        .where('producto_id', '==', producto_id)
        .where('bodega_id', '==', bodega_id)
        .get();

      if (inventarioSnapshot.empty) {
        return res.status(404).json({
          error: `No se encontró inventario para el producto ${producto_id} en la bodega ${bodega_id}`
        });
      }

      const inventarioDoc = inventarioSnapshot.docs[0];
      const cantidadAntes = inventarioDoc.data().cantidad;

      await db.collection('inventario').doc(inventarioDoc.id).update({
        cantidad: nuevaCantidad,
      });

      const [productoDoc, bodegaDoc] = await Promise.all([
        db.collection('productos').doc(producto_id).get(),
        db.collection('bodegas').doc(bodega_id).get()
      ]);

      const producto_nombre = productoDoc.exists ? productoDoc.data().nombre : 'Producto no encontrado';
      const bodega_nombre = bodegaDoc.exists ? bodegaDoc.data().nombre : 'Bodega no encontrada';

      await registerInventoryLog({
        producto_id,
        producto_nombre,
        empresa_id: req.user?.empresa || 'desconocida',
        bodega_id,
        bodega_nombre,
        accion: 'ajuste_manual',
        cantidad_antes: cantidadAntes,
        cantidad_despues: nuevaCantidad,
        cantidad_cambiada: nuevaCantidad - cantidadAntes,
        usuario_id: req.user?.id || 'desconocido',
        usuario_correo: req.user?.correo || 'sin_correo',
        descripcion: `Ajuste manual de inventario realizado`
      });

    }));

    res.status(200).json({ message: 'Inventario actualizado correctamente (modo manual)' });
  } catch (error) {
    console.error('Error al actualizar manualmente el inventario:', error);
    res.status(500).json({ error: 'Error al actualizar manualmente el inventario.' });
  }
};


// Actualiza inventario y guarda un historial simplificado de uso.
const updateInventoryHistory = async (req, res) => {
  const { productos } = req.body;
  try {
    await Promise.all(productos.map(async (producto) => {
      const productId = producto.id;
      const bodegasSeleccionadas = producto.bodegasSeleccionadas;

      await Promise.all(bodegasSeleccionadas.map(async (bodega) => {
        const { bodegaId, cantidadSeleccionada } = bodega;

        const inventarioSnapshot = await db.collection('inventario')
          .where('producto_id', '==', productId)
          .where('bodega_id', '==', bodegaId)
          .get();

        if (inventarioSnapshot.empty) {
          return res.status(404).json({ error: `No se encontró inventario para el producto ${productId} en la bodega ${bodegaId}` });
        }

        const inventarioDoc = inventarioSnapshot.docs[0];
        const cantidadActual = inventarioDoc.data().cantidad;
        const nuevaCantidad = cantidadActual - cantidadSeleccionada;

        if (nuevaCantidad < 0) {
          return res.status(400).json({ error: `No hay suficiente inventario en la bodega ${bodegaId}` });
        }

        await db.collection('inventario').doc(inventarioDoc.id).update({
          cantidad: nuevaCantidad,
        });

        const historialData = {
          producto_id: productId,
          cantidad_usada: cantidadSeleccionada,
          fecha_usada: new Date(),
          usuario_id: req.user.id,
        };

        await db.collection('historial_inventario').add(historialData);
      }));
    }));

    res.status(200).json({ message: 'Inventario actualizado y registrado en el historial correctamente' });
  } catch (error) {
    console.error('Error al actualizar el inventario y guardar en el historial:', error);
    res.status(500).json({ error: 'Hubo un error al actualizar el inventario y registrar el historial.' });
  }
};

// Procesa carga masiva de productos e inventario para una empresa.
const bulkProduct = async (req, res) => {
  try {
    const productos = req.body.productos;

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron productos válidos.' });
    }

    const adminDb = admin.firestore();
    const batch = adminDb.batch();
    const empresaId = req.user.empresa;

    const productosMap = new Map();
    const productosConIds = [];

    for (const p of productos) {
      const clave = String(p.clave || '').trim();
      const categoria = String(p.categoria || '').trim();
      const nombre = String(p.nombre || '').trim();
      const precio = parseFloat(p.precio);
      const bodegaId = String(p.bodegaId || '').trim();
      const bodegaNombre = String(p.bodegaNombre || 'Bodega desconocida').trim();
      const cantidad = parseInt(p.cantidad, 10);

      if (
        clave &&
        categoria &&
        nombre &&
        !isNaN(precio) &&
        bodegaId &&
        !isNaN(cantidad)
      ) {
        let productoInfo;

        if (productosMap.has(clave)) {
          productoInfo = productosMap.get(clave);
        } else {
          const productoRef = adminDb.collection('productos').doc();
          const productoId = productoRef.id;

          const productoData = {
            clave,
            categoria,
            nombre,
            precio,
            empresa_id: empresaId,
          };

          batch.set(productoRef, productoData);

          productoInfo = { productoId, ...productoData };
          productosMap.set(clave, productoInfo);
        }

        const inventarioRef = adminDb.collection('inventario').doc();

        batch.set(inventarioRef, {
          producto_id: productoInfo.productoId,
          bodega_id: bodegaId,
          cantidad,
          empresa_id: empresaId,
        });

        productosConIds.push({
          producto_id: productoInfo.productoId,
          producto_nombre: productoInfo.nombre,
          bodega_id: bodegaId,
          bodega_nombre: bodegaNombre,
          cantidad,
        });

      } else {
        console.warn('⚠️ Fila omitida por datos inválidos:', p);
      }
    }

    await batch.commit();

    await Promise.all(productosConIds.map(async (item) => {
      await registerInventoryLog({
        producto_id: item.producto_id,
        producto_nombre: item.producto_nombre,
        empresa_id: empresaId,
        bodega_id: item.bodega_id,
        bodega_nombre: item.bodega_nombre,
        accion: 'registro_inicial',
        cantidad_antes: 0,
        cantidad_despues: item.cantidad,
        cantidad_cambiada: item.cantidad,
        usuario_id: req.user?.id || 'desconocido',
        usuario_correo: req.user?.correo || 'sin_correo',
        descripcion: 'Carga inicial del producto en inventario'
      });
    }));

    return res.status(201).json({
      message: 'Productos e inventario agregados correctamente.'
    });

  } catch (error) {
    console.error('❌ Error en carga masiva:', error);
    return res.status(500).json({
      error: 'Error al guardar los productos.'
    });
  }
};


module.exports = { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getProductDetails,
  getProductTotalQuantity,
  getProductInventory,
  updateProductInventory,
  updateInventoryManual,
  updateInventoryHistory,
  bulkProduct
};
