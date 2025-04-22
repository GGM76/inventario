//controllers/projectController.js
const { db, admin } = require('../config/firebase');
const { updateProductInventory } = require('../services/inventoryService');

// Obtener proyectos por empresa
const getProjects = async (req, res) => {
  const empresa_id = req.query.empresa_id;  // Obtener 'empresa_id' desde los parámetros de consulta
  
  if (!empresa_id) {
    return res.status(400).json({ error: 'El parámetro "empresa_id" no está presente.' });
  }

  try {
    const projectsSnapshot = await admin.firestore()
      .collection('projects')
      .where('empresa_id', '==', empresa_id)  // Filtramos por 'empresa_id'
      .get();

    if (projectsSnapshot.empty) {
      return res.status(404).json({ error: 'No se encontraron proyectos para esta empresa.' });
    }

    // Mapeamos los proyectos y solo retornamos el nombre
    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().nombre  // Solo devolvemos el nombre del proyecto
    }));

    res.json(projects);  // Retornamos los proyectos con solo el nombre
  } catch (error) {
    console.error('Error al obtener los proyectos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Agregar un proyecto
const addProject = async (req, res) => {
  try {
    const { nombre, descripcion, empresa_id, productos } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'El parámetro "productos" está vacío o no está presente.' });
    }

    if (!empresa_id || !nombre || !descripcion) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    const productosSimplificados = [];
    for (const producto of productos) {
      const productRef = db.collection('productos').doc(producto.id);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(400).json({ error: `Producto con ID ${producto.id} no encontrado.` });
      }

      const nombreProducto = productDoc.data().nombre;
      productosSimplificados.push({
        id: producto.id,
        nombre: nombreProducto,
        cantidadTotal: producto.cantidad,
      });
    }

    // Crear el nuevo proyecto (sin 'subproyecto')
    const newProject = { 
      nombre, 
      descripcion, 
      empresa_id,
      productos: productosSimplificados,
    };

    // Crear el proyecto en Firestore
    const docRef = await db.collection('projects').add(newProject);

    // Llamamos al servicio de inventario para actualizar
    await updateProductInventory(productos);

    // Enviar respuesta solo después de que todo haya salido bien
    res.status(201).json({ message: 'Proyecto creado con éxito.' });

  } catch (err) {
    console.error('Error al agregar el proyecto:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Hubo un error al agregar el proyecto.' });
    }
  }
};

// Actualizar un proyecto
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;  // Datos del proyecto a actualizar
    
    // Actualizamos el proyecto en Firestore (sin 'subproyecto')
    await db.collection('projects').doc(id).update(updatedData);
    
    res.json({ message: 'Proyecto actualizado correctamente', id, ...updatedData });
  } catch (error) {
    console.error('Error al actualizar el proyecto:', error);
    res.status(500).json({ error: 'Hubo un error al actualizar el proyecto.' });
  }
};

// Eliminar un proyecto
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;  // ID del proyecto a eliminar   
    // Paso 1: Eliminar todos los subproyectos relacionados
    const subproyectosSnapshot = await db.collection('subprojects')
      .where('proyectoPrincipalId', '==', id)  // Cambié 'proyecto_id' por 'proyectoPrincipalId'
      .get();
    const deleteSubproyectos = subproyectosSnapshot.docs.map(doc => {
      return db.collection('subprojects').doc(doc.id).delete();
    });
    await Promise.all(deleteSubproyectos);
    // Paso 2: Eliminar el proyecto
    await db.collection('projects').doc(id).delete();
    res.json({ message: 'Proyecto y subproyectos eliminados correctamente' });
  } catch (error) {
    console.error('Error al eliminar el proyecto y sus subproyectos:', error);
    res.status(500).json({ error: 'Error eliminando el proyecto o sus subproyectos' });
  }
};

// Obtener detalles de un proyecto
const getProjectDetails = async (req, res) => {
  const { id } = req.params;  // Obtener el id del proyecto

  try {
    const projectDoc = await db.collection('projects').doc(id).get();  // Buscar el proyecto por ID

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const projectData = projectDoc.data();
    res.json({ id: projectDoc.id, ...projectData });
  } catch (error) {
    console.error('Error al obtener los detalles del proyecto:', error);
    return res.status(500).json({ error: 'Error al obtener los detalles del proyecto' });
  }
};

