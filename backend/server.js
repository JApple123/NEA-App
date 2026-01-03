// server.js
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';


const app = express();
const db = new sqlite3.Database('projectManagementDB.db');
db.run("PRAGMA foreign_keys = ON");


const PORT = process.env.PORT || 8888;



app.use(cors());

app.use(express.json());



// Utility function for ISO date validation
function isValidISODate(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

// Validation functions
function validateProject(data) {
  if (typeof data.name !== 'string') return "Invalid or missing name";
  if (!isValidISODate(data.start_date)) return "Invalid or missing start_date";
  if (!isValidISODate(data.end_date)) return "Invalid or missing end_date";
  if (typeof data.owner !== 'string') return "Invalid or missing owner";
  if (data.description !== undefined && typeof data.description !== 'string') return "Invalid description";
  return null;
}

function validateTask(data) {
  if (typeof data.name !== 'string') return "Invalid or missing name";
  if (!isValidISODate(data.start_date)) return "Invalid or missing start_date";
  if (!isValidISODate(data.end_date)) return "Invalid or missing end_date";
  if (typeof data.duration !== 'number') return "Invalid or missing duration";
  if (typeof data.progress !== 'number') return "Invalid or missing progress";
  if (data.progress < 0 || data.progress > 100) return "Progress must be between 0 and 100";
  //if (typeof data.load !== 'number') return "Invalid or missing load value";
  if (typeof data.project_id !== 'number') return "Invalid or missing project_id";
  if (data.description !== undefined && typeof data.description !== 'string') return "Invalid description";
  return null;
}

function validateRisk(data) {
  if (typeof data.name !== 'string') return "Invalid or missing name";
  if (typeof data.pre_impact !== 'number') return "Invalid or missing pre_impact";
  if (typeof data.post_impact !== 'number') return "Invalid or missing post_impact";
  if (typeof data.pre_likelihood !== 'number') return "Invalid or missing pre_likelihood";
  if (typeof data.post_likelihood !== 'number') return "Invalid or missing post_likelihood";
  if (typeof data.pre_score !== 'number') return "Invalid or missing pre_score";
  if (typeof data.post_score !== 'number') return "Invalid or missing post_score";
  if (typeof data.preparedness !== 'number') return "Invalid or missing preparedness";
  if (!isValidISODate(data.date)) return "Invalid or missing date";
  if (data.description !== undefined && typeof data.description !== 'string') return "Invalid description";
  return null;
}

function validateResource(data) {
  if (typeof data.name !== 'string') return "Invalid or missing name";
  if (typeof data.capacity !== 'number') return "Invalid or missing capacity";
  if (typeof data.role !== 'string') return "Invalid or missing role";
  if (typeof data.team_id !== 'number') return "Invalid or missing team_id";
  if (data.description !== undefined && typeof data.description !== 'string') return "Invalid description";
  return null;
}

function validateDeliverable(data) {
  if (typeof data.name !== 'string') return "Invalid or missing name";
  if (!isValidISODate(data.start_date)) return "Invalid or missing start_date";
  if (!isValidISODate(data.end_date)) return "Invalid or missing end_date";
  if (typeof data.complete !== 'number') return "Invalid or missing complete";
  if (typeof data.owner !== 'string') return "Invalid or missing owner";
  if (typeof data.project_id !== 'number') return "Invalid or missing project_id";
  if (data.description !== undefined && typeof data.description !== 'string') return "Invalid description";
  return null;
}

function validateTeam(data) {
  if (typeof data.name !== 'string') return "Invalid or missing name";
  if (data.description !== undefined && typeof data.description !== 'string') return "Invalid description";
  return null;
}

function validateAssignment(data) {
  if (typeof data.task_id !== 'number') return "Invalid or missing task_id";
  if (typeof data.resource_id !== 'number') return "Invalid or missing resource_id";
  return null;
}

function validateDeliverableDependency(data) {
  if (typeof data.source_id !== 'number') return "Invalid or missing source_id";
  if (typeof data.target_id !== 'number') return "Invalid or missing target_id";
  if (typeof data.dependency_type !== 'string') return "Invalid or missing dependency_type";
  if (typeof data.lag !== 'number') return "Invalid or missing lag";
  return null;
}

function validateDeliverableTask(data) {
  if (typeof data.deliverable_id !== 'number') return "Invalid or missing deliverable_id";
  if (typeof data.task_id !== 'number') return "Invalid or missing task_id";
  return null;
}

function validateTaskDependency(data) {
  if (typeof data.source_id !== 'number') return "Invalid or missing source_id";
  if (typeof data.target_id !== 'number') return "Invalid or missing target_id";
  if (typeof data.dependency_type !== 'string') return "Invalid or missing dependency_type";
  if (typeof data.lag !== 'number') return "Invalid or missing lag";
  return null;
}

function validateTaskRisk(data) {
  if (typeof data.task_id !== 'number') return "Invalid or missing task_id";
  if (typeof data.risk_id !== 'number') return "Invalid or missing risk_id";
  return null;
}

function validateProjectRisk(data) {
  if (typeof data.project_id !== 'number') return "Invalid or missing project_id";
  if (typeof data.risk_id !== 'number') return "Invalid or missing risk_id";
  return null;
}




// === POST FUNCTIONS ===

function postProject(name, start_date, end_date, owner, description, callback) {
  let sql = "INSERT INTO Projects (name, start_date, end_date, owner, description) VALUES ($name, $startDate, $endDate, $owner, $description)"; db.run(sql, {
    $name: name,
    $startDate: start_date,
    $endDate: end_date,
    $owner: owner,
    $description: description
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postTask(id, name, start_date, end_date, duration, progress, project_id, description, callback) {
  let sql = "INSERT INTO Tasks (name, start_date, end_date, duration, progress, project_id, description) VALUES ($name, $start_date, $end_date, $duration, $progress, $project_id, $description)"; db.run(sql, {
    $name: name,
    $start_date: start_date,
    $end_date: end_date,
    $duration: duration,
    $progress: progress,
    $project_id: project_id,
    $description: description
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postRisk(name, description, pre_impact, post_impact, pre_likelihood, post_likelihood, pre_score, post_score, preparedness, date, callback) {
  let sql = "INSERT INTO Risks (name, description, pre_impact, post_impact, pre_likelihood, post_likelihood, pre_score, post_score, preparedness, date) VALUES ($name, $description, $pre_impact, $post_impact, $pre_likelihood, $post_likelihood, $pre_score, $post_score, $preparedness, $date)"; db.run(sql, {
    $name: name,
    $description: description,
    $pre_impact: pre_impact,
    $post_impact: post_impact,
    $pre_likelihood: pre_likelihood,
    $post_likelihood: post_likelihood,
    $pre_score: pre_score,
    $post_score: post_score,
    $preparedness: preparedness,
    $date: date,
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, this.lastID);
    }
  });
}

function postResource(name, capacity, role, team_id, description, callback) {
  let sql = "INSERT INTO Resources (name, capacity, role, team_id, description) VALUES ($name, $capacity, $role, $team_id, $description)"; db.run(sql, {
    $name: name,
    $capacity: capacity,
    $role: role,
    $team_id: team_id,
    $description: description,
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postDeliverable(name, start_date, end_date, complete, owner, project_id, description, callback) {
  let sql = "INSERT INTO Deliverables (name, start_date, end_date, complete, owner, project_id, description) VALUES ($name, $start_date, $end_date, $complete, $owner, $project_id, $description)"; db.run(sql, {
    $name: name,
    $start_date: start_date,
    $end_date: end_date,
    $complete: complete,
    $owner: owner,
    $project_id: project_id,
    $description: description
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postTeam(name, description, callback) {
  let sql = "INSERT INTO Teams (name, description) VALUES ($name, $description)";
  db.run(sql, {
    $name: name,
    $description: description
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postAssignment(task_id, resource_id, callback) {
  let sql = "INSERT INTO Assignments (task_id, resource_id) VALUES ($task_id, $resource_id)";
  db.run(sql, {
    $task_id: task_id,
    $resource_id: resource_id
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postDeliverableDependency(source_id, target_id, dependency_type, lag, callback) {
  let sql = "INSERT INTO DeliverableDependencies (source_id, target_id, dependency_type, lag) VALUES ($source_id, $target_id, $dependency_type, $lag)";
  db.run(sql, {
    $source_id: source_id,
    $target_id: target_id,
    $dependency_type: dependency_type,
    $lag: lag
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postDeliverableTask(deliverable_id, task_id, callback) {
  let sql = "INSERT INTO DeliverableTasks (deliverable_id, task_id) VALUES ($deliverable_id, $task_id)";
  db.run(sql, {
    $deliverable_id: deliverable_id,
    $task_id: task_id,
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postTaskDependency(source_id, target_id, dependency_type, lag, callback) {
  let sql = "INSERT INTO TaskDependencies (source_id, target_id, dependency_type, lag) VALUES ($source_id, $target_id, $dependency_type, $lag)";
  db.run(sql, {
    $source_id: source_id,
    $target_id: target_id,
    $dependency_type: dependency_type,
    $lag: lag
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postTaskRisk(task_id, risk_id, callback) {
  let sql = "INSERT INTO TaskRisks (task_id, risk_id) VALUES ($task_id, $risk_id)";
  db.run(sql, {
    $task_id: task_id,
    $risk_id: risk_id,
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}

function postProjectRisk(project_id, risk_id, callback) {
  let sql = "INSERT INTO ProjectRisks (project_id, risk_id) VALUES ($project_id, $risk_id)";
  db.run(sql, {
    $project_id: project_id,
    $risk_id: risk_id,
  }, function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
}


// === POST ROUTES ===

app.post('/api/projects', (req, res) => {
  const validationError = validateProject(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { name, start_date, end_date, owner, description } = req.body;
  postProject(name, start_date, end_date, owner, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Project created successfully' });
    }
  });
});

app.post('/api/tasks', (req, res) => {
  const validationError = validateTask(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { id, name, start_date, end_date, duration, progress, project_id, description } = req.body;
  postTask(id, name, start_date, end_date, duration, progress, project_id, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Task created successfully' });
    }
  });
});

app.post('/api/risks', (req, res) => {
  const validationError = validateRisk(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { name, description, pre_impact, post_impact, pre_likelihood, post_likelihood, pre_score, post_score, preparedness, date } = req.body;

  postRisk(name, description, pre_impact, post_impact, pre_likelihood, post_likelihood, pre_score, post_score, preparedness, date, (err, insertedId) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      // RETURN THE NEWLY CREATED RISK ID
      res.status(201).json({ message: 'Risk created successfully', id: insertedId });
    }
  });
});

app.post('/api/resources', (req, res) => {
  const validationError = validateResource(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { name, capacity, role, team_id, description } = req.body;
  postResource(name, capacity, role, team_id, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Resource created successfully' });
    }
  });
});

app.post('/api/deliverables', (req, res) => {
  const validationError = validateDeliverable(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { name, start_date, end_date, complete, owner, project_id, description } = req.body;
  postDeliverable(name, start_date, end_date, complete, owner, project_id, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Deliverable created successfully' });
    }
  });
});

app.post('/api/teams', (req, res) => {
  const validationError = validateTeam(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { name, description } = req.body;
  postTeam(name, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Team created successfully' });
    }
  });
});

app.post('/api/assignments', (req, res) => {
  const validationError = validateAssignment(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { task_id, resource_id } = req.body;
  postAssignment(task_id, resource_id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Assignment created successfully' });
    }
  });
});

app.post('/api/deliverabledependencies', (req, res) => {
  const validationError = validateDeliverableDependency(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { source_id, target_id, dependency_type, lag } = req.body;
  postDeliverableDependency(source_id, target_id, dependency_type, lag, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Deliverable dependency created successfully' });
    }
  });
});

app.post('/api/deliverabletasks', (req, res) => {
  const validationError = validateDeliverableTask(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { deliverable_id, task_id } = req.body;
  postDeliverableTask(deliverable_id, task_id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Deliverable dependency created successfully' });
    }
  });
});

app.post('/api/taskdependencies', (req, res) => {
  const validationError = validateTaskDependency(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { source_id, target_id, dependency_type, lag } = req.body;
  postTaskDependency(source_id, target_id, dependency_type, lag, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Task dependency created successfully' });
    }
  });
});

app.post('/api/taskrisks', (req, res) => {
  const validationError = validateTaskRisk(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { task_id, risk_id } = req.body;
  postTaskRisk(task_id, risk_id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Task risk created successfully' });
    }
  });
});

app.post('/api/projectrisks', (req, res) => {
  const validationError = validateProjectRisk(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const { project_id, risk_id } = req.body;
  postProjectRisk(project_id, risk_id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Project risk created successfully' });
    }
  });
});

// === GET BY ID FUNCTIONS ===

function getProjectById(id, callback) {
  db.get("SELECT * FROM Projects WHERE project_id = ?", [id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("Project not found"));
    } else {
      callback(null, row);
    }
  });
}

function getTaskById(id, callback) {
  db.get("SELECT * FROM Tasks WHERE task_id = ?", [id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("Task not found"));
    } else {
      callback(null, row);
    }
  });
}

function getDeliverableById(id, callback) {
  db.get("SELECT * FROM Deliverables WHERE deliverable_id = ?", [id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("Deliverable not found"));
    } else {
      callback(null, row);
    }
  });
}

function getRiskById(id, callback) {
  db.get("SELECT * FROM Risks WHERE risk_id = ?", [id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("Risk not found"));
    } else {
      callback(null, row);
    }
  });
}

function getTeamById(id, callback) {
  db.get("SELECT * FROM Teams WHERE team_id = ?", [id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("Team not found"));
    } else {
      callback(null, row);
    }
  });
}

function getResourceById(id, callback) {
  db.get("SELECT * FROM Resources WHERE resource_id = ?", [id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("Resource not found"));
    } else {
      callback(null, row);
    }
  });
}

function getAssignmentById(task_id, resource_id, callback) {
  db.get("SELECT * FROM Assignments WHERE task_id = ? AND resource_id = ?", [task_id, resource_id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("Assignment not found"));
    } else {
      callback(null, row);
    }
  });
}

function getDeliverableTaskById(deliverable_id, task_id, callback) {
  db.get("SELECT * FROM DeliverableTasks WHERE deliverable_id = ? AND task_id = ?", [deliverable_id, task_id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("DeliverableTask not found"));
    } else {
      callback(null, row);
    }
  });
}

function getTaskRiskById(task_id, risk_id, callback) {
  db.get("SELECT * FROM TaskRisks WHERE task_id = ? AND risk_id = ?", [task_id, risk_id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("TaskRisk not found"));
    } else {
      callback(null, row);
    }
  });
}

