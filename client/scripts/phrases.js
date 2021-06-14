const phrases = [
    "Hello World!",
    "Lorem ipsum dolor sit amet",
    "strongpassword123",
    "Riemann hypothesis for dummies",
    "O Tannenbaum, o tannenbaum",
    "Type something...",
    "I'm bored...",
    "How to pronounce otorhinolaryngology when drunk",
    "Beer someone? 🍺🍺🍺",
    "'Gott ist tot' said Nietzche. God replied: 'Who's dead now?!'",
    "No tak se starej mladej!",
    "Slavoj Žižek do každé rodiny",
    "Only a ginger can call another ginger 'ginger'",
    "...při vstupu do pekla se Dante zalekne nápisu na bráně: 'Naděje zanech kdo mnou ubírá se!'",
    "STOP! Hammertime! 🎧",
    "Congratulations! You have been a lucky winner of $3.2M! Just send me your credit card number",
    "Marianne hat die Waschmaschine angeschlossen",
    "Příliš žluťoučký kůň úpěl své ďábelské ódy",
    "DROP TABLE SILLY_PHRASES",
    "Compiled successfully",
    "Žijte dlouho a blaze",
    "Ahoj jak se máš něco",
    "prozvoň mě prosim",
    "hesoyam",
    "HOYOHOYO",
    "blah blah blah",
    "https://www.youtube.com/watch?v=lXgkuM2NhYI",
    "Spadl server, něco si přej!",
    "program exited with code 0",
    "Tato zpráva není pravdivá.",
    "Šéfe, asi jsem dropnul nějakou tabulku...",
    "#toomanyhashtags",
    "Simon says: 'Prove P=NP'",
    "3.14159265358979323846264338327950288419716939937510",
    "RGB(34, 40, 49)",
    "Kula pece, tak honem hopnem na šalinu a pofajčíme přes štatl s muklama a kocnama na prégl!",
    "Poď na hanu, oplodníme kóřku a bode betélně.",
    "Já su z Prahe.",
    "Wanna sum Anna Kournikova?",
    "*KNOCK-KNOCK* Penny! *KNOCK-KNOCK* Penny! *KNOCK-KNOCK* Penny!",
    "Zemský okres Freyung-Grafenau je okres v německé spolkové zemi Bavorsko.",
    "Co jmelí... ALE JMELÍ!", 
    "Begbie: 'Někdo tady rozbil tý holce hlavu pullitrem a já to teď vyřeším!'",
    "'Dosáhne mi BT přes zeď až na zahradu?' 'Pokud BT je `bitevní tank`, pak ano.'",
    ":wq!",
    "It’s not a bug – it’s an undocumented feature.",
    "Keep it simple, stupid!",
    "Don't repeat yourself",
    "Mysli si číslo mezi 1 a 10. Zavři oči...               Tma, viď?",
    "Poběž rychle mámo sem, Vlastík má styk s Ámosem!",
    "+420 541 110 777",
    "Hledej, šmudlo",
    "John Lenin: 'Imagine there's no heaven (for Mensheviks)'",
    "Some say that he lives in a tree, and that his sweat can be used to clean precious metals. All we know is he’s called the Stig.",
    "Push the tempo!",
    "Tell me now, how do I feel?",
    "Eliza: 'I'm not sure where is this conversation going... Tell me more.'",
    "Parry: 'I think Mr. Kenneth Colby is going to turn me off! Help me!'"
]

const messagebox = document.getElementById('message-input');

//const delay = (timeout) => new Promise((resolve) => {setTimeout(resolve, timeout)});

const type = (phrase, index) => {
    if (phrase.length > index) {
        messagebox.setAttribute('placeholder', messagebox.getAttribute('placeholder') + phrase[index]);
        index++;
        setTimeout(() => {type(phrase, index)}, 50);
    } else {
        setTimeout(untype, 1200);
    }
}

const untype = () => {
    let message = messagebox.getAttribute('placeholder');
    if (message.length > 0) {
        messagebox.setAttribute('placeholder', message.substring(0, message.length-1));
        setTimeout(untype, 20);
    } else {
        setTimeout(() => {type(phrases[Math.floor(Math.random() * phrases.length-1) + 1], 0)}, 600);
    }
}
messagebox.setAttribute('placeholder', ' ');
type(phrases[3], 0);