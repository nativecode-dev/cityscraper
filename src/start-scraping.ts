import * as cluster from 'cluster'
import { DebugLine, Logger } from './logging'
import { ScrapeResult, Site, SiteResult } from './models'
import { Rabbit, RabbitQueue } from './queue'
import { SiteScraper } from './scraping'

if (cluster.isMaster && process.env.NODE_ENV !== 'debug') {

  console.log(`master process ${process.pid}`)
  cluster.fork()
  cluster.on('exit', () => cluster.fork())

} else if (cluster.isWorker || process.env.NODE_ENV === 'debug') {

  console.log(`worker process ${process.pid}`)
  Promise.resolve(Rabbit.initialized).then(async () => {
    const log = Logger.extend('start-scraping')
    const queue = await Rabbit.queue<Site>('scraping')
    const results = await Rabbit.queue<ScrapeResult>('scraping-results')

    queue.message(async (body: Site, properties: any): Promise<any> => {
      const result = await SiteScraper(body, results)
      log.debug('processed', body, result)
      return result
    })

    process.on('exit', () => {
      queue.close()
      results.close()
    })
  }).catch((error) => {
    console.log(error)
    process.exit(1)
  })

}
