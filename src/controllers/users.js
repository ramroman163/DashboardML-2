const bcryptjs = require('bcryptjs')
const getUserDataService = require('../services/seller/getUserDataFromBD.js')

async function logout (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error al cerrar sesión')
    } else {
      res.redirect('/')
    }
  })
}

async function login (req, res) {
  // Tomamos user y pass de la peticion post para login
  const username = req.body.username
  const password = req.body.password

  console.log('Username:', username)
  console.log('Password:', password)

  if (username && password) {
    const results = await getUserDataService.getUsers(username) // Solicitamos todas las contraseñas de la base de datos cuyo nombre de usuario coincida con el enviado por la función para poder comparar.

    if (results.length === 0 || !(await bcryptjs.compare(password, results[0].password))) { // si no hay nada en base de datos o si los datos de la base de datos no coinciden
      console.log('Usuario y/o contraseña incorrecta')
      res.send('Usuario y/o contraseña incorrecta')
    } else {
      console.log('Inicio de sesión correcto')
      req.session.user = results[0].id
      req.session.username = username
      console.log('Nuevo usuario en la sesión:', req.session.user)
      res.redirect('/home')
    }
  } else { // si no hay nombre de usuario o contraseña
    console.log('Error de ingreso de datos en login.')
    res.send('Por favor, ingrese un nombre de usuario y contraseña válidos.')
  }
}

module.exports = {
  logout,
  login
}
