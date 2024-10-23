format2();

function format2() {
  let path = window.location.pathname;
  console.log("Pathname: " + path);
  switch (path) {
    case "/quote/new": 
      format("addQuotes");
      break;
    case "/author/new": 
      format("addAuthors");
      break;
    case "/quotes": 
      format("listQuotes");
      break;
    case "/authors": 
      format("listAuthors");
      break;
    case "/": 
      format("home");
      break;
    default: 
      format("home");
  }
}

function format(format) {
  /*let buttons = document.querySelectorAll("button.navigation");
  buttons.forEach(function(btn) {
    btn.style.backgroundColor = "#898989";
    btn.style.color = "black";
  });*/
  let button = document.querySelector(`#${format}`);
  console.log("Format: " + `${format}`);
  button.style.backgroundColor = "#567890";
  button.style.color = "white";
}