const addProductsToProject = async (req, res) => {
  const { id } = req.params;
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron productos.' });
  }

  try {
    const projectRef = db.collection('projects').doc(id);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    const projectData = projectDoc.data();
    const productosExistentes = projectData.productos || [];

    // ✅ Cambio aquí: usar for...of para poder usar await
    for (const productoNuevo of productos) {
      const index = productosExistentes.findIndex(p => p.id === productoNuevo.id);

      if (index !== -1) {
        // Ya existe → sumamos la cantidad
        productosExistentes[index].cantidadTotal += productoNuevo.cantidad;
      } else {
        let nombreProducto = productoNuevo.nombre;

        if (!nombreProducto) {
          const productDoc = await db.collection('productos').doc(productoNuevo.id).get();
          if (productDoc.exists) {
            nombreProducto = productDoc.data().nombre;
          } else {
            return res.status(400).json({ error: `Producto con ID ${productoNuevo.id} no encontrado.` });
          }
        }

        productosExistentes.push({
          id: productoNuevo.id,
          nombre: nombreProducto,
          cantidadTotal: productoNuevo.cantidad,
        });
      }
    }

    // Actualizar proyecto
    await projectRef.update({ productos: productosExistentes });

    // Actualizar inventario
    await updateProductInventory(productos);

    // Historial (opcional)
    await Promise.all(productos.map(async (producto) => {
      await db.collection('historial_inventario').add({
        producto_id: producto.id,
        cantidad_usada: producto.cantidad,
        proyecto_id: id,
        fecha: new Date(),
        usuario_id: req.user?.id || null
      });
    }));

    res.status(200).json({ message: 'Productos agregados y inventario actualizado.' });

  } catch (error) {
    console.error('Error al agregar productos al proyecto:', error);
    res.status(500).json({ error: 'Hubo un error al agregar productos al proyecto.' });
  }
};

const devolverProductosAlProyecto = async (req, res) => {
  const subproyectoId = req.params.id;
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron productos a devolver.' });
  }

  try {
    const subRef = db.collection('subprojects').doc(subproyectoId);
    const subDoc = await subRef.get();

    if (!subDoc.exists) {
      return res.status(404).json({ error: 'Subproyecto no encontrado.' });
    }

    const subData = subDoc.data();
    const proyectoId = subData.proyectoPrincipalId;
    const subProductos = subData.productos || [];

    // Obtener proyecto principal
    const proyectoRef = db.collection('projects').doc(proyectoId);
    const proyectoDoc = await proyectoRef.get();

    if (!proyectoDoc.exists) {
      return res.status(404).json({ error: 'Proyecto principal no encontrado.' });
    }

    const proyectoData = proyectoDoc.data();
    const productosProyecto = proyectoData.productos || [];

    // Procesar productos
    for (const p of productos) {
      const { id: prodId, cantidad } = p;

      // 🔁 1. Quitar del subproyecto
      const subIndex = subProductos.findIndex(p => p.id === prodId);
      if (subIndex === -1 || subProductos[subIndex].cantidad < cantidad) {
        return res.status(400).json({ error: `Cantidad inválida para el producto ${prodId} en subproyecto.` });
      }
      subProductos[subIndex].cantidad -= cantidad;
      if (subProductos[subIndex].cantidad === 0) {
        subProductos.splice(subIndex, 1);
      }

      // 🔁 2. Sumar al proyecto principal
      const projIndex = productosProyecto.findIndex(p => p.id === prodId);
      if (projIndex !== -1) {
        productosProyecto[projIndex].cantidadTotal += cantidad;
      } else {
        // Recuperar nombre desde la colección 'productos'
        const productoDoc = await db.collection('productos').doc(prodId).get();
        const nombre = productoDoc.exists ? productoDoc.data().nombre : 'Producto desconocido';

        productosProyecto.push({
          id: prodId,
          nombre,
          cantidadTotal: cantidad
        });
      }
    }

    // Guardar cambios
    await subRef.update({ productos: subProductos });
    await proyectoRef.update({ productos: productosProyecto });

    res.status(200).json({ message: 'Productos devueltos al proyecto correctamente.' });

  } catch (error) {
    console.error('Error al devolver productos al proyecto:', error);
    res.status(500).json({ error: 'Hubo un error al devolver los productos.' });
  }
};

const addProductsToSubproject = async (req, res) => {
  const subproyectoId = req.params.id;
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron productos.' });
  }

  try {
    const subRef = db.collection('subprojects').doc(subproyectoId);
    const subDoc = await subRef.get();

    if (!subDoc.exists) {
      return res.status(404).json({ error: 'Subproyecto no encontrado.' });
    }

    const subData = subDoc.data();
    const proyectoPrincipalId = subData.proyectoPrincipalId;

    const proyectoRef = db.collection('projects').doc(proyectoPrincipalId);
    const proyectoDoc = await proyectoRef.get();

    if (!proyectoDoc.exists) {
      return res.status(404).json({ error: 'Proyecto principal no encontrado.' });
    }

    const subProductos = subData.productos || [];
    const productosProyecto = proyectoDoc.data().productos || [];

    for (const p of productos) {
      const { id: prodId, cantidad } = p;

      // 1️⃣ Validar existencia en proyecto principal
      const projIndex = productosProyecto.findIndex(p => p.id === prodId);
      if (projIndex === -1 || productosProyecto[projIndex].cantidadTotal < cantidad) {
        return res.status(400).json({ error: `No hay suficiente cantidad del producto ${prodId} en el proyecto principal.` });
      }

      // 2️⃣ Restar del proyecto principal
      productosProyecto[projIndex].cantidadTotal -= cantidad;

      // 3️⃣ Agregar al subproyecto
      const subIndex = subProductos.findIndex(p => p.id === prodId);
      if (subIndex !== -1) {
        subProductos[subIndex].cantidad += cantidad;
      } else {
        // Recuperar nombre desde productos
        const productoDoc = await db.collection('productos').doc(prodId).get();
        const nombre = productoDoc.exists ? productoDoc.data().nombre : 'Producto desconocido';

        subProductos.push({
          id: prodId,
          nombre,
          cantidad
        });
      }
    }

    await proyectoRef.update({ productos: productosProyecto });
    await subRef.update({ productos: subProductos });

    res.status(200).json({ message: 'Productos transferidos al subproyecto correctamente.' });

  } catch (error) {
    console.error('Error al agregar productos al subproyecto:', error);
    res.status(500).json({ error: 'Hubo un error al agregar productos al subproyecto.' });
  }
};

