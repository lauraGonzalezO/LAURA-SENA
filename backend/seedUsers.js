// Script para insertar usuarios de ejemplo en la base de datos MongoDB
// Ejecutar con: node seedUsers.js (desde la carpeta backend)

// mongoose → librería ODM para conectar Node.js con MongoDB
const mongoose = require('mongoose');

// bcrypt → librería para encriptar contraseñas; no se usa directamente aquí porque
// el modelo User tiene un pre-save hook que encripta automáticamente
const bcrypt = require('bcryptjs');

// Modelo User → se usa para verificar existencia y crear nuevos usuarios
// Archivo: backend/models/User.js
const User = require('./models/User');

// dbConfig → contiene la URL de conexión a MongoDB
// Archivo: backend/config/db.js
const dbConfig = require('./config/db'); // Trae la URL de conexión


async function seed() { // Función async que inserta usuarios de prueba en la BD
  // Conectar a la base de datos (opciones por defecto en driver 4+)
  await mongoose.connect(dbConfig.url);

  const users = [ // Array con los datos de los usuarios de ejemplo a crear
    {
      username: 'admin',             // debe coincidir con el campo definido en User.schema
      email: 'admin@example.com',    // Email del administrador
      password: 'admin123',          // Contraseña en texto plano; el pre-save hook del modelo la encriptará automáticamente
      role: 'admin'                  // Rol con acceso total al sistema
    },
    {
      username: 'coord',             // Nombre de usuario del coordinador
      email: 'coord@example.com',    // Email del coordinador
      password: 'coord123',          // Contraseña en texto plano; será encriptada por el pre-save hook
      role: 'coordinador'            // Rol con acceso a gestión de datos
    }
  ];

  console.log('Usuarios a sembrar:', users);
  for (const user of users) { // Itera sobre cada usuario del array para crearlo si no existe
    console.log('Procesando usuario de semilla:', user);
    const exists = await User.findOne({ username: user.username }); // usa la propiedad correcta del objeto de semilla
    if (!exists) { // Si no existe, lo crea
      try {
        console.log('Creando documento User con:', user);
        await User.create(user); // Crea el documento en la colección 'users'; el pre-save hook encripta la contraseña
        console.log(`Usuario creado: ${user.username}`); // Confirma la creación del usuario en consola
      } catch (err) {
        console.error('Error al crear usuario', user, err);
        throw err; // propagar para que el catch exterior lo capture
      }
    } else { // Si ya existe, lo omite
      console.log(`Usuario ya existe: ${user.username}`); // Informa que el usuario ya estaba en la BD
    }
  }

  mongoose.connection.close(); // Cierra la conexión a MongoDB para liberar recursos
}

seed().catch(err => { // Ejecuta la función; si lanza error lo captura el callback
  console.error(err);           // Imprime el error en consola
  mongoose.connection.close();  // Cierra la conexión incluso si hubo error
});
