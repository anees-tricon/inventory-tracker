const express = require('express');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect('mongodb://localhost/inventory-dev', {
  useMongoClient: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Load Mongo Model
require('./models/Inventory');
require('./models/Item')
const Items = mongoose.model('items');
const Inventory = mongoose.model('inventory');

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override middleware
app.use(methodOverride('_method'));

// Express session midleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

// Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Inventory Index Page
app.get('/inventory', (req, res) => {
  Inventory.find({})
    .sort({date:'desc'})
    .then(items => {
      res.render('inventory/index', {
        items:items
      });
    });
});

// Add Item Form
app.get('/inventory/add', (req, res) => {
  res.render('inventory/add');
});

// Edit Item Form
app.get('/inventory/edit/:id', (req, res) => {
  Inventory.findOne({
    _id: req.params.id
  })
  .then(item => {
    res.render('inventory/edit', {
      item:item
    });
  });
});

// Process Form
app.post('/inventory', (req, res) => {
  let errors = [];

  if(!req.body.category){
    errors.push({text:'Please enter a category'});
  }
  if(!req.body.name){
    errors.push({text:'Please enter item name'});
  }

  if(!req.body.quantityType){
    errors.push({text:'Please enter the quantity type'});
  }

  if(!req.body.quantity){
    errors.push({text:'Please enter the quantity'});
  }

  if(!req.body.purchaseDate){
    errors.push({text:'Please enter the purchase date'});
  }

  if(errors.length > 0){
    res.render('inventory/add', {
      errors: errors,
      category: req.body.category,
      name: req.body.name,
      quantityType: req.body.quantityType,
      quantity: req.body.quantity,
      purchaseDate: req.body.purchaseDate,
      expiryDate: req.body.expiryDate
    });
  } else {
    const newItem = {
      category: req.body.category,
      name: req.body.name,
      quantityType: req.body.quantityType,
      quantity: req.body.quantity,
      purchaseDate: req.body.purchaseDate,
      expiryDate: req.body.expiryDate
    }
    new Inventory(newItem)
      .save()
      .then(() => {
        req.flash('success_msg', 'new Item added to the inventory');
        res.redirect('/inventory');
      })
  }
});

// Edit Form process
app.put('/inventory/:id', (req, res) => {
  Inventory.findOne({
    _id: req.params.id
  })
  .then(item => {
    // new values
    item.category = req.body.category;
    item.name = req.body.name;
    item.quantityType = req.body.quantityType;
    item.quantity = req.body.quantity;
    item.purchaseDate =req.body.purchaseDate;
    item.expiryDate = req.body.expiryDate;

    item.save()
      .then(() => {
        req.flash('success_msg', 'Inventory Item updated');
        res.redirect('/inventory');
      })
  });
});

// Delete Idea
app.delete('/inventory/:id', (req, res) => {
  Inventory.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Inventory Item removed');
      res.redirect('/inventory');
    });
});

const port = 5000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});