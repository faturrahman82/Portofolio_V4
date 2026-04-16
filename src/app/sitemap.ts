import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourportfolio.vercel.app'
  
  // Rute bahasa yang didukung
  const locales = ['en', 'id']
  
  // Halaman utama
  const routes = ['', '/projects', '/resume.pdf']
  
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Generate sitemap untuk setiap rute di setiap bahasa
  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.8,
      })
    })
  })

  // Tambahkan root base statis tanpa locale
  sitemapEntries.push({
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  })

  return sitemapEntries
}
