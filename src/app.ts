import express, { Request, Response } from 'express';
import * as path from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

const test = dotenv.config({ path: __dirname + '/.env' })
const app = express();
const port = 3000;
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: 'postgresdb',
  port: 5432,
};

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.render('home', { pageTitle: 'home' });
});
app.get('/contact', (req: Request, res: Response) => {
  res.render('contact', { pageTitle: 'contact', errors: [] });
});

app.post('/contact', async (req, res) => {
  const userFirstname = req.body.user_firstname;
  const userSurname = req.body.user_surname;
  const userEmail = req.body.user_email;
  const userConfirmation = req.body.user_confirmation;
  const userMessage = req.body.user_message;
  const client = new Client(dbConfig);

  try {
    await client.connect();

    // Add regex to validate input.
    const inputRegex = /^[A-Za-zàäâéèêëïî-]+$/;
    const emailRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,3}$/;
    const messageRegex = /^[^<>]{1,150}$/

    // key : value to string in object empty (with TypeScript: tks!)
    const errors: { [key: string]: string } = {};

    // Regex test
    if (!inputRegex.test(userSurname)) { errors.surname = "Format du nom invalide" };
    if (!inputRegex.test(userFirstname)) { errors.firstname = "Format du prénom invalide" };
    if (!emailRegex.test(userEmail)) { errors.email = "Format d'email invalide" };
    if (userEmail !== userConfirmation) { errors.confirm = "Les deux emails ne sont pas identiques" };
    if (!messageRegex.test(userMessage)) { errors.message = "Format de message invalide" };

    // key[s] of object create with errors > 0 
    if (Object.keys(errors).length > 0) {
      console.log('Erreurs de validation détectées:', errors);
      return res.render('contact', {
        pageTitle: 'contact',
        errors,
        getfirstname: userFirstname,
        getsurname: userSurname,
        getemail: userEmail,
        getconfirmation: userConfirmation,
        getMessage: userMessage,
      });
    }
    else {
      const insertQuery = `INSERT INTO formuser 
      (user_surname, user_firstName, user_email, user_confirmation, user_message) 
      VALUES ($1::text, $2::text, $3::text, $4::text, $5::text)`;
      const values = [userSurname, userFirstname, userEmail, userConfirmation, userMessage];
      const result = await client.query(insertQuery, values);
      if (result.rowCount !== null && result.rowCount > 0) {
        res.status(200).send('Formulaire envoyé avec succès');
      }
      else {
        res.status(500).send("Erreur lors de l'envoi du formulaire");
      }
      // If there are no errors, send a success response
      res.status(200).send('Formulaire envoyé avec succès');
    }

  } catch (error) {
    res.status(500).send("Une erreur s'est produite lors de la connexion");

  } finally {
    await client.end();
  }
});

app.listen(port, () => {
  console.log(`Le serveur fonctionne à http://localhost:${port}`);
});