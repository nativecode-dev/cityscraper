import * as cluster from 'cluster'
import { DebugLine, Logger } from './logging'
import { Site } from './models'
import { Rabbit, RabbitQueue } from './queue'
import { SiteScraper } from './scraping'

if (cluster.isMaster && process.env.NODE_ENV !== 'debug') {

  console.log(`master process ${process.pid}`)
  cluster.fork()
  cluster.on('exit', () => cluster.fork())

} else if (cluster.isWorker || process.env.NODE_ENV === 'debug') {

  console.log(`worker process ${process.pid}`)
  Promise.resolve(true).then(async () => {
    const id = `scraper:${process.pid}`
    const log = Logger.extend('scraping')
    const queue = await Rabbit.inbox<Site>('scraping')

    queue.message(async (body: Site, properties: any): Promise<any> => {
      console.log('message', body)
      const result = await SiteScraper(body)
      log.debug('processed', body, result)
      return result
    })
  }).catch((error) => {
    console.log(error)
    process.exit(1)
  })

}
