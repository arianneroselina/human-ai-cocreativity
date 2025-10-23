"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shadcn_ui/button";

export default function ResultsPage() {
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [meetsRequiredWords, setMeetsRequiredWords] = useState<boolean | null>(null);
  const [meetsAvoidWords, setMeetsAvoidWords] = useState<boolean | null>(null);

  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [clarity, setClarity] = useState<number | null>(null);
  const [workflowRating, setWorkflowRating] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<number | null>(null);
  const [feedback, setFeedback] = useState(""); // User's additional comments

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWordCount(Number(localStorage.getItem("wordCount")));
    setMeetsRequiredWords(JSON.parse(localStorage.getItem("meetsRequiredWords") || "false"));
    setMeetsAvoidWords(JSON.parse(localStorage.getItem("meetsAvoidWords") || "false"));
  }, []);

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(e.target.value);
  };

  const handleSubmit = () => {
    console.log("Survey submitted:", { satisfaction, workflowRating, feedback });
    alert("Thank you for your feedback!");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header Section */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold">Your Submission is Complete!</h1>
          <p className="text-sm text-gray-600 mt-2">Thank you for completing the task!</p>
        </header>

        {/* Submission Summary */}
        <section className="rounded-xl border bg-white p-6 shadow-md mb-6">
          <h2 className="font-semibold text-xl text-gray-800">Submission Summary</h2>
          <div className="mt-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Word Count:</span>
              <span className="text-sm text-gray-500">{wordCount} words</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-700">Required Words:</span>
              <span className="text-sm text-gray-500">{meetsRequiredWords ? "✔️ Met" : "❌ Not Met"}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-700">Avoid Words:</span>
              <span className="text-sm text-gray-500">{meetsAvoidWords ? "✔️ Met" : "❌ Not Met"}</span>
            </div>
          </div>
        </section>

        {/* Survey Section */}
        <section className="rounded-xl border bg-white p-6 shadow-md mb-6">
          <h2 className="font-semibold text-xl text-gray-800">Your Feedback</h2>
          <p className="text-sm text-gray-600 mt-4">Please answer the following questions about your experience:</p>

          {/* Likert Scale for Experience */}
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-1/3">1. How satisfied were you with the task?</span>
              <div className="flex gap-4 w-2/3">
                {[5, 4, 3, 2, 1].map(value => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="satisfaction"
                      value={value}
                      onChange={() => setSatisfaction(value)}
                      checked={satisfaction === value}
                      className="text-gray-600"
                    />
                    <span className="text-sm">
              {value === 1 ? "Very Satisfied" : value === 2 ? "Satisfied" : value === 3 ? "Neutral" : value === 4 ? "Dissatisfied" : "Very Dissatisfied"}
            </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Likert Scale for Clarity */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-1/3">2. Was the task clear and easy to follow?</span>
              <div className="flex gap-4 w-2/3">
                {[5, 4, 3, 2, 1].map(value => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="clarity"
                      value={value}
                      onChange={() => setClarity(value)}
                      checked={clarity === value}
                      className="text-gray-600"
                    />
                    <span className="text-sm">
              {value === 1 ? "Very Clear" : value === 2 ? "Clear" : value === 3 ? "Neutral" : value === 4 ? "Unclear" : "Very Unclear"}
            </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Likert Scale for Workflow */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-1/3">3. Which workflow did you find most useful?</span>
              <div className="flex gap-4 w-2/3">
                {[5, 4, 3, 2, 1].map(value => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="workflowRating"
                      value={value}
                      onChange={() => setWorkflowRating(value)}
                      checked={workflowRating === value}
                      className="text-gray-600"
                    />
                    <span className="text-sm">
              {value === 5 ? "Human Only" : value === 4 ? "AI Only" : value === 3 ? "Human → AI" : value === 2 ? "AI → Human" : "Not Sure"}
            </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Likert Scale for Recommendation */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-1/3">4. How likely are you to recommend this task to others?</span>
              <div className="flex gap-4 w-2/3">
                {[5, 4, 3, 2, 1].map(value => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recommendation"
                      value={value}
                      onChange={() => setRecommendation(value)}
                      checked={recommendation === value}
                      className="text-gray-600"
                    />
                    <span className="text-sm">
              {value === 1 ? "Very Likely" : value === 2 ? "Likely" : value === 3 ? "Neutral" : value === 4 ? "Unlikely" : "Very Unlikely"}
            </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Feedback */}
          <div className="mt-6">
            <label htmlFor="feedback" className="block text-sm text-gray-600">Additional comments</label>
            <input
              id="feedback"
              type="text"
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter your comments here..."
              value={feedback}
              onChange={handleFeedbackChange}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <Button onClick={handleSubmit} disabled={satisfaction === null || clarity === null
              || workflowRating === null || recommendation === null}>Submit Feedback</Button>
          </div>
        </section>

        <footer className="mt-6 text-center text-xs text-gray-400">
          Prototype UI — no data is saved yet.
        </footer>
      </div>
    </main>
  );
}
