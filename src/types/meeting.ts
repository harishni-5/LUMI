export type WordTiming = {
  word: string;
  start: number;
  end: number;
};

export type MeetingAnalysis = {
  discussions?: string;
  summary?: string;
  tasks?: string;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  status: string;
  progress: number;
  url: string;
  blob?: Blob;
  transcript?: string;
  wordTimings?: WordTiming[];
  analysis?: MeetingAnalysis;
  uploadedBy: {
    name: string;
    email: string;
  };
}; 