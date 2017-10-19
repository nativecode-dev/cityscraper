import { Lincoln, Log } from '@nofrills/lincoln'
import { Connection } from 'amqp-ts'
import { Rabbit, RabbitQueue } from '../queue'
import { DebugLine, DebugOutput, Logger } from './index'

import * as cl from 'common-locations'
import * as fs from 'fs'
import * as path from 'path'

export class FileLog {
  private readonly log: Lincoln
  private readonly queue: RabbitQueue<Log>

  constructor() {
    this.log = Logger.extend('FileLog')
    this.queue = Rabbit.pubsub<Log>('logging')

    const logpath = cl('cityscraper').home()
    const logfile = path.join(logpath, `cityscraper-${process.pid}.log`)

    if (fs.existsSync(logpath) === false) {
      fs.mkdirSync(logpath)
    }

    this.queue.message((body: Log, properties: any): Promise<Log> => {
      return new Promise<Log>((resolve, reject) => {
        const json = JSON.stringify(body)
        fs.appendFile(logfile, new Buffer(`${json},\n`), (error) => {
          if (error) {
            reject(error)
          }

          DebugOutput(body)
          resolve(body)
        })
      })
    })

    this.queue.configured.then(() => this.log.debug('file logging started'))
  }

  public stop(): void {
    this.queue.close()
  }
}
