const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 8080;
const SaxonJS = require('saxon-js');
const stylesheet = require('./stylesheets/start-edition.sef.json');



app.use(cors());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/leiden', (req, res) => {

    try {

        const xmlString = req.body.xmlString.replace(/^\ufeff/g,"");

        if(xmlString != '' || xmlString != undefined){
            const options = { 
                "stylesheetInternal": stylesheet,
                "destination": "serialized",
                "sourceText": xmlString
            };
            SaxonJS.transform(options, "async")
            .then(output => {
                res.status(200).send({
                    xml : output.principalResult
                });
            }).catch(error => {
                res.status(400).send(error);
            });
        }else{
            res.send('Empty string')
        }
        

        
    } catch (error) {
        console.log(error)
    }
    
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));