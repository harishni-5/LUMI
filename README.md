# IRIS - Meeting Assistant

IRIS is an intelligent meeting assistant that helps you capture, analyze, and act on your meetings. It provides automatic transcription, AI-powered analysis, and task management capabilities.

## Features

- 🎥 Meeting Recording & Transcription
- 🤖 AI-Powered Meeting Analysis
- 📋 Automated Task Extraction
- 📊 Meeting Insights & Summaries
- 🔄 Task Management Integration
- 🌓 Dark/Light Mode Support

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- Clerk Authentication
- Local Storage for Data Management
- OpenAI Whisper for Transcription
- Llama for AI Analysis

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/iris.git
cd iris
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```env
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key for transcription
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
