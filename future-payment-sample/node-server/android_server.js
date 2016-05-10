var bodyParser = require('body-parser'),
    http = require('http'),
    paypal = require('paypal-rest-sdk'),
    app = require('express')();

var client_id = 'YOUR APPLICATION CLIENT ID';
var secret = 'YOUR APPLICATION SECRET';

paypal.configure({
    'mode': 'sandbox',
    'client_id': client_id,
    'client_secret': secret
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.post('/fpstore', function(req, res){
    var code = {'authorization_code': req.body.code};
    var metadata_id = req.body.metadataId;
    
    //generate token from provided code
    paypal.generateToken(code, function (error, refresh_token) {
        if (error) {
            console.log(error);
            console.log(error.response);
        } else {
            //create future payments config 
            var fp_config = {'client_metadata_id': metadata_id, 'refresh_token': refresh_token};

            //payment details
            var payment_config = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": "3.50"
                    },
                    "description": "Mesozoic era monster toy"
                }]
            };

            //process future payment
            paypal.payment.create(payment_config, fp_config, function (error, payment) {
                if (error) {
                    console.log(error.response);
                    throw error;
                } else {
                    console.log("Create Payment Response");
                    console.log(payment);
                    
                    //send payment object back to mobile
                    res.send(JSON.stringify(payment));
                }
            });
        }
    });
});

//create server
http.createServer(app).listen(3000, function () {
   console.log('Server started: Listening on port 3000');
});
