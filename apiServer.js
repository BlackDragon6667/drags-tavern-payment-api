require(`dotenv`).config();

const express = require("express");
const crypto = require("crypto");
const axios = require(`axios`).default;

const app = express();
const port = 8080;

app.enable("trust proxy");

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

// Add headers before the routes are defined
app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();

});

app.use((err, req, res, next) => {
    console.error(err);
    if (err) {
        res.json({
            "status": 500,
            "message": "Internal server error"
        });
    } else { next() };
})

app.post(`/api`, async (req, res) => {
    console.log(req.body);
    if ([
        req.body["ban_address"],
        req.body["ban_count"],
        req.body["score"],
        req.body["timestamp"],
        req.body["nonce"],
        req.body["hash"]
    ].includes(undefined)) {
        res.json({
            "status": 400,
            "message": "Bad request"
        });
    } else {

        const hash = crypto.createHash('sha256').update(process.env.HASH_SEED + req.body["ban_address"] + req.body["ban_count"] + req.body["timestamp"] + req.body["nonce"]).digest('hex').toUpperCase();

        if (req.body["hash"].toUpperCase() == hash && req.body["ban_count"] != 0) {

            res.json({
                "claim_data": req.body,
                "status": 200,
                "message": "OK"
            });
            
            console.log("successful withdraw", req.body);

            axios.post(process.env.WEBHOOK_URL, {
                // the username to be displayed
                username: 'Funny Monke',
                // the avatar to be displayed
                avatar_url: 'https://i.imgur.com/MKWcl4K.png',
                // contents of the message to be sent
                content: 'Calling on: <@409277585412063232>,',
                // enable mentioning of individual users or roles, but not @everyone/@here
                allowed_mentions: {
                    parse: ['users', 'roles'],
                },
                // embeds to be sent
                embeds: [{
                    // decimal number colour of the side of the embed
                    color: 16776972,
                    // author
                    // - icon next to text at top (text is a link)
                    author: {
                        name: 'Monke',
                        url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4704.png',
                        icon_url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4704.png',
                    },
                    // embed title
                    // - link on 2nd row
                    title: 'Ban_Adress =' + req.body["ban_address"],
                    url: '',
                    // thumbnail
                    // - small image in top right corner.
                    thumbnail: {
                        url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4704.png',
                    },
                    // embed description
                    // - text on 3rd row
                    description: 'Hope you enjoyed the Tavern traveler monke',
                    // custom embed fields: bold title/name, normal content/value below title
                    // - located below description, above image.
                    fields: [
                        {
                            name: 'Bans',
                            value: '' + req.body["ban_count"],
                        },
                        {
                            name: 'Score',
                            value: '' + req.body["score"],
                        },
                    ],
                    // image
                    // - picture below description(and fields)
                    image: {
                        url: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4704.png',
                    },
                    // footer
                    // - icon next to text at bottom
                    footer: {
                        text: 'footer',
                        icon_url: 'https://cdn.pixabay.com/photo/2021/02/22/15/59/fortnite-6040784_960_720.png',
                    },
                }, ],
            }).catch(err => console.log(err));

        } else { res.json({ "status": 400, "message": "Bad request" }); }

    }
})

app.all('*', function(req, res, next) {
    res.json({
        "status": 404,
        "message": "Page not found"
    });
})

app.use(function (req, res, next) {
    res.json({
        "status": 404,
        "message": "Page not found"
    });
})

app.use(function (err, req, res, next) {
    console.error(err.stack)
})

app.listen(port, () => {
    console.log(`UI is live! http://localhost:${port}`);
})