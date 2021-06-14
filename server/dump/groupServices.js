import {State, TemporalStateFactory, DurationLifeCyclePhase} from './stateServices.js'


/**
 * Instance třídy Group mají za cíl symbolizovat chatovací skupinu.
 * Jsou tvořeny názvem, množinou zpráv a stavem. Stav může nabývat omezeného
 * počtu hodnot - CREATED, VACANTIOLEGIS, EXPIRED, CLOSED.
 */
export class Group {

    /**
     * Konstruktor, který inicializuje pole
     * 
     * @param {String}  groupname   Název dané skupiny 
     * @param {State}   state       Stav, který je instanci vlastní
     */
    constructor(groupname, state) {
        this.groupname = groupname;
        this.state = state;
        this.users = [];
        this.messages = [];
    }

    /**
     * Přidá instanci zprávy na seznam zpráv proběhlých v rámci komunikace
     * v této skupině. Připisovat zprávy je možné od té doby, odkdy je 
     * skupina ve stavu 'running' a jen do té doby, dokud je skupina ve stavu 
     * 'vacantiolegis', tedy dokud sice není v plném běhu, ale není ani plně uzavřena.
     * 
     * @param {*} message Zpráva, která bude připsána na konec seznamu.
     */
    addMessage(message) {
        if(this.state.statename === 'running' || this.state.statename === 'vacantio-legis') {
            this.messages.push(message);
        } else {
            throw `Nelze přidat zprávu do skupiny ${this.groupname}, protože je ve stavu ${this.state.stateName}`
        }
    }

    /** Odstraní uživatele dle jeho uživatelského jména */
    removeUser(username) {
        if(this.isIn(username)) {
            let index = this.users.indexOf(username);
            this.users = splice(index, 1);
        } else {
            console.log('Uživatel ' + username + ' nebyl nalezen');
        }
    }

    /** Přidá uživatelské jméno. Vyhazuje výjimku, pokud již takového uživatele skupina eviduje. */
    addUser(username) {
        if(this.isIn(username)) {
            throw `Uživatel se jménem '${username}' již ve skupině '${this.groupname}' jednou je.`
        } else {
            this.users.push(username);
        }
    }

    isIn(username) {
        this.users.forEach((u) => {
            if(u === username) return true;
        });
        return false;
    }
}

/**
 * Tovární třída GroupFactory je odovědná za tvorbu instancí třídy Group.
 * Každé vytvořené instanci (metodou generateGroup(String)) je vtišťen
 * název a je jí vygenerován stav.
 * 
 * Aby bylo zabráněno duplikátům, je vyhazována výjimka v případě, že
 * se nalezne existující skupina s takovýmto názvem.
 * 
 * Třída je potomkem třídy TemporalStateFactory.
 */
export class GroupFactory extends TemporalStateFactory {
    constructor() {
        super(getLifecycle(), (state) => {
            groupContainer.removeGroup(state.stateContainer);
            console.log(`Group ${state.stateContainer.groupname} terminated`);
        }, [new GroupStatePrinter()]);
    }

    /**
     * Metoda se pokusí vytvořit instanci třídy Group ze zadaného názvu.
     * Pokud již skupina s takovým názvem existuje, bude vyhozena výjimka.
     * 
     * @param {String} groupname    název skupiny
     *  
     * @returns Zbrusu nová instance třídy Group, přičemž má nastavenu živostnost
     *          (stav) a název. Po doběhnutí životnosti se sama smaže z GroupContaineru.
     */
    generateGroup(groupname) {
        
        if (groupname.length < 1) {
            throw `Nelze vytvořit skupinu s prázdným názvem!`
        } else if (groupContainer.getGroup(groupname)) {
            throw `Skupina s názvem '${groupname}' již existuje!`
        }

        let g = new Group(groupname, undefined);
        let state = new State('', g);
        g.state = state; 
        super.getTemporalState(state)//.state;
        groupContainer.addGroup(g); 
        
        return g;
    }
}

/**
 * Instance třídy GroupContainer je odpovědná za uchovávání referencí na instance třídy
 * Group.
 * 
 * Je správcem seznamu, tudíž může tyto odstraňovat, přidávat a vyhledávat.
 */
export class GroupContainer {

    constructor() {
        this.groups = [];
    }

    /** 
     * Pokusí se přidat instanci skupiny do kontejneru. Je-li již
     * skupina s takovým názvem obsažena, bude vyhozena výjimka.
     * 
     * @param {Group} group skupina, která má být přidána.
     */
    addGroup(group) {
        if (!this.getGroup(group.groupname)) {
            this.groups.push(group);
        } else {
            throw 'Skupina s takovým názvem již je obsažena!';
        }
    }

    /**
     * Pokusí se odstranit zadanou skupinu. Pokud je obsažena, odstraní ji.
     * 
     * @param {Group} group skupina, která má být odstraněna.
     */
    removeGroup(group) {
        let index = this.groups.indexOf(group);
        if(index > -1) {
            this.groups.splice(index, 1);
        }
    }

    /**
     * Metoda vrací skupinu dle zadaného názvu. Malá a velká písmena jsou ignorována.
     * 
     * @param {String} groupname    název skupiny, která by měla být navrácena.
     *  
     * @returns Pokud je skupina opravdu nalezena, je její instance vrácena. V
     *          opačném případě undefined. 
     */
    getGroup(groupname) {
        for (let g of this.groups) {
            if (g.groupname.toLowerCase() === groupname.toLowerCase()) {
                return g;
            }
        }
    }

    /**
     * Metoda se pokusí odstranit všechny skupiny, které jsou v zadaném stavu.
     * 
     * @param {String} statename název stavu, který by skupina měla nést, aby byla
     *                           ze seznamu vyloučena.
     */
    removeAllWithState(statename) {
        let removals = [];
        for (let g of this.groups) {
            if (g.state.stateName === statename) {
                removals.push(g);
            }
        }
        removals.forEach(g => this.removeGroup(g));
    }
}

class GroupStatePrinter {
    notify(state) {
        console.log(`${new Date()} Group ${state.stateContainer.groupname} má nyní stav ${state.stateName}`);
    }
}


/* Definice stavů, které může skupina mít. */
let groupStates = [
    {statename: 'created',          duration: 1},
    {statename: 'running',          duration: 50},
    {statename: 'vacantio-legis',   duration: 20},
    {statename: 'expired',          duration: 10},
    {statename: 'closed',           duration: 3}
];

const getLifecycle = () => {
    let lifecyclePhases = []
    groupStates.forEach((gs) => {lifecyclePhases.push(new DurationLifeCyclePhase(gs.statename, gs.duration))});
    return lifecyclePhases;
}


export const groupContainer = new GroupContainer();
export const groupFactory = new GroupFactory();
