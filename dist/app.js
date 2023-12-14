"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const pg_1 = require("pg");
const app = (0, express_1.default)();
const port = 3000;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/styles', express_1.default.static(path.join(__dirname, 'styles')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const dbConfig = {
    user: 'user',
    password: 'password',
    database: 'database',
    host: 'postgresdb',
    port: 5432,
};
app.get('/', (req, res) => {
    res.render('home', { pageTitle: 'home' });
});
app.get('/contact', (req, res) => {
    res.render('contact', { pageTitle: 'contact', errors: [] });
});
app.post('/submit-register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userFirstName = req.body.user_firstname;
    const userSurname = req.body.user_surname;
    const userEmail = req.body.user_email;
    const userConfirmation = req.body.user_confirmation;
    const userMessage = req.body.user_message;
    const client = new pg_1.Client(dbConfig);
    console.log(req.body);
    console.log('Données du formulaire :', userEmail, userConfirmation, userSurname, userFirstName, userMessage);
    // Array to store error messages
    const errorMessages = [];
    try {
        yield client.connect();
        // Ajout des regex de validations 
        const nameRegex = /^[A-Za-zàäâéèêëïî-]+$/;
        const emailRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9-]{2,}.[a-zA-Z]{2,3}$/;
        if (!nameRegex.test(userSurname) || !nameRegex.test(userFirstName)) {
            errorMessages.push('Le prénom et le nom de famille ne doivent contenir que des lettres.');
        }
        if (!emailRegex.test(userEmail)) {
            errorMessages.push('L\'adresse e-mail n\'est pas valide.');
        }
        if (userEmail !== userConfirmation) {
            errorMessages.push('Mail non confirmé');
        }
        if (errorMessages.length > 0) {
            console.log('errors:', errorMessages);
            res.status(401).render('contact', { pageTitle: 'contact', errors: errorMessages });
        }
        else {
            const insertQuery = `INSERT INTO formuser 
        (user_surname, user_firstName, user_email, user_confirmation, user_message) 
        VALUES ($1::text, $2::text, $3::text, $4::text, $5::text)`;
            const values = [userSurname, userFirstName, userEmail, userConfirmation, userMessage];
            const result = yield client.query(insertQuery, values);
            if (result.rowCount !== null && result.rowCount > 0) {
                res.status(200).send('Formulaire envoyé avec succès');
            }
            else {
                res.status(500).send("Erreur lors de l'envoi du formulaire");
            }
        }
    }
    catch (error) {
        console.error("Une erreur s'est produite lors de la connexion :", error);
        res.status(500).send("Une erreur s'est produite lors de la connexion");
    }
    finally {
        yield client.end();
    }
}));
app.listen(port, () => {
    console.log(`Le serveur fonctionne à http://localhost:${port}`);
});
