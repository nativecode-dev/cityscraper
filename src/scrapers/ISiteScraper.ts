import { Site, SiteResult } from '../models'

export interface ISiteScraper {
  scrape(site: Site): Promise<SiteResult>
}
