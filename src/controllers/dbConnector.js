// Imports
const mysql = require('mysql')
const pc = require('picocolors')

// Configuración de la BD
const connectorDbDashboard = mysql.createConnection(
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  }
)

// Establecer conexión con la BD
const connectDb = () => {
  connectorDbDashboard.connect(err => {
    if (err) {
      console.error(pc.red(`Error al conectar a la base de datos, código: ${err.code}\n`))
      process.exit(1)
    };
    console.log(pc.green('La aplicación se conectó correctamente'))
  })
}

// Almacenar información de usuario
function saveUserData (access_token, refresh_token, user_id, user) {
  return new Promise(async (resolv, reject) => {
    connectorDbDashboard.query(`SELECT * FROM ml_sellers WHERE seller_id = "${user_id}"`, async (err, result, filed) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        if (result.length > 0) {
          const existentSeller = await checkForMultiUsers(user_id, user)

          if (existentSeller.length > 0) {
            console.log(`El seller ${user_id} ya existe en otro usuario!`)
            resolv({
              existentUser: true
            })
          } else {
            console.log(`Ya existe el seller "${user_id}"`)
            const updateQuery = `UPDATE ml_sellers SET token = "${access_token}", refresh_token = "${refresh_token}" WHERE seller_id = "${user_id}" AND usuario = ${user}`
            connectorDbDashboard.query(updateQuery, (err, result, filed) => {
              if (err) {
                console.log(err)
                reject(err)
              } else {
                console.log('# 1 Resultado de UPDATE de saveUserData: ')
                resolv({
                  seller_id: user_id,
                  access_token,
                  refresh_token
                })
              }
            }
            )
          }
        } else {
          console.log(`Todavía no existe el seller "${user_id}"`)
          const insertQuery = `INSERT INTO ml_sellers (seller_id, usuario, token, refresh_token) VALUES ("${user_id}", ${user}, "${access_token}", "${refresh_token}")`
          connectorDbDashboard.query(insertQuery, (err, result, filed) => {
            if (err) {
              console.log(err)
              reject(err)
            } else {
              console.log('# Resultado de INSERT: ')
              resolv({
                seller_id: user_id,
                access_token,
                refresh_token
              })
            }
          })
        }
      }
    })
  })
}

// Buscar usuario existente
function checkForMultiUsers (user_id, user) {
  return new Promise((resolv, reject) => {
    const checkForMultiUsersQuery = `SELECT usuario, seller_id FROM ml_sellers WHERE seller_id = "${user_id}" AND NOT usuario = ${user}`
    connectorDbDashboard.query(checkForMultiUsersQuery, (err, result, filed) => {
      if (err) {
        console.log(err)
        reject(err)
      }

      console.log(result)
      resolv(result)
    })
  })
}

// Actualizar información de usuario
function updateUserData (access_token, refresh_token, seller_id, user_id) {
  return new Promise((resolv, reject) => {
    const sql_query = `UPDATE ml_sellers SET token = "${access_token}", refresh_token = "${refresh_token}" WHERE seller_id = "${seller_id}" AND usuario = ${user_id}`
    // incheckeable
    connectorDbDashboard.query(sql_query, (err, result, filed) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        resolv(result)
      }
    })
  })
}

// Almacenar información de publicación
function savePublication (user, seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up) {
  // self_service no lo encontramos en el json, lo dejamos con un 0
  return new Promise((resolv, reject) => {
    try {
      connectorDbDashboard.query(`SELECT * FROM ml_items WHERE item_id = "${item_id}"`, (err, result, filed) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          if (result.length > 0) {
            console.log(`Ya existe el item "${item_id}"`)
            const updateQuery = `UPDATE ml_items SET title = "${title}", status = "${status}", sub_status = "${sub_status}", price = ${price}, original_price = ${original_price}, available_quantity = ${available_quantity}, thumbnail = "${thumbnail}", permalink = "${permalink}", listing_type_id = "${listing_type_id}", logistic_type = "${logistic_type}", self_service = ${0}, free_shipping = ${free_shipping}, mandatory_free_shipping = ${mandatory_free_shipping}, local_pick_up = ${local_pick_up} WHERE item_id = "${item_id}"`
            connectorDbDashboard.query(updateQuery, (err, result, filed) => {
              if (err) {
                console.log(err)
                reject(err)
              } else {
                // console.log('# 2 Resultado de UPDATE de savePublications: ')
                resolv(result)
              }
            })
          } else {
            console.log(`Todavía no existe el item "${item_id}"`)
            const insertQuery = `INSERT INTO ml_items (id, usuario, seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up) VALUES (${null}, ${user}, "${seller_id}", "${item_id}", "${title}", "${status}", "${sub_status}", ${price}, ${original_price}, ${available_quantity}, "${thumbnail}", "${permalink}", "${listing_type_id}", "${logistic_type}", ${0}, ${free_shipping}, ${mandatory_free_shipping}, ${local_pick_up})`
            connectorDbDashboard.query(insertQuery, (err, result, filed) => {
              if (err) {
                console.log(err)
                reject(err)
              } else {
                console.log('# Resultado de INSERT: ')
                resolv(result)
              }
            })
          }
          resolv(result)
        }
      })
    } catch (error) {
      console.log(error)
    }

    /* const sql_query = `INSERT INTO ml_items (id, usuario, seller_id, item_id, title, status, sub_status, price, original_price, available_quantity, thumbnail, permalink, listing_type_id, logistic_type, self_service, free_shipping, mandatory_free_shipping, local_pick_up) VALUES
            (${null}, ${1}, "${seller_id}", "${item_id}", "${title}", "${status}", "${sub_status}", ${price}, ${original_price}, ${available_quantity}, "${thumbnail}", "${permalink}", "${listing_type_id}", "${logistic_type}", ${0}, ${free_shipping}, ${mandatory_free_shipping}, ${local_pick_up})`;

            connectorDbDashboard.query(sql_query, (err, result, filed) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolv(result);
                }
            }) */
  })

  // item_id es mi dato a consultar, necesito que si el item_id existe, actualice
}

