
/** Instance této třídy generují náhodná čísla v zadaném rozmezí. */
export class RandomNumberGenerator {

    /**
     * Definuje hranice od jakého nejmenšího čísla bude generována hodnota
     * až do jakého
     * 
     * @param {int} from    minimum možné 
     * @param {int} to      maximum možné
     */
    constructor(from, to) {
        if(from > to) {
            throw `Minimální hodnota musí být větší, než maximální: ${from} > ${to}`;
        }

        this.from = from;
        this.to = to;
    }

    get() {
        return Math.floor((Math.random() * (this.to - this.from)) + this.from);
    }
}

/** 
 * Instance této třídy generují náhodné textové řetězce 
 * ze zadané znakové sady a o zadané délce. 
 */
export class RandomStringGenerator {

    /**
     * Uloží seznam povolených znaků a počet znaků ve výsledném řetězci
     * 
     * @param {String}  charset     Znaková sada reprezentovaná Stringem 
     * @param {int}     numOfChars  Počet znaků ve výsledném řetězci
     */
    constructor(charset, numOfChars) {
        this.charset = charset;
        this.numOfChars = numOfChars;
        this.generator = new RandomNumberGenerator(0, charset.length);
    }

    get() {
        let result = ''
        for (let i = 0; i < this.numOfChars; i++) {
            result += this.charset[this.generator.get()];
        }
        return result;
    }
}