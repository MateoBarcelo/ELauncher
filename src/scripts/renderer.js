const launchButton = document.getElementById("launch-button");
const loader = document.getElementById("loader-select");

launchButton.addEventListener("click", () => {
  api.launchApp(loader.value);
});
