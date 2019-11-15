window.addEventListener("load", load);

let redlining;
let poverty;
let overlay;
let mapboxToken = 'pk.eyJ1IjoibmRldjAyIiwiYSI6ImNrMnE5aXNraTBjdXMzZG13d252eHQzYXAifQ.GBFwNiFFnh7EndNfDOmY0Q';
let mapStyle = 'mapbox.pencil';

let currentMap = 0;

let mapInformation = [
    {
        "title": "REDLINING",
        "description": [
            "Redlining is the systematic denial of various services to residents of specific, often racially associated, neighborhoods or communities, either directly or through the selective raising of prices.",
            "The map to the right shows how the United States government and the Home Owners Loan Corporation (HOLC) redlined Rochester, NY, in the 1930s. Click on a colored region to see what HOLC described it as.",
            "<ul><li>Map Key</li><li>Green = 'The Best'</li><li>Blue = 'Still Desireable'</li><li>Yellow = 'Definitely Declining'</li><li>Red = 'Hazardous'</li></ul>"
        ]
    },
    {
        "title": "POVERTY",
        "description": [
            "The map to the right depicts the median household incomes in Rochester, NY according to 2017 Census data. The poverty threshold of New York State was $33,562 in 2017. Click on a colored region to see the median household income for that region.",
            "<ul><li>Map Key</li><li>Green = Income > $77,500</li><li>Blue = Income > $49,500</li><li>Yellow = Income > $36,000</li><li>Red = Income < $36,000 </li></ul>"
        ]
    },
    {
        "title": "OVERLAY",
        "description": [
            "The map to the right depicts Rochester, NY, as it was redlined in the 1930s as well as the economic status of these communities in Rochester today. The outline color represents the redline grade the area was given and the fill color represents the median household income for that region. Click on a region for more information.",
            "<ul><li>Map Key - Outline</li><li>Green = 'The Best'</li><li>Blue = 'Still Desireable'</li><li>Yellow = 'Definitely Declining'</li><li>Red = 'Hazardous'</li></ul><ul><li>Map Key - Fill</li><li>Green = Income > $77,500</li><li>Blue = Income > $49,500</li><li>Yellow = Income > $36,000</li><li>Red = Income < $36,000 </li></ul>"
        ]
    }
]

function load() {

    setMap("REDLINING");

}

function nextMap() {

    currentMap++;
    if (currentMap > 2) {

        currentMap = 0;

    }
    setMap(mapInformation[currentMap].title);

}

function prevMap() {

    currentMap--;
    if (currentMap < 0) {

        currentMap = 2;

    }
    setMap(mapInformation[currentMap].title);

}

