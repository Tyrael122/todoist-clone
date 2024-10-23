// TODO: Move to file
export type Task = {
  id: number,
} & TaskData

export type TaskData = {
  title: string,
  description: string,
  priority: number,
}

function Homepage() {
  const tasks = [
    { id: 0, title: "Praticar desenvolvimento front end", description: "wmfowm", priority: 2 },
    { id: 1, title: "Fazer 100 push-ups", description: "", priority: 2 },
    { id: 2, title: "Read 10 pages of Network book", description: "", priority: 3 }
  ]

  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-5/6 max-w-3xl mx-14 mt-16 gap-y-10">
        <div className="flex flex-col">
          <span className="font-bold text-4xl">Today</span>
          <span>3 tasks</span>
        </div>

        <div className="flex flex-col gap-y-3">
          {tasks.map((task) => {
            return <TaskRow task={task} />;
          })}
        </div>
      </div>
    </div>
  );
}

type TaskRowProps = {
} & SimpleTaskProps

export type SimpleTaskProps = {
  task: Task
}

function TaskRow({ task }: TaskRowProps) {
  return (
    <div className="flex flex-col justify-between border-b pb-2">
      <div className="flex gap-x-3">
        <Checkbox />

        <div className="flex flex-col">
          <span>{task.title}</span>

          <span>{task.description}</span>
        </div>
      </div>
    </div>
  );
}

// TODO: Move to file
export function Checkbox() {
  return <button className="rounded-full bg-yellow-200 ring-2 ring-yellow-500 size-5 min-h-5 min-w-5 hover:bg-yellow-500" />;
}

export default Homepage