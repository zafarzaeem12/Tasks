const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "user_image") {
      cb(null, "./public/User/");
    } else if (file.fieldname === "category_image") {
      cb(null, "./public/Category/");
    } else if (file.fieldname === "product_image") {
      cb(null, "./public/Product/");
    }
  },
  filename: function (req, file, cb) {
    if (file.fieldname === "user_image") {
      const filename = file.originalname.split(" ").join("-");
      cb(null, `${filename}`);
    } else if (file.fieldname === "category_image") {
      const filename = file.originalname.split(" ").join("-");
      cb(null, `${filename}`);
    } else if (file.fieldname === "product_image") {
      const filename = file.originalname.split(" ").join("-");
      cb(null, `${filename}`);
    }
  },
});

const upload = multer({
  storage: storage,
}).fields([
  { name: "category_image", maxCount: 8 },
  { name: "product_image", maxCount: 8 },
]);


const user = multer({
  storage: storage,
}).single('user_image')

module.exports = { upload , user };
