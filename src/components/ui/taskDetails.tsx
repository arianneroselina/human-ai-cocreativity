import { useState } from "react";
import { Button } from "@/components/shadcn_ui/button";

export const Task = [
  `Write a short poem about a tired student at university. Use the following guidelines:`,
  `Minimum 50 words, maximum 100 words.`,
  `Use at least 3 of the following words:\n` +
  `"Tired", "University", "Books", "Sleepless", "Stress", "Midnight", "Coffee", "Assignment", "Brain", "Overwhelmed".`,
  `Do not use the word "study" or mention specific subjects.`,
  `Your poem can be serious, humorous, or reflective. Experiment with rhyme and rhythm to convey the tired student's emotions.`
]

export const AntiTask = [
  `Write a short poem about a tired student at university. Use the following guidelines:`,
  `Minimum 50 words, maximum 100 words.`,
  `Use only 2 of the following words:\n` +
  `"Tired", "University", "Books", "Sleepless", "Stress", "Midnight", "Coffee", "Assignment", "Brain", "Overwhelmed".`,
  `Use the word "study" or mention specific subjects.`,
  `Your poem can be serious, humorous, or reflective. Experiment with rhyme and rhythm to convey the tired student's emotions.`
]

export const HumanThenAIRules = [
  `Goals:`,
  `- Strengthen imagery and specificity.`,
  `- Improve rhythm and line breaks; prefer natural cadence over forced rhyme.`,
  `- Remove clichés and filler; tighten wording.`,
  `- Maintain language of the original text.`,
  `- Keep length within ±10% of original.`,
  `- Follow the predefined guidelines.`,
  `Additional Rules:`,
  `1) Do NOT invent new narrative events; refine what's there.`,
]

export const GeneralAIRules = [
  `General Rules:`,
  `1) Do NOT add explanations, titles, or commentary.`,
  `2) If a requirement conflicts with goals, requirements win.`,
  `3) Output ONLY the final edited poem—no markdown fences.`,
]

export default function TaskDetails() {
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(true);

  return (
    <section className="rounded-lg border bg-white p-4 shadow-sm">
      {/* Info Section: Display the Task Prompt */}
      <div className="flex justify-between items-center mt-2">
        <h2 className="font-semibold text-lg text-gray-800">Task: Write a Poem</h2>
        <Button
          variant="ghost"
          onClick={() => setTaskDetailsOpen(!taskDetailsOpen)}
          aria-label={taskDetailsOpen ? "Hide Task Details" : "Show Task Details"}
          className="text-gray-500"
        >
          {taskDetailsOpen ? "▲" : "▼"}
        </Button>
      </div>

      {taskDetailsOpen && (
        <div className="mt-4">
          <p className="mt-2 text-sm text-gray-600">
            {Task[0]}
          </p>

          {/* Guidelines List */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl text-sky-600">📝</span>
                <div>
                  <h3 className="font-medium">Length</h3>
                  <p className="text-sm text-gray-600">{Task[1]}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl text-sky-600">🔑</span>
                <div>
                  <h3 className="font-medium">Required Words</h3>
                  <p className="text-sm text-gray-600">
                    {Task[2]}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl text-sky-600">❌</span>
                <div>
                  <h3 className="font-medium">Avoid</h3>
                  <p className="text-sm text-gray-600">{Task[3]}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl text-sky-600">🎨</span>
                <div>
                  <h3 className="font-medium">Tone and Style</h3>
                  <p className="text-sm text-gray-600">{Task[4]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
