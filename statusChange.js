function handleStatusChange(status) {
  const selectedElement = [];
  document.querySelectorAll("input.trigger-checkbox").forEach((ele) => {
    if (ele.checked) {
      selectedElement.push(ele.dataset.triggerid);
    }
  });
  console.log(selectedElement);
}
