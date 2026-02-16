'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { tasksAPI } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TaskList from '@/components/dashboard/TaskList';
import TaskForm from '@/components/dashboard/TaskForm';
import StatsCards from '@/components/dashboard/StatsCards';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
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

  // Derived filtered + sorted tasks
  const filteredTasks = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    let list = (tasks || []).slice();

    if (q.length > 0) {
      list = list.filter((t) => {
        const title = String(t.title || '').toLowerCase();
        const desc = String(t.description || '').toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }

    if (statusFilter) {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter) {
      list = list.filter((t) => t.priority === priorityFilter);
    }

    // Sorting
    list.sort((a, b) => {
      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();
      const updatedA = new Date(a.updatedAt || a.createdAt).getTime();
      const updatedB = new Date(b.updatedAt || b.createdAt).getTime();

      switch (sortBy) {
        case 'created_asc':
          return createdA - createdB;
        case 'created_desc':
          return createdB - createdA;
        case 'updated_asc':
          return updatedA - updatedB;
        case 'updated_desc':
          return updatedB - updatedA;
        default:
          return createdB - createdA;
      }
    });

    return list;
  }, [tasks, search, statusFilter, priorityFilter, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setSortBy('created_desc');
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
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-xl font-bold text-foreground whitespace-nowrap">Your Tasks</h2>
            <div className="ml-0 sm:ml-4 flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <Input
                id="search"
                placeholder="Search by title or description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full sm:w-64"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Filter by priority"
              >
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Sort tasks"
              >
                <option value="created_desc">Newest</option>
                <option value="created_asc">Oldest</option>
                <option value="updated_desc">Recently updated</option>
                <option value="updated_asc">Least recently updated</option>
              </select>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={clearFilters} className="ml-0 sm:ml-1 h-10">
                  Clear
                </Button>
              </div>
            </div>
          </div>

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
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEdit}
            onDelete={handleDeleteTask}
          />
        </div>
      </main>
    </div>
  );
}