function getProjectRiskById(project_id, risk_id, callback) {
  db.get("SELECT * FROM ProjectRisks WHERE project_id = ? AND risk_id = ?", [project_id, risk_id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("ProjectRisk not found"));
    } else {
      callback(null, row);
    }
  });
}

function getTaskDependencyById(source_id, target_id, callback) {
  db.get("SELECT * FROM TaskDependencies WHERE source_id = ? AND target_id = ?", [source_id, target_id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("TaskDependency not found"));
    } else {
      callback(null, row);
    }
  });
}

function getDeliverableDependencyById(source_id, target_id, callback) {
  db.get("SELECT * FROM DeliverableDependencies WHERE source_id = ? AND target_id = ?", [source_id, target_id], (err, row) => {
    if (err) {
      callback(err);
    } else if (!row) {
      callback(new Error("DeliverableDependency not found"));
    } else {
      callback(null, row);
    }
  });
}

// === GET BY ID ROUTES ===

app.get('/api/projects/:id', (req, res) => {
  const id = Number(req.params.id);
  getProjectById(id, (err, project) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(project);
    }
  });
});

app.get('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  getTaskById(id, (err, task) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(task);
    }
  });
});

app.get('/api/deliverables/:id', (req, res) => {
  const id = Number(req.params.id);
  getDeliverableById(id, (err, deliverable) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(deliverable);
    }
  });
});

