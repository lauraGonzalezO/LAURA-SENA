//conexion con la base de datos
module.exports = {
    url:Process.env.MONGO_URI||
    "mongodb://localhost:27017/crud-mongocf"
};
