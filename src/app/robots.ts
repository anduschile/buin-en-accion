import { MetadataRoute } from 'next'
import { tenant } from '@/config/tenant'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/',
        },
        sitemap: `https://${tenant.domainProd}/sitemap.xml`,
    }
}