app.get('/api/risks/:id', (req, res) => {
  const id = Number(req.params.id);
  getRiskById(id, (err, risk) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(risk);
    }
  });
});

app.get('/api/teams/:id', (req, res) => {
  const id = Number(req.params.id);
  getTeamById(id, (err, team) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(team);
    }
  });
});

app.get('/api/resources/:id', (req, res) => {
  const id = Number(req.params.id);
  getResourceById(id, (err, resource) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(resource);
    }
  });
});

app.get('/api/assignments/:task_id/:resource_id', (req, res) => {
  const { task_id, resource_id } = req.params;
  getAssignmentById(Number(task_id), Number(resource_id), (err, assignment) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(assignment);
    }
  });
});

app.get('/api/deliverabletasks/:deliverable_id/:task_id', (req, res) => {
  const { deliverable_id, task_id } = req.params;
  getDeliverableTaskById(Number(deliverable_id), Number(task_id), (err, relation) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(relation);
    }
  });
});

app.get('/api/taskrisks/:task_id/:risk_id', (req, res) => {
  const { task_id, risk_id } = req.params;
  getTaskRiskById(Number(task_id), Number(risk_id), (err, taskrisk) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(taskrisk);
    }
  });
});

app.get('/api/projectrisks/:project_id/:risk_id', (req, res) => {
  const { project_id, risk_id } = req.params;
  getProjectRiskById(Number(project_id), Number(risk_id), (err, projectrisk) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(projectrisk);
    }
  });
});

