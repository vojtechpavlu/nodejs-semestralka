/**
 * Třída State reprezentuje promenlivý stav. Jeho průběh se odvíjí od zvoleného 
 * životního cyklu a jeho fází, viz DurationLifeCyclePhase a ActionLifeCyclePhase.
 */
export class State {

    /**
     * Konstruktor instance reprezentující dočasný stavu.
     * 
     * @param {String}  stateName       název stavu, kterým bude identifikován
     * @param {*}       stateContainer  Instance, které této stav náleží
     */
    constructor(stateName, stateContainer) {
        this.stateName = stateName;
        this.stateContainer = stateContainer;
        this.lifecyclephases = undefined;
    }

    toString() {
        return this.stateName;
    }

    next() {
        return new Promise((resolve, reject) => {
            let found = false;
            let i = 0;
            while(i < this.lifecyclephases.length-1) {
                if(this.lifecyclephases[i].phasename === this.stateName) {
                    found = true;
                    this.lifecyclephases[i].next();
                    resolve(this);
                    break;
                }
                i++;
            }
            if(!found) {
                this.lifecyclephases[this.lifecyclephases.length-1].next()//params[2]();
            }
        });
    }
}

/**
 * Obecná tovární třída stavu, resp. životního cyklu stavu.
 * V této implementaci je cílem pouze uchování společných atributů,
 * tedy býti společným předkem.
 * 
 * Třída (resp. její potomci) jsou sestavováni podle návrhového
 * vzoru FactoryClass.
 */
export class StateFactory {
    constructor(lifecyclephases, lastAction, listeners) {
        this.lifecyclephases = lifecyclephases;
        this.lastAction = lastAction;
        this.listeners = listeners;
    }
}


/**
 * Instance třídy TemporalStateFactory jsou potomky instancí třídy
 * StateFactory. Vyznačují se tím, že žitovní cyklus stavu se odvíjí
 * od času. Fáze v něm jsou časově omezené a samostatně přechází do
 * dalších fází.
 */
export class TemporalStateFactory extends StateFactory {
    constructor(lifecyclephases, lastAction, listeners) {
        super(lifecyclephases, lastAction, listeners)
    }

    /**
     * Tovární metoda sloužící k vyprodukování stavu daného typu.
     * 
     * @param {State} state stav, který má být postupně měněn
     * 
     * @returns reference na upravený stav
     */
    getTemporalState(state) {
        state.lifecyclephases = this.lifecyclephases;
        this.lifecyclephases[0].create(this.lifecyclephases, state, this.lastAction, this.listeners);
        return {
            state: state,
        };
    }
}

/**
 * Třída ActionStateFactory tvoří životní cykly stavů tak, aby se automaticky měnily po
 * zavolání nad nimi adekvátní funkce.
 */
export class ActionStateFactory extends StateFactory {
    constructor(lifecyclephases, lastAction, listeners) {
        super(lifecyclephases, lastAction, listeners)
    }

    /**
     * Samotná tovární metoda upravující autonomně modifikovatelný stav dané instance.
     * 
     * @param {State} state stav, který by se měl menit
     *  
     * @returns upravený stav nastavený tak, aby se postupně (na zavolání příslušné 
     * funkce) měnil (viz dokumentační komentář funkce buildActionLifecycle) 
     */
    getActionState(state) {
        state.lifecyclephases = this.lifecyclephases;
        this.lifecyclephases[0].create(this.lifecyclephases, state, this.lastAction, this.listeners);
        return {
            state: state,
        }
    }
}

/** 
 * Jednoduchá třída popisující instance fáze životního cyklu stavu
 */
class LifeCyclePhase {

    /**
     * Jednoduchý konstruktor pro uložení názvu dané fáze
     * @param {String} phasename název fáze 
     */
    constructor(phasename) {
        this.phasename = phasename;
    }
    toString() {
        return this.phasename;
    }

    create() {
        throw 'Metoda není překrytá'
    }

    next() {
        throw 'Metoda není překrytá'
    }
}

/**
 * Rozšíření třídy LideCyclePhase, které je odpovědné za zpracovávání
 * fází, jejichž životní cyklus se odvíjí od plynutí času
 */
export class DurationLifeCyclePhase extends LifeCyclePhase {

    /**
     * Konstruktor odpovědný za vytvoření instance. Sestává se z volání
     * předka (LifeCyclePhase.constructor(String)) a z přepočítání vstupní
     * doby trvání fáze z milisekund na sekundy.
     * 
     * @param {String} phasename        Název fáze 
     * @param {int}    phaseduration    Počet sekund, jak dlouho má fáze trvat
     */
    constructor(phasename, phaseduration) {
        super(phasename);
        this.phaseduration = phaseduration * 1000;
        this.timeout = undefined;
        this.nextFunction = (phases, state, lastAction, listeners) => {
            let index = phases.indexOf(this);
            if(index < 0) throw `Mezi plánovanými fázemi tato není: ${this.phasename}`
            
            let nextPhase = phases[index+1]
            state.stateName = nextPhase.phasename;
            listeners.forEach(l => l.notify(state));
            nextPhase.create(phases, state, lastAction, listeners);
            
        }
        this.params = undefined;
    }

    create(phases, state, lastAction, listeners) {
        this.params = [phases, state, lastAction, listeners];
        let phaseIndex = phases.indexOf(this);
        this.timeout = setTimeout(
            (phases, state, lastAction, listeners, phaseIndex) => {
                if(phaseIndex < phases.length-1) this.nextFunction(phases, state, lastAction, listeners)
                else lastAction(state)
            }, this.phaseduration, phases, state, lastAction, listeners, phaseIndex);
    }

