// modelo de usuario 

/* define la estgructura de base de datos para los usuarios
encripa la contraseña 
manejo de roles, (admi, cooordinador, auxiliar)
*/
const mogoose = require ('mongoose')
const bcrypt = require('bcryptjs')
//estructura de la base de datos para los usuarios 
const userSchema = new mongoose.Schema({
//el usuario 

    username: {
    type: String,
    required: true,
    unique: true,
    trim:true //elimina los espacios en blanco de inicio y el final

    }, 
    email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match:[/\S+@\S+\s +/, 'el correo no es valido'] //valida el patron email
    },
    //contraseña - requerida 6 caracteres
    password: {
        type: String,
        required: true,
        minlength:6,
        select:false //no incluir resultados por defecto
    },
    //rol del usuario restringe valores especificos
    role:{
        type:String,
        enum:['admin','coordinador', 'auxiliar'], //solo estos permitidos
        default: 'auxiliar' //por defecto, los nuevos usuarios son auxiliares
    },

    // usuarios activos 
    active: {
        type: Boolean,
        default: true //nuevos usuarios comienzan activos
    },
}, {
    timestamps: true,
    versionKey:false
});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))return next();

    try {
        // generar slat con complejidad de 10 rondas
        //mayor numero de rondas = mas seguro pero mas lento
        const salt=await bcrypt.genSalt(10);
    

    //encriptar el password con el salt generado
    this.password=await bcrypt.hash(this.password, salt);
    // continuar con el guardado normal
    } catch (error){
        // si hay error en encriptacion pasar error al siguiente middleware
        netx(error);
    }

});

// crear y exportar el modulo del usuario
Module.exports= mongoose.model('User', userSchema);