app.get('/api/taskdependencies/:source_id/:target_id', (req, res) => {
  const { source_id, target_id } = req.params;
  getTaskDependencyById(Number(source_id), Number(target_id), (err, dependency) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(dependency);
    }
  });
});

app.get('/api/deliverabledependencies/:source_id/:target_id', (req, res) => {
  const { source_id, target_id } = req.params;
  getDeliverableDependencyById(Number(source_id), Number(target_id), (err, dependency) => {
    if (err) {
      res.status(404).json({ error: err.message });
    } else {
      res.json(dependency);
    }
  });
});



// === GET FUNCTIONS ===

function getProjects(callback) {
  db.all("SELECT * FROM Projects;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getTasks(callback) {
  db.all("SELECT * FROM Tasks;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getRisks(callback) {
  db.all("SELECT * FROM Risks;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getResources(callback) {
  db.all("SELECT * FROM Resources;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getDeliverables(callback) {
  db.all("SELECT * FROM Deliverables;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getTeams(callback) {
  db.all("SELECT * FROM Teams;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getAssignments(callback) {
  db.all("SELECT * FROM Assignments;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getDeliverableDependencies(callback) {
  db.all("SELECT * FROM DeliverableDependencies;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getDeliverableTasks(callback) {
  db.all("SELECT * FROM DeliverableTasks;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}


function getTaskDependencies(callback) {
  db.all("SELECT * FROM TaskDependencies;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getTaskRisks(callback) {
  db.all("SELECT * FROM TaskRisks;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}

function getProjectRisks(callback) {
  db.all("SELECT * FROM ProjectRisks;", (err, rows) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}


// === GET ROUTES ===

app.get('/api/projects', (req, res) => {
  getProjects((err, projects) => {
    if (err) {
      res.status(500).send('Error retrieving projects');
    } else {
      res.json(projects);
    }
  });
});

app.get('/api/tasks', (req, res) => {
  getTasks((err, tasks) => {
    if (err) {
      res.status(500).send('Error retrieving tasks');
    } else {
      res.json(tasks);
    }
  });
});

app.get('/api/risks', (req, res) => {
  getRisks((err, risks) => {
    if (err) {
      res.status(500).send('Error retrieving risks');
    } else {
      res.json(risks);
    }
  });
});

app.get('/api/resources', (req, res) => {
  getResources((err, resources) => {
    if (err) {
      res.status(500).send('Error retrieving resources');
    } else {
      res.json(resources);
    }
  });
});

app.get('/api/deliverables', (req, res) => {
  getDeliverables((err, deliverables) => {
    if (err) {
      res.status(500).send('Error retrieving deliverables');
    } else {
      res.json(deliverables);
    }
  });
});

app.get('/api/teams', (req, res) => {
  getTeams((err, teams) => {
    if (err) {
      res.status(500).send('Error retrieving teams');
    } else {
      res.json(teams);
    }
  });
});

app.get('/api/assignments', (req, res) => {
  getAssignments((err, assignments) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving assignments' });
    } else {
      res.json(assignments);
    }
  });
});

app.get('/api/deliverabledependencies', (req, res) => {
  getDeliverableDependencies((err, deliverabledependencies) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving deliverable dependencies' });
    } else {
      res.json(deliverabledependencies);
    }
  });
});

app.get('/api/deliverabletasks', (req, res) => {
  getDeliverableTasks((err, deliverabletasks) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving deliverable tasks' });
    } else {
      res.json(deliverabletasks);
    }
  });
});

app.get('/api/taskdependencies', (req, res) => {
  getTaskDependencies((err, taskdependencies) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving task dependencies' });
    } else {
      res.json(taskdependencies);
    }
  });
});

app.get('/api/taskrisks', (req, res) => {
  getTaskRisks((err, taskrisks) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving task risks' });
    } else {
      res.json(taskrisks);
    }
  });
});

app.get('/api/projectrisks', (req, res) => {
  getProjectRisks((err, projectrisks) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving project risks' });
    } else {
      res.json(projectrisks);
    }
  });
});


// DELETE FUNCTIONS

function deleteProject(id, callback) {
  db.run("DELETE FROM Projects WHERE project_id = ?", [id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Project not found"));
    } else {
      callback(null);
    }
  });
}

function deleteTask(id, callback) {
  db.run("DELETE FROM Tasks WHERE task_id = ?", [id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Task not found"));
    } else {
      callback(null);
    }
  });
}

