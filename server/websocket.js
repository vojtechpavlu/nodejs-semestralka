import WebSocket from 'ws';
import { getGroup, registerNewGroup } from './groups.js';
import { Message } from './message.js';
import { getAllUsers, getUser, registerNewUser } from './users.js';

const users = [];
let PORT = 443;

export const getWSPort = () => {
    return PORT;
}

export const initWS = (server) => {
    return new Promise((resolve, reject) => {
        try {
            let wss = new WebSocket.Server({server});
            console.log(`WSS is listening at port ${443}`);
            initEvents(wss)
            PORT = server;
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

const initEvents = (wss) => {

    let general = registerNewGroup('general');
    clearInterval(general.endCallback)
    general.expiration = new Date(new Date().getTime() + 31_536_000_000) //jeden rok

    wss.on('connection', (ws) => {

        ws.on('message', (message) => {
            let content = undefined;
            try {
                content = JSON.parse(message);
                resolve(content);
            } catch (err) {
                console.log(err)
                ws.send(JSON.stringify({type: 'err', message: err}));
            }
        });

        ws.on('close', () => {
            let user = getAllUsers().find((u) => {
                return u.ws === ws;
            });
            user.groups.forEach((g) => {
                g.removeUser(user);
            });
            console.log(`Uživatel ${user.username} se odpojil.`)
        });


        let username = registerNewUser(ws).username;
        console.log(`Připojil se nový uživatel. Bylo mu přiřazeno jméno ${username}`)

        ws.send(JSON.stringify({
            type: 'registration',
            username: username
        }));

        setTimeout(() => {
            connectToGroupForce(general.groupname, username);
        }, 1500);
    });
}

export const sendMessage = (username, message) => {
    getUser(username)?.sendMessage(message);
}

const resolve = (content) => {
    let type = content.type;
    let user = getUser(content.username);
    if (!type) {
        throw 'Není uveden typ!'
    } else if(!user) {
        throw `Nenalezen uživatel s názvem ${content.username}`
    }

    let groupname = content.groupname;
    let group = getGroup(groupname);

    if (type === 'connect-me') {
        if(!group) throw `Skupina s názvem ${groupname} nenalezena`
        user.addGroup(group)
        return;    
    }

    if (type === 'create-group') {
        let newGroup = registerNewGroup();
        connectToGroupForce(newGroup.groupname, user.username);
        //user.addGroup(newGroup);
        return;
    }

    if (type === 'disconnect-me') {
        if(!group) throw `Skupina s názvem ${groupname} nenalezena`
        user.removeGroup(group);
        return;
    }

    if (type === 'text-message') {
        if(!group) throw `Skupina s názvem ${groupname} nenalezena`
        console.log(`${user.username} píše do skupiny ${group.groupname}`)
        let m = new Message (
            user.username,
            group.groupname,
            content.text
        )
        group.addMessage(m);
        return;
    }

    if (type === 'all-messages') {
        if(!group) throw `Skupina s názvem ${groupname} nenalezena`
        let messages = []
        group.messages.forEach((m) => {messages.push(m)});
        user.sendMessage(JSON.stringify({
            type: 'mess-cont',
            groupname: groupname,
            messages: messages
        }));
        return;
    }

    if (type === 'g-info-req') {
        if(!group) throw `Skupina s názvem ${groupname} nenalezena`
        let usernames = []
        group.users.forEach((u) => {usernames.push(u.username)});
        user.sendMessage(JSON.stringify({
            type: 'g-info',
            groupname: group.groupname,
            groupexp: group.expiration,
            users: usernames,
            numOfMessages: group.messages.length
        }));
        return;
    }

    throw `Typ zprávy nerozpoznán: ${type}`
}


export const connectToGroupForce = (groupname, username) => {
    let user = getUser(username);
    let group = getGroup(groupname);

    if(user && group) {
        user.sendMessage(JSON.stringify({
            type: 'conn-to',
            username: username,
            groupname: groupname
        }));
    } else if (!user) {
        throw `Neidentifikovatelný uživatel ${username}`
    } else {
        throw `Neidentifikovatelná skupina ${groupname}`
    }
}

export const downloadMessages = (groupname, username) => {
    let group = getGroup(groupname);
    let user = getUser(username);

    if (user && group) {
        user.sendMessage(JSON.stringify({
            type: 'download-mess',
            username: username,
            groupname: groupname
        }));
    } else if (!user) {
        throw `Neidentifikovatelný uživatel ${username}`
    } else {
        throw `Neidentifikovatelná skupina ${groupname}`
    }
}

export const disconnectYourself = (groupname, username, reason) => {
    let group = getGroup(groupname);
    let user = getUser(username);
    
    if (user && group) {
        user.sendMessage(JSON.stringify({
            type: 'disconnect-yourself',
            username: username,
            groupname: groupname,
            reason: reason
        }));
    } else if (!user) {
        throw `Neidentifikovatelný uživatel ${username}`
    } else {
        throw `Neidentifikovatelná skupina ${groupname}`
    }
}

