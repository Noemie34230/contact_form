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

app.get('/contact', (req: Request, res: Response ) => {
  res.render('contact', { pageTitle: 'contact', errors: [] });
});

app.post('/submit-register', async (req, res) => {
  const userFirstName = req.body.user_firstname;
  const userSurname = req.body.user_surname;
  const userEmail = req.body.user_email;
  const userConfirmation = req.body.user_confirmation;
  const userMessage = req.body.user_message;
  const client = new Client(dbConfig);
  console.log(req.body);
  console.log('Données du formulaire :', userEmail, userConfirmation, userSurname, userFirstName, userMessage);

  // Array to store error messages
  const errorMessages = [];

  try {
    await client.connect();
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
    } else {
      const insertQuery = `INSERT INTO formuser 
        (user_surname, user_firstName, user_email, user_confirmation, user_message) 
        VALUES ($1::text, $2::text, $3::text, $4::text, $5::text)`;

      const values = [userSurname, userFirstName, userEmail, userConfirmation, userMessage];   
      const result = await client.query(insertQuery, values); 

      if (result.rowCount !== null && result.rowCount > 0) {
        res.status(200).send('Formulaire envoyé avec succès');
      } else {
        res.status(500).send("Erreur lors de l'envoi du formulaire");
      }
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
