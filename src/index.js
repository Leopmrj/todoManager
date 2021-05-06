const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

	const user = users.find(
		(user) => user.username === username
	);

	const userIndex = users.findIndex(
		(userElement) => userElement.username === username
	);

	if(!user){
		return response.status(401).json({error: `User ${username} not found!`})
	}

	request.user = user;
	request.userIndex = userIndex;

	return next();

}

app.post('/users', (request, response) => {
	const {name, username} = request.body;

	const user = users.find(
		(userEl) => userEl.username === username
	);

	if(user){
		return response.status(400).json({error: `User ${username} already exists!`})
	};

	const newUser = {
		id: uuidv4(),
		name,
		username,
		todos: [],
	};

	users.push(newUser);

	return response.json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
	response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
	const {user} = request;
	const {title, deadline} = request.body;

	const newTodo = {
		id: uuidv4(),
		title,
		done: false,
		// deadline: new Date(deadline),
		deadline: deadline,
		created_at: new Date(),
	};

	user.todos.push(newTodo);

	response.status(201).json(newTodo);

});

// route params = params
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user, userIndex} = request;
	const {title, deadline} = request.body;
	const {id} = request.params;

	const todoIndex = user.todos.findIndex(
		(todoElement) => todoElement.id === id
	);

	if(todoIndex === -1){
		return response.status(404).json({error: `Todo id ${id} not found!`})
	}

	users[userIndex].todos[todoIndex].title = title;
	users[userIndex].todos[todoIndex].deadline = new Date(deadline);

	response.status(201).json(users[userIndex].todos[todoIndex]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
	const {user, userIndex} = request;
	const {id} = request.params;

	const todoIndex = user.todos.findIndex(
		(todoElement) => todoElement.id === id
	);

	if(todoIndex === -1){
		return response.status(404).json({error: `Todo id ${id} not found!`})
	};

	users[userIndex].todos[todoIndex].done = true;

	response.status(201).json(users[userIndex].todos[todoIndex]);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user, userIndex} = request;
	const {id} = request.params;

	const todoIndex = user.todos.findIndex(
		(todoElement) => todoElement.id === id
	);

	if(todoIndex === -1){
		return response.status(404).json({error: `Todo id ${id} not found!`})
	}

	users[userIndex].todos.splice(todoIndex, 1);

	return response.status(204).send();

});

module.exports = app;
