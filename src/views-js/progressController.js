const eventSource = new EventSource('/progress')
const progressBar = document.getElementById('progress-bar')

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  const progress = data.progress

  progressBar.style.width = `${progress}%`
  progressBar.setAttribute('aria-valuenow', progress)
  progressBar.innerText = `${progress}%`

  console.log(progress)

  if (progress >= 100) {
    eventSource.close()
  }
}
