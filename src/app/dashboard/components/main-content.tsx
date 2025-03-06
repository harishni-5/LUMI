"use client";

import { motion } from "framer-motion";
import { Upload, FileAudio, Clock, CheckCircle, Play, Trash2, X, PlusCircle, Loader2, MessageSquare, ListTodo, FileText, MoreVertical, BrainCircuit, Send, User, Edit, Check, Sun, Moon, LogOut, Coffee, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TabType } from "./sidebar";
import { MeetingsView } from "./meetings-view";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Meeting, WordTiming } from "@/types/meeting";
import { TrelloIntegration } from "./trello-integration";

// Update Task type to include meeting reference
type Task = {
  id: string;
  title: string;
  status: "pending" | "completed";
  assignee: string;
  dueDate: string;
  createdAt: string;
  meetingId: string;
  meetingTitle: string;
};

// Add Message type
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Add ChatState type
type ChatState = {
  isOpen: boolean;
  meetingId: string | null;
  messages: Message[];
  isLoading: boolean;
};

// Update the TabContent props type
type TabContentProps = {
  activeTab: TabType;
  meetings: Meeting[];
  onMeetingDelete: (meeting: Meeting) => Promise<void>;
  onMeetingPlay: (meeting: Meeting) => Promise<void>;
  onAskAI: (meeting: Meeting) => void;
  isLoading: boolean;
  onTabChange: (tab: TabType) => void;
  isSignedIn: boolean;
  user: any;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  isTranscribing: boolean;
  uploadProgress: number;
  transcriptionProgress: number;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  theme?: string;
  setTheme?: (theme: string) => void;
  handleSignOut?: () => Promise<void>;
};

