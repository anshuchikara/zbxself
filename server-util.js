const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchZabbixAPI(param) {
    console.log("called fetchZabbixAPI", param)
    return await fetch(
        "https://zabbixmon.optum.com/zabbix/api_jsonrpc.php",
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(param),
        redirect: "follow",
      }
    );
  }

  module.exports = {
    fetchZabbixAPI,
    fetch
  }