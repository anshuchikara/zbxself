async function fetchZabbixAPI(body) {
  return await fetch(
    "/zabbixAPI",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      redirect: "follow",
    }
  );
}
