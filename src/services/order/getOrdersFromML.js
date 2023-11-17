const request = require('request')
const pc = require('picocolors')
const getBillingInfoService = require('../billing/getBillingInfo.js')

function setRequest (accessToken, scrollId, sellerId) {
  const headers = {
    Authorization: `Bearer ${accessToken}`
  }

  const OPTIONS = {
    headers,
    url: `https://api.mercadolibre.com/orders/search/pending?seller=${sellerId}&search_type=scan&limit=2&scroll_id=${scrollId}`
  }

  return OPTIONS
}

async function asyncCallback (error, response, body, accessToken, sessionUserId) {
  if (error) {
    console.error(pc.red('Error en getOrders:', error))
    throw error
  }
  try {
    const responseOrders = JSON.parse(body)

    if (response.statusCode === 200 && responseOrders.results.length > 0) {
      const orderData = []
      console.log('ScrollID: ', pc.bgYellow(responseOrders.paging.scroll_id))
      await Promise.all(
        responseOrders.results.map(async (orderInfo) => {
          const orderObject = {
            user: sessionUserId,
            seller_id: orderInfo.seller.id,
            date_closed: orderInfo.date_closed,
            id: orderInfo.id,
            pack_id: orderInfo.pack_id,
            shipping_id: orderInfo.shipping?.id,
            shipping_mode: orderInfo.shipping?.mode ?? null, // No lo encontré
            item_id: orderInfo.order_items[0]?.item?.id ?? null,
            item_title: orderInfo.order_items[0]?.item?.title ?? null,
            item_price: orderInfo.order_items[0]?.unit_price ?? 0.0,
            total_amount: orderInfo.total_amount,
            item_quantity: orderInfo.order_items[0]?.quantity,
            buyer_id: orderInfo.buyer.id,
            buyer_nickname: orderInfo.buyer.nickname,
            buyer_first_name: orderInfo.buyer?.first_name ?? '',
            buyer_last_name: orderInfo.buyer?.last_name ?? '',
            billing_doc_type: '',
            billing_doc_number: ''
          }

          orderData.push(orderObject)

          const reqOptionsBilling = getBillingInfoService.setOptions(accessToken, orderObject.id)
          await getBillingInfoService.doAsyncCallback(reqOptionsBilling, getBillingInfoService.asyncCallback)
        })
      )

      return {
        scrollId: responseOrders.paging.scroll_id,
        statusCode: response.statusCode,
        orderData
      }
    } else {
      return {
        statusCode: response.statusCode,
        scroll_id: null
      }
    }
  } catch (error) {
    console.error(pc.red('Error en getOrders al procesar response:', error))

    return {
      statusCode: response.statusCode,
      scroll_id: null
    }
  }
}

function doAsyncRequest (requestOptions, asyncCallback, accessToken, sessionUserId) {
  return new Promise((resolve, reject) => {
    request(requestOptions, (error, response, body) => {
      asyncCallback(error, response, body, accessToken, sessionUserId)
        .then((value) => resolve(value))
        .catch((error) => reject(error))
    })
  })
}

module.exports = {
  setRequest,
  doAsyncRequest,
  asyncCallback
}
