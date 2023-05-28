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

app.get('/api/users/:email', async (req, res) => {
  const email = req.params.email;

  if (!email) {
    res.status(400).send('El correo electrónico es obligatorio');
    return;
  }

  try {
    const connection = mysql.createConnection(db_config);

    connection.query(
        'SELECT * FROM Users WHERE email = ?',
        [email],
        (error, results) => {
          if (error) {
            console.error('Error ejecutando la consulta:', error.stack);
            res.status(500).send(`Error ejecutando la consulta: ${error.message}`);
            return;
          }

          if (results.length === 0) {
            res.status(404).send('No se encontró el usuario con este correo electrónico');
            return;
          }

          const user = results[0];

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
    console.error('Error en la búsqueda de usuario:', error);
    res.status(500).send('Error en la búsqueda de usuario');
  }
});

app.put('/api/users/:id/name', async (req, res) => {
  const id = req.params.id;
  const { first_name, last_name } = req.body;

  if (!id || !first_name || !last_name) {
    res.status(400).send('El ID, el nombre y el apellido son obligatorios');
    return;
  }

  try {
    const connection = mysql.createConnection(db_config);

    connection.query(
        'UPDATE Users SET first_name = ?, last_name = ? WHERE id = ?',
        [first_name, last_name, id],
        (error, results) => {
          if (error) {
            console.error('Error ejecutando la consulta:', error.stack);
            res.status(500).send(`Error ejecutando la consulta: ${error.message}`);
            return;
          }

          if (results.affectedRows === 0) {
            res.status(404).send('No se encontró el usuario con este ID');
            return;
          }

          res.status(200).send('Nombre del usuario actualizado exitosamente');
        }
    );

    connection.end();
  } catch (error) {
    console.error('Error al actualizar el nombre del usuario:', error);
    res.status(500).send('Error al actualizar el nombre del usuario');
  }
});

app.put('/api/users/:id/email', async (req, res) => {
  const id = req.params.id;
  const { email } = req.body;

  if (!id || !email) {
    res.status(400).send('El ID y el correo electrónico son obligatorios');
    return;
  }

  try {
    const connection = mysql.createConnection(db_config);

    connection.query(
        'UPDATE Users SET email = ? WHERE id = ?',
        [email, id],
        (error, results) => {
          if (error) {
            console.error('Error ejecutando la consulta:', error.stack);
            res.status(500).send(`Error ejecutando la consulta: ${error.message}`);
            return;
          }

          if (results.affectedRows === 0) {
            res.status(404).send('No se encontró el usuario con este ID');
            return;
          }

          res.status(200).send('Correo electrónico del usuario actualizado exitosamente');
        }
    );

    connection.end();
  } catch (error) {
    console.error('Error al actualizar el correo electrónico del usuario:', error);
    res.status(500).send('Error al actualizar el correo electrónico del usuario');
  }
});


app.post('/api/dishes', (req, res) => {
  const connection = mysql.createConnection(db_config);

  const {name, description, image, price, category} = req.body;
  try {
    connection.query('INSERT INTO Dishes (name, description, image, price, category) VALUES (?, ?, ?, ?, ?)', [name, description, image, price, category], (error, results) => {
      if (error) {
        console.error('Error executing query:', error.stack);
        res.status(500).send(`Error executing query: ${error.message}`);
        return;
      }

      const dishId = results.insertId;
      res.status(200).json({id: dishId, name, description, image, price, category});
    });

    connection.end();
  } catch (error) {
    console.error('Error al insertar el platillo:', error);
    res.status(500).send('Error al insertar el platillo');
  }
});

app.delete('/api/dishes/:id', (req, res) => {
  const connection = mysql.createConnection(db_config);
  const id = req.params.id;
    try {
      connection.query('DELETE FROM Dishes WHERE id = ?', [id], (error, results) => {
        if (error) {
          console.error('Error executing query:', error.stack);
          res.status(500).send(`Error executing query: ${error.message}`);
          return;
        }
        res.status(200).json({id: id});
      });
        connection.end();
    }catch (error) {
      console.error('Error al borrar el platillo:', error);
      res.status(500).send('Error al borrar el platillo');
    }
});


/*Me gustaria un endpoint put para dish*/
app.put('/api/dishes/:id', (req, res) => {
  const connection = mysql.createConnection(db_config);
    const id = req.params.id;
    const {name, description, image, price, category} = req.body;
    try {
        connection.query('UPDATE Dishes SET name = ?, description = ?, image = ?, price = ?, category = ? WHERE id = ?', [name, description, image, price, category, id], (error, results) => {
            if (error) {
            console.error('Error executing query:', error.stack);
            res.status(500).send(`Error executing query: ${error.message}`);
            return;
            }
            res.status(200).json({id: id, name, description, image, price, category});
        });
            connection.end();
    }catch (error){
        console.error('Error al actualizar el platillo:', error);
        res.status(500).send('Error al actualizar el platillo');
    }
});


app.get('/api/users', (req, res) => {
  const connection = mysql.createConnection(db_config);
    try {
        connection.query('SELECT * FROM Users', (error, results) => {
            if (error) {
            console.error('Error executing query:', error.stack);
            res.status(500).send(`Error executing query: ${error.message}`);
            return;
            }
            res.status(200).json(results);
        });
            connection.end();
    }catch (error) {
        console.error('Error al recuperar los usuarios:', error);
        res.status(500).send('Error al recuperar los usuarios');
    }
});

/*Me gustaria un endpoint get para los addons*/
app.get('/api/addons', (req, res) => {
  const connection = mysql.createConnection(db_config);
    try {
        connection.query('SELECT * FROM Addons', (error, results) => {
            if (error) {
            console.error('Error executing query:', error.stack);
            res.status(500).send(`Error executing query: ${error.message}`);
            return;
            }
            res.status(200).json(results);
        });
            connection.end();
    }catch (error) {
        console.error('Error al recuperar los addons:', error);
        res.status(500).send('Error al recuperar los addons');
    }
});

app.get('/api/orders', (req, res) => {
    const connection = mysql.createConnection(db_config);

    try {
        const query = `
        SELECT 
            Orders.id as order_id,
            Users.first_name as customer_first_name,
            Users.last_name as customer_last_name,
            Dishes.name as dish_name,
            Orders.status,
            Orders.total
        FROM Orders
        INNER JOIN Users ON Orders.user_id = Users.id
        INNER JOIN OrderDetails ON Orders.id = OrderDetails.order_id
        INNER JOIN Dishes ON OrderDetails.dish_id = Dishes.id
        `;
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error.stack);
                res.status(500).send(`Error executing query: ${error.message}`);
                return;
            }

            res.status(200).json(results);
        });

        connection.end();
    } catch (error) {
        console.error('Error al recuperar las ordenes:', error);
        res.status(500).send('Error al recuperar las ordenes');
    }
});


