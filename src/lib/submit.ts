export function submitData(
  words: number,
  meetsRequiredWords: boolean,
  meetsAvoidWords: boolean,
  text: string,
  router: any
) {
  localStorage.setItem("wordCount", JSON.stringify(words));
  localStorage.setItem("meetsRequiredWords", JSON.stringify(meetsRequiredWords));
  localStorage.setItem("meetsAvoidWords", JSON.stringify(meetsAvoidWords));

  console.log("[submitted]", { workflow: "human", length: text.length, text });
  router.push("/submit");
}
