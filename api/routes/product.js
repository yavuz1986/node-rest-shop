const express = require('express');
const router = express.Router();

const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    //reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({ 
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    }    
});

const ProductController = require('../controllers/product');

router.get('/', ProductController.products_get_all_products);

router.post('/', checkAuth, upload.single('productImage'), ProductController.products_create_product);

router.get('/:product_id', ProductController.products_get_product);

router.patch('/:product_id', checkAuth, ProductController.products_update_product);

router.delete('/:product_id', checkAuth, (req, res, next) => {
    const id = req.params.product_id;
    Product.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product deleted!',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products',
                body: {
                    name: 'String',
                    price: 'Number'
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;