// Almacenar información de vendedor
function saveSellerData (sellerDataObject) {
  return new Promise((resolve, reject) => {
    connectorDbDashboard.query(`SELECT seller_id FROM ml_sellers WHERE seller_id = "${sellerDataObject.seller_id}"`, (err, result, filed) => {
      if (err) {
        console.log(' ####### Error al obtener seller_id de la base de datos.')
        reject(err)
      } else if (result.length > 0) {
        const query = `UPDATE ml_sellers 
        SET 
        nickname = "${sellerDataObject.nickname}",
        country_id = "${sellerDataObject.country_id}",
        first_name = "${sellerDataObject.first_name}",
        last_name = "${sellerDataObject.last_name}",
        email = "${sellerDataObject.email}",
        seller_experience = "${sellerDataObject.seller_experience}",
        total_transactions = ${sellerDataObject.total_transactions},
        completed_transactions = ${sellerDataObject.completed_transactions},
        canceled_transactions = ${sellerDataObject.canceled_transactions},
        reputation_level = ${sellerDataObject.reputation_level},
        positive_rating_transactions = ${sellerDataObject.positive_rating_transactions},
        negative_rating_transactions = ${sellerDataObject.negative_rating_transactions},
        neutral_rating_transactions = ${sellerDataObject.neutral_rating_transactions},
        seller_level_status = ${sellerDataObject.seller_level_status} 
        WHERE seller_id = "${sellerDataObject.seller_id}"`
        connectorDbDashboard.query(query, (err, result, filed) => {
          if (err) {
            console.log(' ####### Error al actualizar nickname del seller', sellerDataObject.seller_id)
            reject(err)
          }
          resolve(result)
          console.log('Seller actualizado con exito')
        })
      } else {
        console.log('No se ha encontrado el seller ' + sellerDataObject.seller_id + ' en la base de datos.')
        resolve(result)
      }
    })
  })
}

function saveOrderData (orderDataObject) {
  const sqlFind = `SELECT id FROM ml_orders WHERE order_id = '${orderDataObject.id}' AND item_id = '${orderDataObject.item_id}'`

  connectorDbDashboard.query(sqlFind, (error, result, filed) => {
    if (error) {
      console.error('Error obteniendo order existente', error)
    }

    if (result.length > 0) {
      updateOrderData(orderDataObject, result[0].id)
    } else {
      const sql = `
      INSERT INTO ml_orders (
        usuario,
        seller_id,
        date_closed,
        order_id,
        pack_id,
        shipping_id,
        shipping_mode,
        item_id,
        item_title,
        item_price,
        total_amount,
        item_quantity,
        buyer_id,
        buyer_nickname,
        buyer_first_name,
        buyer_last_name,
        billing_doc_type,
        billing_doc_number
      ) VALUES (
        ${orderDataObject.user},
        '${orderDataObject.seller_id}',
        '${orderDataObject.date_closed}',
        '${orderDataObject.id}',
        '${orderDataObject.pack_id}',
        '${orderDataObject.shipping_id}',
        '${orderDataObject.shipping_mode}',
        '${orderDataObject.item_id}',
        '${orderDataObject.item_title}',
        ${orderDataObject.item_price},
        ${orderDataObject.total_amount},
        ${orderDataObject.item_quantity},
        '${orderDataObject.buyer_id}',
        '${orderDataObject.buyer_nickname}',
        '${orderDataObject.buyer_first_name}',
        '${orderDataObject.buyer_last_name}',
        '${orderDataObject.billing_doc_type}',
        '${orderDataObject.billing_doc_number}'
      )
      `
      connectorDbDashboard.query(sql, (err, result, filed) => {
        if (err) {
          console.error(pc.red('Error en guardando orders'), err)
        }
        console.log('Order guardada.')
        console.log(result)
      })
    }
  })
}

