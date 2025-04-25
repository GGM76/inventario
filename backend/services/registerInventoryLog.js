// services/registerInventoryLog.js
const { db } = require('../config/firebase');

const registrarMovimientoInventario = async ({
  producto_id,
  producto_nombre,
  empresa_id,
  bodega_id,
  bodega_nombre,
  accion,
  cantidad_antes,
  cantidad_despues,
  cantidad_cambiada,
  usuario_id,
  usuario_correo,
  descripcion
}) => {
  const log = {
    producto_id,
    producto_nombre,
    empresa_id,
    bodega_id,
    bodega_nombre,
    accion,
    cantidad_antes,
    cantidad_despues,
    cantidad_cambiada,
    usuario_id,
    usuario_correo,
    timestamp: new Date(),
    descripcion
  };

  await db.collection('movimientos_inventario').add(log);
};

module.exports = registrarMovimientoInventario;
