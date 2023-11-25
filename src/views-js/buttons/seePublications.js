async function verPublicaciones () {
  const responsePub = await fetch('http://localhost:3000/publications')
  const data = await responsePub.json()
  console.log(data.publications)
  itemsTable = document.getElementById('items_table')

  data.publications.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
          <td>${item.item_id}</td>
          <td>${item.title}</td>
          <td>${item.price}</td>
          <td>${item.status}</td>
          <td>${item.last_sincro}</td>
        `;
    itemsTable.appendChild(row);
  });
}


/*fetch('http://localhost:3000/publications')*/