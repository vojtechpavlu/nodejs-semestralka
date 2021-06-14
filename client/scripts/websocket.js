import {closeNav, openNav} from './nav.js'

let port = undefined
let ws = undefined;

const initWebsocket = () => {
    fetch(`https://${window.location.hostname}:${window.location.port}/api/general/wsport/`)
        .then(response => response.json())
        .then(data => {port = data.wsport})
        .then(() => {
            wss = new WebSocket(`wss://${window.location.hostname}:${port}`);

            ws.addEventListener('open', () => {
                console.log('open')
            });

            ws.addEventListener('message', (message) => {
                let data = JSON.parse(message.data);
                let type = data.type
                let groupname = data.groupname

                if (!type) {
                    alert('Není uveden typ')
                }
                else if (type === 'err') {
                    alert(data.message)
                }
                else if (type === 'registration') {
                    username = data.username;
                    console.log(`Bylo ti přiděleno jméno ${username}`)
                    document.getElementById('username-placeholder').innerHTML = username;
                }
                else if (type === 'conn-to') {
                    connectToGroupRequest(data.groupname);
                }
                else if (type === 'disconnect-yourself') {
                    let group = getGroup(groupname)
                    if (group) {
                        document.getElementById(`chat-group-${group.groupname}`).remove();
                        if (groups.length > 1) {
                            selectGroup(groups[0].groupname);
                        } else {
                            document.getElementById('header-groupname').innerHTML = ''
                        }
                        group.leaveGroup();
                    }
                    console.log('Byl jsi odpojen ze skupiny, protože: ' + data.reason)
                }
                else if (type === 'connected-to-group') {
                    let group = getGroup(groupname)
                    if (!group) {
                        if (data.username === username) {
                            addGroup(groupname)
                            console.log('Právě jsi byl připojen do skupiny!')
                        } else {
                            console.log('Právě se do skupiny připojil ' + data.username)
                        }
                    }
                    groupInfoRequest(groupname)
                    allMessagesRequest(groupname)
                }
                else if (type === 'mess-cont') {
                    let group = getGroup(groupname)
                    if (group) {
                        let messages = data.messages;
                        group.messages = [];
                        for(let m of messages) {
                            group.messages.push(m);
                        }
                    }
                    rewrite();
                }
                else if (type === 'download-mess') {
                    allMessagesRequest(groupname)
                }
                else if (type === 'g-info') {
                    let usernames = data.users;
                    let numOfMessages = data.numOfMessages;
                    let groupExpiration = data.groupexp;
                    
                    const formatDate = (date) => {
                        date = new Date(date);
                        if (date > (new Date(new Date().getTime() + 86_400_000))) {
                            return 'Neexpirující'
                        }
                        let hours = date.getHours();
                        let minutes = date.getMinutes();
                        let seconds = date.getSeconds();
                        return `Expiruje v: ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds<10 ? '0' + seconds : seconds}`;
                    }

                    let groupElement = document.getElementById(`chat-group-${groupname}`);
                    groupElement.setAttribute('data-bs-toggle', 'tooltip');
                    groupElement.setAttribute('data-bs-placement', 'right');
                    groupElement.setAttribute('title', `${formatDate(groupExpiration)}`);
                }
                else if (type === 'disconnected-from-group') {
                    let user = data.username;
                    if (username === user) {
                        removeGroup(groupname)
                    }
                } else {
                    alert('Typ zprávy nerozpoznán: ' + type);
                }
            });

            ws.addEventListener('close', () => {
                console.log('Closing connection');
                alert('Došlo k přerušení spojení... Počkej pár sekund a klepni F5!')
            });

        });
}

const setWS = (websocket) => {
    ws = websocket;
}


class Group {
    constructor(groupname) {
        this.groupname = groupname;
        this.messages = []
    }

    leaveGroup() {
        leaveGroupRequest(this.groupname);
    }

    toString() {
        return this.groupname
    }
}

const leaveGroupRequest = (groupname) => {
    
    let g = getGroup(groupname);

    if(getGroup(groupname)) {
        sendMessage(JSON.stringify({
            type: 'disconnect-me',
            username: username,
            groupname: groupname
        }));
    }
}

