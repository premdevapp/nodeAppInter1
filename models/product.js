const fs = require("fs");
const path = require("path");
const generateUniqueId = require("generate-unique-id");

const Cart = require("./cart");

const pathDir = path.join(
  path.dirname(require.main.filename),
  "..",
  "data",
  "products.json"
);

const getProductsFromFile = (callback) => {
  fs.readFile(pathDir, (err, fileContent) => {
    if (err) {
      return callback([]);
    }
    callback(JSON.parse(fileContent));
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }
  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (item) => item.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(pathDir, JSON.stringify(updatedProducts), (error) => {
          console.error(error);
        });
      } else {
        this.id = generateUniqueId({
          length: 32,
          useLetters: false,
        });
        products.push(this);
        fs.writeFile(pathDir, JSON.stringify(products), (error) => {
          console.error(error);
        });
      }
    });
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === id);
      const updatedProducts = products.filter((prod) => prod.id !== id);
      fs.writeFile(pathDir, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((item) => item.id === id);
      cb(product);
    });
  }
};
