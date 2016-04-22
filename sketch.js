
var roboBold;
var roboRegular;
var title = "The World at War"
var date = "1823 - 2003"
var description = "Based on data from the Correlates of War project\n[correlatesofwar.org], this project looks at conflicts between\nnations and their allegiances over nearly two centuries.\n \nNortheastern University // ARTG6100\nThomas Urell // Spring 2016";
var table_wars;
var linenumbers = {};
var battles = {};
var countries = {};
var entryyears = {};
var exityears = {};
var alliances = {};
var deaths = {};
var warCountries = [];
var wars = [];
var deathTot = {};
var table_pop;
var baseMap = [];
var aBasemap = [];
var countriez = {};
var ccodes = {};
var populations = {};
var latitudes = {};
var longitudes = {};
var warTimeline = [];
var myWars = [];
var warCountries = [];
var mouseWasPressed = false;
var boxLive = true;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
//PRELOAD
function preload() {
    table_pop = loadTable("data/centroids.csv", "csv", "header");
    table_wars = loadTable("data/Inter_edit2.csv", "csv", "header");
    roboBold = loadFont("fonts/RobotoMono-Bold.ttf");
    roboRegular = loadFont("fonts/RobotoMono-Regular.ttf");
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
//SETUP
function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    frameRate(30);
    colorMode(HSB, 360, 100, 100, 100);

    //+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
    //CREATE BASEMAP ARRAY
    table_pop.getRows().forEach(function (row) {
        var cname = row.getString("country_name");
        var ccode = row.getString("country_code");
        var pop = int(row.getString("population"));
        var lng = int(row.getString("lng"));
        var lat = int(row.getString("lat")) * -1;

        countries[cname] = "someodd";
        ccodes[cname] = ccode;
        populations[cname] = pop;
        longitudes[cname] = lng;
        latitudes[cname] = lat;
    });

    var aBasemap = [];
    Object.keys(countries).forEach(function (name_) {
        var country = {};
        country.name = name_;
        country.code = ccodes[name_];
        country.population = populations[name_];
        country.lon = longitudes[name_];
        country.lat = latitudes[name_];
        aBasemap.push(country);
    });

    for (i = 0; i < aBasemap.length; i++) {
        var b = new Country(aBasemap[i].name
            , aBasemap[i].code
            , aBasemap[i].population
            , aBasemap[i].lat
            , aBasemap[i].lon);
        baseMap.push(b);
    }

    //+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
    //CREATE WARS ARRAY
    table_wars.getRows().forEach(function (row) {
        var warName = row.getString("WarName");
        var participantName = row.getString("StateName");
        var startYear = int(row.getString("StartYear1"));
        var startMonth = int(row.getString("StartMonth1"));
        var startDay = int(row.getString("StartDay1"));
        var endYear = int(row.getString("EndYear1"));
        var endMonth = int(row.getString("EndMonth1"));
        var endDay = int(row.getString("EndDay1"));
        var batDeaths = int(row.getString("BatDeath"));
        var cSide = int(row.getString("Side"));
        var startDate = new ODate(startYear, startMonth, startDay);
        var endDate = new ODate(endYear, endMonth, endDay);
        var participant = new Participant(participantName, startDate, endDate, cSide, batDeaths);

        var war = getWar(warName);
        if (war == "false") {
            var myWar = new War(warName);
            myWar.participants.push(participant);
            wars.push(myWar);
        } else {
            war.participants.push(participant);
        }
    });

    function getWar(name) {
        for (var i = 0; i < wars.length; i++) {
            var war = wars[i];
            if (war.name == name) {
                return war;
            }
        }
        return "false";

    }

    for (var i = 0; i < wars.length; i++) {
        var m = new Bar(wars[i].name
            , wars[i].participants);
        warTimeline.push(m);
    }

    //+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
    //CREATE WARCOUNTRIES ARRAY (WARS BY LINE)
    table_wars.getRows().forEach(function (row) {
        var battleNum = int(row.getString("LineNum"));
        var warName = row.getString("WarName");
        var participantName = row.getString("StateName");
        var startYear = int(row.getString("StartYear1"));
        var endYear = int(row.getString("EndYear1"));
        var batDeaths = int(row.getString("BatDeath"));
        var cSide = int(row.getString("Side"));

        linenumbers[battleNum] = "someOdd";
        battles[battleNum] = warName;
        countries[battleNum] = participantName;
        entryyears[battleNum] = startYear;
        exityears[battleNum] = endYear;
        alliances[battleNum] = cSide;
        deaths[battleNum] = batDeaths;

    });

    Object.keys(linenumbers).forEach(function (name_) {
        var country = {};
        country.warName = battles[name_];
        country.country = countries[name_];
        country.start = entryyears[name_];
        country.end = exityears[name_];
        country.side = alliances[name_];
        country.deaths = deaths[name_]
        warCountries.push(country);
    });

}

