/**
 * SIMPLE EXAMPLE - Copy this to understand the basics
 *
 * This shows the simplest way to query MongoDB in AdonisJS using adonisjs-mongoose
 */

import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'
import type { HttpContext } from '@adonisjs/core/http'

// ============================================
// 1. CREATE YOUR MODEL
// ============================================
class Task extends BaseModel {
  static collectionName = 'tasks'

  static schema = new Schema(
    {
      title: { type: String, required: true },
      completed: { type: Boolean, default: false },
      dueDate: Date,
    },
    {
      timestamps: true,
    }
  )
}

// ============================================
// 2. USE IN CONTROLLER
// ============================================
export default class TasksController {
  // GET /tasks - List all tasks
  async index({ response }: HttpContext) {
    const tasks = await Task.find()
    return response.json(tasks)
  }

  // POST /tasks - Create task
  async store({ request, response }: HttpContext) {
    const task = await Task.create({
      title: request.input('title'),
      completed: false,
    })
    return response.created(task)
  }

  // PUT /tasks/:id - Update task
  async update({ params, request, response }: HttpContext) {
    const task = await Task.findByIdAndUpdate(params.id, { completed: true }, { new: true })
    return response.json(task)
  }

  // DELETE /tasks/:id - Delete task
  async destroy({ params, response }: HttpContext) {
    await Task.findByIdAndDelete(params.id)
    return response.json({ message: 'Task deleted' })
  }
}

// ============================================
// 3. ADD ROUTES (in start/routes.ts)
// ============================================
/*
import router from '@adonisjs/core/services/router'
const TasksController = () => import('#controllers/tasks_controller')

router.get('/tasks', [TasksController, 'index'])
router.post('/tasks', [TasksController, 'store'])
router.put('/tasks/:id', [TasksController, 'update'])
router.delete('/tasks/:id', [TasksController, 'destroy'])
*/

// ============================================
// THAT'S IT! 🎉
// ============================================
// Now you can:
// - GET http://localhost:3333/tasks
// - POST http://localhost:3333/tasks with {"title": "My Task"}
// - PUT http://localhost:3333/tasks/123
// - DELETE http://localhost:3333/tasks/123
