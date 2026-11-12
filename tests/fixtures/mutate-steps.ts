import { openDatabase } from '../../server/db/database'
import { taskRepository, TaskHasSteps, MissingTask } from '../../server/domain/tasks'
import { stepRepository } from '../../server/domain/task-steps'
const connection = openDatabase(process.argv[2]!)
process.send?.('ready')
process.once('message', () => {
  try {
    if (process.argv[4] === 'add') stepRepository(connection).create(process.argv[3], { title: 'A' })
    else if (process.argv[4] === 'complete') taskRepository(connection).update(process.argv[3], { completed: true })
    else taskRepository(connection).remove(process.argv[3])
    process.send?.('ok')
  }
  catch (error) {
    if (error instanceof TaskHasSteps) process.send?.('has-steps')
    else if (error instanceof MissingTask) process.send?.('missing')
    else throw error
  }
  finally { connection.close(); process.disconnect() }
})
