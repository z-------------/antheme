var express = require("express");
var app = express();

var hb = require("handlebars");
var request = require("request");
var x2j = require("xml2js");

app.set("port", (process.env.PORT || 3000));

app.get("/", function(req, res) {
    var country = req.query.country;
    
    var source = "<img src='{{countryFlagSrc}}' alt='Flag of {{countryName}}'><iframe src='{{countryAnthemVideoSrc}}'></iframe>";
    var template = hb.compile(source);
    var tdata = {
        countryFlagSrc: "nosrc",
        countryName: country,
        countryAnthemVideoSrc: "noanthem"
    };
    
    /* get country flag from wikimedia commons */
    request({
        url: "http://tools.wmflabs.org/magnus-toolserver/commonsapi.php?image=Flag_of_" + country.split(" ").join("_") + ".svg",
        headers: {
            "User-Agent": "Antheme v0.0.1 (node.js via request)"
        }
    }, function(err, rres, rbody) {
        if (!err && rres.statusCode === 200) {
            console.log(rbody);
            x2j.parseString(rbody, function(err, xres) {
                if (!err) {
                    try {
                        var file = xres.response.file[0];
                        tdata.countryFlagSrc = file.urls[0].file[0];

                        res.send(template(tdata));
                    } catch (e) {
                        res.send(e.toString());
                    }
                } else {
                    res.send(err.toString());
                }
            });
        } else {
            res.send(err.toString());
        }
    });
});

app.listen(app.get("port"), function() {
  console.log("antheme running on port " + app.get("port"));
});