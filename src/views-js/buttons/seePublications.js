async function verPublicaciones () {
  const tableSection = document.querySelector('.table_section')
  tableSection.classList.remove('hidden')

  const responsePub = await fetch('http://localhost:3000/publications')
  const data = await responsePub.json()
  // console.log(data.publications)
  const tableBody = document.querySelector('.table__body')

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
