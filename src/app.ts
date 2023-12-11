import express, { Request, Response } from 'express';
import * as path from 'path';

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.get('/contact', (req: Request, res: Response) => {
    // Utilisez le nom du fichier Pug sans extension
    res.render('contact', { pageTitle: 'contact' });
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});