const usarProductosEnProyecto = async (req, res) => {
  const { id } = req.params;
  const { productos } = req.body;
  const correo = req.user?.email;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron productos a usar.' });
  }

  try {
    const proyectoRef = db.collection('projects').doc(id);
    const proyectoDoc = await proyectoRef.get();

    if (!proyectoDoc.exists) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    const proyectoData = proyectoDoc.data();
    const productosProyecto = proyectoData.productos || [];

    for (const { id: prodId, cantidad } of productos) {
      const index = productosProyecto.findIndex(p => p.id === prodId);
      if (index === -1 || productosProyecto[index].cantidadTotal < cantidad) {
        return res.status(400).json({ error: `Cantidad insuficiente del producto ${prodId}` });
      }

      productosProyecto[index].cantidadTotal -= cantidad;

      // Guardar en historial
      await db.collection('historial_uso').add({
        producto_id: prodId,
        cantidad,
        fecha: new Date(),
        proyecto_id: id,
        subproyecto_id: null,
        correo
      });
    }

    await proyectoRef.update({ productos: productosProyecto });
    res.json({ message: 'Uso de productos registrado en el proyecto correctamente.' });

  } catch (error) {
    console.error('Error al usar productos en proyecto:', error);
    res.status(500).json({ error: 'Error al usar productos en el proyecto.' });
  }
};

const usarProductosEnSubproyecto = async (req, res) => {
  const { id } = req.params;
  const { productos } = req.body;
  const correo = req.user?.email;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron productos a usar.' });
  }

  try {
    const subRef = db.collection('subprojects').doc(id);
    const subDoc = await subRef.get();

    if (!subDoc.exists) {
      return res.status(404).json({ error: 'Subproyecto no encontrado.' });
    }

    const subData = subDoc.data();
    const subProductos = subData.productos || [];

    for (const { id: prodId, cantidad } of productos) {
      const index = subProductos.findIndex(p => p.id === prodId);
      if (index === -1 || subProductos[index].cantidad < cantidad) {
        return res.status(400).json({ error: `Cantidad insuficiente del producto ${prodId}` });
      }

      subProductos[index].cantidad -= cantidad;

      // Guardar en historial
      await db.collection('historial_uso').add({
        producto_id: prodId,
        cantidad,
        fecha: new Date(),
        proyecto_id: subData.proyectoPrincipalId || null,
        subproyecto_id: id,
        correo
      });
    }

    await subRef.update({ productos: subProductos });
    res.json({ message: 'Uso de productos registrado en el subproyecto correctamente.' });

  } catch (error) {
    console.error('Error al usar productos en subproyecto:', error);
    res.status(500).json({ error: 'Error al usar productos en el subproyecto.' });
  }
};

// controllers/projectController.js
const getProjectUsageHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const historialSnapshot = await db.collection('historial_uso')
      .where('proyecto_id', '==', id)
      .get();

    if (historialSnapshot.empty) {
      return res.status(404).json({ error: 'No se encontraron registros de uso para este proyecto.' });
    }

    const historial = await Promise.all(historialSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const productoId = data.producto_id;

      // 🔍 Nombre del producto
      const productoDoc = await db.collection('productos').doc(productoId).get();
      const nombreProducto = productoDoc.exists ? productoDoc.data().nombre : 'Desconocido';

      // 🔍 Nombre del subproyecto (si aplica)
      let subproyectoNombre = null;
      if (data.subproyecto_id) {
        const subDoc = await db.collection('subprojects').doc(data.subproyecto_id).get();
        subproyectoNombre = subDoc.exists ? subDoc.data().nombre : 'Subproyecto desconocido';
      }

      return {
        producto_id: productoId,
        nombre: nombreProducto,
        cantidad: data.cantidad,
        fecha: data.fecha.toDate(),
        correo: data.correo,
        subproyecto_id: data.subproyecto_id || null,
        subproyecto_nombre: subproyectoNombre,
      };
    }));

    res.json(historial);
  } catch (error) {
    console.error('Error al obtener el historial de uso del proyecto:', error);
    res.status(500).json({ error: 'Error al obtener el historial de uso del proyecto.' });
  }
};


module.exports = { 
  getProjects, 
  addProject, 
  updateProject, 
  deleteProject, 
  getProjectDetails,
  addProductsToProject,
  devolverProductosAlProyecto,
  addProductsToSubproject,
  usarProductosEnSubproyecto,
  usarProductosEnProyecto,
  getProjectUsageHistory
};