function setMap(name) {

    switch (name) {

        case "REDLINING": {

            let mapElm = document.querySelector("#redlining");

            mapElm.removeAttribute("hidden");
            document.querySelector("#poverty").setAttribute("hidden", "true");
            document.querySelector("#overlay").setAttribute("hidden", "true");

            document.querySelector("#map-title").innerHTML = mapInformation[0].title;
            document.querySelector("#map-details").innerHTML = mapInformation[0].description.join("<br/><br/>");

            redlining = L.map('redlining').setView([43.1566, -77.6088], 13);
            L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}`, {
                id: mapStyle,
                accessToken: mapboxToken,
                minZoom: 12
            }).addTo(redlining);

            fetch("redlining-rocny.geojson").then(res => res.json()).then(data => redliningData(data));

        } break;

        case "POVERTY": {

            let mapElm = document.querySelector("#poverty");

            mapElm.removeAttribute("hidden");
            document.querySelector("#redlining").setAttribute("hidden", "true");
            document.querySelector("#overlay").setAttribute("hidden", "true");

            document.querySelector("#map-title").innerHTML = mapInformation[1].title;
            document.querySelector("#map-details").innerHTML = mapInformation[1].description.join("<br/><br/>");

            poverty = L.map('poverty').setView([43.1566, -77.6088], 13);
            L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}`, {
                id: mapStyle,
                accessToken: mapboxToken,
                minZoom: 12
            }).addTo(poverty);

            fetch("poverty-rocny.geojson").then(res => res.json()).then(data => {

                let filteredFeatures = data.features.filter(f => f.properties["ID Year"] == "2017");
                data.features = filteredFeatures;
                povertyData(data);

            });

        } break;

        case "OVERLAY": {

            let mapElm = document.querySelector("#overlay");

            mapElm.removeAttribute("hidden");
            document.querySelector("#redlining").setAttribute("hidden", "true");
            document.querySelector("#poverty").setAttribute("hidden", "true");

            document.querySelector("#map-title").innerHTML = mapInformation[2].title;
            document.querySelector("#map-details").innerHTML = mapInformation[2].description.join("<br/><br/>");

            overlay = L.map('overlay').setView([43.1566, -77.6088], 13);
            L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}`, {
                id: mapStyle,
                accessToken: mapboxToken,
                minZoom: 12
            }).addTo(overlay);

            fetch("poverty-rocny.geojson").then(res => res.json()).then(data => {

                let filteredFeatures = data.features.filter(f => f.properties["ID Year"] == "2017");
                data.features = filteredFeatures;

                fetch("redlining-rocny.geojson").then(r => r.json()).then(d => {

                    overlayData(d, data);

                });

            });

        } break;

    }

}

function redliningData(data) {

    // console.log(data.features[0].properties); // Debug see properties

    let styles = {
        a: {
            fillColor: "#00ff00",
            color: "#333333",
            weight: 2,
        },
        b: {
            fillColor: "#0000ff",
            color: "#333333",
            weight: 2,
        },
        c: {
            fillColor: "#ffff00",
            color: "#333333",
            weight: 2,
        },
        d: {
            fillColor: "#ff0000",
            color: "#333333",
            weight: 2,
        }
    }

    let options = {
        style: function (feature) {

            return styles[feature.properties.holc_grade.toLowerCase()];

        },
        onEachFeature: function (feature, layer) {

            if (feature.properties) {

                let popup = `<label style='font-weight:bold;'>${feature.properties.area_description_data[9]}</label><br/>${feature.properties.area_description_data[8]}`;
                layer.bindPopup(popup);

            }

        }
    }

    L.geoJSON(data, options).addTo(redlining);

}

function povertyData(data) {

    // console.log(data.features[0].properties); // Debug see properties

    let styles = {
        high: {
            fillColor: "#00ff00",
            color: "#333333",
            weight: 2,
        },
        moderate: {
            fillColor: "#0000ff",
            color: "#333333",
            weight: 2,
        },
        declining: {
            fillColor: "#ffff00",
            color: "#333333",
            weight: 2,
        },
        low: {
            fillColor: "#ff0000",
            color: "#333333",
            weight: 2,
        }
    }

    let options = {

        style: function (feature) {

            let income = feature.properties["Household Income by Race"];
            if (income > 77500) {

                return styles.high;

            } else if (income > 49500) {

                return styles.moderate;

            } else if (income > 36000) {

                return styles.declining;

            } else {

                return styles.low;

            }

        },
        onEachFeature: function (feature, layer) {

            if (feature.properties) {

                let firstTwo = `${feature.properties["Household Income by Race"]}`.substring(0, 2);
                let remaining = `${feature.properties["Household Income by Race"]}`.substring(2, `${feature.properties["Household Income by Race"]}`.length);
                let income = firstTwo + "," + remaining;
                let popup = `<label style='font-weight:bold;'>${feature.properties.Geography} ${feature.properties["ID Year"]}</label><br/>Median Household Income: $${income}`;
                layer.bindPopup(popup);

            }

        }
    }

    L.geoJSON(data, options).addTo(poverty);

}

function overlayData(redlining, poverty) {

    let stylesR = {
        a: {
            fillColor: "#00000000",
            opacity: 1,
            color: "#00ff00ff",
            weight: 3,
        },
        b: {
            fillColor: "#00000000",
            opacity: 1,
            color: "#0000ffff",
            weight: 3,
        },
        c: {
            fillColor: "#00000000",
            opacity: 1,
            color: "#ffff00ff",
            weight: 3,
        },
        d: {
            fillColor: "#00000000",
            opacity: 1,
            color: "#ff0000ff",
            weight: 3,
        }
    }

    let optionsR = {
        style: function (feature) {

            return stylesR[feature.properties.holc_grade.toLowerCase()];

        },
        interactive: false
    }

    let stylesP = {
        high: {
            fillColor: "#00ff00",
            stroke: false
        },
        moderate: {
            fillColor: "#0000ff",
            stroke: false
        },
        declining: {
            fillColor: "#ffff00",
            stroke: false
        },
        low: {
            fillColor: "#ff0000",
            stroke: false
        }
    }

    let optionsP = {

        style: function (feature) {

            let income = feature.properties["Household Income by Race"];
            if (income > 77500) {

                return stylesP.high;

            } else if (income > 49500) {

                return stylesP.moderate;

            } else if (income > 36000) {

                return stylesP.declining;

            } else {

                return stylesP.low;

            }

        },
        onEachFeature: function (feature, layer) {

            if (feature.properties) {

                let firstTwo = `${feature.properties["Household Income by Race"]}`.substring(0, 2);
                let remaining = `${feature.properties["Household Income by Race"]}`.substring(2, `${feature.properties["Household Income by Race"]}`.length);
                let income = firstTwo + "," + remaining;
                let popup = `<label style='font-weight:bold;'>${feature.properties.Geography} ${feature.properties["ID Year"]}</label><br/>Median Household Income: $${income}`;
                layer.bindPopup(popup);

            }

        }

    }

    L.geoJSON(poverty, optionsP).addTo(overlay);
    L.geoJSON(redlining, optionsR).addTo(overlay);

}

function reveal() {
    
    let overlay = document.querySelector(".map-overlay");
    overlay.classList.add("fade-out");

}