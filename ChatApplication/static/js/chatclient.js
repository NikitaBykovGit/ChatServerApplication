const serverURL = "http://127.0.0.1:8000/api/v1/";
const serverWSURL = "ws://127.0.0.1:8000/ws/";
let Websocket;

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
        displayRooms(
            server,
            user,
            password,
            true,
        );
    } else {
        authorizeUser(server)
    }
}

function authorizeUser(server) {
    document.getElementById("nav").style.display = "none";
    document.getElementById("chats").style.display = "none";
    document.getElementById("messages").style.display = "none";
    document.getElementById("members").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("login_btn").addEventListener("click", () => {
        let loginInput = document.getElementById("login_input").value;
        let PassInput = document.getElementById("pass_input").value;
        localStorage.setItem("user", loginInput);
        localStorage.setItem("password", PassInput);
        fetch(`${server}users/?format=json&username=${loginInput}`, {
            headers: new Headers({
                Authorization: `Basic ${btoa(`${loginInput}:${PassInput}`)}`,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data['detail'] === 'Invalid username/password.') {
                    document.getElementById("login_output").innerHTML = data['detail']
                } else {
                    localStorage.setItem("authorize", 'true');
                    localStorage.setItem("user", loginInput);
                    localStorage.setItem("password", PassInput);
                    document.getElementById("login_output").innerHTML = "";
                    displayRooms(
                        server,
                        localStorage.getItem("user"),
                        localStorage.getItem("password"),
                        true,
                    );
                }
            })
    });
}

function createRoom(server, user, password, roomName) {
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
        .then(() => {
            displayRooms(
                server,
                user,
                password,
                true,
            )
        });
}

function logout(server) {
    localStorage.clear();
    document.getElementById("chats_output").innerHTML = "";
    document.getElementById("messages_output").innerHTML = "";
    document.getElementById("members_output").innerHTML = "";
    authorizeUser(server);
}

function displayRooms(server, user, password, includeUser) {
    document.getElementById("login").style.display = "none";
    document.getElementById("chats").style.display = "block";
    document.getElementById("messages").style.display = "block";
    let url = `${server}rooms/?format=json`;
    let action = "join";
    if (includeUser) {
        url += `&user=${user}`;
        action = "leave";
    } else {
        url += `&notuser=${user}`;
    }
    fetch(url, {
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            document.getElementById("chats_output").innerHTML = "";
            document.getElementById("nav").style.display = "block";
            document.getElementById("account_list").innerHTML = `Hello, ${user}`;
            for (let i = 0; i < data.length; i++) {
                displayRoom(document.getElementById("chats_output"), data[i], action)
            }
        })
        .catch((error) => (document.getElementById("output").innerHTML = `<h3>${error}<h3>`));
}

function displayMessages(server, user, password, roomName) {
    document.getElementById("members").style.display = "none";
    document.getElementById("messages").style.display = "block";
    fetch(`${server}messages/?format=json&room__name=${roomName}`, {
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("messages_output").innerHTML = "";
            for (let i = 0; i < data.length; i++) {
                displayMessage(document.getElementById("messages_output"), data[i])
            }
        })
        .catch((error) => {
            document.getElementById("output").innerHTML = `<h3>${error}<h3>`;
        });
}

function leaveJoinRoom(server, user, password, roomName) {
    fetch(`${server}roomusers/?format=json&room__name=${roomName}&user__username=${user}`, {
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
        }),
    })
        .then((response) => response.json())
        .then((data) => leaveRoom(server, user, password, data[0].id))
        .catch(() => joinRoom(server, user, password, roomName));
}

function leaveRoom(server, user, password, tableID) {
    fetch(`${server}roomusers/${tableID}`, {
        method: "DELETE",
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
        }),
    });
}

function joinRoom(server, user, password, roomName) {
    fetch(`${server}roomusers/`, {
        method: "POST",
        body: JSON.stringify({
            room: roomName,
            user: user,
        }),
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
            "Content-type": "application/json; charset=UTF-8",
        }),
    });
}

