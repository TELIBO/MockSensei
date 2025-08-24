"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

// Custom Hook for recording and processing logic
const useAnswerRecorder = ({ mockInterviewQuestion, activeQuestionIndex, interviewData }) => {
    const [userAnswer, setUserAnswer] = useState("");
    const userAnswerRef = useRef(""); // Use ref to hold the latest value for async operations
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useUser();

    const {
        error,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
    });

    // Append new speech results to the answer
    useEffect(() => {
        if (results.length > 0) {
            const newTranscript = results.map((result) => result.transcript).join(" ");
            const updatedAnswer = userAnswerRef.current + newTranscript;
            setUserAnswer(updatedAnswer);
            userAnswerRef.current = updatedAnswer;
            setResults(); // Clear results to prevent reprocessing
        }
    },);

    // Reset state when the active question changes
    useEffect(() => {
        setUserAnswer("");
        userAnswerRef.current = "";
        setResults();
        if (isRecording) {
            stopSpeechToText();
        }
    },);

    // Handle speech recognition errors
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const updateUserAnswerInDB = useCallback(async () => {
        if (userAnswerRef.current.length < 10) {
            toast.warning("Your answer is too short. Please provide a more detailed response.");
            return;
        }
        setIsProcessing(true);

        const feedbackPrompt =
            `Question: "${mockInterviewQuestion[activeQuestionIndex]?.question}", User Answer: "${userAnswerRef.current}". ` +
            "Based on this question and answer, please provide: " +
            "1) A numeric rating for the answer on a scale of 1 to 5. " +
            "2) Concise feedback (3-5 lines) on areas for improvement. " +
            "Return ONLY a valid JSON object with two fields: 'rating' (number) and 'feedback' (string).";

        try {
            const result = await chatSession.sendMessage(feedbackPrompt);
            const responseText = result.response.text();
            
            // Robust JSON parsing
            const jsonMatch = responseText.match(/\{*\}/);
            if (!jsonMatch) {
                throw new Error("Invalid JSON response from AI.");
            }
            const jsonFeedbackResp = JSON.parse(jsonMatch);

            await db.insert(UserAnswer).values({
                mockIdRef: interviewData?.mockId,
                question: mockInterviewQuestion[activeQuestionIndex]?.question,
                correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
                userAns: userAnswerRef.current,
                feedback: jsonFeedbackResp?.feedback,
                rating: jsonFeedbackResp?.rating,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format("YYYY-MM-DD"),
            });

            setUserAnswer("");
            userAnswerRef.current = "";

        } catch (err) { {
            console.error("Error processing answer:", err);
            // Re-throw the error to be caught by toast.promise
            throw new Error("Failed to process your answer. Please try again.");
        }
        } finally {
            setIsProcessing(false);
        }
    },);

    const startStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
            // Use toast.promise for better UX during submission
            toast.promise(updateUserAnswerInDB(), {
                loading: "Evaluating your answer...",
                success: "Answer submitted successfully!",
                error: (err) => err.message |

| "An unexpected error occurred.",
            });
        } else {
            setUserAnswer("");
            userAnswerRef.current = "";
            startSpeechToText();
        }
    };

    return {
        userAnswer,
        isRecording,
        isProcessing,
        startStopRecording,
    };
};

// Memoized Webcam component to prevent unnecessary re-renders
const WebcamDisplay = memo(() => (
    <div className="relative flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5 h-[500px] w-[500px]">
        <Image
            src={"/webcam.png"}
            width={200}
            height={200}
            alt="webcam overlay"
            className="absolute z-0"
            priority
        />
        <Webcam
            mirrored={true}
            style={{
                height: "100%",
                width: "100%",
                zIndex: 10,
                objectFit: "cover",
            }}
        />
    </div>
));
WebcamDisplay.displayName = 'WebcamDisplay';


// Main Component
function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewData }) {
    const { userAnswer, isRecording, isProcessing, startStopRecording } = useAnswerRecorder({
        mockInterviewQuestion,
        activeQuestionIndex,
        interviewData,
    });

    return (
        <div className="flex items-center justify-center flex-col">
            <WebcamDisplay />

            <Button
                disabled={isProcessing}
                variant="outline"
                className="my-10"
                onClick={startStopRecording}
            >
                {isRecording? (
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

            {/* Display live transcript for user feedback */}
            {userAnswer && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-inner max-w-2xl text-sm text-gray-700">
                    <strong className="block mb-2">Your answer:</strong>
                    <p>{userAnswer}</p>
                </div>
            )}
        </div>
    );
}

export default RecordAnswerSection;