function deleteRisk(id, callback) {
  db.run("DELETE FROM Risks WHERE risk_id = ?", [id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Risk not found"));
    } else {
      callback(null);
    }
  });
}

function deleteResource(id, callback) {
  db.run("DELETE FROM Resources WHERE resource_id = ?", [id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Resource not found"));
    } else {
      callback(null);
    }
  });
}

function deleteDeliverable(id, callback) {
  db.run("DELETE FROM Deliverables WHERE deliverable_id = ?", [id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Deliverable not found"));
    } else {
      callback(null);
    }
  });
}

function deleteTeam(id, callback) {
  db.run("DELETE FROM Teams WHERE team_id = ?", [id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Team not found"));
    } else {
      callback(null);
    }
  });
}

function deleteAssignment(task_id, resource_id, callback) {
  db.run("DELETE FROM Assignments WHERE task_id = ? AND resource_id = ?", [task_id, resource_id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Assignment not found"));
    } else {
      callback(null);
    }
  }
  );
}

function deleteDeliverableDependency(source_id, target_id, callback) {
  db.run("DELETE FROM DeliverableDependencies WHERE source_id = ? AND target_id = ?", [source_id, target_id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Deliverable dependency not found"));
    } else {
      callback(null);
    }
  }
  );
}

function deleteDeliverableTask(deliverable_id, task_id, callback) {
  db.run("DELETE FROM DeliverableTasks WHERE deliverable_id = ? AND task_id = ?", [deliverable_id, task_id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Deliverable task not found"));
    } else {
      callback(null);
    }
  }
  );
}

function deleteTaskDependency(source_id, target_id, callback) {
  db.run("DELETE FROM TaskDependencies WHERE source_id = ? AND target_id = ?", [source_id, target_id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Task dependency not found"));
    } else {
      callback(null);
    }
  }
  );
}

