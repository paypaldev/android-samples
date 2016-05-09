var bodyParser = require('body-parser'),
    http = require('http'),
    https = require('https'),
    paypal = require('paypal-rest-sdk'),
    querystring = require('querystring'),
    app = require('express')();

var client_id = 'YOUR APPLICATION CLIENT ID';
var secret = 'YOUR APPLICATION SECRET';

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': client_id,
    'client_secret': secret
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.post('/fpstore', function(req, res){
    var code = {'authorization_code': req.body.code};
    var metadata_id = req.body.metadataId;
    
    paypal.generateToken(code, function (error, refresh_token) {
        if (error) {
            console.log(error);
            console.log(error.response);
        } else {
            //Refresh token has long shelf life. It is recommended to store this in a database
            //for future payments
            var fp_config = {'client_metadata_id': metadata_id, 'refresh_token': refresh_token};

            //Set up payment details
            var payment_config = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": "1.00"
                    },
                    "description": "This is the payment description."
                }]
            };

            //Create future payment
            paypal.payment.create(payment_config, fp_config, function (error, payment) {
                if (error) {
                    console.log(error.response);
                    throw error;
                } else {
                    console.log("Create Payment Response");
                    console.log(payment);
                    res.write(JSON.stringify(payment));
                }
            });
        }
    });
});

//create server
http.createServer(app).listen(3000, function () {
   console.log('Server started: Listening on port 3000');
});
