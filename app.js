const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = process.env.PORT || 3030;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

const db_config = {
  host: 'containers-us-west-145.railway.app',
  user: 'root',
  password: 'hiZzjoLDzrNowXnpVcl5',
  database: 'railway',
  port: 5441,
};

async function createAdminIfNotExists() {
  try {
    const adminEmail = 'harrison.diaz@uptc.edu.co';
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    const connection = mysql.createConnection(db_config);

    const checkAdminExists = new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Users WHERE email = ?', [adminEmail], (error, results) => {
        if (error) {
          console.error('Error checking for admin:', error.stack);
          reject(error);
          return;
        }

        if (results.length === 0) {
          connection.query(
              'INSERT INTO Users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
              ['Jhoiarid', 'Villamil', adminEmail, hashedPassword, 'ADMINISTRATOR'],
              (error, results) => {
                if (error) {
                  console.error('Error creating admin:', error.stack);
                  reject(error);
                  return;
                }

                console.log('Admin created successfully');
                resolve();
              }
          );
        } else {
          console.log('Admin already exists');
          resolve();
        }
      });
    });

    await Promise.all([checkAdminExists]).finally(() => {
      connection.end();
    });
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdminIfNotExists();

app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const connection = mysql.createConnection(db_config);

    connection.query(
        'INSERT INTO Users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
        [first_name, last_name, email, hashedPassword],
        (error, results) => {
          if (error) {
            console.error('Error executing query:', error.stack);

            if (error.code === 'ER_DUP_ENTRY') {
              res.status(409).send('Este correo ya está registrado');
            } else {
              res.status(500).send(`Error executing query: ${error.message}`);
            }
            return;
          }

          res.status(201).send('Usuario registrado con éxito');
        }
    );

    connection.end();
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).send('Error en el registro');
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = mysql.createConnection(db_config);

    connection.query(
        'SELECT * FROM Users WHERE email = ?',
        [email],
        async (error, results) => {
          if (error) {
            console.error('Error executing query:', error.stack);
            res.status(500).send(`Error executing query: ${error.message}`);
            return;
          }

          if (results.length === 0) {
            res.status(401).send('Correo electrónico o contraseña incorrectos');
            return;
          }

          const user = results[0];
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            res.status(401).send('Correo electrónico o contraseña incorrectos');
            return;
          }

          res.status(200).json({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            registration_date: user.registration_date,
          });
        }
    );

    connection.end();
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).send('Error en el inicio de sesión');
  }
});

app.get('/api/dishes', (req, res) => {
  const connection = mysql.createConnection(db_config);

  connection.query('SELECT * FROM Dishes', (error, results) => {
    if (error) {
      console.error('Error executing query:', error.stack);
      res.status(500).send(`Error executing query: ${error.message}`);
      return;
    }

    const dishes = results.map((row) => {
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        image: row.image,
        price: row.price,
        category: row.category,
        creation_date: row.creation_date,
      };
    });

    res.status(200).json(dishes);
  });

  connection.end();
});

app.get('/api/dishes/:id', (req, res) => {
  const connection = mysql.createConnection(db_config);

  const dishId = req.params.id;

  connection.query('SELECT * FROM Dishes WHERE id = ?', [dishId], (error, results) => {
    if (error) {
      console.error('Error executing query:', error.stack);
      res.status(500).send(`Error executing query: ${error.message}`);
      return;
    }

    if (results.length > 0) {
      const row = results[0];

      const dish = {
        id: row.id,
        name: row.name,
        description: row.description,
        image: row.image,
        price: row.price,
        category: row.category,
        creation_date: row.creation_date,
      };

      res.status(200).json(dish);
    } else {
      res.status(404).send(`Dish with ID ${dishId} not found`);
    }
  });

  connection.end();
});

app.get('/api/addons', (req, res) => {
  const connection = mysql.createConnection(db_config);

  connection.query('SELECT * FROM Addons', (error, results) => {
    if (error) {
      console.error('Error executing query:', error.stack);
      res.status(500).send(`Error executing query: ${error.message}`);
      return;
    }

    const addons = results.map(row => ({
      id: row.id,
      name: row.name
    }));

    res.status(200).json(addons);
  });

  connection.end();
});

app.post('/api/dishes', (req, res) => {
  const connection = mysql.createConnection(db_config);

  const { name, description, image, price, category } = req.body;

  connection.query('INSERT INTO Dishes (name, description, image, price, category) VALUES (?, ?, ?, ?, ?)', [name, description, image, price, category], (error, results) => {
    if (error) {
      console.error('Error executing query:', error.stack);
      res.status(500).send(`Error executing query: ${error.message}`);
      return;
    }

    const dishId = results.insertId;
    res.status(200).json({ id: dishId, name, description, image, price, category });
  });

  connection.end();
});



app.listen(port ,() => {
  console.log(`App listening at ${port}`);
});