// Update the TabContent component to include proper props and fix the overview section
function TabContent({ 
  activeTab, 
  meetings, 
  onMeetingDelete, 
  onMeetingPlay, 
  onAskAI, 
  isLoading,
  onTabChange,
  isSignedIn,
  user,
  fileInputRef,
  isUploading,
  isTranscribing,
  uploadProgress,
  transcriptionProgress,
  handleFileUpload,
  theme,
  setTheme,
  handleSignOut
}: TabContentProps) {
  switch (activeTab) {
    case "meetings":
      return (
        <MeetingsView 
          meetings={meetings}
          onDelete={onMeetingDelete}
          onPlay={onMeetingPlay}
          onAskAI={onAskAI}
          isLoading={isLoading}
        />
      );
    case "overview":
      return (
        <div className="space-y-8">
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
                <h2 className="text-2xl font-semibold mb-2">Upload Meeting Recording</h2>
                <p className="text-muted-foreground mb-4">
                  {isSignedIn ? (
                    <>Welcome, {user?.fullName || user?.firstName || user?.username || 'Anonymous User'}! Drag and drop your audio or video files here</>
                  ) : (
                    'Please sign in to upload files'
                  )}
                </p>
                {(isUploading || isTranscribing) && (
                  <div className="w-full max-w-xs space-y-4 mb-4">
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-1" />
                      </div>
                    )}
                    {isTranscribing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Transcribing...</span>
                          <span>{transcriptionProgress}%</span>
                        </div>
                        <Progress value={transcriptionProgress} className="h-1" />
                      </div>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*,video/*"
                  className="hidden"
                  disabled={isUploading || isTranscribing}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isTranscribing}
                >
                  {isUploading || isTranscribing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isUploading ? 'Uploading...' : 'Transcribing...'}
                    </div>
                  ) : (
                    'Choose File'
                  )}
                </Button>
              </div>
            </Card>
          </section>
          {/* Recent Meetings Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Meetings</h2>
              <Button variant="outline" size="sm" onClick={() => onTabChange("meetings")}>
                View All
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {meetings.slice(0, 4).map((meeting) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileAudio className="h-4 w-4 text-primary" />
                          <h3 className="font-medium truncate">{meeting.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{meeting.date}</span>
                          <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full">
                            {meeting.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <span>Uploaded by: {meeting.uploadedBy?.name}</span>
                          <span>•</span>
                          <span className="truncate">{meeting.uploadedBy?.email}</span>
                        </div>
                        <div className="space-y-1">
                          <Progress value={meeting.progress} className="h-1" />
                          {meeting.progress < 100 && (
                            <p className="text-xs text-muted-foreground text-right">
                              {meeting.progress}%
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMeetingPlay(meeting)}
                          disabled={meeting.status === "Uploading" || meeting.status === "Processing"}
                          className="text-sm"
                        >
                          {meeting.status === "Uploading" || meeting.status === "Processing" ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>Analyze</span>
                            </div>
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => onMeetingDelete(meeting)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAskAI(meeting)}>
                              <BrainCircuit className="mr-2 h-4 w-4" />
                              Ask AI
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      );
    case "tasks":
      return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Meeting Tasks</h2>
            <Button variant="outline" size="sm" onClick={() => onTabChange("meetings")}>
              View Meetings
            </Button>
          </div>

          {/* Add Trello Integration */}
          <div className="mb-6">
            <TrelloIntegration 
              tasks={meetings
                .filter(m => m.analysis?.tasks)
                .flatMap(meeting => {
                  if (!meeting.analysis?.tasks) return [];
                  return meeting.analysis.tasks
                    .split(/\d+\.\s/)
                    .filter(Boolean)
                    .map(task => {
                      const lines = task.trim().split('\n');
                      const title = lines[0];
                      const details = lines.slice(1);
                      return {
                        title,
                        description: details.join('\n'),
                        meetingId: meeting.id,
                        meetingTitle: meeting.title
                      };
                    });
                })}
              onSync={() => {
                toast({
                  title: "Tasks Synced",
                  description: "Your tasks have been synced with Trello successfully."
                });
              }}
            />
          </div>

          {/* Tasks Content - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-4 -mr-4">
            {meetings.filter(m => m.analysis?.tasks).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze meetings to generate tasks automatically
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {meetings
                  .filter(meeting => {
                    const tasks = meeting.analysis?.tasks;
                    return tasks && tasks !== 'No specific tasks identified in this meeting.';
                  })
                  .map(meeting => (
                    <Card key={meeting.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FileAudio className="h-4 w-4 text-primary" />
                          <h3 className="text-lg font-semibold">{meeting.title}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMeetingPlay(meeting)}
                        >
                          View Meeting
                        </Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                        {meeting.analysis?.tasks}
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      );
    case "settings":
      return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Settings</h2>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>
              <img 
                src={user?.imageUrl} 
                alt="Profile" 
                className="h-16 w-16 rounded-full bg-muted object-cover ring-2 ring-primary/10"
              />
            </div>

            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="flex flex-col space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{user?.fullName || 'Not set'}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{user?.primaryEmailAddress?.emailAddress || 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">Change the appearance</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme?.(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <h3 className="font-medium">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">Sign out of your account</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSignOut?.()}
                  className="bg-background hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    default:
      return null;
  }
}

// Update the MainContent props
interface MainContentProps {
  initialActiveTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function MainContent({ initialActiveTab, onTabChange }: MainContentProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<Meeting[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Meeting | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dbReady, setDbReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialActiveTab);
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    meetingId: null,
    messages: [],
    isLoading: false
  });
  const [userMessage, setUserMessage] = useState('');
  const [isEditing, setIsEditing] = useState<{
    discussions: boolean;
    summary: boolean;
    tasks: boolean;
  }>({
    discussions: false,
    summary: false,
    tasks: false,
  });
  const [editableContent, setEditableContent] = useState<{
    discussions: string;
    summary: string;
    tasks: string;
  }>({
    discussions: '',
    summary: '',
    tasks: '',
  });

  // Update activeTab when initialActiveTab changes
  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  // Update the handleTabChange function
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  // Add a useEffect to log user data for debugging
  useEffect(() => {
    if (isLoaded) {
      console.log('Detailed User Data:', {
        fullName: user?.fullName,
        firstName: user?.firstName,
        lastName: user?.lastName,
        username: user?.username,
        primaryEmailAddress: user?.primaryEmailAddress,
        emailAddresses: user?.emailAddresses,
        id: user?.id,
        imageUrl: user?.imageUrl,
        isSignedIn,
        isLoaded,
        rawUser: user
      });
    }
  }, [isLoaded, user, isSignedIn]);

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

  const generateTranscript = async (audioBlob: Blob): Promise<{ transcript: string; wordTimings: WordTiming[] }> => {
    try {
      setIsTranscribing(true);
      setTranscriptionProgress(10);

      // Create FormData and append the blob directly
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      setTranscriptionProgress(30);
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      setTranscriptionProgress(70);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Transcription failed');
      }
      
      const { transcript, wordTimings } = await response.json();
      setIsTranscribing(false);
      setTranscriptionProgress(100);
      return { transcript, wordTimings };
      
    } catch (error) {
      console.error('Error generating transcript:', error);
      setIsTranscribing(false);
      setTranscriptionProgress(0);
      return { transcript: 'Failed to generate transcript', wordTimings: [] };
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
      
    try {
      // Create a unique ID for the meeting
      const meetingId = crypto.randomUUID();
      
      // Create a new meeting object
      const newMeeting: Meeting = {
        id: meetingId,
        title: file.name,
        date: new Date().toLocaleString(),
        status: "Uploading",
        progress: 0,
        url: URL.createObjectURL(file),
        blob: file,
        uploadedBy: {
          name: user?.fullName || user?.firstName || "Anonymous",
          email: user?.primaryEmailAddress?.emailAddress || "anonymous@example.com"
        }
      };

      // Add to state
      setUploadedFiles(prev => [...prev, newMeeting]);
      
      // Create FormData
      const formData = new FormData();
      formData.append('audio', file);
      
      // Ask user if they want to translate non-English audio
      const shouldTranslate = await new Promise<boolean>((resolve) => {
        if (confirm("Is this audio in a language other than English? Click OK to translate to English, or Cancel to transcribe as-is.")) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      formData.append('translate', shouldTranslate.toString());

      // Start upload
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();

      // Update meeting with transcript and word timings
      const updatedMeeting: Meeting = {
        ...newMeeting,
        status: "Processing",
        progress: 50,
        transcript: data.transcript,
        wordTimings: data.wordTimings
      };

      // Update state
      setUploadedFiles(prev =>
        prev.map(m => m.id === meetingId ? updatedMeeting : m)
      );

      // Start analysis
      await analyzeMeeting(updatedMeeting);

      // Final update
      setUploadedFiles(prev =>
        prev.map(m => m.id === meetingId ? {
          ...m,
          status: "Ready",
          progress: 100
        } : m)
      );

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to process the audio file. Please try again.",
        variant: "destructive"
      });
    }
  };

  async function analyzeTranscript(transcript: string): Promise<any> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Analysis failed:', data);
        throw new Error(data.error || data.details || 'Analysis failed');
      }

      return data.analysis;
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to analyze transcript');
    }
  }

  async function analyzeMeeting(meeting: Meeting): Promise<void> {
    try {
      setIsAnalyzing(true);
      const analysis = await analyzeTranscript(meeting.transcript || '');
      
      // Update the meeting with the analysis results
      const updatedMeeting = {
        ...meeting,
        analysis: {
          discussions: analysis.discussions,
          summary: analysis.summary,
          tasks: analysis.tasks,
        },
      };

      // Update the meetings array with the new analysis
      setUploadedFiles(prevMeetings =>
        prevMeetings.map((m) =>
          m.id === meeting.id ? updatedMeeting : m
        )
      );
    } catch (error) {
      console.error('Failed to analyze meeting:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze meeting',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handlePlayMedia = async (meeting: Meeting) => {
    setCurrentlyPlaying(meeting);
    if (meeting.transcript && !meeting.analysis) {
      await analyzeMeeting(meeting);
    }
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
      meetingId: "",
      meetingTitle: "",
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
    const updatedTask: Task = {
      ...task,
      status: task.status === "pending" ? "completed" : "pending"
    };
    await saveTaskToDB(updatedTask);
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
  };

  // Function to update current word based on video time
  const updateCurrentWord = (currentTime: number) => {
    if (currentlyPlaying?.wordTimings) {
      const index = currentlyPlaying.wordTimings.findIndex(
        (timing) => currentTime >= timing.start && currentTime <= timing.end
      );
      setCurrentWordIndex(index);
    }
  };

  // Handle timeupdate event from media player
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      updateCurrentWord(mediaRef.current.currentTime);
    }
  };

  // Update the transcript display section
  const renderTranscript = () => {
    if (!currentlyPlaying?.transcript) return null;

    // If we have word timings (non-translated content), show interactive transcript
    if (currentlyPlaying.wordTimings && currentlyPlaying.wordTimings.length > 0) {
  return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="leading-relaxed">
            {currentlyPlaying.wordTimings.map((timing, index) => (
              <span
                key={index}
                className={`inline-block transition-colors duration-200 ${
                  index === currentWordIndex
                    ? "bg-primary/20 rounded px-1"
                    : "px-[1px]"
                }`}
                onClick={() => {
                  if (mediaRef.current) {
                    mediaRef.current.currentTime = timing.start;
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {timing.word}{" "}
              </span>
            ))}
          </p>
        </div>
      );
    }

    // For translated content or transcripts without word timings
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {currentlyPlaying.transcript.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ))}
        {currentlyPlaying.wordTimings?.length === 0 && (
          <div className="mt-4 p-2 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              This is a translated transcript. Word-level timing information is not available for translated content.
            </p>
          </div>
        )}
      </div>
    );
  };

  const handleAskAI = (meeting: Meeting) => {
    setChatState({
      isOpen: true,
      meetingId: meeting.id,
      messages: [],
      isLoading: false
    });
  };

  const handleCloseChat = () => {
    setChatState({
      isOpen: false,
      meetingId: null,
      messages: [],
      isLoading: false
    });
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || !chatState.meetingId) return;

    const meeting = uploadedFiles.find(m => m.id === chatState.meetingId);
    if (!meeting?.transcript) return;

    const newMessage: Message = { role: 'user', content: userMessage };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isLoading: true
    }));
    setUserMessage('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: meeting.transcript,
          query: userMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Create a temporary message for streaming response
      const tempMessage: Message = { role: 'assistant', content: '' };
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, tempMessage],
        isLoading: false
      }));

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        
        // Update the last message with the accumulated text
        setChatState(prev => {
          const messages = [...prev.messages];
          const lastMessage = messages[messages.length - 1];
          lastMessage.content = accumulatedText;
          return {
            ...prev,
            messages
          };
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request.'
        }]
      }));
    }
  };

  const handleEditSave = async (section: 'discussions' | 'summary' | 'tasks') => {
    if (!currentlyPlaying) return;

    try {
      const updatedMeeting = {
        ...currentlyPlaying,
        analysis: {
          ...currentlyPlaying.analysis,
          [section]: editableContent[section],
        },
      };

      // Update state
      setUploadedFiles(prev =>
        prev.map(m => m.id === currentlyPlaying.id ? updatedMeeting : m)
      );
      setCurrentlyPlaying(updatedMeeting);

      // Save to IndexedDB
      await saveMeetingToDB(updatedMeeting);

      // Exit edit mode
      setIsEditing(prev => ({ ...prev, [section]: false }));

      toast({
        title: "Changes saved",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} has been updated.`,
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error saving changes",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <TabContent
          activeTab={activeTab}
          meetings={uploadedFiles}
          onMeetingDelete={handleDeleteMeeting}
          onMeetingPlay={handlePlayMedia}
          onAskAI={handleAskAI}
          isLoading={isUploading || isTranscribing}
          onTabChange={handleTabChange}
          isSignedIn={!!isSignedIn}
          user={user}
          fileInputRef={fileInputRef}
          isUploading={isUploading}
          isTranscribing={isTranscribing}
          uploadProgress={uploadProgress}
          transcriptionProgress={transcriptionProgress}
          handleFileUpload={handleFileUpload}
          theme={theme}
          setTheme={setTheme}
          handleSignOut={handleSignOut}
        />
      </div>

      {/* Video Player Modal with Transcript and Analysis */}
      {currentlyPlaying && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-hidden">
          <div className="bg-background p-6 rounded-lg w-full max-w-7xl mx-4 h-[95vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
              <h3 className="text-xl font-semibold">{currentlyPlaying.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>Uploaded by {currentlyPlaying.uploadedBy?.name}</span>
                  <span>•</span>
                  <span>{currentlyPlaying.uploadedBy?.email}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentlyPlaying(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
              {/* Left Column: Video and Transcript */}
              <div className="flex flex-col gap-4 min-h-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {currentlyPlaying.blob?.type.includes('video') ? (
              <video
                      ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={currentlyPlaying.url}
                controls
                      className="w-full h-full"
                      onTimeUpdate={handleTimeUpdate}
              />
            ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <audio
                        ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={currentlyPlaying.url}
                controls
                        className="w-full px-4"
                        onTimeUpdate={handleTimeUpdate}
              />
                    </div>
            )}
          </div>
                <div className="bg-muted rounded-lg flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-muted z-10">
                    <h4 className="text-lg font-semibold">Transcript</h4>
                    <div className="flex items-center gap-2">
                      {isTranscribing ? (
                        <>
                          <span className="text-sm font-medium">Processing...</span>
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                        </>
                      ) : currentlyPlaying?.wordTimings?.length === 0 ? (
                        <>
                          <span className="text-sm font-medium">Translated</span>
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-medium">Ready</span>
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {currentlyPlaying.transcript ? (
                      renderTranscript()
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                          <FileAudio className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-muted-foreground">No transcript available</p>
        </div>
      )}
            </div>
          </div>
              </div>

              {/* Right Column: Analysis */}
              <div className="bg-muted rounded-lg overflow-hidden flex flex-col min-h-0">
                <Tabs defaultValue="discussions" className="flex-1 flex flex-col min-h-0">
                  <div className="border-b px-4 bg-muted sticky top-0 z-10">
                    <TabsList className="mb-4">
                      <TabsTrigger value="discussions" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Discussions
                      </TabsTrigger>
                      <TabsTrigger value="summary" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="tasks" className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4" />
                        Tasks
                      </TabsTrigger>
                    </TabsList>
                      </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center h-full p-4">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">
                            Analyzing meeting content...
                          </p>
                      </div>
                    </div>
                    ) : currentlyPlaying.analysis ? (
                        <>
                        <TabsContent value="discussions" className="p-6 mt-0 focus-visible:outline-none">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div className="flex items-center justify-between mb-4 sticky top-0 bg-muted/80 backdrop-blur-sm py-2">
                              <h3 className="text-lg font-semibold">Key Discussions & Decisions</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                                onClick={() => {
                                  if (isEditing.discussions) {
                                    handleEditSave('discussions');
                                  } else {
                                    setEditableContent(prev => ({
                                      ...prev,
                                      discussions: currentlyPlaying?.analysis?.discussions || ''
                                    }));
                                    setIsEditing(prev => ({ ...prev, discussions: true }));
                                  }
                                }}
                              >
                                {isEditing.discussions ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Save
                                  </>
                                ) : (
                                  <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </>
                                )}
                          </Button>
                            </div>
                            {isEditing.discussions ? (
                              <textarea
                                value={editableContent.discussions}
                                onChange={(e) => setEditableContent(prev => ({
                                  ...prev,
                                  discussions: e.target.value
                                }))}
                                className="w-full h-[500px] p-4 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter key discussions and decisions..."
                              />
                            ) : (
                              <div className="whitespace-pre-wrap">
                                {currentlyPlaying?.analysis?.discussions || 'No discussions found'}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent value="summary" className="p-6 mt-0 focus-visible:outline-none">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div className="flex items-center justify-between mb-4 sticky top-0 bg-muted/80 backdrop-blur-sm py-2">
                              <h3 className="text-lg font-semibold">Meeting Summary</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                                onClick={() => {
                                  if (isEditing.summary) {
                                    handleEditSave('summary');
                                  } else {
                                    setEditableContent(prev => ({
                                      ...prev,
                                      summary: currentlyPlaying?.analysis?.summary || ''
                                    }));
                                    setIsEditing(prev => ({ ...prev, summary: true }));
                                  }
                                }}
                              >
                                {isEditing.summary ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Save
                                  </>
                                ) : (
                                  <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                        </>
                      )}
                              </Button>
                    </div>
                            {isEditing.summary ? (
                              <textarea
                                value={editableContent.summary}
                                onChange={(e) => setEditableContent(prev => ({
                                  ...prev,
                                  summary: e.target.value
                                }))}
                                className="w-full h-[500px] p-4 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter meeting summary..."
                              />
                            ) : (
                              <div className="whitespace-pre-wrap">
                                {currentlyPlaying?.analysis?.summary || 'No summary available'}
            </div>
                            )}
                        </div>
                        </TabsContent>
                        <TabsContent value="tasks" className="p-6 mt-0 focus-visible:outline-none">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div className="flex items-center justify-between mb-4 sticky top-0 bg-muted/80 backdrop-blur-sm py-2">
                              <h3 className="text-lg font-semibold">Action Items & Tasks</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                                onClick={() => {
                                  if (isEditing.tasks) {
                                    handleEditSave('tasks');
                                  } else {
                                    setEditableContent(prev => ({
                                      ...prev,
                                      tasks: currentlyPlaying?.analysis?.tasks || ''
                                    }));
                                    setIsEditing(prev => ({ ...prev, tasks: true }));
                                  }
                                }}
                              >
                                {isEditing.tasks ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Save
                                  </>
                                ) : (
                                  <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </>
                                )}
                        </Button>
                      </div>
                            {isEditing.tasks ? (
                              <textarea
                                value={editableContent.tasks}
                                onChange={(e) => setEditableContent(prev => ({
                                  ...prev,
                                  tasks: e.target.value
                                }))}
                                className="w-full h-[500px] p-4 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter action items and tasks..."
                              />
                            ) : (
                              <div className="whitespace-pre-wrap">
                                {currentlyPlaying?.analysis?.tasks || 'No tasks identified'}
                    </div>
                            )}
          </div>
                        </TabsContent>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-muted-foreground">No analysis available</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Analysis will start automatically when transcript is ready
                        </p>
                      </div>
                    )}
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {chatState.isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-lg z-40 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Assistant</h3>
                        </div>
            <Button variant="ghost" size="icon" onClick={handleCloseChat}>
              <X className="h-5 w-5" />
            </Button>
                      </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatState.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
              ))}
            {chatState.isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
          </div>
      </div>
            )}
          </div>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Ask about the meeting..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={chatState.isLoading}>
                <Send className="h-4 w-4" />
              </Button>
          </form>
          </div>
                        </div>
      )}
    </div>
  );
} 