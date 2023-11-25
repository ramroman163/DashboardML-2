const eventSource = new EventSource('/progress')
const progressBarPublications = document.querySelector('.progress-bar-publications')
const progressBarOrders = document.querySelector('.progress-bar-orders')

eventSource.onmessage = async (event) => {
  const data = await JSON.parse(event.data)
  let progressPublications = data.data.progressPublications
  let progressOrders = data.data.progressOrders

  progressBarPublications.style.width = `${progressPublications}%`
  progressBarPublications.setAttribute('aria-valuenow', progressPublications)
  progressBarPublications.innerText = `${progressPublications}%`

  progressBarOrders.style.width = `${progressOrders}%`
  progressBarOrders.setAttribute('aria-valuenow', progressOrders)
  progressBarOrders.innerText = `${progressOrders}%`

  if (progressOrders >= 100 && progressPublications >= 100) {
    eventSource.close()
  }
}
