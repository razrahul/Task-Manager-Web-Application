function TaskFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="input"
      aria-label="Filter tasks by status"
    >
      <option value="">All statuses</option>
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
    </select>
  );
}

export default TaskFilter;
