const express = require('express');
const bodyParser = require('body-parser');
const customersData = require('./customer.json');

const app = express();
app.use(bodyParser.json());

// List API with search and pagination
app.get('/api/customers', (req, res) => {
  const { firstName, lastName, city, page, limit } = req.query;
  let filteredCustomers = [...customersData];

  if (firstName) {
    filteredCustomers = filteredCustomers.filter(
      customer => customer.first_name.toLowerCase().includes(firstName.toLowerCase())
    );
  }

  if (lastName) {
    filteredCustomers = filteredCustomers.filter(
      customer => customer.last_name.toLowerCase().includes(lastName.toLowerCase())
    );
  }

  if (city) {
    filteredCustomers = filteredCustomers.filter(
      customer => customer.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  res.json(paginatedCustomers);
});

// Get single customer data by ID
app.get('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const customer = customersData.find(c => c.id === parseInt(id));

  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

// List all unique cities with the number of customers from each city
app.get('/api/cities', (req, res) => {
  const cities = {};

  customersData.forEach(customer => {
    const { city } = customer;
    if (cities[city]) {
      cities[city]++;
    } else {
      cities[city] = 1;
    }
  });

  res.json(cities);
});

// Add a customer with validations
app.post('/api/customers', (req, res) => {
  const { id, first_name, last_name, city, company } = req.body;

  if (!id || !first_name || !last_name || !city || !company) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const existingCustomer = customersData.find(c => c.id === id);
  if (existingCustomer) {
    res.status(409).json({ message: 'Customer with the same ID already exists' });
    return;
  }

  const existingCity = customersData.find(c => c.city === city);
  const existingCompany = customersData.find(c => c.company === company);
  if (!existingCity || !existingCompany) {
    res.status(400).json({ message: 'City or company does not exist' });
    return;
  }

  const newCustomer = {
    id,
    first_name,
    last_name,
    city,
    company,
  };

  customersData.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
