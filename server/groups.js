import {disconnectYourself} from './websocket.js'


const TTL = 900_000;
const charset = 'ABCGHJKLPRSTUVWXY2345689';
const groupnameLength = 6;

const groups = [];

class Group {
    constructor(groupname) {
        this.groupname = groupname;
        this.messages = [];
        this.users = [];
        this.expiration = new Date(new Date().getTime() + TTL);
        this.endCallback = setTimeout(() => {
            console.log(`Skupina ${this.groupname} právě vypršela.`)
            new Promise((resolve, reject) => {
                this.users.forEach((u) => {
                    disconnectYourself(this.groupname, u.username, 'Skupina vypršela.');
                });
                resolve();
            }).then(() => {
                this.users.forEach((u) => {
                    disconnectYourself(this.groupname, u.username, 'Řikám, že skupina vypršela!');
                });
                this.users = [];
            });
        }, TTL + 5_000);
        console.log(`Vytvořena skupina '${this.groupname}'`);
    }

    isExpired() {
        return this.expiration < new Date(); 
    }

    addMessage(message) {
        if(!this.isExpired()) {
            this.messages.push(message);
            this.users.forEach((u) => {
                u.sendMessage(JSON.stringify({
                    type: 'download-mess',
                    groupname: this.groupname
                }));
            });
        }
    }

    addUser(user) {
        if(!this.isExpired()) {
            this.users.push(user);
            this.users.forEach((u) => {
                u.sendMessage(
                    JSON.stringify({
                        type: 'connected-to-group',
                        groupname: this.groupname,
                        username: user.username,
                        date: new Date(),
                        expiprates: this.expiration
                    })
                )
            });
        }
    }

    removeUser(user) {
        
        this.users.forEach((u) => {
            u.sendMessage(JSON.stringify({
                type: 'disconnected-from-group',
                groupname: this.groupname,
                username: user.username
            }))
        });

        let index = this.users.indexOf(user);
        
        if(index > -1) {
            this.users.splice(index, 1);
        }
        console.log(`Uživatel ${user.username} se odpojil ze skupiny ${this.groupname}`)
    }

    kickUser(user) {
        
        user.sendMessage(JSON.stringify({
            type: 'kick',
            groupname: this.groupname
        }));
        
        this.removeUser(user);
    }
}

export const registerNewGroup = (name) => {
    
    let group = undefined;
    
    if(!name) {
        let groupname = generateGroupName();
        if (getGroup(groupname)) {
            group = registerNewGroup();
            return group;
        } else {
            group = new Group(groupname);
        }

    } else {
        group = new Group(name);
        if(getGroup(name)) {
            throw `Skupina s názvem ${name} již existuje!`
        }
    }
    groups.push(group);
    return group;
}


export const getGroup = (groupname) => {
    return groups.find((g) => {return groupname === g.groupname});
} 


const generateGroupName = () => {
    let result = '#';
    for(let i = 0; i < groupnameLength; i++) {
        result += charset[Math.floor(Math.random() * (charset.length))]
    }
    return result;
}

export const removeGroup = (groupname) => {
    let group = getGroup(groupname);
    let index = groups.indexOf(group);
    if (index > -1) {
        groups.splice(index, 1);
    }
}