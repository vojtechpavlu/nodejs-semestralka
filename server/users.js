import fs from 'fs'
import path from 'path';
import {fileURLToPath} from 'url';
import { isRegExp } from 'util';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const users = [];

class User {
    constructor(username, ws) {
        this.username = username;
        this.ws = ws;
        this.groups = [];
    }

    toString() {
        return username + " " + ws;
    }

    sendMessage(message) {
        return new Promise((resolve, reject) => {
            try {
                this.ws.send(message);
                resolve();
            } catch (err) {
                console.log('PROBLEM MESSAGE: ' + message);
                reject(err);
            }
        });
    }

    addGroup(group) {
        if(group) {
            if(!this.groups.includes(group)) {
                this.groups.push(group);
                group.addUser(this);
            }
        } else {
            throw `Skupina je undefined!`
        }
    }

    removeGroup(group) {
        if (this.groups.includes(group)) {
            this.groups.splice(this.groups.indexOf(group), 1);
            group.removeUser(this);
        }
        
    }
}

export const getUser = (username) => {
    return users.find((u) => {return u.username === username});
}

export const getAllUsers = () => {
    return users;
}

export const registerNewUser = (ws) => {
    
    let user = undefined;

    while(!user) {
        let username = generateUsername();
        if(!getUser(username)) {
            user = new User(username, ws);
        }
    }
    users.push(user);
    return user;
}

export const generateUsername = () => {
    return (
        randomItemPicker(adjectives).toLowerCase() + "-" + 
        randomItemPicker(subjects).toLowerCase() + Math.floor(Math.random() * 99)
    )
}

const read = () => {
    return new Promise((resolve, reject) => {
        let content = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'usernames.json')));
        adjectives = content.adjectives;
        subjects = content.subjects;
        console.log(`Připraveno ${adjectives.length * subjects.length * 99} kombinací uživatelských jmen`);
        resolve();
    });
}

const randomItemPicker = (array) => {
    const len = array.length;
    return array[Math.floor(Math.random() * (len-1))];
}

export const initializeUsernames = () => {
    return read();
}

let adjectives = []
let subjects = []
