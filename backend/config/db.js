//conexion BD
module.exports = {
    // la aplicación usa MONGO_URI pero el script de siembra estaba usando MONGODB_URI
    // aceptamos cualquiera de los dos y además corregimos la URL por defecto
    url: process.env.MONGO_URI || process.env.MONGODB_URI ||
         'mongodb://localhost:27017/crud-mongo'
};