function deleteTaskRisk(task_id, risk_id, callback) {
  db.run("DELETE FROM TaskRisks WHERE task_id = ? AND risk_id = ?", [task_id, risk_id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Task risk not found"));
    } else {
      callback(null);
    }
  }
  );
}

function deleteProjectRisk(project_id, risk_id, callback) {
  db.run("DELETE FROM ProjectRisks WHERE project_id = ? AND risk_id = ?", [project_id, risk_id], function (err) {
    if (err) {
      console.log(err);
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Project risk not found"));
    } else {
      callback(null);
    }
  });
}

app.delete('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  console.log(`Attempting to delete project ${projectId}`);

  db.run(`UPDATE tasks SET project_id = NULL WHERE project_id = ?`, [projectId], (taskErr) => {
    if (taskErr) {
      console.error('❌ Error unlinking tasks:', taskErr.message);
      return res.status(500).json({ message: 'Error unlinking tasks', err: taskErr.message });
    }
    console.log('✅ Tasks unlinked');

    db.run(`UPDATE deliverables SET project_id = NULL WHERE project_id = ?`, [projectId], (deliverableErr) => {
      if (deliverableErr) {
        console.error('❌ Error unlinking deliverables:', deliverableErr.message);
        return res.status(500).json({ message: 'Error unlinking deliverables', err: deliverableErr.message });
      }
      console.log('✅ Deliverables unlinked');

      db.run(`DELETE FROM projects WHERE project_id = ?`, [projectId], function (deleteErr) {
        if (deleteErr) {
          console.error('❌ Error deleting project:', deleteErr.message);
          return res.status(500).json({ message: 'Error deleting project', err: deleteErr.message });
        }
        console.log('✅ Project deleted successfully');
        res.status(200).json({ message: 'Project deleted successfully' });
      });
    });
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  deleteTask(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting task" });
    } else {
      res.json({ message: "Task deleted successfully" });
    }
  });
});

app.delete('/api/risks/:id', (req, res) => {
  deleteRisk(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting risk" });
    } else {
      res.json({ message: "Risk deleted successfully" });
    }
  });
});

app.delete('/api/resources/:id', (req, res) => {
  deleteResource(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting resource" });
    } else {
      res.json({ message: "Resource deleted successfully" });
    }
  });
});

app.delete('/api/deliverables/:id', (req, res) => {
  deleteDeliverable(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting deliverable" });
    } else {
      res.json({ message: "Deliverable deleted successfully" });
    }
  });
});

app.delete('/api/teams/:id', (req, res) => {
  deleteTeam(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting team" });
    } else {
      res.json({ message: "Team deleted successfully" });
    }
  });
});

app.delete('/api/assignments/:task_id/:resource_id', (req, res) => {
  const { task_id, resource_id } = req.params;

  deleteAssignment(task_id, resource_id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting assignment" });
    } else {
      res.json({ message: "Assignment deleted successfully" });
    }
  });
});

app.delete('/api/deliverabledependencies/:source_id/:target_id', (req, res) => {
  const { source_id, target_id } = req.params;

  deleteDeliverableDependency(source_id, target_id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting deliverable dependency" });
    } else {
      res.json({ message: "Deliverable dependency deleted successfully" });
    }
  });
});

app.delete('/api/deliverabletasks/:deliverable_id/:task_id', (req, res) => {
  const { deliverable_id, task_id } = req.params;

  deleteDeliverableTask(deliverable_id, task_id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting deliverable task" });
    } else {
      res.json({ message: "Deliverable task deleted successfully" });
    }
  });
});

app.delete('/api/taskdependencies/:source_id/:target_id', (req, res) => {
  const { source_id, target_id } = req.params;

  deleteTaskDependency(source_id, target_id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting task dependency" });
    } else {
      res.json({ message: "Task dependency deleted successfully" });
    }
  });
});

app.delete('/api/taskrisks/:task_id/:risk_id', (req, res) => {
  const { task_id, risk_id } = req.params;

  deleteTaskRisk(task_id, risk_id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting task risk" });
    } else {
      res.json({ message: "Task risk deleted successfully" });
    }
  });
});

app.delete('/api/projectrisks/:project_id/:risk_id', (req, res) => {
  const { project_id, risk_id } = req.params;

  deleteProjectRisk(project_id, risk_id, (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting project risk" });
    } else {
      res.json({ message: "Project risk deleted successfully" });
    }
  });
});

// === UPDATE FUNCTIONS ===

function updateProject(id, name, start_date, end_date, owner, description, callback) {
  const sql = `UPDATE Projects SET name = ?, start_date = ?, end_date = ?, owner = ?, description = ? WHERE project_id = ?`;
  db.run(sql, [name, start_date, end_date, owner, description, id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Project not found"));
    } else {
      callback(null);
    }
  });
}

