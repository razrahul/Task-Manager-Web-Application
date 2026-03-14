import { useEffect, useMemo, useState } from "react";

import DarkModeToggle from "../components/DarkModeToggle";
import Pagination from "../components/Pagination";
import TaskCard from "../components/TaskCard";
import TaskFilter from "../components/TaskFilter";
import TaskForm from "../components/TaskForm";
import TaskSearch from "../components/TaskSearch";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../services/taskApi";

const DEFAULT_LIMIT = 6;
const THEME_STORAGE_KEY = "task-manager-theme";

function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingTaskId, setIsDeletingTaskId] = useState(null);
  const [isTogglingTaskId, setIsTogglingTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(THEME_STORAGE_KEY)
        : null;
    return stored ? stored === "dark" : false;
  });

  const fetchTasks = async ({
    page: targetPage = page,
    search = debouncedSearchTerm,
    status = statusFilter,
    signal,
  } = {}) => {
    const response = await getTasks(
      {
        search: search || undefined,
        status: status || undefined,
        page: targetPage,
        limit: DEFAULT_LIMIT,
      },
      signal ? { signal } : undefined
    );

    setTasks(response.data);
    setTotal(response.total);
    return response;
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const controller = new AbortController();

    const loadTasks = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        await fetchTasks({ signal: controller.signal });
      } catch (error) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
          return;
        }

        const apiMessage =
          error.response?.data?.message || "Unable to load tasks right now.";
        setErrorMessage(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();

    return () => controller.abort();
  }, [debouncedSearchTerm, page, statusFilter]);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setNotification(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_LIMIT));

  const dashboardStats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === "completed").length;
    const pending = tasks.filter((task) => task.status === "pending").length;
    return { completed, pending };
  }, [tasks]);

  const refreshCurrentPage = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetchTasks();

      if (response.data.length === 0 && page > 1) {
        setPage((currentPage) => Math.max(currentPage - 1, 1));
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to refresh tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (payload) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await createTask(payload);
      setNotification({ type: "success", message: "Task created successfully." });
      if (page !== 1) {
        setPage(1);
      } else {
        await fetchTasks({ page: 1 });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Task creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = async (task) => {
    try {
      const response = await getTaskById(task.id);
      setSelectedTask(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to load task details.");
    }
  };

  const handleUpdateTask = async (payload) => {
    if (!selectedTask) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await updateTask(selectedTask.id, payload);
      setNotification({ type: "success", message: "Task updated successfully." });
      setSelectedTask(null);
      await refreshCurrentPage();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Task update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusToggle = async (task) => {
    setIsTogglingTaskId(task.id);
    setErrorMessage("");

    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description || "",
        status: task.status === "completed" ? "pending" : "completed",
      });
      setNotification({
        type: "success",
        message:
          task.status === "completed"
            ? "Task moved back to pending."
            : "Task marked as completed.",
      });

      if (selectedTask?.id === task.id) {
        setSelectedTask((current) =>
          current
            ? {
                ...current,
                status: current.status === "completed" ? "pending" : "completed",
              }
            : current
        );
      }

      await refreshCurrentPage();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Task status update failed.");
    } finally {
      setIsTogglingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setIsDeletingTaskId(taskId);
    setErrorMessage("");
    try {
      await deleteTask(taskId);
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
      setNotification({ type: "success", message: "Task deleted successfully." });
      await refreshCurrentPage();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Task deletion failed.");
    } finally {
      setIsDeletingTaskId(null);
    }
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-300">
                Quess Corp Assignment
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Task Manager Web Application
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                Build, manage, update, search, filter, and track tasks with a clean full-stack interface using React, FastAPI, MySQL, and Tailwind CSS.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Theme
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {isDarkMode ? "Dark mode" : "Light mode"}
                </p>
              </div>
              <DarkModeToggle
                isDarkMode={isDarkMode}
                onToggle={() => setIsDarkMode((current) => !current)}
              />
            </div>
          </div>

          <div className="mx-auto grid gap-4 sm:grid-cols-3 lg:max-w-[560px]">
            <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white dark:bg-brand-500">
              <p className="text-sm text-white/70">Visible tasks</p>
              <p className="mt-2 text-3xl font-semibold">{tasks.length}</p>
            </div>
            <div className="rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
              <p className="mt-2 text-3xl font-semibold">{dashboardStats.pending}</p>
            </div>
            <div className="rounded-3xl bg-brand-100 px-5 py-4 text-brand-900 dark:bg-slate-900 dark:text-brand-200">
              <p className="text-sm opacity-80">Completed</p>
              <p className="mt-2 text-3xl font-semibold">{dashboardStats.completed}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_2.05fr]">
        <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          <TaskForm
            mode="create"
            onSubmit={handleCreateTask}
            isSubmitting={isSubmitting}
          />
        </div>

        <section className="space-y-6">
          <div className="panel p-5">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
              <TaskSearch value={searchTerm} onChange={setSearchTerm} />
              <TaskFilter value={statusFilter} onChange={handleStatusChange} />
            </div>
          </div>

          {notification && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200">
              {notification.message}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="panel h-60 animate-pulse bg-white/60 p-5 dark:bg-slate-900/60"
                />
              ))
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTask}
                  onToggleStatus={handleQuickStatusToggle}
                  isDeleting={isDeletingTaskId === task.id}
                  isToggling={isTogglingTaskId === task.id}
                />
              ))
            ) : (
              <div className="panel col-span-full p-10 text-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  No tasks found
                </h2>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Try a different search term or status filter, or add a fresh task to get
                  started.
                </p>
              </div>
            )}
          </div>

          <div className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing page {page} of {totalPages} with {total} total tasks.
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </section>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={() => setSelectedTask(null)}
            >
              Close
            </button>
            <TaskForm
              mode="edit"
              initialValues={selectedTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setSelectedTask(null)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDashboard;
