import { Answers, createPromptModule, Questions } from 'inquirer'

import { FileLog, Logger } from './logging'

const log = Logger.extend('cli')

enum Command {
  Module = 'module',
  Run = 'run'
}

enum Module {
  Logging = 'logging'
}

const commands: Questions = [{
  choices: [Command.Module, Command.Run],
  default: Command.Run,
  message: `Command: [${Object.keys(Command).join(', ')}]`,
  name: 'command',
  type: 'input'
}]

const modules: Questions = [{
  choices: [Module.Logging],
  default: Module.Logging,
  message: `Module: [${Object.keys(Module).join(', ')}]`,
  name: 'module',
  type: 'input'
}]

const prompt = createPromptModule()

const logging = (): FileLog => {
  return new FileLog()
}

const handleCommands = (answers: Answers): Promise<Answers> => {
  // tslint:disable-next-line:no-string-literal
  const command = answers['command']

  switch (command) {
    case Command.Module:
      return prompt(modules)

    case Command.Run:
      return prompt(modules)
  }

  return Promise.resolve(answers)
}

const handleModules = (answers: Answers): Promise<Answers> => {
  // tslint:disable-next-line:no-string-literal
  const module = answers['module']

  switch (module) {
    case Module.Logging:
      logging()
      break;
  }

  return Promise.resolve(answers)
}

prompt(commands).then(handleCommands)
