async function verOrdenes () {
  const tableSection = document.querySelector('.table_section')
  tableSection.classList.remove('hidden')

  const tableOrders = document.querySelector('.table-orders')
  tableOrders.classList.remove('hidden')

  const titleTableOrders = document.querySelector('.table-orders-title')
  titleTableOrders.classList.remove('hidden')

  const responseOrders = await fetch('http://localhost:3000/orders')
  const data = await responseOrders.json()

  const tableBody = document.querySelector('.table__body-orders')

  tableBody.innerHTML = ''
  console.log(data.orders)
  data.orders.forEach((item) => {
    const row = document.createElement('tr')
    row.innerHTML = `
          <td>${item.order_id}</td>
          <td>${item.date_closed === null ? 'N/A' : item.date_closed}</td>
          <td>${item.item_title}</td>
          <td>${item.item_quantity}</td>
          <td>${item.total_amount}</td>
          <td>${item.last_sincro}</td>
        `
    tableBody.appendChild(row)
  })
}
