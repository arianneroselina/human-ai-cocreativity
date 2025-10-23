import { useState } from "react";
import { Button } from "@/components/ui/button";

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
            Write a short poem about a tired student at university. Use the following guidelines:
          </p>

          {/* Guidelines List */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl text-sky-600">📝</span>
                <div>
                  <h3 className="font-medium">Length</h3>
                  <p className="text-sm text-gray-600">Minimum 50 words, maximum 150 words.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl text-sky-600">🔑</span>
                <div>
                  <h3 className="font-medium">Required Words</h3>
                  <p className="text-sm text-gray-600">Use at least 3 of the following words:
                    &quot;Tired&quot;, &quot;University&quot;, &quot;Books&quot;, &quot;Sleepless&quot;, &quot;Stress&quot;,
                    &quot;Midnight&quot;, &quot;Coffee&quot;, &quot;Assignment&quot;, &quot;Brain&quot;, &quot;Overwhelmed&quot;.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl text-sky-600">❌</span>
                <div>
                  <h3 className="font-medium">Avoid</h3>
                  <p className="text-sm text-gray-600">Do not use the word &quot;study&quot; or mention specific subjects.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl text-sky-600">🎨</span>
                <div>
                  <h3 className="font-medium">Tone and Style</h3>
                  <p className="text-sm text-gray-600">Your poem can be serious, humorous, or reflective.
                    Experiment with rhyme and rhythm to convey the tired student&apos;s emotions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
