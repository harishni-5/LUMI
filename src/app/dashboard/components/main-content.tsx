"use client";

import { motion } from "framer-motion";
import { Upload, FileAudio, Clock, CheckCircle, Play, Trash2, X, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

// Define the meeting type
type Meeting = {
  id: string;
  title: string;
  date: string;
  status: string;
  progress: number;
  url: string;
  blob?: Blob;
};

// Add Task type
type Task = {
  id: string;
  title: string;
  status: "pending" | "completed";
  assignee: string;
  dueDate: string;
  createdAt: string;
};

export function MainContent() {
  const [uploadedFiles, setUploadedFiles] = useState<Meeting[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Meeting | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dbReady, setDbReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Initialize IndexedDB
  useEffect(() => {
    const request = indexedDB.open('meetingsDB', 2);

    request.onerror = (event) => {
      console.error("Database error:", event);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('meetings')) {
        db.createObjectStore('meetings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      setDbReady(true);
      loadMeetingsFromDB();
      loadTasksFromDB();
    };
  }, []);

  // Load meetings from IndexedDB
  const loadMeetingsFromDB = async () => {
    const db = await openDB();
    const transaction = db.transaction(['meetings'], 'readonly');
    const store = transaction.objectStore('meetings');
    const request = store.getAll();

    request.onsuccess = () => {
      const meetings = request.result;
      meetings.forEach(meeting => {
        if (meeting.blob) {
          meeting.url = URL.createObjectURL(meeting.blob);
        }
      });
      setUploadedFiles(meetings);
    };
  };

  // Helper function to open DB connection
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('meetingsDB', 2);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  // Save meeting to IndexedDB
  const saveMeetingToDB = async (meeting: Meeting) => {
    const db = await openDB();
    const transaction = db.transaction(['meetings'], 'readwrite');
    const store = transaction.objectStore('meetings');
    store.put(meeting);
  };

  // Delete meeting from IndexedDB
  const deleteMeetingFromDB = async (id: string) => {
    const db = await openDB();
    const transaction = db.transaction(['meetings'], 'readwrite');
    const store = transaction.objectStore('meetings');
    await store.delete(id);
  };

  const handleDeleteMeeting = async (meeting: Meeting) => {
    try {
      await deleteMeetingFromDB(meeting.id);
      setUploadedFiles(prev => prev.filter(m => m.id !== meeting.id));
      
      // Revoke the object URL to free up memory
      if (meeting.url) {
        URL.revokeObjectURL(meeting.url);
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const blob = new Blob([file], { type: file.type });
      const url = URL.createObjectURL(blob);
      
      const newMeeting: Meeting = {
        id: crypto.randomUUID(), // Generate unique ID
        title: file.name,
        date: new Date().toLocaleString(),
        status: "Completed",
        progress: 100,
        url: url,
        blob: blob
      };

      // Update state
      setUploadedFiles(prev => [newMeeting, ...prev]);
      
      // Save to IndexedDB
      await saveMeetingToDB(newMeeting);
    }
  };

  const handlePlayMedia = (meeting: Meeting) => {
    setCurrentlyPlaying(meeting);
  };

  const loadTasksFromDB = async () => {
    const db = await openDB();
    const transaction = db.transaction(['tasks'], 'readonly');
    const store = transaction.objectStore('tasks');
    const request = store.getAll();

    request.onsuccess = () => {
      setTasks(request.result || []);
    };
  };

  const saveTaskToDB = async (task: Task) => {
    const db = await openDB();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    await store.put(task);
  };

  const deleteTaskFromDB = async (id: string) => {
    const db = await openDB();
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    await store.delete(id);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      status: "pending",
      assignee: "Me",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [...prev, newTask]);
    await saveTaskToDB(newTask);
    setNewTaskTitle("");
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTaskFromDB(taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleToggleTask = async (task: Task) => {
    const updatedTask = {
      ...task,
      status: task.status === "pending" ? "completed" : "pending"
    };
    await saveTaskToDB(updatedTask);
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
  };

  return (
    <div className="space-y-8 relative">
      {/* Video Player Modal */}
      {currentlyPlaying && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background p-4 rounded-lg w-full max-w-4xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{currentlyPlaying.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentlyPlaying(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {currentlyPlaying.blob?.type.includes('video') ? (
              <video
                src={currentlyPlaying.url}
                controls
                className="w-full rounded-lg"
                autoPlay
              />
            ) : (
              <audio
                src={currentlyPlaying.url}
                controls
                className="w-full"
                autoPlay
              />
            )}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <section>
        <Card className="p-8">
          <div className="flex flex-col items-center text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mb-6 rounded-full bg-primary/10 p-4"
            >
              <Upload className="h-8 w-8 text-primary" />
            </motion.div>
            <h2 className="mb-2 text-2xl font-semibold">Upload Meeting Recording</h2>
            <p className="mb-6 text-muted-foreground">
              Drag and drop your audio or video file, or click to browse
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*,video/*"
              className="hidden"
            />
            <div className="flex gap-4">
              <Button size="lg" onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
              <Button variant="outline" size="lg">Browse Library</Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Recent Meetings & Tasks Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Meetings */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Recent Meetings</h2>
          <div className="space-y-4">
            {uploadedFiles.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileAudio className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">{meeting.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {meeting.url && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlayMedia(meeting)}
                            className="text-primary"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMeeting(meeting)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <span className="text-sm font-medium text-muted-foreground">
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={meeting.progress} className="h-2" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Task Board */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Tasks</h2>
          
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </form>

          {/* Pending Tasks */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Tasks</h3>
            {tasks
              .filter(task => task.status === "pending")
              .map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleTask(task)}
                          className="text-green-500"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>

          {/* Completed Tasks */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Completed Tasks</h3>
            {tasks
              .filter(task => task.status === "completed")
              .map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium line-through opacity-70">{task.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleTask(task)}
                          className="text-muted-foreground"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
} 