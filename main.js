async function handleTemplateButtonClick(templateId) {
  window.location.href = `./detail?templateId=${templateId}`;
}

async function fetchTemplate(event) {
	 event.preventDefault();
	if(document.getElementById("AddMonitoring")){
		document.getElementById("AddMonitoring").style.display = "none";
	}
	// event.preventDefault();
  const hostName = document.getElementById("input1").value.toUpperCase();
  console.log("Hello: " + hostName);
  try {
    const hostRes = await fetchZabbixAPI({
      method: "host.get",
      filter: {
        host: [hostName],
      },
    });
    const { result: hostResult } = await hostRes.json();
console.log("HostResult: "+hostResult[0]);
    const hostResTemplate = await fetchZabbixAPI({
      method: "host.get",
      output: ["hostid"],
      selectParentTemplates: ["templateid", "name"],
      hostids: hostResult[0].hostid,
    });
    const { result: templateResult } = await hostResTemplate.json();

    const ele = document.getElementById("template-list");
    ele.innerHTML = "<h2>Select Template</h2>";
    templateResult[0].parentTemplates.forEach((element) => {
      const button = document.createElement("button");
      button.className = "template-button btn btn-secondary btn-lg";
      button.textContent = element.name;
      button.onclick = handleTemplateButtonClick.bind(null, element.templateid);
      ele.appendChild(button);
    });
  } catch (error) {
	  console.log(error);
    console.error(error);
  }
}
async function saveFile(event){
  event.preventDefault();
  let input = document.getElementById("doc-file");
  let data = new FormData()
  data.append('file', input.files[0])
  fetch('/save-file', {
    method: 'POST',
    body: data
  })
}

async function savePortFile(event){
  event.preventDefault();
  let input = document.getElementById("port-doc-file");
  let data = new FormData()
  data.append('port-file', input.files[0])
  fetch('/save-port-file', {
    method: 'POST',
    body: data
  })
}
async function saveWebFile(event){
  event.preventDefault();
  let input = document.getElementById("web-doc-file");
  let data = new FormData()
  data.append('web-file', input.files[0])
  fetch('/save-web-file', {
    method: 'POST',
    body: data
  })
}
