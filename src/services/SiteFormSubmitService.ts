import * as URL from 'url'

import { FormField, FormResult, MappingSource, Site } from '../models'
import { ISiteScraper } from './ISiteScraper'

export class SiteFormSubmitService implements ISiteScraper {
  public scrape(site: Site): Promise<FormResult> {
    if (site.definition.form.submit.url) {
      const url: URL.Url = URL.parse(site.definition.form.submit.url)
      url.query = '?' + site.definition.form.fields
        .filter((field: FormField) => field.mapping.source === MappingSource.String)
        .map((field: FormField) => `${encodeURIComponent(field.name)}=${(field.mapping.value || '')}`)
        .join('&')
    }

    return Promise.resolve(new FormResult())
  }
}
