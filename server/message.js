export class Message {
    constructor(username, groupname, text) {
        
        checker.check(text);
        subs.forEach((s) => {text = s.substitute(text)});

        this.username = username;
        this.groupname = groupname;
        this.text = text;
        this.date = new Date();
    }

    toString() {
        return `${this.username}: '${this.text}' to '${this.groupname}' at ${this.date}`
    }
}

class Substituer {
    constructor(oldSeq, newSeq) {
        this.oldSeq = oldSeq;
        this.newSeq = newSeq;
    }

    substitute(text) {
        return text.replace(this.oldSeq, this.newSeq);
    }
}

const subs = [
    new Substituer(':D',' &#128516'),
    new Substituer(':P',' &#128539'),
    new Substituer(':)',' &#128578'),
    new Substituer(':O',' &#128561'),
]


class RudeWordFinder {
    constructor(rudeword) {
        this.rudeword = rudeword.toLowerCase();
    }

    check(text) {
        if (text.toLowerCase().includes(this.rudeword)) {
            throw `Zpráva obsahuje zakázané slovo '${this.rudeword}'`;
        }
    }
}

class TextChecker {
    constructor(words) {
        this.checks = [];
        words.forEach((rw) => {
            this.checks.push(new RudeWordFinder(rw));
        });
    }

    check(text) {
        this.checks.forEach((check) => {check.check(text)});
    }

    getRudeWords() {
        let rudeWords = [];
        this.checks.forEach((check) => {rudeWords.push(check.rudeword)});
        return rudeWords;
    }
}

export const checker = new TextChecker(
    [
        'blb',
        'vůl',
        'jelito',
        'hrome',
        'Barbara Streisand'
    ]
);