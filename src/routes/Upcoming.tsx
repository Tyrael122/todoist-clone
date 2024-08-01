import { useState } from "react";
import { Checkbox, Task, TaskData } from "./Homepage";

function formatDateToDisplay(date: Date) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  let sevenDaysFromNow = currentDate;
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  if (date < sevenDaysFromNow) {
    return date.toLocaleString("en-us", { weekday: "long" });
  }

  return date.toLocaleString("en-us", { month: "short", day: "numeric" });
}

function parseAditionalDateDescription(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateToday = date.valueOf() == today.valueOf();
  if (isDateToday) {
    return " - Today";
  }

  today.setDate(today.getDate() + 1);
  if (date.valueOf() <= today.valueOf()) {
    return " - Tomorrow";
  }

  return " - " + date.toLocaleDateString('en-us', { weekday: "long" });
}

type UpcomingTask = {
  isPlaceholder: boolean;
} & Task;

let draggedTaskCoords = [0, 0];

let lastTaskId = 0;

export function Upcoming() {
  const [dailyTasksMap, setDailyTasksMap] = useState(new Map<string, Task[]>());

  function disableCurrentDraggedTaskPlaceholder() {
    tasksColumns[draggedTaskCoords[0]].tasks[
      draggedTaskCoords[1]
    ].isPlaceholder = false;

    setTaskColumns(Array.from(tasksColumns));
  }

  return (
    <div className="mt-11">
      <div className="flex flex-col ml-14 gap-y-4">
        <span className="font-bold text-4xl">Upcoming</span>
        <div>
          <span className="font-medium">July </span>
          <span>2024</span>
        </div>
      </div>

      <div className="pb-5 border-b-2" />
      <div className="flex mx-14 mt-6 gap-x-10">
        {tasksColumns.map((column, columnIndex) => {
          const date = new Date();
          date.setHours(0, 0, 0, 0);

          date.setDate(date.getDate() + columnIndex);

          return (
            <CardColumn
              key={column.id}
              tasks={column.tasks}
              date={date}
              onDragStart={(task, taskIndex) => {
                draggedTaskCoords = [columnIndex, taskIndex];

                console.log("Dragged coords: " + draggedTaskCoords);

                task.isPlaceholder = true;

                setTaskColumns(Array.from(tasksColumns));
              }}
              onDragEnter={(taskIndex) => {
                console.log(
                  "Entering another card. Coords: " +
                    columnIndex +
                    ", " +
                    taskIndex
                );

                console.log(draggedTaskCoords);
                console.log(tasksColumns);

                const taskBeingDragged =
                  tasksColumns[draggedTaskCoords[0]].tasks[
                    draggedTaskCoords[1]
                  ];
                console.log(taskBeingDragged);

                tasksColumns[draggedTaskCoords[0]].tasks.splice(
                  draggedTaskCoords[1],
                  1
                );

                tasksColumns[columnIndex].tasks.splice(
                  taskIndex,
                  0,
                  taskBeingDragged
                );

                console.log(tasksColumns);

                draggedTaskCoords = [columnIndex, taskIndex];

                setTaskColumns(Array.from(tasksColumns));
              }}
              onDragEnd={(taskIndex) => {
                // if (
                //   columnIndex != draggedTaskCoords[0] ||
                //   taskIndex != draggedTaskCoords[1]
                // ) {
                //   return;
                // }

                disableCurrentDraggedTaskPlaceholder();
              }}
              onDrop={() => {
                console.log(draggedTaskCoords);

                disableCurrentDraggedTaskPlaceholder();
              }}
              onAddTask={(title, description, date) => {
                console.log("Trying to add task");

                const newTaskData = {
                  title: title,
                  description: description,
                  priority: 0,
                };

                tasksColumns[date.getDay() - 1].tasks.push(
                  createUpcomingTask(newTaskData)
                );

                setTaskColumns(tasksColumns);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

type CardColumnProps = {
  tasks: UpcomingTask[];
  date: Date;
  onAddTask: (title: string, description: string, date: Date) => void;
  onDragStart: (task: UpcomingTask, taskIndex: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: (taskIndex: number) => void;
  onDrop: () => void;
};

function CardColumn({
  tasks,
  date,
  onAddTask,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
}: CardColumnProps) {
  let [showAddTaskCard, setShowAddTaskCard] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-y-4">
      <span className="font-medium">
        {date.toLocaleDateString("en-us", { month: "short", day: "numeric" }) +
          parseAditionalDateDescription(date)}
      </span>

      {tasks.map((task, taskIndex) => {
        return (
          <Card
            key={task.id}
            task={task}
            isInvisible={task.isPlaceholder}
            onDragStart={() => onDragStart(task, taskIndex)}
            onDragEnd={() => onDragEnd(taskIndex)}
            onDragEnter={() => onDragEnter(taskIndex)}
            onDrop={onDrop}
          />
        );
      })}

      {!showAddTaskCard && (
        <AddTaskPlaceholder
          onClick={() => setShowAddTaskCard(true)}
          onDragEnter={() => {
            if (tasks.length == 0) {
              onDragEnter(0);
            } else {
              onDragEnter(tasks.length - 1);
            }
          }}
        />
      )}

      {showAddTaskCard && (
        <AddTaskCard
          initialDate={date}
          onClosePopup={() => setShowAddTaskCard(false)}
          onAddTask={onAddTask}
        />
      )}
    </div>
  );
}

type CardProps = {
  task: Task;
  isInvisible: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragEnter: () => void;
  onDrop: () => void;
};

function Card({
  task,
  isInvisible,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
}: CardProps) {
  return (
    <div
      className={
        "flex gap-x-3 border-2 p-3 bg-white cursor-pointer rounded-xl hover:shadow" +
        (isInvisible ? " opacity-50" : "")
      }
      draggable={true}
      onDragStart={(e) => {
        onDragStart();
      }}
      onDragEnd={(e) => {
        console.log("Drag end triggered!!");
        onDragEnd();
      }}
      onDragEnter={(e) => {
        e.preventDefault();

        onDragEnter();

        e.currentTarget.classList.add("no-pointer-children");
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragLeave={(e) => {
        console.log("Leaving target!!");
        e.currentTarget.classList.remove("no-pointer-children");
      }}
      onDrop={(e) => {
        onDrop();
      }}
    >
      <Checkbox />

      <div className="flex flex-col gap-y-1">
        <span className="text-sm">{task.title}</span>

        <span className="text-xs">{task.description}</span>
      </div>
    </div>
  );
}

type AddTaskCardProps = {
  onAddTask: (title: string, description: string, date: Date) => void;
  onClosePopup: () => void;
  initialDate: Date;
};

function AddTaskCard({
  onAddTask,
  onClosePopup,
  initialDate,
}: AddTaskCardProps) {
  let [canAddTask, setCanAddTask] = useState(false);
  let [selectedDate, setSelectedDate] = useState(initialDate);

  let [title, setTitle] = useState("");
  let [description, setDescription] = useState("");

  return (
    <div className="border-2 rounded-xl p-3 flex flex-col gap-y-3">
      <div>
        <input
          className="font-medium outline-0"
          placeholder="Task name"
          onChange={(e) => {
            if (e.currentTarget.value) {
              setCanAddTask(true);
            } else {
              setCanAddTask(false);
            }

            setTitle(e.currentTarget.value);
          }}
        />
        <input
          className="text-sm outline-0"
          placeholder="Description"
          onChange={(e) => {
            setDescription(e.currentTarget.value);
          }}
        />
      </div>

      <div className="flex justify-between">
        <div
          className="border-2 rounded-md p-1"
          onClick={() => {
            const datePicker = document.getElementById("potato");
            if (datePicker == null) {
              console.log("DIndt find the element");
              return;
            }

            if (datePicker instanceof HTMLInputElement) {
              datePicker.hidden = false;

              datePicker.showPicker();

              console.log("just showed pciker.");
            }
          }}
          style={{
            position: "relative",
          }}
        >
          <input
            id="potato"
            style={{
              position: "absolute",
              overflow: "hidden",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
              opacity: 0,
            }}
            type="date"
            onChange={(e) => {
              const dateParts = e.currentTarget.value.split("-");
              const year = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]);
              const day = parseInt(dateParts[2]);

              console.log(dateParts);

              const date = new Date(year, month - 1, day);

              console.log(date);

              setSelectedDate(date);
            }}
          />

          <span className="text-sm">{formatDateToDisplay(selectedDate)}</span>
        </div>
        <div className="flex gap-x-2">
          <div className="flex items-center justify-center size-8 rounded bg-slate-100">
            <button onClick={onClosePopup}>
              <CloseIcon />
            </button>
          </div>
          <div
            className={
              "flex items-center justify-center size-8 rounded " +
              (canAddTask ? "bg-red-500" : "bg-red-300")
            }
            style={{
              color: "#fff",
            }}
          >
            <button
              onClick={() => {
                if (!canAddTask) {
                  return;
                }

                onAddTask(title, description, selectedDate);

                onClosePopup();
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type AddTaskPlaceholderProps = {
  onClick: () => void;
  onDragEnter: () => void;
};

function AddTaskPlaceholder({ onClick, onDragEnter }: AddTaskPlaceholderProps) {
  return (
    <div
      className="align-top text-slate-500 text-sm select-none hover:cursor-pointer hover:text-red-500"
      onClick={onClick}
      onDragEnter={onDragEnter}
    >
      <span className="text-red-500 text-2xl pr-2">+</span>
      Add task
    </div>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path
        fill="currentColor"
        fill-rule="nonzero"
        d="M5.146 5.146a.5.5 0 0 1 .708 0L12 11.293l6.146-6.147a.5.5 0 0 1 .638-.057l.07.057a.5.5 0 0 1 0 .708L12.707 12l6.147 6.146a.5.5 0 0 1 .057.638l-.057.07a.5.5 0 0 1-.708 0L12 12.707l-6.146 6.147a.5.5 0 0 1-.638.057l-.07-.057a.5.5 0 0 1 0-.708L11.293 12 5.146 5.854a.5.5 0 0 1-.057-.638z"
      ></path>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M7.18 6.396C7 6.642 7 7.054 7 7.878V11l6.715.674c.38.038.38.614 0 .652L7 13v3.122c0 .824 0 1.236.18 1.482.157.214.4.356.669.39.308.041.687-.15 1.444-.531l8.183-4.122c.861-.434 1.292-.651 1.432-.942a.915.915 0 0 0 0-.798c-.14-.29-.57-.508-1.433-.942l-8.18-4.122c-.758-.381-1.137-.572-1.445-.532a.986.986 0 0 0-.67.391Z"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
}

function createUpcomingTask(task: TaskData) {
  const newTask = { ...task, id: lastTaskId + 1, isPlaceholder: false };

  lastTaskId++;

  return newTask;
}