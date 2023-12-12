import express, { Request, Response } from 'express';
import * as path from 'path';
import { Client } from 'pg';
const app = express();
const port = 3000;

// Configuration de la connexion à la base de données (remplacez ces informations par les vôtres)
const dbConfig = {
  user: 'aduser',
  password: 'adpassword',
  database: 'adatabase',
  host: 'postgresdb', 
  port: 5432, // Port par défaut de PostgreSQL
};

// Création d'un nouveau client pour se connecter à la base de données
const client = new Client(dbConfig);
async function insertUserData(User_Surname: string, User_First_name: string, User_Nickname: string, User_Email: string, User_Password: string) {
  try {
    // Connexion au client PostgreSQL
    await client.connect();

    // Requête SQL pour insérer les données dans la table
    const insertQuery = `INSERT INTO formuser (User_Surname, User_First_Name, User_Nickname, User_Email, User_Password)
                         VALUES ($1, $2, $3, $4, $5)`;

    // Paramètres à passer à la requête
    const values = [User_Surname, User_First_name, User_Nickname, User_Email, User_Password];

    // Exécution de la requête d'insertion
    await client.query(insertQuery, values);

    console.log('Client créé avec succès');

  } catch (error) {
    console.error('Erreur lors de l\'insertion des données :', error);
  } finally {
    // Fermeture de la connexion à la base de données
    await client.end();
  }
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Définit le dossier "styles" pour les fichiers CSS
app.use('/styles', express.static(path.join(__dirname, 'styles')));

app.get('/', (req: Request, res: Response) => {
  // Utilise le nom du fichier Pug sans extension
  res.render('home', { pageTitle: 'home' });
});

app.get('/contact', (req: Request, res: Response) => {
    // Utilise le nom du fichier Pug sans extension
    res.render('contact', { pageTitle: 'contact' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});