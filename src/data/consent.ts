export const CONSENT_VERSION = "2026-01-04-v1";

export type ConsentSection = {
  title: string;
  body: string;
};

export const CONSENT_SECTIONS: ConsentSection[] = [
  {
    title: "1. Purpose of the Study",
    body:
      "You are invited to take part in a research study exploring how people collaborate with artificial intelligence (AI) " +
      "on time-boxed writing tasks. During the study, you will engage in several rounds of writing tasks using different " +
      "collaboration workflows. We want to understand how different forms of collaboration with AI influence writing efficiency, " +
      "output quality, workflow choice, and trust in AI.",
  },
  {
    title: "2. Participation Requirements",
    body:
      "Participation is voluntary. You must be at least 18 years old and able to read English. If you choose to participate, " +
      "you will complete a session consisting of time-bounded writing rounds. Each round uses one of several collaboration " +
      "workflows (e.g., human only, AI only, mixed).",
  },
  {
    title: "3. Procedures",
    body:
      " - You will start a session by clicking “Start session”.\n" +
      " - Each round is time-boxed; you should submit before time runs out.\n" +
      " - In each round you will select one of the provided collaboration workflows and complete a writing task.",
  },
  {
    title: "4. Duration and Tasks",
    body:
      "The entire session will take approximately 30-50 minutes. During each round, you will choose a workflow and complete the associated writing task.",
  },
  {
    title: "5. What Will Be Recorded",
    body:
      "The following information will be recorded (coded/pseudonymous) for research purposes:\n" +
      " - Task duration and timing\n" +
      " - The workflow you select each round\n" +
      " - The final text output you submit after each round\n" +
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
      "Data is stored in a coded/pseudonymous form. Data will be handled in accordance with GDPR-aligned data protection standards.",
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