app.post('/api/orders', (req, res) => {
   const connection = mysql.createConnection(db_config);

    const { userId, delivery_address, contact_phone, status, total } = req.body;

    try {
        connection.beginTransaction(async (error) => {
            if (error) throw error;

            const insertOrder = 'INSERT INTO Orders (user_id, delivery_address, contact_phone, status, total) VALUES (?, ?, ?, ?, ?)';
            connection.query(insertOrder, [userId, delivery_address, contact_phone, status, total], (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        throw error;
                    });
                }

                const orderId = results.insertId;
                const { orderDetails, orderAddons } = req.body;

                orderDetails.forEach(detail => {
                    const insertDetail = 'INSERT INTO OrderDetails (order_id, dish_id, quantity, unit_price, total_price, modification) VALUES (?, ?, ?, ?, ?, ?)';
                    connection.query(insertDetail, [orderId, detail.dish_id, detail.quantity, detail.unit_price, detail.total_price, detail.modification], (error, results) => {
                        if (error) {
                            return connection.rollback(() => {
                                throw error;
                            });
                        }
                    });
                });
                if(orderAddons !== null){

                orderAddons.forEach(addon => {
                    const insertAddon = 'INSERT INTO OrderAddons (order_id, addon_id, addon_price) VALUES (?, ?, ?)';
                    connection.query(insertAddon, [orderId, addon.addon_id, addon.addon_price], (error, results) => {
                        if (error) {
                            return connection.rollback(() => {
                                throw error;
                            });
                        }
                    });
                });
                }

                connection.commit((error) => {
                    if (error) {
                        return connection.rollback(() => {
                            throw error;
                        });
                    }

                    res.status(200).json({ id: orderId, userId, delivery_address, contact_phone, status, total });
                });
            });
        });

    } catch (error) {
        console.error('Error al insertar la orden:', error);
        res.status(500).send('Error al insertar la orden');
    }
});

app.get('/api/addons/:name', (req, res) => {
    const connection = mysql.createConnection(db_config);
    const addonName = req.params.name;

    connection.query('SELECT * FROM Addons WHERE name = ?', [addonName], (error, results) => {
        if (error) {
            console.error('Error executing query:', error.stack);
            res.status(500).send(`Error executing query: ${error.message}`);
            return;
        }

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).send(`Addon with name ${addonName} not found`);
        }
    });

    connection.end();
});

app.listen(port ,() => {
  console.log(`App listening at ${port}`);
});

