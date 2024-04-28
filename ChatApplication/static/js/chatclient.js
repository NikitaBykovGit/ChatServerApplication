const serverURL = "http://127.0.0.1:8000/api/v1/";
const serverWSURL = "ws://127.0.0.1:8000/ws/";

const output = document.getElementById("output");
const chatsOutput = document.getElementById("chats_output");
const messageOutput = document.getElementById("messages_output");
const loginSection = document.getElementById("login");
const loginBtn = document.getElementById("login_btn");
const loginOutput = document.getElementById("login_output");
const chatSection = document.getElementById("chats");
const messageSection = document.getElementById("messages");
const messageForm = document.getElementById("message_form");
const messageInput = document.getElementById("message_input");
const messageBtn = document.getElementById("message_btn");
const accountList = document.getElementById("account_list");
const logoutA = document.getElementById("logout");
const navigation = document.getElementById("nav");
const showAll = document.getElementById("show_all");
const hideAll = document.getElementById("hide_all");
const newChat = document.getElementById("new_chat");
let socket;

function display_massage(outputTag, message) {
    let pre = document.createElement("aside");
    pre.innerHTML = `
    <article id="message_id${message.id}">
      <h3>${message.author || message["author"]}</h3>
      <p>${message.time}</p>
      <p>${message.text}</p>
    </article>`;
    outputTag.appendChild(pre);
}

function startApplication(server) {
    if (localStorage.getItem("user") && localStorage.getItem("password")) {
        displayRooms(
            serverURL,
            localStorage.getItem("user"),
            localStorage.getItem("password"),
            localStorage.getItem("userID"),
            true,
        );
    } else {
        authorizateUser(server)
    }
}

function authorizateUser(server) {
    navigation.style.display = "none";
    chatSection.style.display = "none";
    messageSection.style.display = "none";
    loginSection.style.display = "block";
    if (localStorage.getItem("user") || localStorage.getItem("password")) {
        loginOutput.innerHTML = "Incorrect login or password";
    }
    loginBtn.addEventListener("click", () => {
        let loginInput = document.getElementById("login_input").value;
        let PassInput = document.getElementById("pass_input").value;

        fetch(`${server}users/?format=json&username=${loginInput}`, {
            headers: new Headers({
                Authorization: `Basic ${btoa(`${loginInput}:${PassInput}`)}`,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                localStorage.setItem("user", loginInput);
                localStorage.setItem("password", PassInput);
                localStorage.setItem("userID", data[0].id);
                loginOutput.innerHTML = "";
                displayRooms(
                    server,
                    localStorage.getItem("user"),
                    localStorage.getItem("password"),
                    localStorage.getItem("userID"),
                    true,
                );
            })
            .catch(() => {
                loginOutput.innerHTML = `<h3>Incorrect login or password<h3>`;
            });
    });
}

function createRoom(server, user, password, userID, roomName) {
    fetch(`${server}rooms/`, {
        method: "POST",
        body: JSON.stringify({
            name: roomName,
            author: user,
        }),
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
            "Content-type": "application/json; charset=UTF-8",
        }),

    }).then((response) => response.json())
        .then((data) => {
            displayRooms(
                server,
                user,
                password,
                userID,
                true,
            )
        });
}

function logout() {
    localStorage.clear();
    authorizateUser(serverURL);
}

function displayRooms(server, user, password, userID, includeUser) {
    loginSection.style.display = "none";
    chatSection.style.display = "block";
    messageSection.style.display = "block";
    let url = `${server}rooms/?format=json`;
    let action = "join";
    if (includeUser) {
        url += `&roomuser__user=${userID}`;
        action = "leave";
    } else {
        url += `&user_id=${userID}`;
    }
    fetch(url, {
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            chatsOutput.innerHTML = "";
            navigation.style.display = "block";
            accountList.innerHTML = `Hello, ${user}`;
            for (let i = 0; i < data.length; i++) {
                let pre = document.createElement("article");
                pre.innerHTML = `
        <article id="chat_id${data[i].id}">
          <h3>${data[i].name}</h3>
          <p id="leave_join${data[i].id}" class="rightCentr">${action}</p>
          <p>${data[i].author}</p>
          <p>Members: ${data[i].members}</p>
        </article>`;
                chatsOutput.appendChild(pre);
            }
        })
        .catch((error) => (output.innerHTML = `<h3>${error}<h3>`));
}

