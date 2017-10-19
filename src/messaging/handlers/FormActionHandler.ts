import { IMessageHandler } from '../IMessageHandler'
import { FormSubmitAction, Site } from '../../models'
import { SiteFormSubmitService } from '../../services'

export class FormActionHandler implements IMessageHandler {
  public get priority(): number {
    return 0
  }

  public handle(message: object): Promise<object> {
    const site = <Site>message
    const service = new SiteFormSubmitService()
    return service.scrape(site)
  }

  public handles(message: object): boolean {
    try {
      const site = <Site>message
      return site.definition.form.submit.action === FormSubmitAction.FormAction
    } catch {
      return false
    }
  }
}
