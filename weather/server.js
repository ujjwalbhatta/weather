const express = require('express');
const request = require('request-promise'); //async alaways uses promises
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended : true, useUnifiedTopology: true }));

mongoose.connect('mongodb+srv://ujjwal:Pranjita@patients-evtmn.mongodb.net/test?retryWrites=true&w=majority');

const citySchema = new mongoose.Schema({
    name: String
});

const cityModel = mongoose.model('City',citySchema);

//  const lasvegas = new cityModel({name : 'Las Vegas'});
//  const toronto = new cityModel({name : 'Toronto'});
//  const sydney = new cityModel({name : 'Sydney'});
//  lasvegas.save()
//  toronto.save()
//  sydney.save()

async function getWeather(cities) {
    const weather_data = [];

    for (const city_obj of cities) {
        const city = city_obj.name;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=271d1234d3f497eed5b1d80a07b3fcd1`;

        const response_body = await request(url);

        const weather_json = JSON.parse(response_body);

        const weather = {
            city : city,
            temperature :  Math.round(weather_json.main.temp),
            description : weather_json.weather[0].description,
            icon : weather_json.weather[0].icon,
        };

        weather_data.push(weather);
    }

    return weather_data;
}


app.get('/', function(req, res) {

    cityModel.find({}, function(err, cities) {

        getWeather(cities).then(function(results) {

            var weather_data = {weather_data : results};

            res.render('weather', weather_data);

        });

    });      

});

app.post('/', function(req, res) {

    var newCity = new cityModel({name : req.body.city_name});
    newCity.save();

    res.redirect('/');

});

app.listen(8000);