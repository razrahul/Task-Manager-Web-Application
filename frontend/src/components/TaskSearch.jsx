function TaskSearch({ value, onChange }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="input"
      placeholder="Search tasks by title or description"
      aria-label="Search tasks"
    />
  );
}

export default TaskSearch;
