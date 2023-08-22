//======================================================================
// Blockchain Configuration
//======================================================================
let nomorTiket;

function cariTiket(){
    nomorTiket = document.getElementById('nomor_tiket').value;

    if(nomorTiket != ''){
        wsConnect();
        document.getElementById("detail_laporan").innerHTML=`
        `;
    }
}

//======================================================================
// Websocket Function
//======================================================================
const socket = io.connect(socketAddr);

function wsConnect(){
    // Send submit request to gateway
    // format : submit_special/tag_index/data/return_topic
    let inputMessage = "payload/" + nomorTiket +'/'+ clientSocket;
    socket.emit('submit', inputMessage);

    // change display
    document.getElementById("detail_laporan").innerHTML+=`
        <div class="row primecolor">
            <p>Mencari tiket di blockchain . . .</p>
        </div>
    `;
}


socket.on(clientSocket, (msg) => {
    let IOTAResponse = msg.replace(/'/g, '"');

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
});

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

