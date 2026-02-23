import { tenant } from '@/config/tenant'

const p = tenant.tablePrefix

export const TABLES = {
    items: `${p}items`,
    votes: `${p}votes`,
    categories: `${p}categories`,
    profiles: `${p}profiles`,
    updates: `${p}updates`,
    reports: `${p}reports`,
    report_updates: `${p}report_updates`,
}
