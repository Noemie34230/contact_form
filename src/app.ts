import express, { Request, Response } from 'express';
import * as path from 'path';
import { Client } from 'pg';

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Définit le dossier "styles" pour les fichiers CSS
app.use('/styles', express.static(path.join(__dirname, 'styles')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.render('home', { pageTitle: 'home' });
});

app.get('/contact', (req: Request, res: Response) => {
  res.render('contact', { pageTitle: 'contact' });
});

app.listen(port, () => {
  console.log(`Le serveur fonctionne à http://localhost:${port}`);
});

const dbConfig = {
  user: 'user',
  password: 'password',
  database: 'database',
  host: 'postgresdb',
  port: 5432,
};

async function insertUserData(
  User_Surname: string,
  User_First_name: string,
  User_Email: string,
  User_Password: string,
  User_Message: string
) {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    const insertQuery = `INSERT INTO formuser (User_Surname, User_First_Name, User_Email, User_Password, User_Message)
                         VALUES ($1, $2, $3, $4, $5)`;

    const values = [User_Surname, User_First_name, User_Email, User_Password, User_Message];

    await client.query(insertQuery, values);

    console.log('Formulaire créé avec succès');

  } catch (error) {
    console.error("Erreur lors de l'insertion des données :", error);
  } finally {
    await client.end();
  }
}

app.post('/submit-register', async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    const userSurname = req.body.User_Surname;
    const userFirstName = req.body.User_First_name;
    const userEmail = req.body.User_Email;
    const userPassword = req.body.User_Password;
    const userMessage = req.body.User_Message;

    const insertQuery = `INSERT INTO formuser (User_Surname, User_First_Name, User_Email, User_Password, User_Message)
                         VALUES ($1, $2, $3, $4, $5)`;

    const values = [userSurname, userFirstName, userEmail, userPassword, userMessage];

    const result = await client.query(insertQuery, values);

    if (result.rows.length > 0) {
      console.log('Donnée formulaire insérée avec succès');
      res.redirect('/');
    } else {
      console.error("Erreur lors de l'insertion des données : Aucune ligne affectée");
      res.status(500).send("Erreur lors de l'insertion des données");
    }
  } catch (error) {
    console.error("Une erreur s'est produite lors de la connexion :", error);
    res.status(500).send("Une erreur s'est produite lors de la connexion");
  } finally {
    await client.end();
  }
});
