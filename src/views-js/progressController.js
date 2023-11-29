const eventSource = new EventSource('/progress')

eventSource.onmessage = async (event) => {
  const progressBarPublications = document.querySelector('.progress-bar-publications')
  const progressBarOrders = document.querySelector('.progress-bar-orders')

  const data = await JSON.parse(event.data)
  console.log(data)
  const progressPublications = data.data.progressPublications
  const progressOrders = data.data.progressOrders

  progressBarPublications.style.width = `${progressPublications}%`
  progressBarPublications.setAttribute('aria-valuenow', progressPublications)
  progressBarPublications.innerText = `${progressPublications}%`

  progressBarOrders.style.width = `${progressOrders}%`
  progressBarOrders.setAttribute('aria-valuenow', progressOrders)
  progressBarOrders.innerText = `${progressOrders}%`

  if (progressPublications >= 100) {
    progressBarPublications.classList.remove('progress-bar-striped')
    progressBarPublications.classList.add('bg-success')
  }

  if (progressOrders >= 100) {
    progressBarOrders.classList.remove('progress-bar-striped')
    progressBarOrders.classList.add('bg-success')
  }

  if (progressOrders >= 100 && progressPublications >= 100) {
    eventSource.close()
  }
}