//+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
//DRAW
function draw() {
    background(0, 0, 100, 100);

    timeline();

    baseMap.forEach(function (b) {
        b.update();
        b.draw();
    });

    warTimeline.forEach(function (w) {
        w.update();
        w.draw();
    });
    
    collision();

    introBox();
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
//INTROBOX
function introBox() {
    var mouseBox = false;
    var mouseEye = false;
    var closeBoxPos = createVector(width / 2 - 60, height / 2 + 100);
    var infoBoxPos = createVector(width * 0.925, height * 0.025);

    function mouseOnBox() {
        mouseBox = collidePointRect(mouseX, mouseY
            , closeBoxPos.x
            , closeBoxPos.y
            , 120
            , 40);
    }

    function checkEye() {
        mouseEye = collidePointRect(mouseX, mouseY
            , infoBoxPos.x
            , infoBoxPos.y
            , 60
            , 30)
    }

    checkBox(this);
    checkEye(this);

    if (boxLive) {
        noStroke();
        fill(350, 5, 40, 40);
        rect(0, 0, width, height);

        noStroke();
        fill(350, 0, 100, 100);
        rect(width / 2 - 300
            , height / 2 - 200
            , 600
            , 400
            , 1);

        textAlign(CENTER, TOP);
        textFont(roboBold);
        textSize(36);
        fill(350, 5, 0, 100);
        text(title, width / 2, height / 2 - 150);

        textAlign(CENTER, TOP);
        textFont(roboBold);
        textSize(18);
        fill(350, 5, 0, 100);
        text(date, width / 2, height / 2 - 100);

        textAlign(CENTER, TOP);
        textFont(roboRegular);
        textSize(14);
        fill(350, 5, 40, 100);
        text(description, width / 2, height / 2 - 50);

        noStroke();
        fill(350, 100, 100, 70);
        rect(width / 2 + 160, height / 2 + 200, 0.5, -100);
        rect(width / 2 + 160, height / 2 + 80, 80, 60);
        
        noStroke();
        fill(350, 0, 0, 70);
        rect(width / 2 + 200, height / 2 + 200, 0.5, -80);
        rect(width / 2 + 200, height / 2 + 120, 60, 40);
        
        mouseOnBox();

        if (mouseBox) {
            noStroke();
            fill(350, 100, 100, 100);
            rect(closeBoxPos.x, closeBoxPos.y, 120, 40, 1);

            textAlign(CENTER, CENTER);
            textFont(roboBold);
            textSize(14);
            fill(350, 0, 100, 100);
            text("Ok, got it", width / 2, closeBoxPos.y + 20);
        } else {
            noStroke();
            fill(350, 1, 90, 100);
            rect(closeBoxPos.x, closeBoxPos.y, 120, 40, 1);

            textAlign(CENTER, CENTER);
            textFont(roboBold);
            textSize(14);
            fill(350, 5, 40, 100);
            text("Ok, got it", width / 2, closeBoxPos.y + 20);
        }
    } else {
        if (mouseEye) {
            noStroke();
            fill(350, 100, 100, 100);
            rect(infoBoxPos.x, infoBoxPos.y, 60, 30, 1);

            textAlign(CENTER, CENTER);
            textFont(roboBold);
            textSize(14);
            fill(350, 0, 100, 100);
            text("info", infoBoxPos.x + 30, infoBoxPos.y + 16);
        } else {
            noStroke();
            fill(350, 1, 90, 100);
            rect(infoBoxPos.x, infoBoxPos.y, 60, 30, 1);

            textAlign(CENTER, CENTER);
            textFont(roboBold);
            textSize(14);
            fill(350, 5, 40, 100);
            text("info", infoBoxPos.x + 30, infoBoxPos.y + 16);
        }
    }

    function checkBox() {
        if (mouseEye == true && mouseIsPressed) {
            boxLive = true;
        }

        if (mouseBox == true && mouseIsPressed) {
            boxLive = false;
        }
    }

    checkBox(this);

}

//+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
//COUNTRIES
var Country = function (name, code, population, lon, lat) {
    if (width > 1250) {
        this.population = sqrt(population * 85) * .0006;
        this.lon = (lon * 5.5) + height * 0.625;
        this.lat = (lat * 4.75) + width * 0.365;
        this.pos = createVector(this.lat, this.lon);
        this.boxSize = createVector(this.population * 1.8, this.population * 0.8);
    } else {
        this.population = sqrt(population * 55) * .00045;
        this.lon = (lon * 3.95) + height * 0.65;
        this.lat = (lat * 3.05) + width * 0.35;
        this.pos = createVector(this.lat, this.lon);
        this.boxSize = createVector(this.population * 1.8, this.population * 0.9);
    }

    this.name = name;
    this.code = code;
    this.center = createVector(this.pos.x + (this.boxSize.x / 2)
        , this.pos.y + (this.boxSize.y / 2));

    var ismyMouseOver = false;
    var theseWars = [];
    var theseDeaths = 0;

    this.update = function () {
        checkmyMouse(this);
    }

    this.draw = function () {
        if (mouseWasPressed && ismyMouseOver == true) {
                findWars(this);
                mouseWasPressed = false;
            }
        
        if (!boxLive && ismyMouseOver == true) {
            textFont(roboBold);
            noFill();
            stroke(350, 100, 100, 80);
            strokeWeight(sqrt(this.population)/7);
            textSize(this.population);
            text(this.code, this.pos.x, this.pos.y + this.boxSize.y);

            noStroke();
            textFont(roboBold);
            fill(350, 1, 30, 100);
            textSize(24);
            text(this.name
                , width * .51
                , height * .002 + 26);
            
             if (mouseIsPressed) {
                myWars.forEach(function (p) {
                    p.update();
                    p.draw();
                });
                                
                textFont(roboRegular);
                fill(350, 1, 50, 100);
                textSize(12);
                text("total country deaths: " + nfc(theseDeaths)
                    , width * 0.51
                    , height * 0.002 + 44);
                
                var theseWarstxt = theseWars.join("\n");
                textFont(roboRegular);
                fill(350, 1, 30, 100);
                textSize(12);
                text(theseWarstxt, width * .51, height * 0.002 + 60);
            }
            
        } else {
            textFont(roboBold);
            noFill();
            stroke(0, 0, 80);
            strokeWeight(sqrt(this.population)/8);
            textSize(this.population);
            text(this.code, this.pos.x, this.pos.y + this.boxSize.y);
        }
    }

    function checkmyMouse(instance) {
        ismyMouseOver = collidePointRect(mouseX, mouseY
            , instance.pos.x
            , instance.pos.y
            , instance.boxSize.x
            , instance.boxSize.y);
    }

    function findWars(instance) {
        myWars = [];
        theseWars = [];
        for (var i = 0; i < warCountries.length; i++) {
            var myWar = function () {
                if (warCountries[i].country == instance.name) {
                    theseWars.push(warCountries[i].start + " " + warCountries[i].warName);
                    theseDeaths += warCountries[i].deaths;
                    return warCountries[i].warName;
                }
            }();
            for (var j = 0; j < wars.length; j++) {
                if (wars[j].name == myWar) {
                    var k = new CountryBar(wars[j].name
                        , instance.name
                        , wars[j].participants)
                    myWars.push(k);
                }
            }
        }
    }
}

var CountryBar = function (warName, cName, participants) {
    this.cName = cName;
    this.warName = warName;
    this.barPos = getBarPos(this.warName);
    this.barSize = getBarSize(this.warName);
    this.participants = participants;
    var myParticipants = this.participants;

    var mySides = [];
    for (var i = 0; i < myParticipants.length; i++) {
        var k = new AllyEnemy(myParticipants[i].country
            , myParticipants[i].cSide
            , myParticipants[i].batDeaths
            , myParticipants[i].startDate
            , myParticipants[i].endDate);
        mySides.push(k);
    }

    this.update = function () {

    }

    this.draw = function () {
        noStroke();
        fill(350, 100, 100, 100);
        rect(this.barPos.x - 1, this.barPos.y - 1, this.barSize.x + 2, this.barSize.y + 2);

        mySides.forEach(function (m) {
            m.draw();
        });
    }
}

var AllyEnemy = function (country, cSide, batDeaths, startDate, endDate) {
    this.country = country;
    this.side = cSide;
    this.deaths = batDeaths;
    var color = map(this.side, 1, 2, 0, 100);
    this.pos = getCountryPos(this.country);
    this.pop = getCountryPop(this.country);
    this.code = getCountryCode(this.country);
    this.textBoxSize = getTextBoxSize(this.country);
    this.draw = function () {
        noStroke();
        fill(350, 100, color, 100);
        textFont(roboBold);
        textSize(this.pop);
        text(this.code, this.pos.x, this.pos.y + this.textBoxSize.y);
    }

}

//+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
//BARS + FLAGS
var Bar = function (name, participants) {
    this.name = name;
    this.participants = participants;
    var myParticipants = this.participants;
    var myFlags = [];
    var sideOne = [];
    var sideTwo = [];
    this.deathTot = 0;
    for (var i = 0; i < myParticipants.length; i++) {
        var k = new Flag(myParticipants[i].country
            , myParticipants[i].cSide
            , myParticipants[i].batDeaths
            , myParticipants[i].startDate
            , myParticipants[i].endDate);
        myFlags.push(k);

        if (myParticipants[i].cSide == 1) {
            sideOne.push(myParticipants[i].country + ": " + nfc(myParticipants[i].batDeaths))
        } else {
            sideTwo.push(myParticipants[i].country + ": " + nfc(myParticipants[i].batDeaths))
        };

        this.deathTot += myParticipants[i].batDeaths;
    }

    var sideOnetxt = sideOne.join("\n");
    var sideTwotxt = sideTwo.join("\n");

    this.startDate = myFlags[0].startDate;
    this.endDate = myFlags[0].endDate;
    this.warDuration = (this.endDate - this.startDate) * 2;
    this.barSize = createVector(1, sqrt(sqrt(this.deathTot)) * (height * .00275));
    this.pos = createVector((map(this.startDate, 1820, 2003, width * .0225, width * .478))
        , height * .125 - (this.barSize.y / 2));

    var isMouseOver = false;

    this.update = function () {
        checkMouse(this);
    }

    this.draw = function () {
        if (!boxLive && isMouseOver == true) {
            noStroke();
            fill(350, 100, 100, 80);
            myRect(this);
            
            textFont(roboBold);
            fill(350, 1, 30, 100);
            textSize(24);
            text(this.name
                , width * .51
                , height * .002 + 26);

            textFont(roboRegular);
            fill(350, 1, 70, 100);
            textSize(12);
            text("total war deaths: " + nfc(this.deathTot)
                , width * 0.51
                , height * 0.002 + 44);

            textFont(roboRegular);
            fill(350, 1, 0, 100);
            textSize(12);
            text(sideOnetxt, width * .51, height * 0.002 + 60)

            textFont(roboRegular);
            fill(350, 100, 100, 100);
            textSize(12);
            text(sideTwotxt, width * .75, height * 0.002 + 60)

            myFlags.forEach(function (m) {
                m.draw(name);
            });

            textFont(roboBold);
            fill(350, 100, 100, 80);
            textSize(10);
            text(floor(this.startDate), this.pos.x, height * .02 + 11);

        } else {
            noStroke();
            fill(350, 1, 40, 100);
            myRect(this);
        };

    }

    function myRect(instance) {
        rect(instance.pos.x, instance.pos.y, instance.barSize.x, instance.barSize.y);
    }

    function checkMouse(instance) {
        isMouseOver = collidePointRect(mouseX, mouseY
            , instance.pos.x
            , instance.pos.y
            , instance.barSize.x + 10
            , instance.barSize.y);
    }

}

var Flag = function (country, cSide, batDeaths, startDate, endDate) {
    this.country = country;
    this.side = cSide;
    this.deaths = batDeaths;
    this.startDate = getDecimalDate(startDate);
    this.endDate = getDecimalDate(endDate);

    this.size = sqrt(this.deaths) * 0.15;
    var color = map(this.side, 1, 2, 0, 100);
    this.pos = getCountryCenter(this.country);
    this.warDuration = (this.endDate - this.startDate) * 4;

    this.draw = function (warName) {
        noStroke();
        fill(350, 100, color, 70);
        rect(this.pos.x, this.pos.y, 0.5, -25);
        rect(this.pos.x, this.pos.y - 25, this.size, this.size * -.75);
    }
}

function timeline() {
    noStroke();
    var textY = (height * .02);
    textFont(roboBold);
    fill(350, 1, 70, 100);
    textSize(10);
    text(1820, width * 0.015, textY);
    text(1850, width * 0.088, textY);
    text(1900, width * 0.215, textY);
    text(1950, width * 0.34, textY);
    text(2000, width * 0.465, textY);

    rect(width * 0.05, textY - 6, 1, 4);
    rect(width * 0.07, textY - 6, 1, 4);

    rect(width * 0.125, textY - 6, 1, 4);
    rect(width * 0.15, textY - 6, 1, 4);
    rect(width * 0.175, textY - 6, 1, 4);
    rect(width * 0.2, textY - 6, 1, 4);

    rect(width * 0.25, textY - 6, 1, 4);
    rect(width * 0.275, textY - 6, 1, 4);
    rect(width * 0.3, textY - 6, 1, 4);
    rect(width * 0.325, textY - 6, 1, 4);

    rect(width * 0.375, textY - 6, 1, 4);
    rect(width * 0.4, textY - 6, 1, 4);
    rect(width * 0.425, textY - 6, 1, 4);
    rect(width * 0.45, textY - 6, 1, 4);
}

//+~+~+~+~+~+~+~+~+~+~+~+~+~++~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~+~
//MISC.
function getCountryCenter(name) {
    for (var i = 0; i < baseMap.length; i++) {
        if (baseMap[i].name == name) {
            return baseMap[i].center;
        }
    }
}

function getBarPos(war) {
    for (var j = 0; j < warTimeline.length; j++) {
        if (warTimeline[j].name == war) {
            return warTimeline[j].pos;
        }
    }
}

function getBarSize(war) {
    for (var k = 0; k < warTimeline.length; k++) {
        if (warTimeline[k].name == war) {
            return warTimeline[k].barSize;
        }
    }
}

function getCountryPos(name) {
    for (var i = 0; i < baseMap.length; i++) {
        if (baseMap[i].name == name) {
            return baseMap[i].pos;
        }
    }
}

function getCountryPop(name) {
    for (var i = 0; i < baseMap.length; i++) {
        if (baseMap[i].name == name) {
            return baseMap[i].population;
        }
    }
}

function getCountryCode(name) {
    for (var i = 0; i < baseMap.length; i++) {
        if (baseMap[i].name == name) {
            return baseMap[i].code;
        }
    }
}

function getTextBoxSize(name) {
    for (var i = 0; i < baseMap.length; i++) {
        if (baseMap[i].name == name) {
            return baseMap[i].boxSize;
        }
    }
}

function mousePressed() {
    mouseWasPressed = true;
}

function collision() {
    for (var STEPS = 0; STEPS < 4; STEPS++) {
        for (var i = 0; i < baseMap.length - 1; i++) {
            for (var j = i + 1; j < baseMap.length; j++) {
                var pa = baseMap[i];
                var pb = baseMap[j];
                var ab = p5.Vector.sub(pa.center, pb.center);
                var hit = false;
                hit = collideRectRect(pa.pos.x, pa.pos.y, pa.boxSize.x, pa.boxSize.y
                    , pb.pos.x, pb.pos.y, pb.boxSize.x, pb.boxSize.y);
                if (hit) {
                    ab.normalize();
                    ab.mult(.5);
                    pa.pos.add(ab.x, ab.y);
                    ab.mult(-1);
                    pb.pos.add(ab);

                    pa.center.set(pa.pos.x + pa.boxSize.x / 2, pa.pos.y + pa.boxSize.y / 2);
                    pb.center.set(pb.pos.x + pb.boxSize.x / 2, pb.pos.y + pb.boxSize.y / 2);

                }
            }
        }
    }
}

var War = function (name) {
    this.name = name;
    this.participants = [];
}

var Participant = function (country, startDate, endDate, cSide, batDeaths) {
    this.country = country;
    this.startDate = startDate;
    this.endDate = endDate;
    this.cSide = cSide;
    this.batDeaths = batDeaths;
}

var ODate = function (AAAA, MM, DD) {
    this.year = AAAA;
    this.month = MM;
    this.day = DD;
}

function getDecimalDate(date) {
    return date.year + (date.month - 1) / 12 + (date.day - 1) / 365;
}
