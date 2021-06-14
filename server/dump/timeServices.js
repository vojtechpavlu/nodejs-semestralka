
/**
 * Tovární funkce, která má za cíl vracet instanci Expirable na základě
 * vstupního počtu sekund. Jinými slovy je vráceno datum expirace v budoucnosti,
 * kdy doba v budoucnu je definována dobou reprezentovanou v sekundách.
 * 
 * @param {int}         secondsToExpiration počet sekund v budoucnosti
 * @param {Function}    whatNext            Funkce, která se má po expiraci provést
 * 
 * @returns     instance Expirable 
 */
export const getExpirableInSeconds = (secondsToExpiration, whatNext) => {
    return new Expirable(getDateInFutureBySeconds(secondsToExpiration), whatNext);
}

export const getDateInFutureBySeconds = (secondsToFuture) => {
    return new Date(new Date().getTime() + (1000 * secondsToFuture));
}

/**
 * Třída reprezentuje instance s expirací. Sestává se z obalení datumu, ze kterého
 * je spočítána expirace.
 */
export class Expirable {

    /**
     * Konstruktor třídy, který sestavuje objekt. Na základě tohoto objektu se připraví
     * i funkce, která bude vykonána.
     * @param {Date}        expiration datum expirace, kdy se má provést daná akce 
     * @param {Function}    whatNext funkce, která se má po uplynutí doby provést
     */
    constructor(expiration, whatNext) {
        this.expiration = expiration;
        this.onExpiration = setTimeout(whatNext, this.getPeriod().getAbsoluteSecs() * 1000);
    }
    
    /**
     * Metoda, která určuje, zda-li je zadané datum po expiraci či nikoliv.
     * 
     * @returns false, pokud je datum expirace před aktuálním okamžikem, jinak true. 
     */
    isExpired() {
        return (new Date() < this.expiration);
    }

    /**
     * Metoda, která vrací dobu do expirace ve formátu 'HH:MM:SS'.
     * doba delší než jeden den je ignorována, za standard je považován
     * 
     * @returns Doba do expirace ve formátu 'HH:MM:SS'. 
     */
    expiresIn() {
        return (this.isExpired() ? '00:00:00' : new Period(new Date(), this.expiration)).getSimpleObject().hhmmss;
    }

    /**
     * Metoda vytvářející instanci třídy Period z uloženého data expirace a 
     * z aktuálního datumu.
     * 
     * @returns instance třídy Period vytvořená z aktuálního datumu a data expirace 
     */
    getPeriod() {
        return new Period(new Date(), this.expiration);
    }

    stop() {
        console.log('stopping...');
        clearTimeout(this.onExpiration);
    }
}

/**
 * Třída reprezentující období mezi datumy
 */
export class Period {
    /**
     * Konstruktor odpovědný za inicializaci polí. Předpokládá se, že
     * date1 je dřívější datum, než date2. Pokud tomu tak není,
     * je toto označeno za 'opačné'
     * 
     * @param {Date} date1 datum, z něhož má být spočítáno období
     * @param {Date} date2 datum, z něhož má být spočítáno období
     */
    constructor(date1, date2) {
        this.date1 = date1;
        this.date2 = date2;
        this.reversed = false;

        if (date1 > date2) {
            this.reversed = true;
        }
    }

    /**
     * Vrací absolutní dobu v sekundách. Nerozlišuje tedy v pořadí dat (vždy nezáporné).
     * 
     * @returns Absolutní hodnota doby v sekundách. 
     */
    getAbsoluteSecs() {
        return Math.abs((this.reversed ? this.date1 - this.date2 : this.date2 - this.date1)) / 1000;
    }

    /**
     * Metoda vrací jednoduchý JS objekt obsahující položky date1, date2 a
     * dobu mezi těmito datumy
     * 
     * @returns 
     */
    getSimpleObject() {

        let diff = this.getAbsoluteSecs();
        let days = Math.floor(diff / 86400);
        diff -= days * 86400;
        let hours = Math.floor(diff / 3600) % 24;
        diff -= hours * 3600;
        let mins = Math.floor(diff / 60) % 60;
        diff -= mins * 60;
        let secs = Math.floor(diff);
        
        const format = (number) => {
            return number > 9 ? `${number}` : `0${number}`;
        }

        return {
            d1: this.date1,
            d2: this.date2,
            reversed: this.reversed,
            absoluteSecs: this.getAbsoluteSecs(),
            hhmmss: `${format(hours)}:${format(mins)}:${format(secs)}`,
            diff: {
                secs: secs,
                mins: mins,
                hours: hours,
                days: days,
            }
        }
    }
}
