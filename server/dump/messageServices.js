import {groupContainer} from './groupServices.js'

/**
 * Nejobecnejší reprezentace zprávy obsahující nejzákladnější atributy.
 */
export class Message {
    constructor(author, date, group) {
        this.author = author;
        this.date = date;
        this.group = group;
    }

    /**
     * Metoda se pokusí přidat zprávu zadané skupině. Pokud se to nepovede
     * (neexistující skupina či skupina s nevhodným stavem), vrací chybovou hlášku.
     * 
     * @returns Pokud dojde k chybě, vrací chybovou hlášku, jinak se zpráva do skupiny přidá.
     */
    appendMessage() {
        console.log(`${this.author} ${this.group}`)
        try {
            let foundGroup = this.getGroup()
            if (!foundGroup) {
                throw `Skupina ${this.group} není evidována a není možné do ní přidat zprávu`;
            }
            foundGroup.push(this);
        } catch (err) {
            return err;
        }
    }

    getGroup() {
        return groupContainer.getGroup(this.group);
    }
}

/**
 * Instance třídy ReportMessage jsou reprezentace různých hlášení o skupině, 
 * které by měl uživatel vidět. Příkladně informace o připojení či odpojení
 * uživatele do-, resp. ze skupiny.
 */
export class ContentMessage extends Message {
    constructor(author, date, content, group) {
        super(author, date, group);
        this.content = content;
    }
}

/**
 * Jednoduchá třída ConnectedMessage mající za cíl formalizovat způsob
 * generování obsahu zpráv o připojení uživatele.
 */
export class ConnectedMessage extends ContentMessage {
    constructor(author, date, group) {
        super(author, date, `User ${author} joined the group ${group}`, group);
    }
}

/**
 * Jednoduchá třída DisconnectedMessage mající za cíl formalizovat způsob
 * generování obsahu zpráv o odpojení uživatele.
 */
export class DisconnectedMessage extends ContentMessage {
    constructor(author, date, group) {
        super(author, date, `User ${author} left the group ${group}`, group);
    }
}


/**
 * Instance třídy TextMessage mají za cíl formalizovat podobu textových zpráv.
 */
export class TextMessage extends ContentMessage {
    constructor(author, date, content, group) {
        super(author, date, content, group);
    }

    appendMessage() {
        try {
            if(!this.getGroup()) {
                throw `Skupina ${this.group} nebyla nalezena`
            }
            if(!this.getGroup().users.includes(this.author)) {
                throw `Skupina ${this.group} neobsahuje uživatele ${this.author}`
            }
            testText(this.content)
            super.appendMessage();
        } catch (err) {
            return err;
        }
    }
}


class MessageFilter {

    filter(text) {
        if (text.length < 1) {
            throw `Textová zpráva musí mít alespoň jeden znak!`
        }
    }
}

class RudeWordFilter extends MessageFilter{

    constructor(rudeword) {
        super();
        this.rudeword = rudeword;
    }

    filter(text) {
        if (text.toLowerCase().includes(this.rudeword.toLowerCase())) {
            throw `Text této zprávy obsahuje nevhodný řetězec '${this.rudeword}'!`
        }
    }
}

class MessageFiltersContainer extends MessageFilter {
    
    constructor(filters) {
        super();
        this.filters = [new MessageFilter()];
        filters.forEach(f => {
            this.filters.push(f);
        });
    }

    filter(text) {
        for (let f of this.filters) {
            f.filter(text);
        }
    }
}

const filters = [
    new RudeWordFilter('blb'),
    new RudeWordFilter('vůl'),
    new RudeWordFilter('vul'),
    new RudeWordFilter('krava'),
    new RudeWordFilter('kráva'),
    new RudeWordFilter('bottom'),
    new RudeWordFilter('bolocks'),
    new RudeWordFilter('Barbara Streisand')
];

const messageFilterContainer = new MessageFiltersContainer(filters);

export const testText = (text) => {
    messageFilterContainer.filter(text);
}