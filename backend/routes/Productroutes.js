//routes/Productroutes.js
const express = require('express');
const { 
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
} = require('../controllers/productController');
const { authenticateToken, checkAdmin } = require('../Middleware/authMiddleware');

const router = express.Router();

router.get('/products', authenticateToken, getProducts);
router.put('/products/:id', authenticateToken, updateProduct);
router.get('/products/:id', authenticateToken, getProductDetails);
router.get('/product-total-quantity', authenticateToken, getProductTotalQuantity);

router.get('/product-inventory', authenticateToken, getProductInventory);
router.put('/product-inventory', authenticateToken, updateProductInventory);

router.put('/update-inventory-manual', authenticateToken, checkAdmin, updateInventoryManual);
router.put('/update-inventory-history', authenticateToken, checkAdmin, updateInventoryHistory);

router.post('/products', authenticateToken, checkAdmin, addProduct);
router.post('/productos/masivos',authenticateToken, checkAdmin, bulkProduct);
router.delete('/products/:id', authenticateToken, checkAdmin, deleteProduct);


module.exports = router;
