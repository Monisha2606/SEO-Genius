import { google } from 'googleapis'

export function getSearchConsoleClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({ access_token: accessToken })

  return google.searchconsole({ version: 'v1', auth })
}

export async function fetchSiteList(accessToken: string) {
  const sc = getSearchConsoleClient(accessToken)
  const res = await sc.sites.list()
  return res.data.siteEntry || []
}

export async function fetchSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit = 1000
) {
  const sc = getSearchConsoleClient(accessToken)
  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit,
      dataState: 'all',
    },
  })
  return res.data.rows || []
}

export async function fetchIndexingStatus(accessToken: string, siteUrl: string) {
  const sc = getSearchConsoleClient(accessToken)
  try {
    const res = await sc.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: siteUrl,
        siteUrl,
      },
    })
    return res.data
  } catch {
    return null
  }
}

export async function fetchSitemaps(accessToken: string, siteUrl: string) {
  const sc = getSearchConsoleClient(accessToken)
  try {
    const res = await sc.sitemaps.list({ siteUrl })
    return res.data.sitemap || []
  } catch {
    return []
  }
}

export function getDateRange(days: number) {
  const end = new Date()
  end.setDate(end.getDate() - 3) // GSC has ~3 day delay
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

export function calculateCTR(clicks: number, impressions: number) {
  if (impressions === 0) return 0
  return (clicks / impressions) * 100
}

export function calculateDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}
