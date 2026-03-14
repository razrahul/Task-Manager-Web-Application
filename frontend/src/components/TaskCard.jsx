function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting,
  isToggling,
}) {
  const isCompleted = task.status === "completed";
  const badgeClass = isCompleted
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";

  return (
    <article className="panel flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{task.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Created {formatDate(task.created_at)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClass}`}>
          {task.status}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {task.description || "No description provided for this task yet."}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button type="button" className="button-secondary" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button
          type="button"
          className={
            isCompleted
              ? "rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
              : "rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          }
          onClick={() => onToggleStatus(task)}
          disabled={isToggling}
        >
          {isToggling ? "Updating..." : isCompleted ? "Mark Pending" : "Mark Complete"}
        </button>
        <button
          type="button"
          className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onDelete(task.id)}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
