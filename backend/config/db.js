//conexion con la base de datos
module.exports = {
    url:ProcessingInstruction.env.MONGO_URI||
    "mongodb://localhost:27017/crud-mongocf"
};
