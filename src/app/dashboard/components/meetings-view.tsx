"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  FileAudio, 
  Clock, 
  Loader2, 
  MoreVertical, 
  Trash2, 
  BrainCircuit, 
  Search,
  X,
  MessageSquare,
  ListTodo,
  FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Meeting } from "@/types/meeting";

type WordTiming = {
  word: string;
  start: number;
  end: number;
};

interface MeetingsViewProps {
  meetings: Meeting[];
  onDelete: (meeting: Meeting) => Promise<void>;
  onPlay: (meeting: Meeting) => Promise<void>;
  onAskAI: (meeting: Meeting) => void;
  isLoading: boolean;
}

export function MeetingsView({ meetings, onDelete, onPlay, onAskAI, isLoading }: MeetingsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Meeting | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [taskStates, setTaskStates] = useState<{ [key: string]: boolean }>({});
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.uploadedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.uploadedBy.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

    if (currentlyPlaying.wordTimings) {
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

    // Fallback for transcripts without timing information
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {currentlyPlaying.transcript.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  const handlePlayMedia = async (meeting: Meeting) => {
    setCurrentlyPlaying(meeting);
    await onPlay(meeting);
  };

  const renderTasks = (tasksText: string) => {
    if (!tasksText) return 'No tasks identified';

    // Split the text into individual tasks
    const tasks = tasksText.split(/\d+\.\s/).filter(Boolean);

    return (
      <div className="space-y-4">
        {tasks.map((task, index) => {
          const taskId = `${currentlyPlaying?.id}-task-${index}`;
          const taskLines = task.trim().split('\n');
          const taskTitle = taskLines[0];
          const taskDetails = taskLines.slice(1);

          return (
            <div key={taskId} className="flex items-start space-x-3 p-3 rounded-lg bg-background/50">
              <Checkbox
                id={taskId}
                checked={taskStates[taskId] || false}
                onCheckedChange={(checked) => {
                  setTaskStates(prev => ({
                    ...prev,
                    [taskId]: checked === true
                  }));
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor={taskId}
                  className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    taskStates[taskId] && "line-through text-muted-foreground"
                  )}
                >
                  {taskTitle}
                </label>
                {taskDetails.length > 0 && (
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    {taskDetails.map((detail, i) => (
                      <li key={i} className={taskStates[taskId] ? "line-through" : ""}>
                        {detail.trim()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">All Meetings</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading meetings...</p>
            </div>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <FileAudio className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No meetings found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'Upload a meeting recording to get started'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {filteredMeetings.map((meeting) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4 w-full">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
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
                          onClick={() => handlePlayMedia(meeting)}
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
                            <DropdownMenuItem onClick={() => onDelete(meeting)}>
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
          </AnimatePresence>
        )}
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
                      <span className="text-sm font-medium">Ready</span>
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
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
                            <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-muted/80 backdrop-blur-sm py-2">
                              Key Discussions & Decisions
                            </h3>
                            <div className="whitespace-pre-wrap">
                              {currentlyPlaying.analysis.discussions || 'No discussions found'}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="summary" className="p-6 mt-0 focus-visible:outline-none">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-muted/80 backdrop-blur-sm py-2">
                              Meeting Summary
                            </h3>
                            <div className="whitespace-pre-wrap">
                              {currentlyPlaying.analysis.summary || 'No summary available'}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="tasks" className="p-6 mt-0 focus-visible:outline-none">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-muted/80 backdrop-blur-sm py-2">
                              Action Items & Tasks
                            </h3>
                            <div>
                              {currentlyPlaying.analysis?.tasks ? 
                                <div className="space-y-4">
                                  {currentlyPlaying.analysis.tasks.split(/\d+\.\s/).filter(Boolean).map((task, index) => {
                                    const taskId = `${currentlyPlaying.id}-task-${index}`;
                                    const taskLines = task.trim().split('\n');
                                    const taskTitle = taskLines[0];
                                    const taskDetails = taskLines.slice(1);

                                    return (
                                      <div key={taskId} className="flex items-start space-x-3 p-3 rounded-lg bg-background/50">
                                        <Checkbox
                                          id={taskId}
                                          checked={taskStates[taskId] || false}
                                          onCheckedChange={(checked) => {
                                            setTaskStates(prev => ({
                                              ...prev,
                                              [taskId]: checked === true
                                            }));
                                          }}
                                          className="mt-1"
                                        />
                                        <div className="flex-1">
                                          <label
                                            htmlFor={taskId}
                                            className={cn(
                                              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                              taskStates[taskId] && "line-through text-muted-foreground"
                                            )}
                                          >
                                            {taskTitle}
                                          </label>
                                          {taskDetails.length > 0 && (
                                            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                                              {taskDetails.map((detail, i) => (
                                                <li key={i} className={taskStates[taskId] ? "line-through" : ""}>
                                                  {detail.trim()}
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                : 'No tasks identified'}
                            </div>
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
    </div>
  );
} 