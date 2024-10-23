import { useState } from "react";
import { Checkbox, Task, TaskData } from "./Homepage";
import { buildDateList, dateFromIsoString } from "../utils/date";
import "../utils/extensions/map";
import "../utils/extensions/array";

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

  return " - " + date.toLocaleDateString("en-us", { weekday: "long" });
}

type UpcomingTask = {
  isPlaceholder: boolean;
} & Task;

let draggedTaskDate = "";
let draggedTaskIndex = 0;

let lastTaskId = 0;

export function Upcoming() {
  const [dailyTasksMap, setDailyTasksMap] = useState(
    new Map<string, UpcomingTask[]>()
  );

  const [currentDate, setCurrentDate] = useState(new Date().withoutTime());
  const [newTaskCardDateColumn, setNewTaskCardDateColumn] = useState("");

  function disableCurrentDraggedTaskPlaceholder() {
    console.log("Date: ", draggedTaskDate, ", Task index: ", draggedTaskIndex);

    console.log(dailyTasksMap);

    dailyTasksMap.get(draggedTaskDate)![draggedTaskIndex].isPlaceholder = false;

    setDailyTasksMap(new Map(dailyTasksMap));

    console.log("task placeholder disabled!");
  }

  return (
    <div className="mt-11">
      <div className="flex flex-col mx-14 gap-y-4">
        <span className="font-bold text-4xl">Upcoming</span>
        <div className="flex justify-between">
          <HiddenDateInput
            className="w-fit cursor-pointer"
            initialDate={currentDate}
            onChangeDate={setCurrentDate}
            content={() => {
              return (
                <div className="flex justify-center">
                  <span className="font-medium">
                    {currentDate.toLocaleDateString("en-us", { month: "long" })}{" "}
                    &nbsp;
                  </span>
                  <span>
                    {currentDate.toLocaleDateString("en-us", {
                      year: "numeric",
                    })}
                  </span>

                  <GoogleIcon name="keyboard_arrow_down" />
                </div>
              );
            }}
          />
          <div className="flex items-center border-2 rounded-md">
            <div
              className="flex cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.removeDays(7));
              }}
            >
              <GoogleIcon name="chevron_left" />
            </div>

            <div className="border-l-2 h-4/6 pl-2" />

            <span
              className="text-sm cursor-pointer"
              onClick={() => {
                setCurrentDate(new Date().withoutTime());
              }}
            >
              Today
            </span>

            <div className="border-r-2 h-4/6 pr-2" />

            <div
              className="flex cursor-pointer"
              onClick={() => {
                setCurrentDate(currentDate.addDays(7));
              }}
            >
              <GoogleIcon name="chevron_right" />
            </div>
          </div>
        </div>
      </div>

      <div className="pb-5 border-b-2" />

      <div className="flex  mx-14 mt-6 gap-x-10">
        {buildDateList(currentDate).map((date) => {
          return (
            <CardColumn
              key={date}
              tasks={dailyTasksMap.getOrDefault(date, [])}
              date={dateFromIsoString(date)}
              onDragStart={(task, taskIndex) => {
                draggedTaskDate = date;
                draggedTaskIndex = taskIndex;

                console.log("Dragged coords: " + date, ": ", taskIndex);

                task.isPlaceholder = true;

                setDailyTasksMap(new Map(dailyTasksMap));
              }}
              onDragEnter={(taskIndex) => {
                console.log(
                  "Entering another card. Coords: " + date + ", " + taskIndex
                );

                const originColumn = dailyTasksMap.get(draggedTaskDate)!;

                const taskBeingDragged = originColumn[draggedTaskIndex];

                originColumn.removeAt(draggedTaskIndex);

                if (!dailyTasksMap.has(date)) {
                  dailyTasksMap.set(date, []);
                }

                const destinationColumn = dailyTasksMap.get(date)!;
                destinationColumn.insertAt(draggedTaskIndex, taskBeingDragged);

                draggedTaskDate = date;
                draggedTaskIndex = taskIndex;

                setDailyTasksMap(new Map(dailyTasksMap));

                console.log(dailyTasksMap);

                // TODO: Make this more performant. Every time the onDragEnter event is called, it re-registers these event listeners.
                // And by the way, somehow when the events are called, their reference to the map is old.
                // That means it doesn't contain the newly added tasks.
                document.addEventListener("drop", () =>
                  disableCurrentDraggedTaskPlaceholder()
                );
                document.addEventListener("dragover", (e) =>
                  e.preventDefault()
                );
                document.addEventListener("dragend", () =>
                  disableCurrentDraggedTaskPlaceholder()
                );
              }}
              onDragEnd={(taskIndex) => {
                // if (
                //   columnIndex != draggedTaskCoords[0] ||
                //   taskIndex != draggedTaskCoords[1]
                // ) {
                //   return;
                // }

                console.log("Drag end being triggered!");

                disableCurrentDraggedTaskPlaceholder();
              }}
              onDrop={() => {
                disableCurrentDraggedTaskPlaceholder();
              }}
              onAddTask={(title, description, date) => {
                console.log("Trying to add task");

                const newTaskData = {
                  title: title,
                  description: description,
                  priority: 0,
                };

                if (!dailyTasksMap.has(date.toISOString())) {
                  dailyTasksMap.set(date.toISOString(), []);
                }

                dailyTasksMap
                  .get(date.toISOString())!
                  .push(createUpcomingTask(newTaskData));

                console.log(dailyTasksMap);

                setDailyTasksMap(new Map(dailyTasksMap));
              }}
              showAddTaskCard={date.localeCompare(newTaskCardDateColumn) === 0}
              onOpenNewTaskCard={() => {
                setNewTaskCardDateColumn(date);
              }}
              onCloseNewTaskCard={() => {
                setNewTaskCardDateColumn("");
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
  showAddTaskCard: boolean;
  onOpenNewTaskCard: () => void;
  onCloseNewTaskCard: () => void;
};

function CardColumn({
  tasks,
  date,
  onAddTask,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
  showAddTaskCard,
  onOpenNewTaskCard,
  onCloseNewTaskCard,
}: CardColumnProps) {
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
          onClick={onOpenNewTaskCard}
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
          onClosePopup={onCloseNewTaskCard}
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
  const [canAddTask, setCanAddTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
        <div className="flex gap-x-2">
          <HiddenDateInput
            initialDate={selectedDate}
            onChangeDate={setSelectedDate}
            content={() => {
              return (
                <div className="border-2 h-7 rounded-md p-1">
                  <span className="text-sm">
                    {formatDateToDisplay(selectedDate)}
                  </span>
                </div>
              );
            }}
          />

          <div className="flex items-center h-7 gap-x-1 border-2 rounded-md p-1">
            <FilledFlagIcon />

            <span className="text-sm">P3</span>
          </div>
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
        fillRule="nonzero"
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
        fillRule="evenodd"
        d="M7.18 6.396C7 6.642 7 7.054 7 7.878V11l6.715.674c.38.038.38.614 0 .652L7 13v3.122c0 .824 0 1.236.18 1.482.157.214.4.356.669.39.308.041.687-.15 1.444-.531l8.183-4.122c.861-.434 1.292-.651 1.432-.942a.915.915 0 0 0 0-.798c-.14-.29-.57-.508-1.433-.942l-8.18-4.122c-.758-.381-1.137-.572-1.445-.532a.986.986 0 0 0-.67.391Z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      color="#246fe0"
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M2 3a.5.5 0 0 1 .276-.447C3.025 2.179 4.096 2 5.5 2c.901 0 1.485.135 2.658.526C9.235 2.885 9.735 3 10.5 3c1.263 0 2.192-.155 2.776-.447A.5.5 0 0 1 14 3v6.5a.5.5 0 0 1-.276.447c-.749.375-1.82.553-3.224.553-.901 0-1.485-.135-2.658-.526C6.765 9.615 6.265 9.5 5.5 9.5c-1.08 0-1.915.113-2.5.329V13.5a.5.5 0 0 1-1 0V3Zm1 5.779v-5.45C3.585 3.113 4.42 3 5.5 3c.765 0 1.265.115 2.342.474C9.015 3.865 9.599 4 10.5 4c1.002 0 1.834-.09 2.5-.279v5.45c-.585.216-1.42.329-2.5.329-.765 0-1.265-.115-2.342-.474C6.985 8.635 6.401 8.5 5.5 8.5c-1.001 0-1.834.09-2.5.279Z"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
}

function FilledFlagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      color="#246fe0"
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M2.276 2.553A.5.5 0 0 0 2 3v10.5a.5.5 0 0 0 1 0V9.829c.585-.216 1.42-.329 2.5-.329.765 0 1.265.115 2.342.474 1.173.391 1.757.526 2.658.526 1.404 0 2.475-.178 3.224-.553A.5.5 0 0 0 14 9.5V3a.5.5 0 0 0-.724-.447C12.692 2.845 11.763 3 10.5 3c-.765 0-1.265-.115-2.342-.474C6.985 2.135 6.401 2 5.5 2c-1.404 0-2.475.179-3.224.553Z"
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

type HiddenDateInputProps = {
  initialDate: Date;
  onChangeDate: (newDate: Date) => void;
  content: () => JSX.Element;
  className?: string;
};

function HiddenDateInput({
  initialDate,
  onChangeDate,
  content,
  className,
}: HiddenDateInputProps) {
  const elementId = Math.floor(Math.random() * 1000);

  console.log("className received: '" + className + "'");

  return (
    <div
      className={className}
      onClick={() => {
        const datePicker = document.getElementById("date-picker" + elementId);
        if (datePicker == null) {
          console.error("The date picker element was not found.");
          return;
        }

        if (datePicker instanceof HTMLInputElement) {
          datePicker.showPicker();
        }
      }}
      style={{
        position: "relative",
      }}
    >
      <input
        id={"date-picker" + elementId}
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
        value={initialDate.toISODateString()}
        onChange={(e) => {
          const dateParts = e.currentTarget.value.split("-");
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]);
          const day = parseInt(dateParts[2]);

          console.log(dateParts);

          const date = new Date(year, month - 1, day);

          console.log(date);

          onChangeDate(date);
        }}
      />

      {content()}
    </div>
  );
}

type GoogleIconProps = {
  name: string;
};

function GoogleIcon({ name }: GoogleIconProps) {
  return <span className="material-symbols-outlined">{name}</span>;
}
