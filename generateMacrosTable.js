function setItemStatusText(status) {
  return +status === 0 ? "Enable" : "Disable";
}

function show(value) {
  document.querySelector(".dropdown-menu").value = value;
}

async function handleStatusChange(itemid, auth, id) {
  const newStatus = this.textContent === "Enable" ? 1 : 0;
  const itemRes = await fetchZabbixAPI({
    method: "item.update",
    itemid: itemid,
    status: newStatus,
  });
  await itemRes.json();
  this.textContent = setItemStatusText(newStatus);
}

export default function generateMacrosTable(data, auth, id) {
  //debugger;
  const tbody = document.querySelector("#macros-table tbody");
  const template = document.getElementById("table-macro-template");
  data.forEach(({ macros, templateid }) => {
    macros.forEach(({ macro, value, hostmacroid, type }) => {
      const clone = template.content.cloneNode(true);
      const td = clone.querySelectorAll("td");
      td[0].textContent = macro;
       var showValue;
      if(value==undefined){
        showValue = "******";
      }else{
        showValue = value;
      }
      td[1].innerHTML = `
      <!-- Button item modal -->
      <button type="button" class="btn btn-link" id="macroValueButton" 
       data-bs-toggle="modal" data-bs-target="#macroValueModal">
       ${showValue}
        </button>
      `;
      td[1]
        .querySelector("#macroValueButton")
        .addEventListener(
          "click",
          handleMacroValueButtonClick.bind(
            null,
            macro,
            value,
            hostmacroid,
            type,
            templateid,
            macros
          )
        );
      tbody.appendChild(clone);
    });
  });
}

async function updateMacroValue(hostmacroid, macro, type, templateid, macros) {
  const newMacro = macros.reduce((acc, curr) => {
    if (curr.hostmacroid === hostmacroid) {
      return [
        ...acc,
        {
          macro: macro,
          value: document.getElementById("macroValue").value,
          type: type,
        },
      ];
    }
    return [
      ...acc,
      {
        macro: curr.macro,
        value: curr.value,
        type: curr.type,
      },
    ];
  }, []);

  const itemRes = await fetchZabbixAPI({
    method: "template.update",
    macros: newMacro,
    templateid,
  });
  await itemRes.json();
  window.location.reload();
}

function handleMacroValueButtonClick(
  macro,
  value,
  hostmacroid,
  type,
  templateid,
  macros
) {
  document.getElementById("macroValue").value = value;
  document
    .getElementById("saveMacroValue")
    .addEventListener(
      "click",
      updateMacroValue.bind(null, hostmacroid, macro, type, templateid, macros)
    );
}
