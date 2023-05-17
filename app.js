const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);

    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityAndProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

//API1

app.get("/todo/", async (request, response) => {
  let data = null;

  let getTodoQuery = "";

  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case (hasPriorityAndStatusProperties = request.query):
      getTodoQuery = `

          SELECT

          *

          FROM 

           todo

          WHERE 

          todo LIKE '%${search_q}%

          AND status = '${status}'

          AND priority = '${priority};`;

      break;

    case (hasPriorityAndProperty = request.query):
      getTodoQuery = `

        SELECT

          *

          FROM 

           todo

          WHERE 

          todo LIKE '%${search_q}%

          AND priority = '${priority};`;

      break;

    case (hasStatusProperty = request.query):
      getTodoQuery = `

        SELECT

          *

          FROM 

           todo

          WHERE 

          todo LIKE '%${search_q}%

          AND status = '${status}';`;

      break;

    default:
      getTodoQuery = `

    SELECT

          *

          FROM 

           todo

          WHERE 

          todo LIKE '%${search_q}%;`;
  }

  data = await database.all(getTodoQuery);

  response.send(data);
});

app.get("/todo/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `

  SELECT

  *

  FROM

  todo

  WHERE

  id = ${todoId};`;

  const todo = await database.get(getTodoQuery);

  response.send(todo);
});

app.post("/todo/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const postTodoQuery = `

    INSET INTO

      todo (id, todo, priority, status)

    VALUES

     (${id}, ${todo}, ${priority}, ${status});`;

  await database.run(postTodoQuery);

  response.send("Todo Successfully Added");
});

app.put("/todo/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  let updateColumn = "";

  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";

      break;

    case requestBody.priority !== undefined:
      updateColumn = "Priority";

      break;

    case requestBody.todo !== undefined:
      updateColumn = "Todo";

      break;
  }

  const previousTodoQuery = `

    SELECT

    *

    FROM

     todo

    WHERE

      id = ${todoId};`;

  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,

    priority = previousTodo.priority,

    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `

    UPDATE

     todo

    SET

     todo = ${todo},

     priority = ${priority},

     status = ${status}

    WHERE 

     id = ${statusId};`;

  await database.run(updateTodoQuery);

  response.send(`${updateColumn} Updated`);
});

app.delete("/todo/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodoQuery = `

    DELETE FROM

     todo

    WHERE

     id = ${todoId};`;

  await database.run(deleteTodoQuery);

  response.send("Todo Deleted");
});

module.exports = app;
