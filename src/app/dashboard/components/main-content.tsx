"use client";

import { motion } from "framer-motion";
import { Upload, FileAudio, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function MainContent() {
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
            <h2 className="mb-2 text-2xl font-semibold">Upload Meeting Recording</h2>
            <p className="mb-6 text-muted-foreground">
              Drag and drop your audio or video file, or click to browse
            </p>
            <div className="flex gap-4">
              <Button size="lg">Choose File</Button>
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
            {[
              {
                title: "Product Review",
                date: "Today, 2:00 PM",
                status: "Processing",
                progress: 65,
              },
              {
                title: "Team Sync",
                date: "Yesterday",
                status: "Completed",
                progress: 100,
              },
            ].map((meeting, index) => (
              <motion.div
                key={index}
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
                    <span className="text-sm font-medium text-muted-foreground">
                      {meeting.status}
                    </span>
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
          <div className="space-y-4">
            {[
              {
                title: "Review Meeting Notes",
                status: "pending",
                assignee: "John Doe",
                dueDate: "Today",
              },
              {
                title: "Update Documentation",
                status: "in-progress",
                assignee: "Jane Smith",
                dueDate: "Tomorrow",
              },
            ].map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        task.status === "completed"
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
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