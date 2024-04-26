import generateTriggerTable from "./generateTriggerTable.js";
import generateMacrosTable from "./generateMacrosTable.js";

/*
(async () => {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("templateId");
  const triggerRes = await fetchZabbixAPI({
    method: "trigger.get",
    templateids: templateId,
    output: "extend",
    selectFunctions: "extend",
    selectTags: "extend",
  });
  const { result: triggerResult } = await triggerRes.json();
  generateTriggerTable(triggerResult);
  document
    .getElementById("saveSeverity")
    .addEventListener("click", updateSeverity.bind(null));
  document
    .getElementById("saveTag")
    .addEventListener("click", updateTag.bind(null));
    document
    .getElementById("saveDescription")
    .addEventListener("click", updateDescription.bind(null));
  })();
*/

(async () => {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("templateId");

  const [triggerRes, templateRes1] = await Promise.all([
    fetchZabbixAPI({
      method: "trigger.get",
      templateids: templateId,
      output: "extend",
      selectFunctions: "extend",
      selectTags: "extend",
      macros: "extend",
    }),
    fetchZabbixAPI({
      method: "template.get",
      templateids: templateId,
      output: "extend",
      selectMacros: "extend",
    })
  ])

  const { result: triggerResult } = await triggerRes.json();
  generateTriggerTable(triggerResult);

  const { result: templateResult1 } = await templateRes1.json();
  generateMacrosTable(templateResult1);

  document
    .getElementById("saveSeverity")
    .addEventListener("click", updateSeverity.bind(null));
  document
    .getElementById("saveTag")
    .addEventListener("click", updateTag.bind(null));
  document
    .getElementById("saveDescription")
    .addEventListener("click", updateDescription.bind(null));

  })();


async function updateSeverity(auth, id) {
  const triggerRes = await fetchZabbixAPI({
    method: "trigger.update",
    triggerid: document.getElementById("saveSeverity").dataset.triggerid,
    priority: document.getElementById("selectPriority").value,
  });
  await triggerRes.json();
  window.location.reload();
}

async function updateTag(auth, id) {
  const newTag = [
    ...document.querySelectorAll("#selectTag .tagDetails"),
  ].reduce((acc, curr) => {
    const tagName = curr.querySelector("#tagName").textContent;
    const tagValue = curr.querySelector("#tagValue").value;
    return [
      ...acc,
      {
        tag: tagName,
        value: tagValue,
      },
    ];
  }, []);
  const triggerRes = await fetchZabbixAPI({
    method: "trigger.update",
    triggerid: document.getElementById("saveTag").dataset.triggerid,
    tags: newTag,
  });
  await triggerRes.json();
  window.location.reload();
}
async function updateDescription(auth, id) {
  const triggerRes = await fetchZabbixAPI({
    method: "trigger.update",
    triggerid: document.getElementById("saveDescription").dataset.triggerid,
    description: document.getElementById("triggerDescription").value,
  });
  await triggerRes.json();
  window.location.reload();
}
