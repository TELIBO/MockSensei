"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    results?.map((result) =>
      setUserAnswer((prevAns) => prevAns + result?.transcript)
    );
  }, [results]);

  // Clear answers when question changes
  useEffect(() => {
    setUserAnswer("");
    setResults([]);
  }, [activeQuestionIndex]);

  // Modified this useEffect to prevent multiple calls
  useEffect(() => {
    if (!isRecording && userAnswer?.length > 10) {
      // Add a small delay and check if we're not already processing
      const timer = setTimeout(() => {
        if (!loading) {
          UpdateUserAnswer();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRecording, userAnswer]); // Added isRecording as dependency

const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      // Clear any previous results before starting new recording
      setUserAnswer("");
      setResults([]);
      startSpeechToText();
    }
  };

  const UpdateUserAnswer = async () => {
    console.log("Processing answer:", userAnswer);
    setLoading(true);
    
    try {
      const feedbackPrompt =
        "Question: " +
        mockInterviewQuestion[activeQuestionIndex]?.question +
        ", User Answer: " +
        userAnswer +
        ". Based only on this question and answer, please provide: " +
        "1) A numeric rating out of 5 for the answer. " +
        "2) Feedback highlighting specific areas for improvement, if any, in 3 to 5 concise lines. " +
        "Return ONLY a valid JSON object with two fields: 'rating' (number) and 'feedback' (string).";

      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = result.response
        .text()
        .replace("json", "")
        .replace("", "");
      
      console.log("AI Response:", mockJsonResp);
      
      const JsonFeedbackResp = JSON.parse(mockJsonResp);
      
      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback,
        rating: JsonFeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-yyyy"),
      });

      console.log("Database insert result:", resp);

      if (resp) {
        toast.success("User Answer recorded successfully");
        setUserAnswer("");
        setResults([]);
      }
    } catch (error) {
      console.error("Error in UpdateUserAnswer:", error);
      toast.error("Failed to save answer: " + error.message);
    } finally {
      setResults([]);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src={"/webcam.png"}
          width={200}
          height={200}
          alt="webcam"
          className="absolute"
        />
        <Webcam
          mirrored={true}
          style={{
            height: 500,
            width: 500,
            zIndex: 10,
          }}
        />
      </div>

      {/* Debug info - remove this after testing */}
      {userAnswer && (
        <div className="mt-4 p-2 bg-blue-50 rounded max-w-md text-sm">
          <strong>Current Answer:</strong> {userAnswer.substring(0, 100)}...
        </div>
      )}
      
      <Button
        disabled={loading}
        variant="outline"
        className="my-10"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className="text-red-600 animate-pulse flex gap-2 items-center">
            <StopCircle />
            Stop Recording
          </h2>
        ) : (
          <h2 className="text-primary flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>

      {loading && (
        <p className="text-blue-600">Processing your answer...</p>
      )}
    </div>
  );
}
export default RecordAnswerSection;

