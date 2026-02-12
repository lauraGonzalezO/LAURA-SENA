/**modelo de categoria MONGODB
 * define la estructura de la categoria
 * /
*/

const mongoose =require('mongoose');
//campos de categoria
const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        require: [true, 'el nombre es obligatgordio'],
        unique: true,
        trim: true //eliminar espacio al inicio y al final
    },
    description:{
        type: String,
        require: [true, 'la descripcion es requerida'],
        trim: true //elim
    },
    //active, desactiva las categorias pero no las elimina
    active: {
        type: Boolean, //agrega,crea y udpated automaticamente
        default: true, //no iniciar campos _v
    }

}, { timestamps: true, //
    versinoKey:false,
});

/**
 * MIDDLEWARE PRE-SAVE
 * Limpia indices duplicados
 * Mongodb aveces crea multiples indices con el mismo nombre
 * esto causa conflictos al intentar dropIndex o recrear indices
 * este middleware limpia los indices problematicos
 * proceso
 * 1 obtiene una lista de todos los indices de la coleccion
 * 2 busca si existe el indice con nombre name_1 (antiguo o duplicado)
 * si existe lo elimina antes de nuevas operaciones
 * ignora errores si el indice no existe
 * continua con el guardado normal
 */
categorySchema.pre('save', async function (next){
    try {
        //obtener refrencia de la coleccion de mongoDB
        const collection = this.constructor.collection;
        //obtener lista de todos los indices
        const indexes = await collection.indexes();
        //buscar si existe indice problematico con nombre "name_1"
        //(del orden: 1 significa ascendente)

        const problematicIndex= indexes.find(index =>
            index.name === 'name_1');

     //si lo encuentra, eliminarlo
     if (problematicIndex) {
        await collection.dropIndex('name_1');
     }
    } catch (err) {
        // sii el error es index no found no es problema - continuar 
        // si es otro error pasarlo al siguiente middleware
        if (err.message.includes ('Index no found')) {
            return next(err);
        }
    }
    //continuar con el guardado
    next();

});


/**
 * 
 * crear indice unico
 * 
 * mongo rechaza cualquier intento de interta<r  o actualizar 
 * un documento con valor de name qur ya exista
 * aumenta la velocidad de las busquedas
 */

categorySchema.index({name: 1},  {
    unique:true,
    name: 'name_1' // nombre explicito para evitar conflictos
});


//exportar modelo 

Module.exports=mongoose.model('category', categorySchema)

