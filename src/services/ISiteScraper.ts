import { FormResult, Site } from '../models'

export interface ISiteScraper {
  scrape(site: Site): Promise<FormResult>
}
