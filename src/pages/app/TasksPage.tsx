import React, { useState, useEffect } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { CheckSquare, GripVertical, Plus, Trash2, Edit2, Play, Check, AlertTriangle, Calendar, Flag, Search } from 'lucide-react';
import { Button, Card, Input, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableTaskItem = ({ 
  task, 
  onUpdate, 
  onDeleteRequest,
  onAddSubtask,
  isSubtask = false
}: { 
  task: Task; 
  onUpdate: (id: string, updates: Partial<Task>) => void; 
  onDeleteRequest: (id: string) => void;
  onAddSubtask?: (id: string) => void;
  isSubtask?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: false });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>(task.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isDone = task.status === 'done';

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdate(task.id, { 
      title: editTitle, 
      description: editDesc,
      priority: editPriority,
      dueDate: editDueDate
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.dueDate || '');
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case 'todo':
        return <Badge variant="secondary" className="bg-surface-100 text-surface-600 border-none px-2 py-0">To Do</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-2 py-0">In Progress</Badge>;
      case 'done':
        return <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0">Done</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = () => {
    const colors = {
      high: "bg-rose-50 text-rose-600 border-rose-100",
      medium: "bg-amber-50 text-amber-600 border-amber-100",
      low: "bg-blue-50 text-blue-600 border-blue-100"
    };
    return (
      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border capitalize font-normal", colors[task.priority || 'medium'])}>
        <Flag className="w-2.5 h-2.5 mr-1" />
        {task.priority || 'medium'}
      </Badge>
    );
  };

  const getDueDateDisplay = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    const isOverdue = !isDone && date < new Date() && date.toDateString() !== new Date().toDateString();
    
    return (
      <div className={cn("flex items-center gap-1 text-[10px]", isOverdue ? "text-rose-500 font-medium" : "text-surface-400")}>
        <Calendar className="w-3 h-3" />
        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </div>
    );
  };

  if (isEditing) {
    return (
      <Card ref={setNodeRef} style={style} className="p-4 mb-2 border-indigo-500 shadow-lg z-10">
        <div className="space-y-3">
          <Input 
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            placeholder="Task title"
            autoFocus
            className="font-medium"
          />
          <Textarea 
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Task description (optional)"
            rows={2}
            className="text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider ml-1">Priority</label>
              <div className="flex items-center gap-1">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditPriority(p)}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded text-[10px] font-medium border capitalize transition-all",
                      editPriority === p 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                        : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider ml-1">Due Date</label>
              <Input 
                type="date" 
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="text-[10px] h-8 py-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 p-3 transition-all mb-2 group",
        isDragging ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/20" : "hover:border-surface-300",
        isDone ? "bg-surface-50/50 opacity-80" : "bg-white shadow-sm",
        isSubtask && "ml-8 sm:ml-12 border-l-4 border-l-surface-200"
      )}
    >
      <div className="flex items-start gap-3 w-full capitalize">
        <div {...attributes} {...listeners} title="Drag to reorder" aria-label="Drag to reorder task" className="cursor-grab hover:bg-surface-100 p-1.5 rounded text-surface-400 mt-0.5 shrink-0 transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className={cn("font-medium text-sm truncate", isDone && "line-through text-surface-500")}>
              {task.title}
            </span>
            {getStatusBadge()}
            {getPriorityBadge()}
            {getDueDateDisplay()}
          </div>
          {task.description && (
            <span className={cn("text-xs text-surface-500 block line-clamp-2", isDone && "line-through opacity-70")}>
              {task.description}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:ml-auto shrink-0 self-center">
          {/* Status Toggles */}
          <div role="group" aria-label="Task status" className="flex items-center bg-surface-100 p-0.5 rounded-lg mr-2 border border-surface-200">
            <button
              title="Set to 'To Do'"
              aria-label="Set to 'To Do'"
              aria-pressed={task.status === 'todo'}
              onClick={() => onUpdate(task.id, { status: 'todo' })}
              className={cn("p-1.5 rounded-md transition-all", task.status === 'todo' ? "bg-white shadow-sm text-surface-900 ring-1 ring-surface-200" : "text-surface-50 hover:text-surface-700")}
            >
              <div className="w-3.5 h-3.5 rounded border-2 border-current" />
            </button>
            <button
              title="Set to 'In Progress'"
              aria-label="Set to 'In Progress'"
              aria-pressed={task.status === 'in_progress'}
              onClick={() => onUpdate(task.id, { status: 'in_progress' })}
              className={cn("p-1.5 rounded-md transition-all", task.status === 'in_progress' ? "bg-white shadow-sm text-indigo-600 ring-1 ring-surface-200" : "text-surface-500 hover:text-indigo-500")}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              title="Set to 'Done'"
              aria-label="Set to 'Done'"
              aria-pressed={task.status === 'done'}
              onClick={() => onUpdate(task.id, { status: 'done' })}
              className={cn("p-1.5 rounded-md transition-all", task.status === 'done' ? "bg-white shadow-sm text-emerald-600 ring-1 ring-surface-200" : "text-surface-500 hover:text-emerald-500")}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
          </div>

          <div className="flex items-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {!isSubtask && onAddSubtask && (
               <Button variant="ghost" size="icon" title="Add Sub-task" aria-label="Add Sub-task" className="h-8 w-8 text-surface-400 hover:text-indigo-600 hover:bg-indigo-50 shrink-0" onClick={() => onAddSubtask(task.id)}>
                 <Plus className="h-3.5 w-3.5" />
               </Button>
            )}
            <Button variant="ghost" size="icon" title="Edit task" aria-label="Edit task" className="h-8 w-8 text-surface-400 hover:text-indigo-600 hover:bg-indigo-50 shrink-0" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" title="Delete task" aria-label="Delete task" className="h-8 w-8 text-surface-400 hover:text-rose-600 hover:bg-rose-50 shrink-0" onClick={() => onDeleteRequest(task.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};


