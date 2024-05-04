const serverURL = "http://127.0.0.1:8000/api/v1/";
const serverWSURL = "ws://127.0.0.1:8000/ws/";
let websocket = undefined;
let authHeaders = undefined;

function displayRoom(outputTag, room, action) {
    let pre = document.createElement("article");
    pre.innerHTML = `
        <article>
          <h3>${room.name}</h3>
          <p class="rightCentr">${action}</p>
          <p class ="textAuthor">Author: ${room.author}</p>
          <p class ="textMembers">Members: ${room.members}</p>
        </article>`;
    outputTag.appendChild(pre);
}

function displayMessage(outputTag, message) {
    let pre = document.createElement("article");
    pre.innerHTML = `
    <article class="rightMain">
      <h3>${message.author}</h3>
      <p>${message.time}</p>
      <p>${message.text}</p>
    </article>`;
    outputTag.appendChild(pre);
}

function displayMember(outputTag, member) {
    let pre = document.createElement("article");
    pre.innerHTML = `
    <article class="rightMain">
      <h3>${member.user}</h3>
      <image class="writeButton" title="Write message" src="${pathToWriteMessage}"></image>
    </article>`;
    outputTag.appendChild(pre);
}

function startApplication(server, user, password) {
    if (localStorage.getItem("authorize")) {
        authHeaders = new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
            "Content-type": "application/json; charset=UTF-8",
        })
        displayRooms(server, user, authHeaders, true,);
    } else authorizeUser(server)
}

function authorizeUser(server) {
    document.getElementById("nav").style.display = "none";
    document.getElementById("chats").style.display = "none";
    document.getElementById("messages").style.display = "none";
    document.getElementById("members").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("login_btn").addEventListener("click", function (e) {
        let loginInput = document.getElementById("login_input").value;
        let PassInput = document.getElementById("pass_input").value;
        localStorage.setItem("user", loginInput);
        localStorage.setItem("password", PassInput);
        authHeaders = new Headers({
            Authorization: `Basic ${btoa(`${loginInput}:${PassInput}`)}`,
            "Content-type": "application/json; charset=UTF-8",
        })
        fetch(`${server}users/?format=json&username=${loginInput}`, {headers: authHeaders})
            .then((response) => response.json())
            .then((data) => {
                if (data['detail'] === 'Invalid username/password.') {
                    document.getElementById("login_output").innerHTML = data['detail']
                } else {
                    document.getElementById("login_btn").style.backgroundImage = `url(${pathToUnlock})`;
                    setTimeout(() => {
                        localStorage.setItem("authorize", 'true');
                        localStorage.setItem("user", loginInput);
                        localStorage.setItem("password", PassInput);
                        document.getElementById("login_output").innerHTML = "";
                        displayRooms(server, localStorage.getItem("user"), authHeaders, true,);
                        document.getElementById("login_btn").style.backgroundImage = `url(${pathToLock})`;
                    }, 1000)
                    e.target.removeEventListener(e.type, arguments.callee);
                }
            })
    });
}

function createRoom(server, user, header, roomName) {
    fetch(`${server}rooms/`, {
        method: "POST", body: JSON.stringify({name: roomName, author: user,}),
        headers: header,
    }).then((response) => response.json())
        .then(() => displayRooms(server, user, header, true))
}

function logout(server, header) {
    localStorage.clear();
    document.getElementById("chats_output").innerHTML = "";
    document.getElementById("messages_output").innerHTML = "";
    document.getElementById("members_output").innerHTML = "";
    authorizeUser(server, header);
}

function displayRooms(server, user, header, includeUser) {
    document.getElementById("login").style.display = "none";
    document.getElementById("chats").style.display = "block";
    document.getElementById("messages").style.display = "block";
    let url = `${server}rooms/?format=json`;
    let action = "join";
    if (includeUser) {
        url += `&user=${user}`;
        action = "leave";
    } else url += `&notuser=${user}`
    fetch(url, {headers: header})
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            document.getElementById("chats_output").innerHTML = "";
            document.getElementById("nav").style.display = "block";
            document.getElementById("account_list").innerHTML = `Hello, ${user}`;
            data.forEach((room) => displayRoom(document.getElementById("chats_output"), room, action));
        })
        .catch((error) => (document.getElementById("output").innerHTML = `<h3>${error}<h3>`));
}

function displayMessages(server, header, roomName) {
    document.getElementById("members").style.display = "none";
    document.getElementById("messages").style.display = "block";
    fetch(`${server}messages/?format=json&room__name=${roomName}`, {headers: header})
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("messages_output").innerHTML = "";
            data.forEach((message) => displayMessage(document.getElementById("messages_output"), message))
        })
        .catch((error) => document.getElementById("output").innerHTML = `<h3>${error}<h3>`)
}

