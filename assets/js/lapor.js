// =========================================================================================
// Blockchain Configuration
// =========================================================================================
let blockchainIndex = "b48830c9428c8ea62a5d7a3f7c130e077ad1a21cad6b655d79b8d365c544b6c6";

let clickedLatitude;
let clickedLongitude;
let clickedRoad;

let productJSON;

// =========================================================================================
// Data Issuer Identifier
//
// Description: 
// Get issuer ip address and then hash. ==> issuer identifier
// =========================================================================================
let issuer = 'anonymous';

// Fetch the IP address using the ipify API
fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
    const ipAddress = data.ip;
    issuer = CryptoJS.SHA3(ipAddress, { outputLength: 256 }).toString(CryptoJS.enc.Hex);
});


// =========================================================================================
// Damaged Road Report
//
// Description:
// Get road properties and then call mqtt connect
// =========================================================================================
function lapor(){
    let lapor_desc = document.getElementById('laporDesc').value;

    // Create special JSON format
    productJSON = "{'type':'report','issuer':'"+issuer+"','roadName':'"+clickedRoad+"','lat':'"+clickedLatitude+"','long':'"+clickedLongitude+"','desc':'"+lapor_desc+"'}";
    
    //Connect MQTT for 
    MQTTconnect();
}

// =========================================================================================
// Road Fixing Report
//
// Description:
// Get road properties and then call mqtt connect
// =========================================================================================

function perbaikan(){
    let lapor_jalan = document.getElementById('nama_jalan').textContent;
    let lapor_tiket = document.getElementById('laporTiket').textContent;
    let lapor_lat = document.getElementById('laporLat').value;
    let lapor_long = document.getElementById('laporLong').value;
    let lapor_desc = document.getElementById('laporDesc').value;

    // Create special JSON format
    productJSON = "{'type':'fixing','issuer':'"+issuer+"','ticket':'"+lapor_tiket+"','roadName':'"+lapor_jalan+"','lat':'"+lapor_lat+"','long':'"+lapor_long+"','desc':'"+lapor_desc+"'}";
    
    //Connect MQTT for 
    MQTTconnect();
}

// =========================================================================================
// Finished Progress Report
//
// Description:
// Get road properties and then call mqtt connect
// =========================================================================================

function selesaiPerbaikan(){
    let lapor_jalan = document.getElementById('nama_jalan').textContent;
    let lapor_tiket = document.getElementById('laporTiket').textContent;
    let lapor_lat = document.getElementById('laporLat').value;
    let lapor_long = document.getElementById('laporLong').value;
    let lapor_desc = document.getElementById('laporDesc').value;

    // Create special JSON format
    productJSON = "{'type':'finish','issuer':'"+issuer+"','ticket':'"+lapor_tiket+"','roadName':'"+lapor_jalan+"','lat':'"+lapor_lat+"','long':'"+lapor_long+"','desc':'"+lapor_desc+"'}";
    
    //Connect MQTT for 
    MQTTconnect();
}


//======================================================================
// MQTT Function
//======================================================================
// When user is connect to mqtt, subscribe randomized topic and send 
function onConnect(){
    document.getElementById("lapor_jalan").innerHTML=``;

    // Subscribe topic
    mqtt.subscribe(topic);

    // Send submit request to gateway
    // format : submit_special/tag_index/data/return_topic
    let mqtt_msg = "data/" + productJSON + '/'+ returnTopic + '/' + blockchainIndex;
    
    let product_msg = new Paho.MQTT.Message(mqtt_msg);
    product_msg.destinationName = gatewayId + "/submit" ;
    mqtt.send(product_msg);

    // change display
    document.getElementById("lapor_jalan").innerHTML+=`
        <div class="row primecolor">
            <p>Mengunggah laporan ke blockchain . . .</p>
            <p>Harap menunggu. Biasanya memerlukan waktu 1-2 menit</p>
        </div>
    `;
}

function onFailure(){
    console.log("Failed to connect");
    setTimeout(MQTTconnect, reconnectTimeout);
}


// If gateway give response, display it
function onMessageArrived(msg){
    let IOTAResponse=msg.payloadString;

    // show the data in html
    document.getElementById("lapor_jalan").innerHTML = `
        <div class="row primecolor">
            <p>Laporan berhasil diunggah ke blockchain </p>
            <p>Kode ticket : <a href="https://explorer.iota.org/devnet/indexed/${IOTAResponse}">${IOTAResponse}</a></p>
        </div>
    `;
}

// connect to mqtt
function MQTTconnect(){
    console.log("connecting MQTT");
    mqtt = new Paho.MQTT.Client(host,port,"clientjs");

    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure,
    };

    mqtt.onMessageArrived = onMessageArrived;
    mqtt.connect(options);
}