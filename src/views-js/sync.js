const buttonSync = document.querySelector('.button__sync')

buttonSync.addEventListener('click', async () => {
  const progressBarPublications = document.querySelector('.progress-bar-publications')
  const progressBarOrders = document.querySelector('.progress-bar-orders')
  const statusSync = document.querySelector('.status__sync')
  const statusPubSection = document.querySelector('.pub__status-container')
  const statusOrdSection = document.querySelector('.ord__status-container')

  statusSync.classList.remove('hidden')

  statusPubSection.classList.remove('hidden')
  statusOrdSection.classList.remove('hidden')
  statusSync.innerHTML = 'Sincronizando...'

  const urlUser = 'http://localhost:3000/sync'

  try {
    const response = await fetch(urlUser)
    const data = await response.json()
    if (progressBarPublications.innerText >= '100%' && progressBarOrders.innerText >= '100%') {
      statusSync.innerHTML = data.result

      const viewButtons = document.querySelector('.buttons_view')
      viewButtons.classList.remove('hidden')
    }
  } catch (error) {
    console.error('Error al sincronizar:', error)
    statusSync.innerHTML = 'Error al sincronizar.'
  }
})
