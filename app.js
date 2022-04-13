const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/views'));

const dataPath = path.join('.', 'data', 'series.json');
const readJSON = fs.readFileSync(dataPath);
let datas = JSON.parse(readJSON);

app.get('/', (req, res) => {
  let { filter } = req.query;

  let displayedDatas = [...datas];

  if (filter) {
    displayedDatas = datas.filter(data => {
      return data.Title.toLowerCase().match(filter.toLowerCase()) || data.Country.toLowerCase().match(filter.toLowerCase());
    });
  }
  
  res.render('index', { datas: displayedDatas, filter });
});

app.get('/add', (req, res) => {
  res.render('add', {
    title: 'Add Data',
    selectedData: '',
    action: '/add'
  });
});

app.post('/add', (req, res) => {
  // let title = req.body.title;
  // let country = req.body.country;
  let { title, country } = req.body;

  const newData = {
    ID: datas.length + 1,
    Title: title,
    Country: country
  };

  datas.push(newData);
  fs.writeFileSync(dataPath, JSON.stringify(datas, null, 4));
  res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
  const { id } = req.params;

  let selectedData = datas.filter(element => {
    return element.ID === parseInt(id);
  });

  res.render('add', { 
    selectedData: selectedData[0],
    title: 'Edit Data',
    action: `/edit/${id}`
  });
});

app.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { title, country } = req.body;

  for (let i = 0; i < datas.length; i++) {
    if (datas[i].ID === parseInt(id)) {
      datas[i].Title = title;
      datas[i].Country = country;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(datas, null, 4));
  res.redirect('/');
});

app.get('/delete/:id', (req, res) => {
  const { id } = req.params;

  let newDatas = datas.filter(element => {
    return element.ID !== parseInt(id);
  });

  datas = newDatas;
  fs.writeFileSync(dataPath, JSON.stringify(datas, null, 4));
  res.redirect('/');
});

app.listen(port, () => console.log(`listening on port http://localhost:${port}`));
