import connectDB from '../db/mongodb';
import Task, { ITask } from '../db/models/Task';
import { CreateTaskInput, UpdateTaskInput } from '../validations/task';
import mongoose from 'mongoose';

export class TasksService {
  /**
   * Get all tasks for a user
   */
  static async getUserTasks(userId: string): Promise<ITask[]> {
    await connectDB();

    const tasks = await Task.find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return tasks;
  }

  /**
   * Get a single task by ID (with authorization check)
   */
  static async getTaskById(
    taskId: string,
    userId: string
  ): Promise<ITask | null> {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const task = await Task.findOne({
      _id: taskId,
      userId,
    })
      .lean()
      .exec();

    return task;
  }

  /**
   * Create a new task
   */
  static async createTask(
    data: CreateTaskInput,
    userId: string
  ): Promise<ITask> {
    await connectDB();

    const task = await Task.create({
      ...data,
      userId,
    });

    return task;
  }

  /**
   * Update a task (with authorization check)
   */
  static async updateTask(
    taskId: string,
    data: UpdateTaskInput,
    userId: string
  ): Promise<ITask | null> {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    // Find task and verify ownership
    const task = await Task.findOne({
      _id: taskId,
      userId,
    });

    if (!task) {
      throw new Error('Task not found or unauthorized');
    }

    // Update task
    Object.assign(task, data);
    await task.save();

    return task;
  }

  /**
   * Delete a task (with authorization check)
   */
  static async deleteTask(
    taskId: string,
    userId: string
  ): Promise<boolean> {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const result = await Task.deleteOne({
      _id: taskId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new Error('Task not found or unauthorized');
    }

    return true;
  }

  /**
   * Get task statistics for a user
   */
  static async getTaskStats(userId: string): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  }> {
    await connectDB();

    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      if (stat._id === 'todo') result.todo = stat.count;
      if (stat._id === 'in_progress') result.inProgress = stat.count;
      if (stat._id === 'done') result.done = stat.count;
    });

    return result;
  }
}
