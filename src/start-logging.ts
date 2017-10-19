import * as cluster from 'cluster'
import { Lincoln, Log } from '@nofrills/lincoln'
import { Connection } from 'amqp-ts'
import { Rabbit, RabbitQueue } from './queue'
import { DebugLine, DebugLog, Logger } from './index'

import * as cl from 'common-locations'
import * as fs from 'fs'
import * as path from 'path'

if (cluster.isMaster && process.env.NODE_ENV !== 'debug') {
  console.log(`master process ${process.pid}`)
  cluster.fork()
  cluster.on('exit', () => cluster.fork())
} else if (cluster.isWorker || process.env.NODE_ENV === 'debug') {
  console.log(`worker process ${process.pid}`)
  Promise.resolve(true).then(async () => {
    const logpath = cl('cityscraper').app.local()
    let logfile = path.join(logpath, `cityscraper-${process.pid}.log`)

    if (process.argv.length === 3) {
      logfile = path.join(logpath, process.argv[2])
    }

    const log = Logger.extend('logging')
    const queue = await Rabbit.queue<Log>('logging')

    let newfile = true

    if (fs.existsSync(logpath) === false) {
      fs.mkdirSync(logpath)
    }

    queue.message((body: Log, properties: any): Promise<any> => {
      console.log('logging', body)
      const json = JSON.stringify(body)
      const separator = newfile ? '' : ',\n'

      return new Promise<any>((resolve, reject) => {
        fs.appendFile(logfile, new Buffer(`${separator}${json}`), (error) => {
          if (error) {
            reject(error)
            return
          }

          DebugLog(body)
          resolve(body)
        })
        newfile = false
      })
    })
  }).catch((error) => {
    console.log(error)
    process.exit(1)
  })
}