function updateTask(id, name, start_date, end_date, duration, progress, project_id, description, callback) {
  const sql = `UPDATE Tasks SET name = ?, start_date = ?, end_date = ?, duration = ?, progress = ?, project_id = ?, description = ? WHERE task_id = ?`;
  db.run(sql, [name, start_date, end_date, duration, progress, project_id, description, id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Task not found"));
    } else {
      callback(null);
    }
  });
}

function updateRisk(id, name, description, pre_impact, post_impact, pre_likelihood, post_likelihood, pre_score, post_score, preparedness, date, callback) {
  const sql = `UPDATE Risks SET name = ?, description = ?, pre_impact = ?, post_impact = ?, pre_likelihood = ?, post_likelihood = ?, pre_score = ?, post_score = ?, preparedness = ?, date = ? WHERE risk_id = ?`;
  db.run(sql, [name, description, pre_impact, post_impact, pre_likelihood, post_likelihood, pre_score, post_score, preparedness, date, id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Risk not found"));
    } else {
      callback(null);
    }
  });
}

function updateResource(id, name, capacity, role, team_id, description, callback) {
  const sql = `UPDATE Resources SET name = ?, capacity = ?, role = ?, team_id = ?, description = ? WHERE resource_id = ?`;
  db.run(sql, [name, capacity, role, team_id, description, id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Resource not found"));
    } else {
      callback(null);
    }
  });
}

function updateDeliverable(id, name, start_date, end_date, complete, owner, project_id, description, callback) {
  const sql = `UPDATE Deliverables SET name = ?, start_date = ?, end_date = ?, complete = ?, owner = ?, project_id = ?, description = ? WHERE deliverable_id = ?`;
  db.run(sql, [name, start_date, end_date, complete, owner, project_id, description, id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Deliverable not found"));
    } else {
      callback(null);
    }
  });
}

function updateTeam(id, name, description, callback) {
  const sql = `UPDATE Teams SET name = ?, description = ? WHERE team_id = ?`;
  db.run(sql, [name, description, id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Team not found"));
    } else {
      callback(null);
    }
  });
}

function updateAssignment(newtask_id, newresource_id, oldtask_id, oldresource_id, callback) {
  const sql = `UPDATE Assignments SET task_id = ?, resource_id = ? WHERE task_id = ? AND resource_id = ?`;
  db.run(sql, [newtask_id, newresource_id, oldtask_id, oldresource_id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Assignment not found"));
    } else {
      callback(null);
    }
  });
}

function updateDeliverableDependency(oldSourceId, oldTargetId, newSourceId, newTargetId, dependency_type, lag, callback) {
  const sql = `UPDATE DeliverableDependencies SET source_id = ?, target_id = ?, dependency_type = ?, lag = ?WHERE source_id = ? AND target_id = ?`;

  db.run(sql, [newSourceId, newTargetId, dependency_type, lag, oldSourceId, oldTargetId], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Deliverable dependency not found"));
    } else {
      callback(null);
    }
  });
}


function updateDeliverableTask(olddeliverable_id, oldtask_id, newdeliverable_id, newtask_id, callback) {
  const sql = `UPDATE DeliverableTasks SET deliverable_id = ?, task_id = ? WHERE deliverable_id = ? AND task_id = ?`;

  db.run(sql, [newdeliverable_id, newtask_id, olddeliverable_id, oldtask_id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Deliverable task not found"));
    } else {
      callback(null);
    }
  });
}

function updateTaskDependency(oldSourceId, oldTargetId, newSourceId, newTargetId, dependency_type, lag, callback) {
  const sql = `UPDATE TaskDependencies SET source_id = ?, target_id = ?, dependency_type = ?, lag = ?WHERE source_id = ? AND target_id = ?`;

  db.run(sql, [newSourceId, newTargetId, dependency_type, lag, oldSourceId, oldTargetId], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Task dependency not found"));
    } else {
      callback(null);
    }
  });
}

function updateTaskRisk(oldtask_id, oldrisk_id, newtask_id, newrisk_id, callback) {
  const sql = `UPDATE TaskRisks SET task_id = ?, risk_id = ? WHERE task_id = ? AND risk_id = ?`;

  db.run(sql, [newtask_id, newrisk_id, oldtask_id, oldrisk_id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Task risk not found"));
    } else {
      callback(null);
    }
  });
}

function updateProjectRisk(oldproject_id, oldrisk_id, newproject_id, newrisk_id, callback) {
  const sql = `UPDATE ProjectRisks SET project_id = ?, risk_id = ? WHERE project_id = ? AND risk_id = ?`;
  db.run(sql, [newproject_id, newrisk_id, oldproject_id, oldrisk_id], function (err) {
    if (err) {
      callback(err);
    } else if (this.changes === 0) {
      callback(new Error("Project risk not found"));
    } else {
      callback(null);
    }
  });
}

