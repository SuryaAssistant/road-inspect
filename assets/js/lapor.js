// =========================================================================================
// Blockchain Configuration
// =========================================================================================
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
function report(){
    let reportDescription = document.getElementById('laporDesc').value;

    // Create special JSON format
    productJSON = "{'type':'report','issuer':'"+issuer+"','roadName':'"+clickedRoad+"','lat':'"+clickedLatitude+"','long':'"+clickedLongitude+"','desc':'"+reportDescription+"'}";
    
    //Connect Websocket 
    wsConnect();
}

// =========================================================================================
// Road Fixing Report
//
// Description:
// Get road properties and then call mqtt connect
// =========================================================================================

function report_fixing(){
    let roadName = document.getElementById('nama_jalan').textContent;
    let mainTicket = document.getElementById('laporTiket').textContent;
    let reportLat = document.getElementById('laporLat').value;
    let reportLong = document.getElementById('laporLong').value;
    let reportDescription = document.getElementById('laporDesc').value;

    // Create special JSON format
    productJSON = "{'type':'fixing','issuer':'"+issuer+"','ticket':'"+mainTicket+"','roadName':'"+roadName+"','lat':'"+reportLat+"','long':'"+reportLong+"','desc':'"+reportDescription+"'}";
    
    //Connect websocket 
    wsConnect();
}

// =========================================================================================
// Finished Progress Report
//
// Description:
// Get road properties and then call mqtt connect
// =========================================================================================

function report_finish(){
    let roadName = document.getElementById('nama_jalan').textContent;
    let mainTicket = document.getElementById('laporTiket').textContent;
    let reportLat = document.getElementById('laporLat').value;
    let reportLong = document.getElementById('laporLong').value;
    let reportDescription = document.getElementById('laporDesc').value;

    // Create special JSON format
    productJSON = "{'type':'finish','issuer':'"+issuer+"','ticket':'"+mainTicket+"','roadName':'"+roadName+"','lat':'"+reportLat+"','long':'"+reportLong+"','desc':'"+reportDescription+"'}";
    
    //Connect websocket 
    wsConnect();
}


//======================================================================
// Websocket Function
//======================================================================

// connect to websocket
function wsConnect(){
    document.getElementById("lapor_jalan").innerHTML=``;

    // Send a message to the server
    let inputMessage = "data/" + productJSON + '/'+ clientSocket + '/' + blockchainIndex;
    socket.emit('submit', inputMessage);

    // change display
    document.getElementById("lapor_jalan").innerHTML+=`
        <div class="row primecolor">
            <p>Mengunggah laporan ke blockchain . . .</p>
            <p>Harap menunggu. Biasanya memerlukan waktu 1-2 menit</p>
        </div>
    `;
}



socket.on(clientSocket, (msg) => {
    let response=msg;
    // show the data in html
    document.getElementById("lapor_jalan").innerHTML = `
        <div class="row primecolor">
            <p>Laporan berhasil diunggah ke blockchain </p>
            <p>Kode ticket : <a href="./laporan/info.html?tiket=${response}">${response}</a></p>
        </div>
    `;
//    socket.disconnect();
});