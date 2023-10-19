const buttonSync = document.querySelector('.button__sync')

buttonSync.addEventListener('click', async () => {
  const statusSync = document.querySelector('.status__sync')
  // const userLinked = document.querySelector(".link_state").innerHTML;
  statusSync.innerHTML = 'Sincronizando...'

  // let urlUser = `http://localhost:3000/sync?id=${1}&nickname=${userLinked}`;
  const urlUser = 'http://localhost:3000/sync'
  // Realizamos una peticion al servidor para que este realice la sincronización
  fetch(urlUser)
    .then(response => response.json())
    .then(data => {
      statusSync.innerHTML = data.result
    })
})
