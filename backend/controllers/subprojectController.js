//controllers//subprojectController.js

const { db, admin } = require('../config/firebase');

// Agregar un subproyecto
const addSubproject = async (req, res) => {
  try {
    const { nombre, descripcion, proyectoPrincipalId, productos } = req.body;

    // Validamos que el proyecto principal existe
    const projectDoc = await db.collection('projects').doc(proyectoPrincipalId).get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Proyecto principal no encontrado' });
    }

    const projectData = projectDoc.data();  // Extraemos los datos del proyecto principal
    const productosProyectoPrincipal = projectData.productos;  // Accedemos al array de productos del proyecto

    const productosSimplificados = [];
    const updatedProductos = [...productosProyectoPrincipal]; // Hacemos una copia del array de productos para actualizarlo después

    for (const producto of productos) {
      // Verificamos si el producto existe en el array de productos del proyecto principal
      const productoEnProyecto = productosProyectoPrincipal.find(p => p.id === producto.id);

      if (!productoEnProyecto) {
        return res.status(404).json({ error: `Producto con ID ${producto.id} no encontrado en el proyecto principal.` });
      }

      const nombreProducto = productoEnProyecto.nombre;

      productosSimplificados.push({
        id: producto.id,
        nombre: nombreProducto,
        cantidad: producto.cantidad,  // Cantidad solicitada para el subproyecto
      });

      // Descontamos la cantidad del proyecto principal
      const updatedCantidadTotal = productoEnProyecto.cantidadTotal - producto.cantidad;
      if (updatedCantidadTotal < 0) {
        return res.status(400).json({ error: `No hay suficiente cantidad de ${nombreProducto} en el proyecto principal.` });
      }

      // Actualizamos el array de productos para reflejar el cambio en la cantidadTotal
      const productIndex = updatedProductos.findIndex(p => p.id === producto.id);
      updatedProductos[productIndex].cantidadTotal = updatedCantidadTotal;
    }

    // Actualizamos el proyecto principal con todos los productos modificados
    await db.collection('projects').doc(proyectoPrincipalId).update({
      productos: updatedProductos,
    });

    // Crear el nuevo subproyecto
    const newSubproject = {
      nombre,
      descripcion,
      proyectoPrincipalId,  // Relación con el proyecto principal
      productos: productosSimplificados,
    };

    // Guardamos el subproyecto en Firestore
    await db.collection('subprojects').add(newSubproject);

    // Enviar respuesta con éxito
    res.status(201).json({ message: 'Subproyecto creado con éxito.' });

  } catch (err) {
    console.error('Error al agregar el subproyecto:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Hubo un error al agregar el subproyecto.' });
    }
  }
};


// Obtener los subproyectos de un proyecto principal
// Obtener los subproyectos de un proyecto principal
const getSubprojectsByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const subprojectsSnapshot = await db.collection('subprojects')
      .where('proyectoPrincipalId', '==', projectId)
      .get();

    // Si no se encuentran subproyectos, devolvemos un array vacío
    if (subprojectsSnapshot.empty) {
      return res.status(200).json([]);  // Devuelve un array vacío en lugar de 404
    }

    // Si hay subproyectos, los mapeamos y los devolvemos
    const subprojects = subprojectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(subprojects);

  } catch (err) {
    console.error('Error al obtener los subproyectos:', err);
    return res.status(500).json({ error: 'Error al obtener los subproyectos.' });
  }
};


module.exports = {
  addSubproject,
  getSubprojectsByProjectId,
};