export const TasksPage = () => {
  const { 
    tasks, 
    isLoading, 
    filterPriority, 
    setFilterPriority, 
    sortBy, 
    setSortBy, 
    createTask, 
    updateTask, 
    deleteTask, 
    reorderTasks 
  } = useTasks();
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  
  // Create Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [activeParentId, setActiveParentId] = useState<string | null>(null);

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalTasks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        reorderTasks(newItems.map(item => item.id));
        return newItems;
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await createTask(newTaskTitle.trim(), newTaskDesc.trim(), {
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      parentId: activeParentId || ''
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setIsCreating(false);
    setActiveParentId(null);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const filteredTasks = localTasks
    .filter(t => {
      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      
      return true;
    });

  // Organize by hierarchy
  const rootTasks = filteredTasks.filter(t => !t.parentId);
  
  const handleAddSubtask = (parentId: string) => {
    setActiveParentId(parentId);
    setIsCreating(true);
    // Scroll to top or just show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 mb-1 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-indigo-500" />
            Tasks
          </h1>
          <p className="text-surface-500">Manage your spatial analysis objectives and to-dos.</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input 
            className="pl-10"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isCreating && (
          <Card className="p-5 bg-white border-indigo-200 shadow-lg border-2">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-indigo-900">
                  {activeParentId ? 'Add Sub-task' : 'Create New Task'}
                </h3>
                {activeParentId && (
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none">
                    Replying to parent task
                  </Badge>
                )}
              </div>
              <div>
                <Input 
                  autoFocus
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                  className="font-medium"
                />
              </div>
              <div>
                <Textarea 
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Details or description (optional)"
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider ml-1">Priority</label>
                  <div className="flex items-center gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTaskPriority(p)}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-md text-xs font-medium border capitalize transition-all",
                          newTaskPriority === p 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                            : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider ml-1">Due Date</label>
                  <Input 
                    type="date" 
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setActiveParentId(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!newTaskTitle.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                  {activeParentId ? 'Add Sub-task' : 'Save Task'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {/* Filter & Sort Controls */}
      {!isLoading && localTasks.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 bg-white p-3 rounded-xl border border-surface-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-1.5 p-1 bg-surface-50 rounded-lg border border-surface-200">
               {(['all', 'todo', 'in_progress', 'done'] as const).map((f) => (
                <button 
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all", 
                    statusFilter === f 
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-surface-200" 
                      : "text-surface-400 hover:text-surface-600"
                  )}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-surface-50 rounded-lg border border-surface-200">
               {(['all', 'low', 'medium', 'high'] as const).map((p) => (
                <button 
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all", 
                    filterPriority === p 
                      ? "bg-white text-amber-600 shadow-sm ring-1 ring-surface-200" 
                      : "text-surface-400 hover:text-surface-600"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 lg:mt-0">
             <span className="text-[10px] font-bold uppercase tracking-widest text-surface-400 whitespace-nowrap">Sort:</span>
             <select 
               className="text-[11px] font-medium bg-surface-50 border border-surface-200 rounded-lg py-1.5 pl-2 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500"
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value as 'order' | 'priority' | 'dueDate')}
             >
               <option value="order">Custom Order</option>
               <option value="priority">Priority Status</option>
               <option value="dueDate">Due Date</option>
             </select>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1">
        {localTasks.length === 0 && !isCreating ? (
          <div className="text-center p-12 bg-surface-50 border border-surface-200 rounded-xl border-dashed relative overflow-hidden">
            {isLoading && (
              <div className="absolute top-0 inset-x-0 h-0.5 bg-indigo-500/20">
                 <div className="h-full bg-indigo-500 w-1/3 animate-[slide_1.5s_ease-in-out_infinite]" />
              </div>
            )}
            <CheckSquare className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-surface-900">No tasks yet</h3>
            <p className="text-xs text-surface-500 mt-1 mb-4">Add tasks to keep track of your work.</p>
            <Button onClick={() => setIsCreating(true)} variant="secondary">
              <Plus className="w-4 h-4 mr-2" /> Create First Task
            </Button>
          </div>
        ) : rootTasks.length === 0 && tasks.length > 0 ? (
          <div className="text-center p-12 text-surface-500 bg-surface-50 rounded-xl">
             <Search className="w-8 h-8 text-surface-300 mx-auto mb-2 opacity-50" />
             <p className="text-sm">No tasks match your current filters.</p>
             <Button variant="link" size="sm" onClick={() => { setStatusFilter('all'); setFilterPriority('all'); setSearchQuery(''); }} className="mt-1 text-indigo-600 font-bold uppercase tracking-widest text-[10px]">
               Clear all filters
             </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {rootTasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <SortableTaskItem 
                      task={task} 
                      onUpdate={updateTask}
                      onDeleteRequest={setTaskToDelete}
                      onAddSubtask={handleAddSubtask}
                    />
                    {/* Render subtasks */}
                    {filteredTasks.filter(t => t.parentId === task.id).map(subTask => (
                      <SortableTaskItem 
                        key={subTask.id}
                        task={subTask}
                        onUpdate={updateTask}
                        onDeleteRequest={setTaskToDelete}
                        isSubtask
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Dialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <DialogTitle className="text-center text-xl">Delete Task</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setTaskToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

