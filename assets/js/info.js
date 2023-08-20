//======================================================================
// Blockchain Configuration
//======================================================================
let blockchainIndex = "b48830c9428c8ea62a5d7a3f7c130e077ad1a21cad6b655d79b8d365c544b6c6";
let nomorTiket;

function cariTiket(){
    nomorTiket = document.getElementById('nomor_tiket').value;

    if(nomorTiket != ''){
        //Connect MQTT for 
        MQTTconnect();
        document.getElementById("detail_laporan").innerHTML=`
        `;
    }
}

//======================================================================
// MQTT Function
//======================================================================
// When user is connect to mqtt, subscribe randomized topic and send 
function onConnect(){
    // Subscribe topic
    mqtt.subscribe(topic);

    // Send submit request to gateway
    // format : submit_special/tag_index/data/return_topic
    let mqtt_msg = "payload/" + nomorTiket +'/'+ returnTopic;
    
    let product_msg = new Paho.MQTT.Message(mqtt_msg);
    product_msg.destinationName = gatewayId + "/submit" ;
    mqtt.send(product_msg);

    // change display
    document.getElementById("detail_laporan").innerHTML+=`
        <div class="row primecolor">
            <p>Mencari tiket di blockchain . . .</p>
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
    IOTAResponse = IOTAResponse.replace(/'/g, '"');

    let blockchainData = JSON.parse(IOTAResponse);
    let tanggalLapor = new Date(((blockchainData.message.timestamp))*1000)
    
    // Add market on map
    let getLatitude = blockchainData.message.data.lat;
    let getLongitude = blockchainData.message.data.long
    // Coordinates for the marker
    const markerCoords = [getLatitude, getLongitude];

    // Add a marker (pin) to the map
    const marker = L.marker(markerCoords).addTo(map);

    // show the data in html
    document.getElementById("detail_laporan").innerHTML=`
    <div class="col">
        <div class="section-title">
            <h1 class="" style="text-align: left;">Detail Laporan</h1>
        </div>
        <div class="row">
            <div class="col">
                <span class="form-key">PELAPOR : </span>
                <br><span>${blockchainData.message.data.issuer}</span><br>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <span class="form-key">TANGGAL PELAPORAN : </span>
                <br><span>${tanggalLapor}</span><br>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <span class="form-key">NAMA JALAN : </span>
                <br><span>${blockchainData.message.data.roadName}</span><br>
                <hr>
            </div>
        </div>                                                            
        <div class="row">
            <div class="col">
                <span class="form-key">LATITUDE, LONGITUDE : </span>
                <br><span>${getLatitude},${getLongitude}</span><br>
                <hr>
            </div>
        </div>                                                            
        <div class="row">
            <div class="col">
                <span class="form-key">DESKRIPSI LAPORAN : </span>
                <br><span>${blockchainData.message.data.desc}</span><br>
                <hr>
            </div>
        </div>
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