import * as cluster from 'cluster'
import * as os from 'os'
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
  const logpath = cl('cityscraper').app.local()
  const logfile = process.argv.length === 3
    ? path.join(logpath, process.argv[2])
    : path.join(logpath, `cityscraper-${process.pid}.log`)

  const options = { encoding: 'utf8', flags: 'a+' }
  const stream = fs.createWriteStream(logfile, options)
  process.on('exit', () => stream.close())

  Promise.resolve(true).then(async () => {
    const log = Logger.extend('logging')
    const queue = await Rabbit.queue<Log>('logging')

    if (fs.existsSync(logpath) === false) {
      fs.mkdirSync(logpath)
    }

    queue.message((body: Log, properties: any): Promise<any> => {
      const json = JSON.stringify(body)
      const buffer = new Buffer(json, 'utf8')

      return new Promise<any>((resolve, reject) => {
        console.log('logging', json)
        stream.write(buffer, () => resolve())
      })
    })
  }).catch((error) => {
    console.log(error)
    process.exit(1)
  })

}
