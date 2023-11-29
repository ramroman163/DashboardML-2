async function verPublicaciones () {
  const tableSection = document.querySelector('.table_section')
  tableSection.classList.remove('hidden')

  const tablePublications = document.querySelector('.table-publications')
  tablePublications.classList.remove('hidden')

  const titleTablePublications = document.querySelector('.table-publications-title')
  titleTablePublications.classList.remove('hidden')

  const responsePub = await fetch('http://localhost:3000/publications')
  const data = await responsePub.json()

  const tableBody = document.querySelector('.table__body-publications')

  tableBody.innerHTML = ''
  console.log(data.publications)
  data.publications.forEach((item) => {
    const row = document.createElement('tr')
    row.innerHTML = `
          <td>${item.item_id}</td>
          <td>${item.title}</td>
          <td>${item.price}</td>
          <td>${item.status}</td>
          <td>${item.last_sincro}</td>
        `
    tableBody.appendChild(row)
  })
}
