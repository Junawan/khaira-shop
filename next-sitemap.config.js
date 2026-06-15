/** @type {import('next-sitemap').IConfig} */
const admin = require('firebase-admin')

// Init firebase-admin pakai service account
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // private key harus di-replace \n jadi enter beneran
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  })
}

const db = admin.firestore()

module.exports = {
  siteUrl: 'https://www.ks25.my.id',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/account/*', '/cart', '/checkout', '/login*', '/register'],
  
  additionalPaths: async () => {
    const snapshot = await db.collection('products').get() // ganti 'products' sesuai nama collection kamu
    
    const paths = []
    snapshot.forEach(doc => {
      const data = doc.data()
      paths.push({
        loc: `/product/${data.slug}`, // pastikan field slug ada di Firestore
        lastmod: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.9
      })
    })
    
    return paths
  }
}