import express, { Request, Response } from 'express';
import * as path from 'path';
import { Client } from 'pg';

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbConfig = {
  user: 'user',
  password: 'password',
  database: 'database',
  host: 'postgresdb',
  port: 5432,
};

app.get('/', (req: Request, res: Response) => {
  res.render('home', { pageTitle: 'home' });
});

app.get('/contact', (req: Request, res: Response) => {
  res.render('contact', { pageTitle: 'contact' });
});

app.post('/submit-register', async (req, res) => {
  const userFirstName = req.body.user_firstName;
  const userSurname = req.body.user_surname;
  const userEmail = req.body.user_email;
  const userConfirmation = req.body.user_confirmation;
  const userPassword = req.body.user_password;
  const userMessage = req.body.user_message;
  const client = new Client(dbConfig);
  console.log(req.body);
  console.log('Données du formulaire :', userEmail, userPassword, userConfirmation, userSurname, userFirstName, userMessage);
  try {
    await client.connect();
    const insertQuery = `INSERT INTO formuser 
    (user_id, user_surname, user_firstName, user_email, user_confirmation, user_password, user_message) 
    VALUES (DEFAULT, $1::text, $2::text, $3::text, $4::text, $5::text, $6::text, $7::text) RETURNING User_id`;

    const values = [userSurname, userFirstName, userEmail, userConfirmation, userPassword, userMessage];   
    const result = await client.query(insertQuery, values); 

    if (result.rowCount !== null && result.rowCount > 0) {
      res.status(200).send('Inscription réussie !');
    } else {
      res.status(500).send("Erreur lors de l'inscription");
    }
  } catch (error) {
    console.error("Une erreur s'est produite lors de la connexion :", error);
    res.status(500).send("Une erreur s'est produite lors de la connexion");
  } finally {
    await client.end();
  }
});

app.listen(port, () => {
  console.log(`Le serveur fonctionne à http://localhost:${port}`);
});
