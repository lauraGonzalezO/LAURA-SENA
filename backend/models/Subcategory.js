/**
 * modelo de subcategoria MONGODB
 * define la estructura de la subcategoria
 * la subcategoria depende de una categoria
 * muchos productos pueden pertenecer a una subcategoria
 * mcuhas subcategorias dependen de una sola categoria
*/

const mongoose =require('mongoose');

//campos de sub categoria
const subcategorySchema = new mongoose.Schema({
    name:{
        type: String,
        require: [true, 'el nombre es obligatgordio'],
        unique: true,// no pueden haver sub cateogrias con el mismo nombre
        trim: true //eliminar espacio al inicio y al final
    },

    // descripccion de la subcategoria - requerida
    description:{
        type: String,
        require: [true, 'la descripcion es requerida'],
        trim: true //elim
    },

    //categoria padre esta subcateogria pertenece a una categoria 
    //relacion 1 - muchos una categoria puede tener muchas subcategorias

    category: {
        type: mongoose.Schema.types.ObjectId,
        ref: 'category', //puede ser poblado con .populate('category')

        required: [true, 'la categoria ees requerida']
    },


    //active, desactiva las subcategorias pero no las elimina
    active: {
        type: Boolean, //agrega, createdAt y udpatedAt automaticamente
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
subcategorySchema.post('save',function (error, doc,next){

    //verificar si es un error de mongoDB por violacion de indice unico

     if (error.name==='MongoServerError'&& error.code === 1000) {
        next(new Error('ya no existe una subcategoria con ese nombre'));
     } else { 
        //pasar el error tal como es 
        next(error);
    }
});

/**
 * 
 * crear indice unico
 * 
 * mongo rechaza cualquier intento de interta<r  o actualizar 
 * un documento con valor de name qur ya exista
 * aumenta la velocidad de las busquedas
 */





//exportar modelo 

Module.exports=mongoose.model('Subcategory', subcategorySchema);

