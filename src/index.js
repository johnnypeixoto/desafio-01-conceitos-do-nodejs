const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (!userAlreadyExists) {
    return response.status(404).json({ error: 'User not found!'})
  }

  request.currentUser = userAlreadyExists;
  
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  const userAlreadExists = users.some((user) => user.username === username);

  if (userAlreadExists) {
    return response.status(400).json({ error: 'User already exists'});
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  objIndex = users.findIndex((obj => obj.username === username));

  users[objIndex].todos = [...users[objIndex].todos, newTodo];

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { currentUser } = request;

  userObjIndex = users.findIndex((obj => obj.id === currentUser.id));
  todoObjIndex = currentUser.todos.findIndex((obj => obj.id === id));

  if (todoObjIndex === -1) {
    return response.status(404).json({ error: 'should not be able to update a non existing todo'});
  }

  currentUser.todos[todoObjIndex].title = title;
  currentUser.todos[todoObjIndex].deadline = deadline;

  users[userObjIndex] = currentUser;

  const updatedTodo = {
    title,
    deadline,
    done: false
  }

  return response.status(201).json(updatedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { currentUser } = request;
  
  userObjIndex = users.findIndex((obj => obj.id === currentUser.id));
  todoObjIndex = currentUser.todos.findIndex((obj => obj.id === id));

  if (todoObjIndex === -1) {
    return response.status(404).json({ error: 'should not be able to mark a non existing todo as done'});
  }

  currentUser.todos[todoObjIndex].done = true;

  users[userObjIndex] = currentUser;

  return response.status(201).json(currentUser.todos[todoObjIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { currentUser } = request;
  
  userObjIndex = users.findIndex((obj => obj.id === currentUser.id));
  todoObjIndex = currentUser.todos.findIndex((obj => obj.id === id));

  if (todoObjIndex === -1) {
    return response.status(404).json({ error: 'should not be able to delete a non existing todo'});
  }

  currentUser.todos.splice(todoObjIndex, 1);

  users[userObjIndex] = currentUser;

  return response.status(204).json({ success: 'todo delete with success!'});
});

module.exports = app;