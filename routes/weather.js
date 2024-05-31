var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const City = require('../models/cities');

const API_KEY = '2e31b5fe95d02cf485c00cb6ae61b70e';

router.post('/', (req, res) => {
  City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i')} })
  .then(dbData => {
    if(dbData === null) {
      fetch(`http://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${API_KEY}&units=metric`)
        .then(response => response.json())
        .then(apiData => {
          const newCity = new City({
            cityName: req.body.cityName,
            main: apiData.weather[0].main,
            description: apiData.weather[0].description,
            tempMin: apiData.main.temp_min,
            tempMax: apiData.main.temp_max,
          });
          newCity.save().then(newDoc => {
            res.json({ result: true, weather: newDoc });
          });
        });
    } else {
      res.json({ result: false, error:  'City already savec' });
    }
  });
});

router.get('/:cityName', (req, res) => {
  City.findOne({
    cityName: { $regex: new RegExp(req.params.cityName, "i")},
  }).then(data => {
    if(data) {
       res.json({ result: true, weather: data });
    } else {
      res.json({ result: false, error: 'City not found' });
    }
  });
});

router.delete('/:cityName', (req, res) => {
  City.deleteOne({
    cityName: { $regex: new RegExp(req.params.cityName, "i")}
  }).then(deleteDoc => {
    if(deleteDoc.deleteCount > 0) {
      City.find().then(data => {
        res.json({ result: true, weather: data });
      });
    } else {
      res.json({ result: false, error: 'City not found' });
    }
  });
});

module.exports = router;