    /**
     * Metoda zajišťující vynucený skok kupředu. Vyčistí časovač a spustí funkci, 
     * která by se provedla při doběhnutí časovače.
     */
    next() {
        return new Promise((resolve, reject) => {
            clearTimeout(this.timeout);
            this.nextFunction(...this.params);
            resolve();
        });
    }
}

/**
 * Rozšíření třídy LifeCyclePhase, které slouží především jako uchovatel
 * informace o typu fáze. V rámci životního cyklu stavu sestávajícího se z
 * těchto fází je přechod do dalšího stavu iniciován provedením nějaké akce,
 * oproti instancím třídy DurationLifeCyclePhase.
 */
export class ActionLifeCyclePhase extends LifeCyclePhase {

    /** Jednoduchý konstruktor postupující parametry konstruktoru předka*/
    constructor(phasename) {
        super(phasename);
        this.params = undefined;
        this.nextPhase = undefined;
        this.params = undefined;
        this.nextAction = undefined;
    }

    create(phases, state, lastAction, listeners) {

        this.params = [phases, state, lastAction, listeners];
        let index = phases.indexOf(this)
        if(index < 0) {
            throw `Fáze životního cyklu není v seznamu fází: ${this.phasename}`
        }
        
        state.stateName = this.phasename;

        if(index < phases.length-1) {
            this.nextAction = (phases, state, lastAction, listeners, nextPhase) => {
                nextPhase.create(phases, state, lastAction, listeners)
            }
        } else {
            this.nextAction = (phases, state, lastAction, listeners, nextPhase) => {
                lastAction(state);
            }
        }
        listeners.forEach(l => l.notify(state));
    }

    next() {
        return new Promise((resolve, reject) => {
            let index = this.params[0].indexOf(this);
            if (index < 0) {
                throw 'Není mezi fázemi'
            }
            this.nextAction(...this.params, this.params[0][index+1])
            resolve();
        });
    }
}

/**
 * Metoda se zaměřuje na naplánování a sestavení celého životního cyklu zadaného stavu. Celý proces se 
 * pak zaměřuje na vytovření sekvence callbacků tak, aby na sebe navazovaly v různých časových intervalech 
 * definovaných předpisem v instancích třídy DurationLifeCyclePhase, které jsou potomky třídy LideCyclePhase. 
 * 
 * @param {Array<DurationLifeCyclePhase>}   phases      skupina fází, kterými daný stav prochází 
 * @param {int}                             index       pořadí dané fáze - funkce se volá rekurzivně
 * @param {State}                           state       Stav, který má být v čase proměnlivý 
 * @param {Function}                        lastAction  Funkce, která má být na konci (po poslední fázi
 *                                                      životního cyklu stavu) provedena 
 * @param {Array<T>}                        listeners   Množina posluchačů. Jediným požadavkem na ně je, 
 *                                                      aby každý měl definovánu funkci notify(State). 
 */
const buildLifecycle = (phases, index, state, lastAction, listeners) => {
    
    /** Upozorní všechny observery */
    for(let f of listeners) {
        f.notify(state)
    }

    /** rekurzivní callback pro všechny stavy životního cyklu */
    setTimeout(() => {
        if(index < phases.length - 1) {
            state.stateName = phases[index+1].phasename;
            state.expirationDate = new Date(new Date() + (1000 * phases[index].phaseduration));
            buildLifecycle(phases, index+1, state, lastAction, listeners);
        } else {
            state.stateName = phases[index].phasename;
            state.expirationDate = new Date(new Date() + (1000 * phases[index].phaseduration));
            lastAction(state)
        }
    }, phases[index].phaseduration);
}


/**
 * Funkce odpovědná za sestavení takové vzájemně provázané sekvence stavů, které odpovídají pořadím
 * sestavě definované polem instancí ActionLifeCyclePhase. Každá další instance je volána pomocí metody
 * next() nad zadaným stavem. 
 * 
 * @param {Array}       phases      seznam instancí třídy ActionLifeCyclePhase, které mají za cíl reprezentovat
 *                                  jednotlivé fáze životního cyklu 
 * @param {int}         index       funkce se volá rekurzivně, index reprezentuje pořadí fáze v řetězci, defaultně 0 
 * @param {State}       state       Reprezentace stavu, který má být proměnlivý 
 * @param {Function}    lastAction  Funkce, která má být na konci provedena
 * @param {Array}       listeners   Seznam posluchačů (observerů) změn daného stavu. Při každé změně jsou informováni
 *                                  pomocí metody notify(State). 
 */
const buildActionLifecyle = (phases, index, state, lastAction, listeners) => {
    
    /** Notifikace observerů */
    listeners.forEach((listener) => listener.notify(state));

    /** Pro všechny vyjma posledního se přiřadí funkce next() */
    if(index < phases.length-1) {
        state.next = () => {
            let s = new State(phases[index+1].phasename, new Date(), state.stateContainer);
            state.stateContainer.state = s;
            buildActionLifecyle(phases, index+1, s, lastAction, listeners);
        }
    
    /** Poslednímu se přiřazuje funkce odpovídající té poslední, definováno v lastAction */
    } else {
        state.next = (state) => {lastAction(state)};
    }
}
