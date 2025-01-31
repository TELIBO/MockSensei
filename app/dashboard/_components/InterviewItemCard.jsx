import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function InterviewItemCard({ interview, removeInterviewHistory }) {
  const router = useRouter();

  const onStart = () => {
    router.push("/dashboard/interview/" + interview?.mockId);
  };

  const onFeedbackPress = () => {
    router.push("/dashboard/interview/" + interview.mockId + "/feedback");
  };

  return (
    <div className="border shadow-sm rounded-lg p-3">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-primary">{interview?.jobPosition}</h2>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => removeInterviewHistory(interview?.mockId)}
        >
          <Trash2 />
        </Button>
      </div>
      <h2 className="font-bold text-gray-400">{interview?.interviewRound}</h2>
      <h2 className="text-sm text-gray-600">
        {interview?.jobExperience} Years of Experience
      </h2>
      <h2 className="text-xs text-gray-400">
        Created At:{interview.createdAt}
      </h2>
      <div className="flex justify-between mt-2 gap-5">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={onFeedbackPress}
        >
          Feedback
        </Button>
        <Button size="sm" className="w-full" onClick={onStart}>
          Start
        </Button>
      </div>
    </div>
  );
}

export default InterviewItemCard;
