async function handleLogin(event) {
  event.preventDefault();
  console.log("called");
  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
      }),
    });
    const { status } = await response.json();
    if (status) {
      window.location.href = "./main";
    }
  } catch (error) {
    console.error(error);
  }
}