function createChatWithUser(server, user, password, targetUsername) {
    roomName = `ChatWith${targetUsername}`
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
            alert(data.name)
            fetch(`${server}roomusers/`, {
                method: "POST",
                body: JSON.stringify({
                    room: data.name,
                    user: targetUsername,
                }),
                headers: new Headers({
                    Authorization: `Basic ${btoa(`${user}:${password}`)}`,
                    "Content-type": "application/json; charset=UTF-8",
                }),
            });
        })
        .then(() => {
            displayRooms(
                server,
                user,
                password,
                true,
            )
        })
}

function displayMembers(server, user, password, roomName) {
    document.getElementById("login").style.display = "none";
    document.getElementById("messages").style.display = "none";
    document.getElementById("members").style.display = "block";
    fetch(`${server}roomusers/?format=json&room__name=${roomName}`, {
        headers: new Headers({
            Authorization: `Basic ${btoa(`${user}:${password}`)}`,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("members_output").innerHTML = "";
            for (let i = 0; i < data.length; i++) {
                displayMember(document.getElementById("members_output"), data[i])
            }
        })
        .then(() => {
            let btns = document.querySelectorAll('.writeButton')
            for (let i = 0; i < btns.length; i++) {
                btns[i].addEventListener("click", (e) => {
                    createChatWithUser(serverURL,
                        localStorage.getItem("user"),
                        localStorage.getItem("password"),
                        e.target.previousElementSibling.innerHTML
                    )
                })
            }
        })
        .catch((error) => {
            document.getElementById("output").innerHTML = `<h3>${error}<h3>`;
        });


}

startApplication(serverURL, localStorage.getItem("user"), localStorage.getItem("password"));

document.getElementById("chats_output").addEventListener("click", (e) => {
    let roomName = e.target.parentElement.querySelector('H3').innerText
    switch (e.target.className) {
        case "rightCentr":
            leaveJoinRoom(
                serverURL,
                localStorage.getItem("user"),
                localStorage.getItem("password"),
                roomName,
            );
            e.target.parentElement.remove();
            break;
        case "textMembers":
            displayMembers(serverURL,
                localStorage.getItem("user"),
                localStorage.getItem("password"),
                roomName)
            break;
        default:
            const parent = e.target.parentElement;
            document.getElementById("message_form").style.display = "block";
            sessionStorage.setItem("Room", roomName);
            if (parent.tagName === "ARTICLE") {
                Websocket = new WebSocket(serverWSURL + `room/${roomName}/`);
                Websocket.onmessage = function (e) {
                    let data = JSON.parse(e.data);
                    if (data['type'] === 'message') displayMessage(document.getElementById("messages_output"), data)
                    if (data['type'] === 'notmember') alert('Join the room to message')
                };
                displayMessages(
                    serverURL,
                    localStorage.getItem("user"),
                    localStorage.getItem("password"),
                    roomName,
                );
            }
            break;
    }

});

document.getElementById("logout").addEventListener("click", () => {
    logout(serverURL);
});

document.getElementById("show_all").addEventListener("click", () => {
    displayRooms(
        serverURL,
        localStorage.getItem("user"),
        localStorage.getItem("password"),
    );
    document.getElementById("hide_all").style.display = "block";
    document.getElementById("show_all").style.display = "none";
});

document.getElementById("hide_all").addEventListener("click", () => {
    displayRooms(
        serverURL,
        localStorage.getItem("user"),
        localStorage.getItem("password"),
        true,
    );
    document.getElementById("hide_all").style.display = "none";
    document.getElementById("show_all").style.display = "block";
});

document.getElementById("message_btn").addEventListener("click", () => {
    Websocket.send(
        JSON.stringify({
            'author': localStorage.getItem("user"),
            'room': sessionStorage.getItem("Room"),
            'text': document.getElementById("message_input").value,
            'type': 'message'
        })
    );
});

document.getElementById("new_chat").addEventListener("click", () => {
    let newChatName = prompt("Input new chat name:")
    createRoom(
        serverURL,
        localStorage.getItem("user"),
        localStorage.getItem("password"),
        newChatName
    )
})