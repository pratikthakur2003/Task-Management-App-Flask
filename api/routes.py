from flask import jsonify, request
from app.models import Task 
from app import db 
from api import api 

# Endpoint to fetch all tasks
@api.route('/tasks', methods=['GET'])
def get_tasks():
    """
    Fetch all tasks from the database.
    Returns:
        JSON: A list of tasks with their details (id, title, description, due_date, status).
    """
    tasks = Task.query.all() 
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date,
        'status': task.status
    } for task in tasks]) 

# Endpoint to create a new task
@api.route('/tasks', methods=['POST'])
def create_task():
    """
    Create a new task.
    Expects:
        JSON: Task data with 'title' (required), 'due_date' (required), 'description' (optional), 'status' (optional).
    Returns:
        JSON: A success message or an error message if required fields are missing.
    """
    data = request.get_json() 
    if not data.get('title') or not data.get('due_date'):
        return jsonify({'error': 'Title and Due Date are required'}), 400
    
    # Create a new task instance
    new_task = Task(
        title=data['title'],
        description=data.get('description', ''),
        due_date=data['due_date'],
        status=data.get('status', 'Pending') 
    )
    db.session.add(new_task) 
    db.session.commit()
    return jsonify({'message': 'Task created successfully'}) 

# Endpoint to fetch a specific task by ID
@api.route('/tasks/<int:id>', methods=['GET'])
def get_task(id):
    """
    Fetch a specific task by its ID.
    Args:
        id (int): The ID of the task.
    Returns:
        JSON: The task's details or a 404 error if the task is not found.
    """
    task = Task.query.get_or_404(id) 
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date,
        'status': task.status
    })

# Endpoint to update an existing task
@api.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    """
    Update an existing task.
    Args:
        id (int): The ID of the task to update.
    Expects:
        JSON: Updated task data with optional fields ('title', 'description', 'due_date', 'status').
    Returns:
        JSON: A success message.
    """
    data = request.get_json()  
    task = Task.query.get_or_404(id)  
    
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.due_date = data.get('due_date', task.due_date)
    task.status = data.get('status', task.status)
    
    db.session.commit() 
    return jsonify({'message': 'Task updated successfully'})  

# Endpoint to delete a task
@api.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    """
    Delete a specific task by its ID.
    Args:
        id (int): The ID of the task to delete.
    Returns:
        JSON: A success message.
    """
    task = Task.query.get_or_404(id) 
    db.session.delete(task) 
    db.session.commit()  
    return jsonify({'message': 'Task deleted successfully'}) 
