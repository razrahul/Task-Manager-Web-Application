import { useEffect, useState } from "react";

const initialFormState = {
  title: "",
  description: "",
  status: "pending",
};

function TaskForm({ mode = "create", initialValues, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || "",
        description: initialValues.description || "",
        status: initialValues.status || "pending",
      });
      return;
    }

    setFormData(initialFormState);
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.title.trim().length < 3) {
      setFormError("Title must be at least 3 characters long.");
      return;
    }

    if (formData.description.length > 500) {
      setFormError("Description cannot exceed 500 characters.");
      return;
    }

    setFormError("");
    await onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
    });

    if (mode === "create") {
      setFormData(initialFormState);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel space-y-5 p-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
          {mode === "create" ? "Create Task" : "Edit Task"}
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          {mode === "create" ? "Plan your next move" : "Refine your task details"}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={`${mode}-title`} className="mb-2 block text-sm font-medium">
            Title
          </label>
          <input
            id={`${mode}-title`}
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label htmlFor={`${mode}-description`} className="mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            id={`${mode}-description`}
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="input resize-none"
            placeholder="Describe the task"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {formData.description.length}/500 characters
          </p>
        </div>

        <div>
          <label htmlFor={`${mode}-status`} className="mb-2 block text-sm font-medium">
            Status
          </label>
          <select
            id={`${mode}-status`}
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {(formError || mode === "edit") && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          {formError || "Update the task and save your changes."}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Add Task"
              : "Save Changes"}
        </button>
        {mode === "edit" && (
          <button type="button" className="button-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