// === PUT ROUTES ===

app.put('/api/projects/:id', (req, res) => {
  const validationError = validateProject(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const id = req.params.id;
  const { name, start_date, end_date, owner, description } = req.body;
  updateProject(id, name, start_date, end_date, owner, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Project updated successfully' });
    }
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const validationError = validateTask(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const id = req.params.id;
  const { name, start_date, end_date, duration, progress, project_id, description } = req.body;
  updateTask(id, name, start_date, end_date, duration, progress, project_id, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Task updated successfully' });
    }
  });
});

app.put('/api/risks/:id', (req, res) => {
  const validationError = validateRisk(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const id = req.params.id;
  const { name, description, pre_impact, post_impact, pre_likelihood, post_likelihood, pre_score, post_score, preparedness, date } = req.body;
  updateRisk(id, name, description, pre_impact, post_impact, pre_likelihood, post_likelihood, pre_score, post_score, preparedness, date, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Risk updated successfully' });
    }
  });
});

app.put('/api/resources/:id', (req, res) => {
  const validationError = validateResource(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const id = req.params.id;
  const { name, capacity, role, team_id, description } = req.body;
  updateResource(id, name, capacity, role, team_id, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Resource updated successfully' });
    }
  });
});

app.put('/api/deliverables/:id', (req, res) => {
  const validationError = validateDeliverable(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const id = req.params.id;
  const { name, start_date, end_date, complete, owner, project_id, description } = req.body;
  updateDeliverable(id, name, start_date, end_date, complete, owner, project_id, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Deliverable updated successfully' });
    }
  });
});

app.put('/api/teams/:id', (req, res) => {
  const validationError = validateTeam(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const id = req.params.id;
  const { name, description } = req.body;
  updateTeam(id, name, description, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Team updated successfully' });
    }
  });
});

app.put('/api/assignments/:task_id/:resource_id', (req, res) => {
  const oldtask_id = Number(req.params.task_id);
  const oldresource_id = Number(req.params.resource_id);

  const { task_id: newtask_id, resource_id: newresource_id } = req.body;

  const validationError = validateAssignment(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  updateAssignment(newtask_id, newresource_id, oldtask_id, oldresource_id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Assignment updated successfully' });
    }
  });
});

app.put('/api/deliverabledependencies/:source_id/:target_id', (req, res) => {
  const oldSourceId = Number(req.params.source_id);
  const oldTargetId = Number(req.params.target_id);

  const { source_id: newSourceId, target_id: newTargetId, dependency_type, lag } = req.body;

  const validationError = validateDeliverableDependency(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  updateDeliverableDependency(oldSourceId, oldTargetId, newSourceId, newTargetId, dependency_type, lag, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Deliverable dependency updated successfully' });
    }
  });
});

app.put('/api/deliverabletasks/:deliverable_id/:task_id', (req, res) => {
  const olddeliverable_id = Number(req.params.deliverable_id);
  const oldtask_id = Number(req.params.task_id); 

  const { deliverable_id: newdeliverable_id, task_id: newtask_id } = req.body;

  const validationError = validateDeliverableTask(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  updateDeliverableTask(olddeliverable_id, oldtask_id, newdeliverable_id, newtask_id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Deliverable task updated successfully' });
    }
  });
});

app.put('/api/taskdependencies/:source_id/:target_id', (req, res) => {
  const oldSourceId = Number(req.params.source_id);
  const oldTargetId = Number(req.params.target_id);

  const { source_id: newSourceId, target_id: newTargetId, dependency_type, lag } = req.body;

  const validationError = validateTaskDependency(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  updateTaskDependency(oldSourceId, oldTargetId, newSourceId, newTargetId, dependency_type, lag, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Task dependency updated successfully' });
    }
  });
});

app.put('/api/taskrisks/:task_id/:risk_id', (req, res) => {
  const oldtask_id = Number(req.params.task_id);
  const oldrisk_id = Number(req.params.risk_id); 

  const { task_id: newtask_id, risk_id: newrisk_id } = req.body;

  const validationError = validateTaskRisk(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  updateTaskRisk(oldtask_id, oldrisk_id, newtask_id, newrisk_id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Task risk updated successfully' });
    }
  });
});


app.put('/api/projectrisks/:project_id/:risk_id', (req, res) => {
  const oldproject_id = Number(req.params.project_id);
  const oldrisk_id = Number(req.params.risk_id); 

  const { project_id: newproject_id, risk_id: newrisk_id } = req.body;

  const validationError = validateProjectRisk(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  updateProjectRisk(oldproject_id, oldrisk_id, newproject_id, newrisk_id, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ message: 'Project risk updated successfully' });
    }
  });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => {
  console.log('Server is alive');
}, 30000);

