const express = require('express') //web server
 const pg = require('pg'); //library to connect to PostgresSQL db
 const { Client } = pg; //specific class you use to make that connection

 //creating DB connection
 const client = new Client({
  user: 'selenamoss',
  password: '',
  host: 'localhost',
  port: 5432,
  database: 'the_acme_notes_db',
 })

 //creating the express App + Port
 const app = express()
 const port = 3000
 app.use(express.json()); // so u can read JSON from the body

//connecting to the DB THEN starting the Server using try catch
const startServer = async () => {
  try {
    await client.connect();
    console.log('🔌 Connected to database')

    //Start the server AFTER database connection is successful
app.listen(port, () => {
      console.log(`📟Server is listening on port ${port}`)
    });
  } catch (err) {
    console.error('❌Error connecting to the database:', err)
  }
};
//testing connection
app.get('/', (req, res) => {
  res.send('✨Server is running✨');
});
/* 
  📦 GET /api/flavors 
  - Returns array of flavors
*/
app.get('/api/flavors', async (req, res) => {
  const data = await client.query('SELECT * FROM flavors');
    res.json(data.rows);
    // console.log(data.rows);
});

/* 
  🍨 GET /api/flavors/:id 
  - Returns a single flavor
*/
app.get('/api/flavors/:id', async (req, res) => {
  const { id } = req.params;
  const data =  await client.query('SELECT * FROM flavors WHERE id= $1', [id]);
  if (data.rows.length === 0) {
    const sadEmojis = ['😭', '🫠', '😵‍💫', '😿', '😩'];
    const randomSadEmoji = sadEmojis[Math.floor(Math.random() * sadEmojis.length)];
    res.status(404).json({ error: ` Womp Womp! Flavor with ID ${id} not found ${randomSadEmoji} ` });
  } else {
    res.json(data.rows[0]);
  }
});

/* 
  ➕ POST /api/flavors 
  - Creates a new flavor and returns it
*/
app.post('/api/flavors', async (req, res) => {
  const { name, is_favorite  } = req.body;
  const data = await client.query('INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *', [name, is_favorite]);
  res.json(data.rows[0]);
});

/* 
  🗑️ DELETE /api/flavors/:id
  - returns nothing
*/
app.delete('/api/flavors/:id', async (req,res) => {
  const { id } = req.params;
  await client.query('DELETE FROM flavors WHERE id = $1', [id]);
  res.json('🗑️success');

})

/* 
  PUT /api/flavors/:ID
  - HAS the updated flavor as the payload, and returns the updated flavor.
*/
app.put('/api/flavors/:id', async (req,res) => {
  const { id } = req.params
  const { name, is_favorite } = req.body
  try {
    await client.query('UPDATE flavors SET name = $1, is_favorite = $2 WHERE id = $3', [name, is_favorite, id]);
    res.json('🍦flavor updated')
  } catch (err) {
    console.log(err)
  }
});

//start the server
startServer();