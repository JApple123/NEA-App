import express from 'express'
import pool from './db.js'

const app = express();

// Middleware
app.use(express.json());

// Validation helpers
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const isValidISODate = (date) => {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// ============================================================================
// TEAMS ROUTES
// ============================================================================

// Create team
app.post('/api/teams', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }

    const query = `
      INSERT INTO teams (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, description || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team by ID
app.get('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid team ID format' });
    }

    const result = await pool.query('SELECT * FROM teams WHERE team_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update team
app.put('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid team ID format' });
    }

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }

    const query = `
      UPDATE teams 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description)
      WHERE team_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete team
app.delete('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid team ID format' });
    }

    const result = await pool.query('DELETE FROM teams WHERE team_id = $1 RETURNING team_id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete team with existing resources' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// PROJECTS ROUTES
// ============================================================================

// Create project
app.post('/api/projects', async (req, res) => {
  try {
    const { name, startDate, endDate, ownerId, description } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }
    if (!startDate || !isValidISODate(startDate)) {
      return res.status(400).json({ error: 'Valid startDate is required (ISO 8601 format)' });
    }
    if (!endDate || !isValidISODate(endDate)) {
      return res.status(400).json({ error: 'Valid endDate is required (ISO 8601 format)' });
    }
    if (!ownerId || !isValidUUID(ownerId)) {
      return res.status(400).json({ error: 'Valid ownerId (UUID) is required' });
    }

    const query = `
      INSERT INTO projects (name, start_date, end_date, owner_id, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, startDate, endDate, ownerId, description || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.message.includes('check_project_dates')) {
      return res.status(400).json({ error: 'End date must be after or equal to start date' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all projects (with optional owner filter)
app.get('/api/projects', async (req, res) => {
  try {
    const { ownerId } = req.query;
    
    let query = 'SELECT * FROM projects';
    let params = [];
    
    if (ownerId) {
      if (!isValidUUID(ownerId)) {
        return res.status(400).json({ error: 'Invalid ownerId format' });
      }
      query += ' WHERE owner_id = $1';
      params.push(ownerId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const result = await pool.query('SELECT * FROM projects WHERE project_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, ownerId, description } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }
    if (startDate !== undefined && !isValidISODate(startDate)) {
      return res.status(400).json({ error: 'Invalid startDate format' });
    }
    if (endDate !== undefined && !isValidISODate(endDate)) {
      return res.status(400).json({ error: 'Invalid endDate format' });
    }
    if (ownerId !== undefined && !isValidUUID(ownerId)) {
      return res.status(400).json({ error: 'Invalid ownerId format' });
    }

    const query = `
      UPDATE projects 
      SET name = COALESCE($1, name),
          start_date = COALESCE($2, start_date),
          end_date = COALESCE($3, end_date),
          owner_id = COALESCE($4, owner_id),
          description = COALESCE($5, description)
      WHERE project_id = $6
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, startDate, endDate, ownerId, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.message.includes('check_project_dates')) {
      return res.status(400).json({ error: 'End date must be after or equal to start date' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const result = await pool.query('DELETE FROM projects WHERE project_id = $1 RETURNING project_id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tasks for a project
app.get('/api/projects/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const result = await pool.query(
      'SELECT * FROM tasks WHERE project_id = $1 ORDER BY start_date',
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get milestones for a project
app.get('/api/projects/:id/milestones', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const result = await pool.query(
      'SELECT * FROM milestones WHERE project_id = $1 ORDER BY start_date',
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project milestones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// TASKS ROUTES
// ============================================================================

// Create task
app.post('/api/tasks', async (req, res) => {
  try {
    const { name, startDate, endDate, duration, progress, load, projectId, description } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }
    if (!startDate || !isValidISODate(startDate)) {
      return res.status(400).json({ error: 'Valid startDate is required (ISO 8601 format)' });
    }
    if (!endDate || !isValidISODate(endDate)) {
      return res.status(400).json({ error: 'Valid endDate is required (ISO 8601 format)' });
    }
    if (typeof duration !== 'number' || duration <= 0) {
      return res.status(400).json({ error: 'Duration is required and must be a positive number' });
    }
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress is required and must be between 0 and 100' });
    }
    if (load !== undefined && load !== null && (typeof load !== 'number' || load < 0)) {
      return res.status(400).json({ error: 'Load must be a non-negative number' });
    }
    if (projectId && !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'ProjectId must be a valid UUID' });
    }

    const query = `
      INSERT INTO tasks (name, start_date, end_date, duration, progress, load, project_id, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, startDate, endDate, duration, progress, load || null, projectId || null, description || null
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.message.includes('check_task_dates')) {
      return res.status(400).json({ error: 'End date must be after or equal to start date' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Project does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tasks (with optional project filter)
app.get('/api/tasks', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM tasks';
    let params = [];
    
    if (projectId) {
      if (!isValidUUID(projectId)) {
        return res.status(400).json({ error: 'Invalid projectId format' });
      }
      query += ' WHERE project_id = $1';
      params.push(projectId);
    }
    
    query += ' ORDER BY start_date';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get task by ID
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const result = await pool.query('SELECT * FROM tasks WHERE task_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, duration, progress, load, projectId, description } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }
    if (startDate !== undefined && !isValidISODate(startDate)) {
      return res.status(400).json({ error: 'Invalid startDate format' });
    }
    if (endDate !== undefined && !isValidISODate(endDate)) {
      return res.status(400).json({ error: 'Invalid endDate format' });
    }
    if (duration !== undefined && (typeof duration !== 'number' || duration <= 0)) {
      return res.status(400).json({ error: 'Duration must be a positive number' });
    }
    if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || progress > 100)) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }
    if (load !== undefined && load !== null && (typeof load !== 'number' || load < 0)) {
      return res.status(400).json({ error: 'Load must be a non-negative number' });
    }
    if (projectId !== undefined && projectId !== null && !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid projectId format' });
    }

    const query = `
      UPDATE tasks 
      SET name = COALESCE($1, name),
          start_date = COALESCE($2, start_date),
          end_date = COALESCE($3, end_date),
          duration = COALESCE($4, duration),
          progress = COALESCE($5, progress),
          load = COALESCE($6, load),
          project_id = COALESCE($7, project_id),
          description = COALESCE($8, description)
      WHERE task_id = $9
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, startDate, endDate, duration, progress, load, projectId, description, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.message.includes('check_task_dates')) {
      return res.status(400).json({ error: 'End date must be after or equal to start date' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Project does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const result = await pool.query('DELETE FROM tasks WHERE task_id = $1 RETURNING task_id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete task with existing dependencies or assignments' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// RISKS ROUTES
// ============================================================================

// Create risk
app.post('/api/risks', async (req, res) => {
  try {
    const {
      name, preImpact, postImpact, preLikelihood, postLikelihood,
      preScore, postScore, preparedness, date, description
    } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }
    if (typeof preImpact !== 'number' || preImpact < 1 || preImpact > 5) {
      return res.status(400).json({ error: 'preImpact is required and must be between 1 and 5' });
    }
    if (typeof postImpact !== 'number' || postImpact < 1 || postImpact > 5) {
      return res.status(400).json({ error: 'postImpact is required and must be between 1 and 5' });
    }
    if (typeof preLikelihood !== 'number' || preLikelihood < 1 || preLikelihood > 5) {
      return res.status(400).json({ error: 'preLikelihood is required and must be between 1 and 5' });
    }
    if (typeof postLikelihood !== 'number' || postLikelihood < 1 || postLikelihood > 5) {
      return res.status(400).json({ error: 'postLikelihood is required and must be between 1 and 5' });
    }
    if (preScore !== undefined && preScore !== null && (typeof preScore !== 'number' || preScore < 1 || preScore > 25)) {
      return res.status(400).json({ error: 'preScore must be between 1 and 25' });
    }
    if (postScore !== undefined && postScore !== null && (typeof postScore !== 'number' || postScore < 1 || postScore > 25)) {
      return res.status(400).json({ error: 'postScore must be between 1 and 25' });
    }
    if (typeof preparedness !== 'number' || preparedness < 0 || preparedness > 100) {
      return res.status(400).json({ error: 'Preparedness is required and must be between 0 and 100' });
    }
    if (!date || !isValidISODate(date)) {
      return res.status(400).json({ error: 'Valid date is required (ISO 8601 format)' });
    }

    const query = `
      INSERT INTO risks (
        name, pre_impact, post_impact, pre_likelihood, post_likelihood,
        pre_score, post_score, preparedness, date, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, preImpact, postImpact, preLikelihood, postLikelihood,
      preScore || null, postScore || null, preparedness, date, description || null
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all risks
app.get('/api/risks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM risks ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get risk by ID
app.get('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid risk ID format' });
    }

    const result = await pool.query('SELECT * FROM risks WHERE risk_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update risk
app.put('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, preImpact, postImpact, preLikelihood, postLikelihood,
      preScore, postScore, preparedness, date, description
    } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid risk ID format' });
    }

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }
    if (preImpact !== undefined && (typeof preImpact !== 'number' || preImpact < 1 || preImpact > 5)) {
      return res.status(400).json({ error: 'preImpact must be between 1 and 5' });
    }
    if (postImpact !== undefined && (typeof postImpact !== 'number' || postImpact < 1 || postImpact > 5)) {
      return res.status(400).json({ error: 'postImpact must be between 1 and 5' });
    }
    if (preLikelihood !== undefined && (typeof preLikelihood !== 'number' || preLikelihood < 1 || preLikelihood > 5)) {
      return res.status(400).json({ error: 'preLikelihood must be between 1 and 5' });
    }
    if (postLikelihood !== undefined && (typeof postLikelihood !== 'number' || postLikelihood < 1 || postLikelihood > 5)) {
      return res.status(400).json({ error: 'postLikelihood must be between 1 and 5' });
    }
    if (preScore !== undefined && preScore !== null && (typeof preScore !== 'number' || preScore < 1 || preScore > 25)) {
      return res.status(400).json({ error: 'preScore must be between 1 and 25' });
    }
    if (postScore !== undefined && postScore !== null && (typeof postScore !== 'number' || postScore < 1 || postScore > 25)) {
      return res.status(400).json({ error: 'postScore must be between 1 and 25' });
    }
    if (preparedness !== undefined && (typeof preparedness !== 'number' || preparedness < 0 || preparedness > 100)) {
      return res.status(400).json({ error: 'Preparedness must be between 0 and 100' });
    }
    if (date !== undefined && !isValidISODate(date)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const query = `
      UPDATE risks 
      SET name = COALESCE($1, name),
          pre_impact = COALESCE($2, pre_impact),
          post_impact = COALESCE($3, post_impact),
          pre_likelihood = COALESCE($4, pre_likelihood),
          post_likelihood = COALESCE($5, post_likelihood),
          pre_score = COALESCE($6, pre_score),
          post_score = COALESCE($7, post_score),
          preparedness = COALESCE($8, preparedness),
          date = COALESCE($9, date),
          description = COALESCE($10, description)
      WHERE risk_id = $11
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, preImpact, postImpact, preLikelihood, postLikelihood,
      preScore, postScore, preparedness, date, description, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete risk
app.delete('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid risk ID format' });
    }

    const result = await pool.query('DELETE FROM risks WHERE risk_id = $1 RETURNING risk_id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    res.json({ message: 'Risk deleted successfully' });
  } catch (error) {
    console.error('Error deleting risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// MILESTONES ROUTES
// ============================================================================

// Create milestone
app.post('/api/milestones', async (req, res) => {
  try {
    const { name, startDate, endDate, ownerId, projectId, description, complete } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }
    if (!startDate || !isValidISODate(startDate)) {
      return res.status(400).json({ error: 'Valid startDate is required (ISO 8601 format)' });
    }
    if (!endDate || !isValidISODate(endDate)) {
      return res.status(400).json({ error: 'Valid endDate is required (ISO 8601 format)' });
    }
    if (!ownerId || !isValidUUID(ownerId)) {
      return res.status(400).json({ error: 'Valid ownerId (UUID) is required' });
    }
    if (projectId && !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'ProjectId must be a valid UUID' });
    }
    if (complete !== undefined && typeof complete !== 'boolean') {
      return res.status(400).json({ error: 'Complete must be a boolean' });
    }

    const query = `
      INSERT INTO milestones (name, start_date, end_date, owner_id, project_id, description, complete)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, startDate, endDate, ownerId, projectId || null, description || null, complete !== undefined ? complete : false
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating milestone:', error);
    if (error.message.includes('check_milestone_dates')) {
      return res.status(400).json({ error: 'End date must be after or equal to start date' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Project does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all milestones (with optional filters)
app.get('/api/milestones', async (req, res) => {
  try {
    const { projectId, ownerId, complete } = req.query;
    
    let query = 'SELECT * FROM milestones WHERE 1=1';
    let params = [];
    let paramCount = 1;
    
    if (projectId) {
      if (!isValidUUID(projectId)) {
        return res.status(400).json({ error: 'Invalid projectId format' });
      }
      query += ` AND project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    if (ownerId) {
      if (!isValidUUID(ownerId)) {
        return res.status(400).json({ error: 'Invalid ownerId format' });
      }
      query += ` AND owner_id = $${paramCount}`;
      params.push(ownerId);
      paramCount++;
    }

    if (complete !== undefined) {
      query += ` AND complete = $${paramCount}`;
      params.push(complete === 'true');
      paramCount++;
    }
    
    query += ' ORDER BY start_date';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get milestone by ID
app.get('/api/milestones/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid milestone ID format' });
    }

    const result = await pool.query('SELECT * FROM milestones WHERE milestone_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching milestone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update milestone
app.put('/api/milestones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, ownerId, projectId, description, complete } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid milestone ID format' });
    }

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }
    if (startDate !== undefined && !isValidISODate(startDate)) {
      return res.status(400).json({ error: 'Invalid startDate format' });
    }
    if (endDate !== undefined && !isValidISODate(endDate)) {
      return res.status(400).json({ error: 'Invalid endDate format' });
    }
    if (ownerId !== undefined && !isValidUUID(ownerId)) {
      return res.status(400).json({ error: 'Invalid ownerId format' });
    }
    if (projectId !== undefined && projectId !== null && !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid projectId format' });
    }
    if (complete !== undefined && typeof complete !== 'boolean') {
      return res.status(400).json({ error: 'Complete must be a boolean' });
    }

    const query = `
      UPDATE milestones 
      SET name = COALESCE($1, name),
          start_date = COALESCE($2, start_date),
          end_date = COALESCE($3, end_date),
          owner_id = COALESCE($4, owner_id),
          project_id = COALESCE($5, project_id),
          description = COALESCE($6, description),
          complete = COALESCE($7, complete)
      WHERE milestone_id = $8
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, startDate, endDate, ownerId, projectId, description, complete, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating milestone:', error);
    if (error.message.includes('check_milestone_dates')) {
      return res.status(400).json({ error: 'End date must be after or equal to start date' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Project does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete milestone
app.delete('/api/milestones/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid milestone ID format' });
    }

    const result = await pool.query('DELETE FROM milestones WHERE milestone_id = $1 RETURNING milestone_id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete milestone with existing dependencies or tasks' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// RESOURCES ROUTES
// ============================================================================

// Create resource
app.post('/api/resources', async (req, res) => {
  try {
    const { name, capacity, role, teamId, description } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }
    if (typeof capacity !== 'number' || capacity < 0) {
      return res.status(400).json({ error: 'Capacity is required and must be a non-negative number' });
    }
    if (!role || typeof role !== 'string') {
      return res.status(400).json({ error: 'Role is required and must be a string' });
    }
    if (!teamId || !isValidUUID(teamId)) {
      return res.status(400).json({ error: 'Valid teamId (UUID) is required' });
    }

    const query = `
      INSERT INTO resources (name, capacity, role, team_id, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, capacity, role, teamId, description || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Team does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all resources (with optional team filter)
app.get('/api/resources', async (req, res) => {
  try {
    const { teamId } = req.query;
    
    let query = 'SELECT * FROM resources';
    let params = [];
    
    if (teamId) {
      if (!isValidUUID(teamId)) {
        return res.status(400).json({ error: 'Invalid teamId format' });
      }
      query += ' WHERE team_id = $1';
      params.push(teamId);
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get resource by ID
app.get('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid resource ID format' });
    }

    const result = await pool.query('SELECT * FROM resources WHERE resource_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update resource
app.put('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, role, teamId, description } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid resource ID format' });
    }

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }
    if (capacity !== undefined && (typeof capacity !== 'number' || capacity < 0)) {
      return res.status(400).json({ error: 'Capacity must be a non-negative number' });
    }
    if (role !== undefined && typeof role !== 'string') {
      return res.status(400).json({ error: 'Role must be a string' });
    }
    if (teamId !== undefined && !isValidUUID(teamId)) {
      return res.status(400).json({ error: 'Invalid teamId format' });
    }

    const query = `
      UPDATE resources 
      SET name = COALESCE($1, name),
          capacity = COALESCE($2, capacity),
          role = COALESCE($3, role),
          team_id = COALESCE($4, team_id),
          description = COALESCE($5, description)
      WHERE resource_id = $6
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, capacity, role, teamId, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Team does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete resource
app.delete('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid resource ID format' });
    }

    const result = await pool.query('DELETE FROM resources WHERE resource_id = $1 RETURNING resource_id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete resource with existing assignments' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get resources for a team
app.get('/api/teams/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid team ID format' });
    }

    const result = await pool.query(
      'SELECT * FROM resources WHERE team_id = $1 ORDER BY name',
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching team resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// ASSIGNMENTS ROUTES (Junction Table)
// ============================================================================

// Create assignment
app.post('/api/assignments', async (req, res) => {
  try {
    const { taskId, resourceId } = req.body;

    if (!taskId || !isValidUUID(taskId)) {
      return res.status(400).json({ error: 'Valid taskId (UUID) is required' });
    }
    if (!resourceId || !isValidUUID(resourceId)) {
      return res.status(400).json({ error: 'Valid resourceId (UUID) is required' });
    }

    const query = `
      INSERT INTO assignments (task_id, resource_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [taskId, resourceId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating assignment:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Task or resource does not exist' });
    }
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Assignment already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all assignments (with optional filters)
app.get('/api/assignments', async (req, res) => {
  try {
    const { taskId, resourceId } = req.query;
    
    let query = 'SELECT * FROM assignments WHERE 1=1';
    let params = [];
    let paramCount = 1;
    
    if (taskId) {
      if (!isValidUUID(taskId)) {
        return res.status(400).json({ error: 'Invalid taskId format' });
      }
      query += ` AND task_id = $${paramCount}`;
      params.push(taskId);
      paramCount++;
    }

    if (resourceId) {
      if (!isValidUUID(resourceId)) {
        return res.status(400).json({ error: 'Invalid resourceId format' });
      }
      query += ` AND resource_id = $${paramCount}`;
      params.push(resourceId);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete assignment
app.delete('/api/assignments/:taskId/:resourceId', async (req, res) => {
  try {
    const { taskId, resourceId } = req.params;

    if (!isValidUUID(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    if (!isValidUUID(resourceId)) {
      return res.status(400).json({ error: 'Invalid resource ID format' });
    }

    const result = await pool.query(
      'DELETE FROM assignments WHERE task_id = $1 AND resource_id = $2 RETURNING *',
      [taskId, resourceId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// MILESTONE DEPENDENCIES ROUTES (Junction Table)
// ============================================================================

// Create milestone dependency
app.post('/api/milestone-dependencies', async (req, res) => {
  try {
    const { sourceId, targetId, dependencyType, lag } = req.body;

    if (!sourceId || !isValidUUID(sourceId)) {
      return res.status(400).json({ error: 'Valid sourceId (UUID) is required' });
    }
    if (!targetId || !isValidUUID(targetId)) {
      return res.status(400).json({ error: 'Valid targetId (UUID) is required' });
    }
    if (sourceId === targetId) {
      return res.status(400).json({ error: 'A milestone cannot depend on itself' });
    }
    if (!dependencyType || typeof dependencyType !== 'string') {
      return res.status(400).json({ error: 'DependencyType is required and must be a string' });
    }
    if (typeof lag !== 'number' || lag < 0) {
      return res.status(400).json({ error: 'Lag is required and must be a non-negative number' });
    }

    const query = `
      INSERT INTO milestone_dependencies (source_id, target_id, dependency_type, lag)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [sourceId, targetId, dependencyType, lag]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating milestone dependency:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Source or target milestone does not exist' });
    }
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Dependency already exists' });
    }
    if (error.message.includes('check_no_self_dependency')) {
      return res.status(400).json({ error: 'A milestone cannot depend on itself' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all milestone dependencies (with optional filters)
app.get('/api/milestone-dependencies', async (req, res) => {
  try {
    const { sourceId, targetId } = req.query;
    
    let query = 'SELECT * FROM milestone_dependencies WHERE 1=1';
    let params = [];
    let paramCount = 1;
    
    if (sourceId) {
      if (!isValidUUID(sourceId)) {
        return res.status(400).json({ error: 'Invalid sourceId format' });
      }
      query += ` AND source_id = $${paramCount}`;
      params.push(sourceId);
      paramCount++;
    }

    if (targetId) {
      if (!isValidUUID(targetId)) {
        return res.status(400).json({ error: 'Invalid targetId format' });
      }
      query += ` AND target_id = $${paramCount}`;
      params.push(targetId);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching milestone dependencies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete milestone dependency
app.delete('/api/milestone-dependencies/:sourceId/:targetId', async (req, res) => {
  try {
    const { sourceId, targetId } = req.params;

    if (!isValidUUID(sourceId)) {
      return res.status(400).json({ error: 'Invalid source ID format' });
    }
    if (!isValidUUID(targetId)) {
      return res.status(400).json({ error: 'Invalid target ID format' });
    }

    const result = await pool.query(
      'DELETE FROM milestone_dependencies WHERE source_id = $1 AND target_id = $2 RETURNING *',
      [sourceId, targetId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone dependency not found' });
    }

    res.json({ message: 'Milestone dependency deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone dependency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// MILESTONE TASKS ROUTES (Junction Table)
// ============================================================================

// Create milestone-task relationship
app.post('/api/milestone-tasks', async (req, res) => {
  try {
    const { milestoneId, taskId } = req.body;

    if (!milestoneId || !isValidUUID(milestoneId)) {
      return res.status(400).json({ error: 'Valid milestoneId (UUID) is required' });
    }
    if (!taskId || !isValidUUID(taskId)) {
      return res.status(400).json({ error: 'Valid taskId (UUID) is required' });
    }

    const query = `
      INSERT INTO milestone_tasks (milestone_id, task_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [milestoneId, taskId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating milestone-task relationship:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Milestone or task does not exist' });
    }
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Relationship already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all milestone-task relationships (with optional filters)
app.get('/api/milestone-tasks', async (req, res) => {
  try {
    const { milestoneId, taskId } = req.query;
    
    let query = 'SELECT * FROM milestone_tasks WHERE 1=1';
    let params = [];
    let paramCount = 1;
    
    if (milestoneId) {
      if (!isValidUUID(milestoneId)) {
        return res.status(400).json({ error: 'Invalid milestoneId format' });
      }
      query += ` AND milestone_id = $${paramCount}`;
      params.push(milestoneId);
      paramCount++;
    }

    if (taskId) {
      if (!isValidUUID(taskId)) {
        return res.status(400).json({ error: 'Invalid taskId format' });
      }
      query += ` AND task_id = $${paramCount}`;
      params.push(taskId);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching milestone-task relationships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete milestone-task relationship
app.delete('/api/milestone-tasks/:milestoneId/:taskId', async (req, res) => {
  try {
    const { milestoneId, taskId } = req.params;

    if (!isValidUUID(milestoneId)) {
      return res.status(400).json({ error: 'Invalid milestone ID format' });
    }
    if (!isValidUUID(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const result = await pool.query(
      'DELETE FROM milestone_tasks WHERE milestone_id = $1 AND task_id = $2 RETURNING *',
      [milestoneId, taskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone-task relationship not found' });
    }

    res.json({ message: 'Milestone-task relationship deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone-task relationship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tasks for a milestone
app.get('/api/milestones/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid milestone ID format' });
    }

    const query = `
      SELECT t.* 
      FROM tasks t
      INNER JOIN milestone_tasks mt ON t.task_id = mt.task_id
      WHERE mt.milestone_id = $1
      ORDER BY t.start_date
    `;
    
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching milestone tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// PROJECT RISKS ROUTES (Junction Table)
// ============================================================================

// Create project-risk relationship
app.post('/api/project-risks', async (req, res) => {
  try {
    const { projectId, riskId } = req.body;

    if (!projectId || !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Valid projectId (UUID) is required' });
    }
    if (!riskId || !isValidUUID(riskId)) {
      return res.status(400).json({ error: 'Valid riskId (UUID) is required' });
    }

    const query = `
      INSERT INTO project_risks (project_id, risk_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [projectId, riskId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project-risk relationship:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Project or risk does not exist' });
    }
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Relationship already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all project-risk relationships (with optional filters)
app.get('/api/project-risks', async (req, res) => {
  try {
    const { projectId, riskId } = req.query;
    
    let query = 'SELECT * FROM project_risks WHERE 1=1';
    let params = [];
    let paramCount = 1;
    
    if (projectId) {
      if (!isValidUUID(projectId)) {
        return res.status(400).json({ error: 'Invalid projectId format' });
      }
      query += ` AND project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    if (riskId) {
      if (!isValidUUID(riskId)) {
        return res.status(400).json({ error: 'Invalid riskId format' });
      }
      query += ` AND risk_id = $${paramCount}`;
      params.push(riskId);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project-risk relationships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project-risk relationship
app.delete('/api/project-risks/:projectId/:riskId', async (req, res) => {
  try {
    const { projectId, riskId } = req.params;

    if (!isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }
    if (!isValidUUID(riskId)) {
      return res.status(400).json({ error: 'Invalid risk ID format' });
    }

    const result = await pool.query(
      'DELETE FROM project_risks WHERE project_id = $1 AND risk_id = $2 RETURNING *',
      [projectId, riskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project-risk relationship not found'});
    }

    res.json({ message: 'Project-risk relationship deleted successfully' });
} catch (error) {
console.error('Error deleting project-risk relationship:', error);
res.status(500).json({ error: 'Internal server error' });
}
});
// Get risks for a project
app.get('/api/projects/:id/risks', async (req, res) => {
try {
const { id } = req.params;
if (!isValidUUID(id)) {
  return res.status(400).json({ error: 'Invalid project ID format' });
}

const query = `
  SELECT r.* 
  FROM risks r
  INNER JOIN project_risks pr ON r.risk_id = pr.risk_id
  WHERE pr.project_id = $1
  ORDER BY r.date DESC
`;

const result = await pool.query(query, [id]);
res.json(result.rows);
} catch (error) {
console.error('Error fetching project risks:', error);
res.status(500).json({ error: 'Internal server error' });
}
});
// ============================================================================
// TASK DEPENDENCIES ROUTES (Junction Table)
// ============================================================================
// Create task dependency
app.post('/api/task-dependencies', async (req, res) => {
try {
const { sourceId, targetId, dependencyType, lag } = req.body;
if (!sourceId || !isValidUUID(sourceId)) {
  return res.status(400).json({ error: 'Valid sourceId (UUID) is required' });
}
if (!targetId || !isValidUUID(targetId)) {
  return res.status(400).json({ error: 'Valid targetId (UUID) is required' });
}
if (sourceId === targetId) {
  return res.status(400).json({ error: 'A task cannot depend on itself' });
}
if (!dependencyType || typeof dependencyType !== 'string') {
  return res.status(400).json({ error: 'DependencyType is required and must be a string' });
}
if (typeof lag !== 'number' || lag < 0) {
  return res.status(400).json({ error: 'Lag is required and must be a non-negative number' });
}

const query = `
  INSERT INTO task_dependencies (source_id, target_id, dependency_type, lag)
  VALUES ($1, $2, $3, $4)
  RETURNING *
`;

const result = await pool.query(query, [sourceId, targetId, dependencyType, lag]);
res.status(201).json(result.rows[0]);
} catch (error) {
console.error('Error creating task dependency:', error);
if (error.code === '23503') {
return res.status(400).json({ error: 'Source or target task does not exist' });
}
if (error.code === '23505') {
return res.status(400).json({ error: 'Dependency already exists' });
}
if (error.message.includes('check_no_self_dependency')) {
return res.status(400).json({ error: 'A task cannot depend on itself' });
}
res.status(500).json({ error: 'Internal server error' });
}
});
// Get all task dependencies (with optional filters)
app.get('/api/task-dependencies', async (req, res) => {
try {
const { sourceId, targetId } = req.query;
let query = 'SELECT * FROM task_dependencies WHERE 1=1';
let params = [];
let paramCount = 1;

if (sourceId) {
  if (!isValidUUID(sourceId)) {
    return res.status(400).json({ error: 'Invalid sourceId format' });
  }
  query += ` AND source_id = $${paramCount}`;
  params.push(sourceId);
  paramCount++;
}

if (targetId) {
  if (!isValidUUID(targetId)) {
    return res.status(400).json({ error: 'Invalid targetId format' });
  }
  query += ` AND target_id = $${paramCount}`;
  params.push(targetId);
  paramCount++;
}

query += ' ORDER BY created_at DESC';

const result = await pool.query(query, params);
res.json(result.rows);
} catch (error) {
console.error('Error fetching task dependencies:', error);
res.status(500).json({ error: 'Internal server error' });
}
});
// Delete task dependency
app.delete('/api/task-dependencies/:sourceId/:targetId', async (req, res) => {
try {
const { sourceId, targetId } = req.params;
if (!isValidUUID(sourceId)) {
  return res.status(400).json({ error: 'Invalid source ID format' });
}
if (!isValidUUID(targetId)) {
  return res.status(400).json({ error: 'Invalid target ID format' });
}

const result = await pool.query(
  'DELETE FROM task_dependencies WHERE source_id = $1 AND target_id = $2 RETURNING *',
  [sourceId, targetId]
);

if (result.rows.length === 0) {
  return res.status(404).json({ error: 'Task dependency not found' });
}

res.json({ message: 'Task dependency deleted successfully' });
} catch (error) {
console.error('Error deleting task dependency:', error);
res.status(500).json({ error: 'Internal server error' });
}
});
// ============================================================================
// TASK RISKS ROUTES (Junction Table)
// ============================================================================
// Create task-risk relationship
app.post('/api/task-risks', async (req, res) => {
try {
const { taskId, riskId } = req.body;
if (!taskId || !isValidUUID(taskId)) {
  return res.status(400).json({ error: 'Valid taskId (UUID) is required' });
}
if (!riskId || !isValidUUID(riskId)) {
  return res.status(400).json({ error: 'Valid riskId (UUID) is required' });
}

const query = `
  INSERT INTO task_risks (task_id, risk_id)
  VALUES ($1, $2)
  RETURNING *
`;

const result = await pool.query(query, [taskId, riskId]);
res.status(201).json(result.rows[0]);
} catch (error) {
console.error('Error creating task-risk relationship:', error);
if (error.code === '23503') {
return res.status(400).json({ error: 'Task or risk does not exist' });
}
if (error.code === '23505') {
return res.status(400).json({ error: 'Relationship already exists' });
}
res.status(500).json({ error: 'Internal server error' });
}
});
// Get all task-risk relationships (with optional filters)
app.get('/api/task-risks', async (req, res) => {
try {
const { taskId, riskId } = req.query;
let query = 'SELECT * FROM task_risks WHERE 1=1';
let params = [];
let paramCount = 1;

if (taskId) {
  if (!isValidUUID(taskId)) {
    return res.status(400).json({ error: 'Invalid taskId format' });
  }
  query += ` AND task_id = $${paramCount}`;
  params.push(taskId);
  paramCount++;
}

if (riskId) {
  if (!isValidUUID(riskId)) {
    return res.status(400).json({ error: 'Invalid riskId format' });
  }
  query += ` AND risk_id = $${paramCount}`;
  params.push(riskId);
  paramCount++;
}

query += ' ORDER BY created_at DESC';

const result = await pool.query(query, params);
res.json(result.rows);
} catch (error) {
console.error('Error fetching task-risk relationships:', error);
res.status(500).json({ error: 'Internal server error' });
}
});
// Delete task-risk relationship
app.delete('/api/task-risks/:taskId/:riskId', async (req, res) => {
try {
const { taskId, riskId } = req.params;
if (!isValidUUID(taskId)) {
  return res.status(400).json({ error: 'Invalid task ID format' });
}
if (!isValidUUID(riskId)) {
  return res.status(400).json({ error: 'Invalid risk ID format' });
}

const result = await pool.query(
  'DELETE FROM task_risks WHERE task_id = $1 AND risk_id = $2 RETURNING *',
  [taskId, riskId]
);

if (result.rows.length === 0) {
  return res.status(404).json({ error: 'Task-risk relationship not found' });
}

res.json({ message: 'Task-risk relationship deleted successfully' });
} catch (error) {
console.error('Error deleting task-risk relationship:', error);
res.status(500).json({ error: 'Internal server error' });
}
});
// Get risks for a task
app.get('/api/tasks/:id/risks', async (req, res) => {
try {
const { id } = req.params;
if (!isValidUUID(id)) {
  return res.status(400).json({ error: 'Invalid task ID format' });
}

const query = `
  SELECT r.* 
  FROM risks r
  INNER JOIN task_risks tr ON r.risk_id = tr.risk_id
  WHERE tr.task_id = $1
  ORDER BY r.date DESC
`;

const result = await pool.query(query, [id]);
res.json(result.rows);
} catch (error) {
console.error('Error fetching task risks:', error);
res.status(500).json({ error: 'Internal server error' });
}
});
// ============================================================================
// SERVER SETUP
// ============================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
console.log('SIGTERM received, closing database pool');
await pool.end();
process.exit(0);
});
process.on('SIGINT', async () => {
console.log('SIGINT received, closing database pool');
await pool.end();
process.exit(0);
});

        