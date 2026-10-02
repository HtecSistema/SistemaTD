if (localStorage.getItem("logado") !== "true") {
  // só redireciona se abriu o arquivo direto, não se está dentro do iframe
  if (window.top === window.self) {
    window.location.href = "index.html";
  }
}