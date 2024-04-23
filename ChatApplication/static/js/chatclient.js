const serverURL = "http://127.0.0.1:8000/api/v1/";

const output = document.getElementById("output");
const main = document.querySelector("main");
const chatsOutput = document.getElementById("chats_output");
const messageOutput = document.getElementById("messages_output");

login = "user1";
password = "user1user1user1";

const options = {
  headers: new Headers({
    Authorization: `Basic ${btoa(`${login}:${password}`)}`,
  }),
};

function checkAutorization() {
  localStorage.clear();
  if (localStorage.getItem("user") === null) {
    main.innerHTML = `
    <section id="login">
      <input type="text" id="login_input" placeholder="Login">
      <input type="text" id="pass_input" placeholder="password">
      <button id="login_btn">Login</button>
      <div id="login_output"></div>
    </section>
    `;
    const loginBtn = document.getElementById("login_btn");
    const loginOutput = document.getElementById("login_output");
    loginBtn.addEventListener("click", () => {
      let loginInput = document.getElementById("login_input").value;
      let PassInput = document.getElementById("pass_input").value;
      localStorage.setItem("user", loginInput);
      localStorage.setItem("password", PassInput);
    });
  }
}

function displayRooms() {
  output.innerHTML = main
  main.innerHTML = `
  <section id="chats">
    <h3>Chats<h3>
    <div id="chats_output"></div>
  </section>
  <section id="messages">
    <h3>Messages<h3>
    <div id="messages_output"></div>
  </section>`;
  fetch(`${serverURL}rooms/?format=json`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        let pre = document.createElement("p");
        pre.innerHTML = `
        <article id="chat_id${data[i].id}">
          <h3>${data[i].name}</h3>
          <p>${data[i].author}</p>
          <p>${data[i].members}</p>
        </article>`;
        chatsOutput.appendChild(pre);
      }

    })
    .catch((error) => {
      output.innerHTML = `<h3>${error}<h3>`;
    });
}

chatsOutput.addEventListener("click", (e) => {
        const parent = e.target.parentElement;
        if (parent.tagName == "ARTICLE") {
        fetch(
        `${serverURL}messages/?format=json&room_id=${parent.id.at(-1)}`, options)
        .then((response) => {
            //output.innerHTML = response.status
            return response.json();
        })
        .then((data) => {
            messageOutput.innerHTML = "";
            for (let i = 0; i < data.length; i++) {
                let pre = document.createElement("p");
                pre.innerHTML = `
                <article id="message_id${data[i].id}">
                <h3>${data[i].author}</h3>
                <p>${data[i].time}</p>
                <p>${data[i].text}</p>
                </article>
                `;
                messageOutput.appendChild(pre);
            }
        })
        .catch((error) => {
            output.innerHTML = `<h3>${error}<h3>`;
        });
        }
    });

//checkAutorization();
displayRooms();

