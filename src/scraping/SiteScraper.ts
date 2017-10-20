import axios from 'axios'
import * as cheerio from 'cheerio'

import { FormField, FormSubmitAction, MappingSource, ScrapeResult, Site, SiteResult, SiteResultSelection } from '../models'
import { RabbitQueue } from '../queue'

const fvalue = (field: FormField): string => {
  return field.mapping.value ? field.mapping.value : ''
}

const siteurl = (site: Site): string => {
  let baseurl = site.url

  if (site.definition.form.submit.url) {
    baseurl = site.definition.form.submit.url
  }

  const query = site.definition.form.fields
    .map((field: FormField): string => `${field.name}=${fvalue(field)}`)
    .join('&')

  return `${baseurl}?${query}`
}

const ScrapeFormAction = async (site: Site): Promise<SiteResult> => {
  try {
    const result = new SiteResult()
    const submiturl = site.definition.form.submit.url
    const url = siteurl(site)
    const response = await axios(url)
    const html = cheerio.load(response.data)

    site.definition.form.selectors.forEach((selector): void => {
      const selections = html(selector.selector)
      const selection = new SiteResultSelection()
      selection.html = selections.toArray().map(element => html(element).html().trim())
      selection.name = selector.name
      result.selections.push(selection)
    })

    console.log(result)
    return result
  } catch (error) {
    return Promise.reject(error)
  }
}

const ScrapeFormActionPost = (site: Site): Promise<SiteResult> => {
  return Promise.resolve(new SiteResult())
}

const ScrapeJavascript = (site: Site): Promise<SiteResult> => {
  return Promise.resolve(new SiteResult())
}

export const SiteScraper = async (site: Site, queue: RabbitQueue<ScrapeResult>): Promise<ScrapeResult> => {
  const action = site.definition.form.submit.action
  let result: SiteResult | null = null

  switch (action) {
    case FormSubmitAction.FormAction:
      result = await ScrapeFormAction(site)
      break

    case FormSubmitAction.FormActionPost:
      result = await ScrapeFormActionPost(site)
      break

    case FormSubmitAction.Javascript:
      result = await ScrapeJavascript(site)
      break

    default:
      throw new Error(`Invalid FormSubmitAction, ${action}`)
  }

  const scrape = new ScrapeResult()
  scrape.results = result
  scrape.site = site
  queue.publish(scrape)
  return scrape
}
