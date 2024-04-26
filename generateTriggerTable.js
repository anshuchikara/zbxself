function setStatusText(status) {
  return +status === 0 ? "Enable" : "Disable";
}

function show(value) {
  document.querySelector(".dropdown-menu").value = value;
}

async function handleStatusChange(triggerid, auth, id) {
  const newStatus = this.textContent === "Enable" ? 1 : 0;
  const triggerRes = await fetchZabbixAPI({
    method: "trigger.update",
    triggerid: triggerid,
    status: newStatus,
  });
  await triggerRes.json();
  this.textContent = setStatusText(newStatus);
}
var priorityMap = new Map();
setPriorityHashMap(priorityMap);
export default function generateTriggerTable(data, auth, id) {
  const tbody = document.querySelector("#trigger-table tbody");
  const template = document.getElementById("table-data-template");
  data.forEach(({ priority, description, status, tags, triggerid }) => {
    const clone = template.content.cloneNode(true);
    const td = clone.querySelectorAll("td");

    td[0].innerHTML =
      `
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-primary" id="priorityButton" 
     data-bs-toggle="modal" data-bs-target="#exampleModal">
    ` +
      priorityMap.get(priority) +
      `
      </button>
    `;

    td[0]
      .querySelector("#priorityButton")
      .addEventListener(
        "click",
        handleButtonClick.bind(null, priority, triggerid)
      );
      td[1].innerHTML =
      `
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-link" id="discriptionButton" 
     data-bs-toggle="modal" data-bs-target="#descriptionModal">
     ${description}
      </button>
    `;
    td[1]
      .querySelector("#discriptionButton")
      .addEventListener(
        "click",
        handleDiscriptionButtonClick.bind(null, description, triggerid)
      );
    
    //td[1].textContent = description;
    td[2].textContent = setStatusText(status);
    td[2].addEventListener(
      "click",
      handleStatusChange.bind(td[2], triggerid, auth, id)
    );
    td[3].innerHTML = `
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-primary" id="tagButton" 
     data-bs-toggle="modal" data-bs-target="#exampleModal1">show</button>
    `;
    td[3]
      .querySelector("#tagButton")
      .addEventListener(
        "click",
        handleTagButtonClick.bind(null, tags, triggerid)
      );
    tbody.appendChild(clone);
  });
}

function handleTagButtonClick(tags, triggerid) {
  const template = document.getElementById("tag-row-template");
  document.getElementById("selectTag").innerHTML = "";
  document.getElementById("saveTag").dataset.triggerid = triggerid;
  tags
    .sort((a, b) => {
      return a.tag > b.tag ? 1 : -1;
    })
    .forEach(({ tag, value }) => {
      const clone = template.content.cloneNode(true);
      clone.getElementById("tagName").textContent = tag;
      clone.getElementById("tagValue").value = value;
      document.getElementById("selectTag").appendChild(clone);
    });

  //document.getElementById('selectTag').value=tags;
  //document.getElementById('saveTag').dataset.triggerid=triggerid;
}
function handleButtonClick(priority, triggerid) {
  document.getElementById("selectPriority").value = priority;
  document.getElementById("saveSeverity").dataset.triggerid = triggerid;
}
function setPriorityHashMap(priorityMap) {
  priorityMap.set("0", "Not classified");
  priorityMap.set("1", "Information");
  priorityMap.set("2", "Warning");
  priorityMap.set("3", "Minor");
  priorityMap.set("4", "Major");
  priorityMap.set("5", "Critical");
}

function handleDiscriptionButtonClick(description, triggerid) {
  document.getElementById("triggerDescription").value = description;
  document.getElementById("saveDescription").dataset.triggerid = triggerid;
}