function displayMessages(server, user, password, chatID) {
    fetch(`${server}messages/?format=json&room_id=${chatID}`, {
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
        }),
    })
        .then((response) => {
            output.innerHTML = response.status;
            return response.json();
        })
        .then((data) => {
            messageOutput.innerHTML = "";
            for (let i = 0; i < data.length; i++) {
                display_massage(messages_output, data[i])
            }
        })
        .catch((error) => {
            output.innerHTML = `<h3>${error}<h3>`;
        });
}

function leaveJoinRoom(server, user, password, userID, roomID) {
    fetch(`${server}roomusers/?format=json&room_id=${roomID}&user_id=${userID}`, {
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            leaveRoom(server, user, password, data[0].id);
        })
        .catch(() => joinRoom(server, user, password, roomID));
}

function leaveRoom(server, user, password, tableID) {
    fetch(`${server}roomusers/${tableID}`, {
        method: "DELETE",
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
        }),
    });
}

function joinRoom(server, user, password, roomID) {
    fetch(`${server}roomusers/`, {
        method: "POST",
        body: JSON.stringify({
            room: roomID,
            user: user,
        }),
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
            "Content-type": "application/json; charset=UTF-8",
        }),
    });
}

startApplication(serverURL);

chatsOutput.addEventListener("click", (e) => {
    if (e.target.className === "rightCentr") {
        leaveJoinRoom(
            serverURL,
            localStorage.getItem("user"),
            localStorage.getItem("password"),
            localStorage.getItem("userID"),
            e.target.id.replace(/[^0-9]/g, ""),
        );
        e.target.parentElement.remove();
    } else {
        const parent = e.target.parentElement;
        let parentID = parent.id.replace(/[^0-9]/g, '');
        messageForm.style.display = "block";
        sessionStorage.setItem("Room", parentID);
        if (parent.tagName === "ARTICLE") {
            socket = new WebSocket(serverWSURL + `room/${parentID}/`);
            socket.onmessage = function (e) {
                let data = JSON.parse(e.data);
                display_massage(messageOutput, data)
            };
            displayMessages(
                serverURL,
                localStorage.getItem("user"),
                localStorage.getItem("password"),
                parentID,
            );
        }
    }
});

logoutA.addEventListener("click", () => {
    logout();
});

showAll.addEventListener("click", () => {
    displayRooms(
        serverURL,
        localStorage.getItem("user"),
        localStorage.getItem("password"),
        localStorage.getItem("userID"),
    );
    hideAll.style.display = "block";
    showAll.style.display = "none";
});

hideAll.addEventListener("click", () => {
    displayRooms(
        serverURL,
        localStorage.getItem("user"),
        localStorage.getItem("password"),
        localStorage.getItem("userID"),
        true,
    );
    hideAll.style.display = "none";
    showAll.style.display = "block";
});

messageBtn.addEventListener("click", () => {
    socket.send(
        JSON.stringify({
            'author': localStorage.getItem("user"),
            'room': sessionStorage.getItem("Room"),
            'text': messageInput.value,
            'type': 'message'
        })
    );
});

newChat.addEventListener("click", () => {
    let newChatName = prompt("Input new chat name:")
    createRoom(
        serverURL,
        localStorage.getItem("user"),
        localStorage.getItem("password"),
        localStorage.getItem("userID"),
        newChatName
    )
    // joinRoom(
    //     serverURL,
    //     localStorage.getItem("user"),
    //     localStorage.getItem("password"),
    //     newRoomID
    // )
})