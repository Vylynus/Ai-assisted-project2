document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const taskGroup = document.getElementById('task-group');
    const addButton = document.getElementById('add-button');
    const activeList = document.getElementById('active-list');
    const completedList = document.getElementById('completed-list');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    // Group lists
    const groupLists = {
        work: document.getElementById('work-list'),
        personal: document.getElementById('personal-list'),
        shopping: document.getElementById('shopping-list'),
        health: document.getElementById('health-list')
    };

    // Sidebar toggle functionality
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Save sidebar state to localStorage
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
    
    // Load sidebar state from localStorage
    function loadSidebarState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }
    
    // Add new task
    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText === '') return;

        const group = taskGroup.value;
        
        // Create task element
        const tr = createTaskElement(taskText, group);
        
        // Add to appropriate list
        if (group === 'none') {
            activeList.appendChild(tr);
        } else {
            // Add to both active list and group list
            const groupTr = createGroupTaskElement(taskText, group);
            activeList.appendChild(tr);
            groupLists[group].appendChild(groupTr);
            
            // Add group class to identify it
            tr.classList.add('group-' + group);
            groupTr.classList.add('group-' + group);
        }
        
        todoInput.value = '';
        todoInput.focus();
        
        // Save to local storage
        saveTasksToLocalStorage();
        
        // Check if lists were empty and remove empty messages if needed
        checkEmptyLists();
    }

    // Create a task element for the active list
    function createTaskElement(taskText, group) {
        const tr = document.createElement('tr');
        if (group !== 'none') {
            tr.setAttribute('data-group', group);
        }
        
        // Task text cell
        const taskCell = document.createElement('td');
        taskCell.textContent = taskText;
        
        // Group badge cell
        const groupCell = document.createElement('td');
        const groupBadge = document.createElement('span');
        groupBadge.className = `group-badge ${group}`;
        groupBadge.textContent = group === 'none' ? 'None' : group.charAt(0).toUpperCase() + group.slice(1);
        groupCell.appendChild(groupBadge);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'task-actions';
        
        const completeBtn = document.createElement('button');
        completeBtn.innerHTML = '<i class="fas fa-check"></i>';
        completeBtn.className = 'complete-btn';
        completeBtn.title = "Mark as complete";
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = "Delete task";
        
        actionsCell.appendChild(completeBtn);
        actionsCell.appendChild(deleteBtn);
        
        tr.appendChild(taskCell);
        tr.appendChild(groupCell);
        tr.appendChild(actionsCell);
        
        // Add event listeners
        completeBtn.addEventListener('click', completeTask);
        deleteBtn.addEventListener('click', deleteTask);
        
        return tr;
    }
    
    // Create a task element for group lists
    function createGroupTaskElement(taskText, group) {
        const tr = document.createElement('tr');
        tr.setAttribute('data-group', group);
        
        // Task text cell
        const taskCell = document.createElement('td');
        taskCell.textContent = taskText;
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'task-actions';
        
        const completeBtn = document.createElement('button');
        completeBtn.innerHTML = '<i class="fas fa-check"></i>';
        completeBtn.className = 'complete-btn';
        completeBtn.title = "Mark as complete";
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = "Delete task";
        
        actionsCell.appendChild(completeBtn);
        actionsCell.appendChild(deleteBtn);
        
        tr.appendChild(taskCell);
        tr.appendChild(actionsCell);
        
        // Add event listeners
        completeBtn.addEventListener('click', completeTask);
        deleteBtn.addEventListener('click', deleteTask);
        
        return tr;
    }

    // Complete a task
    function completeTask(e) {
        const row = e.target.closest('tr');
        const taskText = row.querySelector('td').textContent;
        const group = row.getAttribute('data-group') || 'none';
        
        // Create a completed task element
        const completedRow = document.createElement('tr');
        completedRow.innerHTML = `
            <td>${taskText}</td>
            <td class="task-actions">
                <button class="delete-btn" title="Delete task"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        // Add to completed list
        completedList.appendChild(completedRow);
        
        // Add event listener to the delete button
        completedRow.querySelector('.delete-btn').addEventListener('click', deleteTask);
        
        // Remove from active list
        row.style.opacity = '0';
        row.style.transform = 'translateX(30px)';
        
        setTimeout(() => {
            // Remove from active list
            if (row.parentElement) {
                row.parentElement.removeChild(row);
            }
            
            // If it's a grouped task, also remove from group list
            if (group !== 'none') {
                const groupItems = document.querySelectorAll(`.group-${group}`);
                groupItems.forEach(item => {
                    if (item.querySelector('td').textContent === taskText && item !== row) {
                        if (item.parentElement) {
                            item.parentElement.removeChild(item);
                        }
                    }
                });
            }
            
            // Save to local storage
            saveTasksToLocalStorage();
            
            // Check if lists are empty
            checkEmptyLists();
        }, 300);
    }

    // Delete task
    function deleteTask(e) {
        const row = e.target.closest('tr');
        const taskText = row.querySelector('td').textContent;
        const group = row.getAttribute('data-group') || 'none';
        
        // Add a fade-out animation
        row.style.opacity = '0';
        row.style.transform = 'translateX(30px)';
        
        // Remove after animation completes
        setTimeout(() => {
            if (row.parentElement) {
                row.parentElement.removeChild(row);
            }
            
            // If it's a grouped task, also remove from group list
            if (group !== 'none' && !row.parentElement.id.includes('completed')) {
                const groupItems = document.querySelectorAll(`.group-${group}`);
                groupItems.forEach(item => {
                    if (item.querySelector('td').textContent === taskText && item !== row) {
                        if (item.parentElement) {
                            item.parentElement.removeChild(item);
                        }
                    }
                });
            }
            
            saveTasksToLocalStorage();
            
            // Check if lists are empty
            checkEmptyLists();
        }, 300);
    }

    // Clear all completed tasks
    function clearCompletedTasks() {
        const completedTasks = completedList.querySelectorAll('tr');
        
        completedTasks.forEach(task => {
            task.style.opacity = '0';
            task.style.transform = 'translateX(30px)';
        });
        
        setTimeout(() => {
            completedList.innerHTML = '';
            saveTasksToLocalStorage();
            checkEmptyLists();
        }, 300);
    }

    // Tab switching
    function switchTab(e) {
        const tabId = e.currentTarget.getAttribute('data-tab');
        
        // Update active nav button
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Show selected tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId + '-tasks').classList.add('active');
    }

    // Check if lists are empty and add placeholder message if needed
    function checkEmptyLists() {
        // Check active list
        if (activeList.children.length === 0) {
            activeList.innerHTML = '<tr><td colspan="3" class="empty-message">No active tasks. Add a new task to get started!</td></tr>';
        } else if (activeList.querySelector('.empty-message') && activeList.children.length > 1) {
            const emptyRow = activeList.querySelector('tr td.empty-message').parentElement;
            if (emptyRow) {
                activeList.removeChild(emptyRow);
            }
        }
        
        // Check completed list
        if (completedList.children.length === 0) {
            completedList.innerHTML = '<tr><td colspan="2" class="empty-message">No completed tasks yet.</td></tr>';
        } else if (completedList.querySelector('.empty-message') && completedList.children.length > 1) {
            const emptyRow = completedList.querySelector('tr td.empty-message').parentElement;
            if (emptyRow) {
                completedList.removeChild(emptyRow);
            }
        }
        
        // Check group lists
        Object.keys(groupLists).forEach(group => {
            const list = groupLists[group];
            if (list.children.length === 0) {
                list.innerHTML = `<tr><td colspan="2" class="empty-message">No ${group} tasks yet.</td></tr>`;
            } else if (list.querySelector('.empty-message') && list.children.length > 1) {
                const emptyRow = list.querySelector('tr td.empty-message').parentElement;
                if (emptyRow) {
                    list.removeChild(emptyRow);
                }
            }
        });
    }

    // Save tasks to local storage
    function saveTasksToLocalStorage() {
        const tasks = {
            active: [],
            completed: [],
            groups: {
                work: [],
                personal: [],
                shopping: [],
                health: []
            }
        };
        
        // Save active tasks
        document.querySelectorAll('#active-list tr:not(.empty-message)').forEach(task => {
            if (!task.querySelector('.empty-message')) {
                const cells = task.querySelectorAll('td');
                if (cells.length >= 2) {
                    const group = task.getAttribute('data-group') || 'none';
                    tasks.active.push({
                        text: cells[0].textContent,
                        group: group
                    });
                }
            }
        });
        
        // Save completed tasks
        document.querySelectorAll('#completed-list tr:not(.empty-message)').forEach(task => {
            if (!task.querySelector('.empty-message')) {
                const cells = task.querySelectorAll('td');
                if (cells.length >= 1) {
                    tasks.completed.push({
                        text: cells[0].textContent
                    });
                }
            }
        });
        
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    // Load tasks from local storage
    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('todoTasks'));
        
        if (!tasks) {
            checkEmptyLists();
            return;
        }
        
        // Clear example tasks
        activeList.innerHTML = '';
        completedList.innerHTML = '';
        Object.values(groupLists).forEach(list => {
            list.innerHTML = '';
        });
        
        // Load active tasks
        tasks.active.forEach(task => {
            const tr = createTaskElement(task.text, task.group);
            
            if (task.group !== 'none') {
                tr.setAttribute('data-group', task.group);
                tr.classList.add('group-' + task.group);
                
                // Also add to group list
                const groupTr = createGroupTaskElement(task.text, task.group);
                groupTr.classList.add('group-' + task.group);
                groupLists[task.group].appendChild(groupTr);
            }
            
            activeList.appendChild(tr);
        });
        
        // Load completed tasks
        tasks.completed.forEach(task => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.text}</td>
                <td class="task-actions">
                    <button class="delete-btn" title="Delete task"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            // Add event listener to the delete button
            tr.querySelector('.delete-btn').addEventListener('click', deleteTask);
            
            completedList.appendChild(tr);
        });
        
        checkEmptyLists();
    }

    // Event listeners
    addButton.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Tab switching
    navButtons.forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    
    // Add event listeners to the example task if it exists
    const exampleTaskCompleteBtn = document.querySelector('#active-list tr .complete-btn');
    const exampleTaskDeleteBtn = document.querySelector('#active-list tr .delete-btn');
    
    if (exampleTaskCompleteBtn) {
        exampleTaskCompleteBtn.addEventListener('click', completeTask);
    }
    
    if (exampleTaskDeleteBtn) {
        exampleTaskDeleteBtn.addEventListener('click', deleteTask);
    }

    // Load saved tasks when the page loads
    loadTasksFromLocalStorage();
    
    // Load sidebar state
    loadSidebarState();
}); 