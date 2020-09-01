const multer = require("multer");
const express = require("express");

const router = express.Router();

const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});

const ProductController = require("../controllers/products");

router.get("/", ProductController.getAllProducts);

router.post("/", checkAuth, upload.single("productImage"), ProductController.createProduct);

router.get("/:productId", ProductController.getProductById);

router.patch("/:productId", checkAuth, ProductController.updateProductById);

router.delete("/:productId", checkAuth, ProductController.deleteProductById);

module.exports = router;
