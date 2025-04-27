import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn, filter]);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(res.data);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/register', { username, password });
    alert('User registered');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/login', { username, password });
    localStorage.setItem('token', res.data.token);
    setIsLoggedIn(true);
  };

  const addTask = async () => {
    await axios.post('http://localhost:5000/tasks', { title, description, completed: false }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setTitle('');
    setDescription('');
    fetchTasks();
  };

  const toggleTask = async (id, completed) => {
    await axios.put(`http://localhost:5000/tasks/${id}`, { completed: !completed }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/tasks/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchTasks();
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Register</button>
        </form>

        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Task Manager</h1>
      <button onClick={() => { localStorage.removeItem('token'); setIsLoggedIn(false); }}>Logout</button>
      
      <div className="task-form">
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="filter-buttons">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>

      <div className="task-list">
        {filteredTasks.map(task => (
          <div key={task._id} className={`task ${task.completed ? 'completed' : ''}`}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <button onClick={() => toggleTask(task._id, task.completed)}>
              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;