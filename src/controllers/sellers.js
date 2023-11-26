const pc = require('picocolors')

const { checkSellerData } = require('../services/seller/checkSellerData.js')
const getSellersUserService = require('../services/seller/getSellersUserFromBD.js')
const { getSellerPublications } = require('../services/publication/getSellerPublications.js')

async function getSellersByUser (req, res) {
  // Obtenemos perfiles del usuario que inició sesión
  const profiles = await getSellersUserService.getSellers(req.session.user)

  const profilesNicknames = profiles.map((profile) => {
    return {
      sellerId: profile.seller_id,
      nickname: profile.nickname
    }
  })

  req.session.sellers = [...profilesNicknames]

  console.log(pc.bgBlue('Profiles obtenidos: '), profilesNicknames)

  res.render('dashboard.ejs', {
    sellers: profilesNicknames,
    message: '',
    username: req.session.username
  })
}

async function getSeller (req, res) {
  req.session.seller_id = req.query.seller_id
  req.session.nickname = req.query.nickname
  console.log('Session seller:', req.session.seller_id, 'Session nickname:', req.session.nickname)

  const result = await checkSellerData(req.session.seller_id, req.session.user)

  if (result.check) {
    res.render('index.ejs', { state: req.session.nickname })
  } else {
    res.render('index.ejs', { state: req.session.nickname, message: 'Error comprobando el usuario' })
  }
}

async function getPublications (req, res) {
  const publications = await getSellerPublications(req.session.seller_id)
  console.log(publications)
  res.json({ publications })
}

module.exports = {
  getSeller,
  getSellersByUser,
  getPublications
}
