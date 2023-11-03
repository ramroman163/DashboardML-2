function setOptions (shippingId, accessToken, scrollId) {
  const headers = {
    Authorization: `Bearer ${accessToken}`
  }

  const options = {
    headers,
    url: `https://api.mercadolibre.com/shipments/${shippingId}&search_type=scan&limit=2&scroll_id=${scrollId}`
  }

  return options
}

function asyncCallback () {

}

function doAsyncCallback () {

}

module.exports = {
  setOptions
}