const createGroupRequest = () => {
    sendMessage(JSON.stringify({
        type: 'create-group',
        username: username
    }));
}

const sendMessageRequest = (content, groupname) => {
    sendMessage(JSON.stringify({
        type: 'text-message',
        username: username,
        groupname: groupname,
        text: content
    }));
}

const connectToGroupRequest = (groupname) => {
    sendMessage(JSON.stringify({
        type: 'connect-me',
        username: username,
        groupname: groupname
    }));
}

const allMessagesRequest = (groupname) => {
    sendMessage(JSON.stringify({
        type: 'all-messages',
        username: username,
        groupname: groupname
    }));
}

const groupInfoRequest = (groupname) => {
    sendMessage(JSON.stringify({
        type: 'g-info-req',
        username: username,
        groupname: groupname
    }));
}


const sendMessage = (message) => {
    ws.send(message);
}

const removeGroup = (groupname) => {
    let index = groups.indexOf(getGroup(groupname));
    if(index > -1) {
        groups.splice(index, 1);
    }
}

const addGroup = (groupname) => {
    if (!getGroup(groupname)) {
        groups.push(new Group(groupname));
        selectGroup(groupname);
        let element = document.createElement('a');
        element.id = `chat-group-${groupname}`;
        element.setAttribute('href', 'javascript:void(0)');
        element.setAttribute('class', 'list-group-item list-group-item-action');
        element.innerHTML = groupname;
        element.addEventListener('click', () => {
            selectGroup(element.id.split('-')[2]);
            closeNav();
        });
        document.getElementById('group-content').appendChild(element);
    }
}

const getGroup = (groupname) => {
    return groups.find((g) => {
        return groupname === g.groupname;
    });
}

const selectGroup = (groupname) => {
    if(getGroup(groupname)) {
        currentGroup = groupname;
        document.getElementById('header-groupname').innerHTML = groupname;
        rewrite();
    }
}

initWebsocket();

let username = undefined;
let groups = [];

let currentGroup = undefined;

const textfield = document.getElementById('message-input');
const sendBtn = document.getElementById('message-input-send');

sendBtn.addEventListener('click', (e) => {
    let text = textfield.value;
    if(text.length > 0) {
        sendMessageRequest(text, currentGroup);
        textfield.value = "";
    }
});

let groupConnectionTf = document.getElementById('group-connection-code');
let groupConnectionBtn = document.getElementById('group-connection-button');
let groupCreationBtn = document.getElementById('group-creation-button');

groupCreationBtn.addEventListener('click', () => {
    createGroupRequest();
});

groupConnectionBtn.addEventListener('click', () => {
    let groupname = groupConnectionTf.value;
    if (groupname.length > 0) {
        if (groupname[0] !== '#') {
            groupname = '#' + groupname;
        }
        connectToGroupRequest(groupname);
        groupConnectionTf.value = "";
    }
});

const rewrite = () => {
    let group = getGroup(currentGroup);
    if (group) {
        let field = document.getElementById('chat-window-messages')
        field.innerHTML = '';
        group.messages.forEach((m) => {field.appendChild(createMessageElement(m))});
        field.scrollTop = field.scrollHeight;
    }
}


const createMessageElement = (message) => {
    let author = message.username;
    let time = message.date;
    let text = message.text;

    const dateFormat = (date) => {
        date = new Date(date);
        let h = date.getHours();
        let m = date.getMinutes();
        let s = date.getSeconds();
        return `${h<10?'0'+h:h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}`
    }

    let messLine = document.createElement('div');
    messLine.setAttribute('class', `${author===username?'mine-message-cont':'others-message-cont'}`);
    let messBubble = document.createElement('div');
    messBubble.setAttribute('class', `message-bubble ${author===username?'bg-success':'others-message-bubble'}`);
    let messText = document.createElement('p');
    messText.setAttribute('class', 'fs-4')
    let messInfo = document.createElement('p');
    messText.innerHTML = text;
    messInfo.innerHTML = `${dateFormat(time)} <b>${author===username?'já':author}</b>`
    messLine.appendChild(messBubble);
    messBubble.appendChild(messText);
    messBubble.appendChild(messInfo);

    return messLine;
}