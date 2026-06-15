/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.ks25.my.id', // pakai www karena ini domain canonical kamu
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' }
    ],
    additionalSitemaps: [
      'https://www.ks25.my.id/sitemap.xml'
    ],
  },
}