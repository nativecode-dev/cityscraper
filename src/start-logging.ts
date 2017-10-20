import * as cluster from 'cluster'
import * as os from 'os'
import { Lincoln, Log } from '@nofrills/lincoln'
import { Connection } from 'amqp-ts'
import { Rabbit, RabbitQueue } from './queue'
import { DebugLine, DebugLog, Logger } from './index'

import * as fs from 'fs'
import * as path from 'path'

if (cluster.isMaster && process.env.NODE_ENV !== 'debug') {

  console.log(`master process ${process.pid}`)
  cluster.fork()
  cluster.on('exit', () => cluster.fork())

} else if (cluster.isWorker || process.env.NODE_ENV === 'debug') {

  console.log(`worker process ${process.pid}`)
  const logpath = path.join(process.cwd(), 'logs')
  const logfile = process.argv.length === 3
    ? path.join(logpath, process.argv[2])
    : path.join(logpath, `cityscraper-${process.pid}.log`)

  if (fs.existsSync(logpath) === false) {
    fs.mkdirSync(logpath)
  }

  const options = { encoding: 'utf8', flags: 'a+' }
  const stream = fs.createWriteStream(logfile, options)

  Promise.resolve(Rabbit.initialized).then(async () => {
    const log = Logger.extend('logging')
    const queue = await Rabbit.queue<Log>('logging')

    queue.message((body: Log, properties: any): Promise<any> => {
      const json = JSON.stringify(body)
      const buffer = new Buffer(json, 'utf8')

      return new Promise<any>((resolve, reject) => {
        console.log('logging', json)
        stream.write(buffer, () => resolve())
      })
    })

    process.on('exit', () => {
      stream.close()
      queue.close()
    })
  }).catch((error) => {
    console.log(error)
    process.exit(1)
  })

}
