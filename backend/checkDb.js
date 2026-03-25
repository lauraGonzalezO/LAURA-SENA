const mongoose = require('mongoose');
const config = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Subcategory = require('./models/Subcategory');
const Product = require('./models/Product');
(async()=>{
  console.log('Config URL:', config.url);
  await mongoose.connect(config.url, {useNewUrlParser:true, useUnifiedTopology:true});
  const [u,c,s,p] = await Promise.all([
    User.countDocuments(),
    Category.countDocuments(),
    Subcategory.countDocuments(),
    Product.countDocuments()
  ]);
  console.log({u,c,s,p});
  mongoose.connection.close();
})();