function updateOrderData (orderDataObject, id) {
  const sql = `
  UPDATE ml_orders
  SET
    usuario = ${orderDataObject.user},
    seller_id = '${orderDataObject.seller_id}',
    date_closed = '${orderDataObject.date_closed}',
    pack_id = '${orderDataObject.pack_id}',
    shipping_id = '${orderDataObject.shipping_id}',
    shipping_mode = '${orderDataObject.shipping_mode}',
    item_id = '${orderDataObject.item_id}',
    item_title = '${orderDataObject.item_title}',
    item_price = ${orderDataObject.item_price},
    total_amount = ${orderDataObject.total_amount},
    item_quantity = ${orderDataObject.item_quantity},
    buyer_id = '${orderDataObject.buyer_id}',
    buyer_nickname = '${orderDataObject.buyer_nickname}',
    buyer_first_name = '${orderDataObject.buyer_first_name}',
    buyer_last_name = '${orderDataObject.buyer_last_name}',
    billing_doc_type = '${orderDataObject.billing_doc_type}',
    billing_doc_number = '${orderDataObject.billing_doc_number}'
  WHERE id = ${id}
  `

  connectorDbDashboard.query(sql, (error, result, filed) => {
    if (error) {
      console.error(pc.bgRed('Error actualizando order'))
    }
    console.log(pc.bgGreen('Order actualizada'))
  })
}

function saveShippingData (shippingDataObject, user) {
  const sql = `SELECT shipping_id FROM ml_shippings WHERE shipping_id = ${shippingDataObject.shipping_id} AND usuario = ${user}`

  connectorDbDashboard.query(sql, (err, result, filed) => {
    if (err) {
      console.log('Error al obtener id de shipping')
    }

    if (result.length > 0) {
      console.log(pc.yellow(`Ya existe el shipping ${shippingDataObject.shipping_id}`))
      updateShippingData(shippingDataObject, user)
    } else {
      const sqlInsert = `
      INSERT INTO ml_shippings (
        usuario,
        seller_id,
        shipping_id,
        state_id,
        state_name,
        status,
        date_created,
        country_id,
        country_name,
        city_name,
        lat,
        lon,
        address_line,
        base_cost) 
        VALUES (${shippingDataObject.usuario},
        "${shippingDataObject.seller_id}",
        "${shippingDataObject.shipping_id}",
        "${shippingDataObject.state_id}",
        "${shippingDataObject.state_name}",
        "${shippingDataObject.status}",
        "${shippingDataObject.date_created}",
        "${shippingDataObject.country_id}",
        "${shippingDataObject.country_name}",
        "${shippingDataObject.city_name}",
        "${shippingDataObject.lat}",
        "${shippingDataObject.long}",
        "${shippingDataObject.address_line}",
        ${shippingDataObject.base_cost})
      `
      connectorDbDashboard.query(sqlInsert, (err, result, filed) => {
        if (err) {
          console.error(pc.red('Error insertando shipping'))
          console.log(err)
        }
        console.log(pc.green(`Shipping ${shippingDataObject.shipping_id} insertado`))
      })
    }
  })
}

function updateShippingData (shippingDataObject, user) {
  const sql = `
    UPDATE ml_shippings
    SET
      usuario = ${shippingDataObject.usuario},
      seller_id = "${shippingDataObject.seller_id}",
      shipping_id = "${shippingDataObject.shipping_id}",
      state_id = "${shippingDataObject.state_id}",
      state_name = "${shippingDataObject.state_name}",
      status = "${shippingDataObject.status}",
      date_created = "${shippingDataObject.date_created}",
      country_id = "${shippingDataObject.country_id}",
      country_name = "${shippingDataObject.country_name}",
      city_name = "${shippingDataObject.city_name}",
      lat = "${shippingDataObject.lat}",
      lon = "${shippingDataObject.long}",
      address_line = "${shippingDataObject.address_line}",
      base_cost = ${shippingDataObject.base_cost}
    WHERE usuario = ${user} AND id = ${shippingDataObject.shipping_id}  
    `

  connectorDbDashboard.query(sql, (err, result, filed) => {
    if (err) {
      console.error(pc.red('Error actualizando shipping'))
      throw err
    }
    console.log(pc.green(`Shipping ${shippingDataObject.shipping_id} actualizado`))
  })
}

// Exportaciones
module.exports = {
  connectDbDashboard: connectorDbDashboard,
  connectDb,
  saveUserData,
  savePublication,
  updateUserData,
  saveSellerData,
  saveOrderData,
  saveShippingData
}
