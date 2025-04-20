document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginContainer").style = "display: none";
  setTimeout(() => {
    document.getElementById("loginContainer").style = "display: block";
    document.getElementsByTagName("body")[0].style.backgroundImage =
      "url(images/bg2.png)";
  }, 1650);
});

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    Swal.fire("Error", "Please enter both username and password", "error");
    return;
  }

  try {
    const response = await axios.post("/login", { username, password });
    if (response.data.success) {
      localStorage.setItem("username",response.data.username)
      setTimeout(() => {
        window.location.replace("./schedule");
      }, 1000);
    } else {
      Swal.fire("Error", "Invalid credentials", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    Swal.fire("Error", "Login failed", "error");
  }
}