function leaveJoinRoom(server, user, header, roomName) {
    fetch(`${server}roomusers/?format=json&room__name=${roomName}&user__username=${user}`, {headers: header})
        .then((response) => response.json())
        .then((data) => leaveRoom(server, header, data[0].id))
        .catch(() => joinRoom(server, header, roomName));
}

function leaveRoom(server, header, tableID) {
    fetch(`${server}roomusers/${tableID}`, {method: "DELETE", headers: header});
}

function joinRoom(server, header, roomName) {
    fetch(`${server}roomusers/`, {
        method: "POST", body: JSON.stringify({
            room: roomName, user: user,
        }), headers: header,
    });
}

function createChatWithUser(server, user, header, targetUsername) {
    roomName = `ChatWith${targetUsername}`
    fetch(`${server}rooms/`, {
        method: "POST", body: JSON.stringify({
            name: roomName, author: user,
        }), headers: header
    }).then((response) => response.json())
        .then((data) => {
            alert(data.name)
            fetch(`${server}roomusers/`, {
                method: "POST", body: JSON.stringify({
                    room: data.name, user: targetUsername,
                }), headers: header
            });
        })
        .then(() => {
            displayRooms(server, user, header, true,)
        })
}

function displayMembers(server, header, roomName) {
    document.getElementById("login").style.display = "none";
    document.getElementById("messages").style.display = "none";
    document.getElementById("members").style.display = "block";
    fetch(`${server}roomusers/?format=json&room__name=${roomName}`, {headers: header})
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("members_output").innerHTML = "";
            data.forEach((d) => {
                displayMember(document.getElementById("members_output"), d)
            })
        })
        .then(() => {
            let buttons = document.querySelectorAll('.writeButton')
            buttons.forEach((button) => {
                button.addEventListener("click", (e) => {
                    createChatWithUser(serverURL, localStorage.getItem("user"), header, e.target.previousElementSibling.innerHTML)
                })
            })
        })
        .catch((error) => {
            document.getElementById("output").innerHTML = `<h3>${error}<h3>`;
        });


}

startApplication(serverURL, localStorage.getItem("user"), localStorage.getItem("password"));

document.getElementById("chats_output").addEventListener("click", function (e) {
    let roomName = e.target.parentElement.querySelector('H3').innerText
    switch (e.target.className) {
        case "rightCentr":
            leaveJoinRoom(serverURL, localStorage.getItem("user"), authHeaders, roomName,);
            e.target.parentElement.remove();
            break;
        case "textMembers":
            displayMembers(serverURL, authHeaders, roomName)
            break;
        default:
            const parent = e.target.parentElement;
            document.getElementById("message_form").style.display = "block";
            sessionStorage.setItem("Room", roomName);
            if (parent.tagName === "ARTICLE") {
                if (websocket) websocket.close()
                websocket = new WebSocket(serverWSURL + `room/${roomName}/`);
                websocket.onmessage = function (e) {
                    let data = JSON.parse(e.data);
                    if (data['type'] === 'message') displayMessage(document.getElementById("messages_output"), data)
                    if (data['type'] === 'notmember') alert('Join the room to message')
                };
                displayMessages(serverURL, authHeaders, roomName,);
            }
            break;
    }
    e.target.removeEventListener(e.type, arguments.callee);
});

document.getElementById("logout").addEventListener("click", () => {
    logout(serverURL);
});

document.getElementById("show_all").addEventListener("click", () => {
    displayRooms(serverURL, localStorage.getItem("user"), authHeaders,);
    document.getElementById("hide_all").style.display = "block";
    document.getElementById("show_all").style.display = "none";
});

document.getElementById("hide_all").addEventListener("click", () => {
    displayRooms(serverURL, localStorage.getItem("user"), authHeaders, true,);
    document.getElementById("hide_all").style.display = "none";
    document.getElementById("show_all").style.display = "block";
});

document.getElementById("message_btn").addEventListener("click", () => {
    websocket.send(JSON.stringify({
        'author': localStorage.getItem("user"),
        'room': sessionStorage.getItem("Room"),
        'text': document.getElementById("message_input").value,
        'type': 'message'
    }));
});

document.getElementById("new_chat").addEventListener("click", () => {
    let newChatName = prompt("Input new chat name:")
    createRoom(serverURL, localStorage.getItem("user"), authHeaders, newChatName)
})