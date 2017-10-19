import { FormSubmitAction, Site } from '../../models'
import { SiteFormSubmitService } from '../../services'
import { IMessageHandler } from '../IMessageHandler'

export class FormActionHandler implements IMessageHandler {
  public get priority(): number {
    return 0
  }

  public handle(message: object): Promise<object> {
    const site = message as Site
    const service = new SiteFormSubmitService()
    return service.scrape(site)
  }

  public handles(message: object): boolean {
    try {
      const site = message as Site
      return site.definition.form.submit.action === FormSubmitAction.FormAction
    } catch {
      return false
    }
  }
}
