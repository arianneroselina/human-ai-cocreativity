export const CONSENT_VERSION = "2026-01-24-v4";

export type ConsentSection = {
  title: string;
  body: string;
};

export const CONSENT_SECTIONS: ConsentSection[] = [
  {
    title: "1. Purpose of the Study",
    body:
      "You are invited to take part in a research study exploring how people collaborate with artificial intelligence (AI) " +
      "on time-boxed creative writing tasks. During the study, you will engage in several rounds of creative writing tasks " +
      "using different collaboration workflows. We want to understand how different forms of collaboration with AI influence " +
      "writing efficiency, output quality, workflow choice, and trust in AI.",
  },
  {
    title: "2. Participation Requirements",
    body:
      "Participation is voluntary. You must be at least 18 years old and able to read English. If you choose to participate, " +
      "you will complete a session consisting of time-bounded writing rounds. The session includes 4 practice rounds and 3 main rounds, " +
      "each followed by a short feedback survey.",
  },
  {
    title: "3. Procedures",
    body:
      " - You will start a session by clicking “Start session”.\n" +
      " - The session begins with 4 practice rounds where you will try each collaboration workflow once, in random order.\n" +
      " - After the practice rounds, you will complete 3 main rounds.\n" +
      " - Each round is time-boxed; you should submit before time runs out. If not, it will be submitted for you.\n" +
      " - In every round, you will use one of the provided collaboration workflows and complete a creative writing task.\n" +
      " - Please do your best in all 7 rounds, as all of them will be used for the study analyses.\n" +
      " - After each round, you will answer a brief feedback survey about your experience in that round.\n" +
      " - At the end of the session, you will complete an additional short survey about your overall experience."
  },
  {
    title: "4. Duration and Tasks",
    body:
      "The entire session will take approximately 30–50 minutes. Across 4 practice rounds and 3 main rounds, you will choose or be assigned workflows and complete " +
      "the associated creative writing tasks, followed by short feedback surveys after each round and at the end of the session.",
  },
  {
    title: "5. What Will Be Recorded",
    body:
      "The following information will be recorded (pseudonymous) for research purposes:\n" +
      " - Task duration and timing\n" +
      " - The workflow you use in each round\n" +
      " - The final text output you submit after each round\n" +
      " - Your responses to the feedback surveys\n" +
      " - Your interactions with the AI during the task, including chat messages and actions\n" +
      "No direct identifiers (e.g., name, email) are collected in this system.",
  },
  {
    title: "6. Risks and Discomforts",
    body:
      "There are no known risks beyond those experienced in normal computer use. You may withdraw from the study at any time without penalty. Participation is voluntary.",
  },
  {
    title: "7. Confidentiality",
    body:
      "Data is stored in a pseudonymous form. Data will be handled in accordance with GDPR-aligned data protection standards.",
  },
  {
    title: "8. Voluntary Participation and Withdrawal",
    body:
      "Your participation is voluntary. You may refuse to participate or withdraw at any time without penalty. If you decide to withdraw, your data from this session will not be used.",
  },
  {
    title: "9. Consent",
    body:
      "By clicking “Agree,” you confirm that you have read the information provided above, you understand the purpose and procedures of the study, and you voluntarily agree to participate.",
  },
];

export function buildConsentText() {
  return [
    "Informed Consent Form",
    "",
    ...CONSENT_SECTIONS.flatMap((s) => [s.title, s.body, ""]),
  ].join("\n");
}
