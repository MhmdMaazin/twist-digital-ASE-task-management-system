'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { tasksAPI } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TaskList from '@/components/dashboard/TaskList';
import TaskForm from '@/components/dashboard/TaskForm';
import StatsCards from '@/components/dashboard/StatsCards';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchTasks();
      fetchStats();
    }
  }, [user, authLoading, router]);

  const fetchTasks = async () => {
    try {
      const data: any = await tasksAPI.getAll();
      setTasks(data.tasks);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data: any = await tasksAPI.getStats();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await tasksAPI.create(taskData);
      await fetchTasks();
      await fetchStats();
      setIsFormOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;
    try {
      await tasksAPI.update(editingTask._id, taskData);
      await fetchTasks();
      await fetchStats();
      setEditingTask(null);
      setIsFormOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      await fetchTasks();
      await fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              <span className="text-primary">TWI</span>
              <span className="text-accent">S</span>
              <span className="text-primary">T</span>
              <span className="text-muted-foreground text-xxl ml-1">DIGITAL</span>
              <span className="text-foreground text-base block mt-1">Task Management System</span>
            </h1>
            <p className="text-sm text-foreground/70 mt-1">Welcome, {user.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="font-semibold">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        {stats && <StatsCards stats={stats} />}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Your Tasks</h2>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="font-semibold bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all"
          >
            Create Task
          </Button>
        </div>

        {/* Task Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskForm
                  task={editingTask}
                  onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingTask(null);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Task List */}
        <div className="mt-6">
          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDeleteTask}
          />
        </div>
      </main>
    </div>
  );
}
