import { Site, SiteResult } from '../models'

export const SiteScraper = (site: Site): Promise<SiteResult> => {
  return Promise.resolve(new SiteResult())
}
