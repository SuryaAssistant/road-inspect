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
// Function to show modal contain road description form
//
// Description:
// Get road properties and then call mqtt connect
// =========================================================================================

function reportRoad(){
    // update row
    $('#modalLaporRusak').modal('show');
    document.getElementById('nama_jalan').textContent = clickedRoad;

    document.getElementById('lapor_jalan').innerHTML = `
    <div class="col padding-left-right" id="blockchain_data">
        <div class="row align-items-center" >
            <div class="mx-auto">
                <!-- Latitude -->
                <div class="mb-3">
                    <label class="form-label form-key primecolor">Latitude</label>
                    <input class="form-control" id="laporLat" value="${clickedLatitude}" disabled>
                </div>
                <!-- Longitude -->
                <div class="mb-3">
                    <label class="form-label form-key primecolor">Longitude</label>
                    <input class="form-control" id="laporLong" value="${clickedLongitude}" disabled>
                </div>
                <!-- Deskripsi -->
                <div class="mb-3">
                    <label class="form-label form-key">Deskripsi kerusakan</label>
                    <textarea class="form-control" id="laporDesc" rows="3" placeholder="Isikan deskripsi kerusakan jalan di sini"></textarea>
                </div>
            </div>
        </div>
    </div>
    `;

    document.getElementById('footer_button').innerHTML = `
    <div class="mb-3">
        <button type="button" class="btn btn-danger mb-3" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-success mb-3" onclick="report()">Laporkan</button>
    </div>
    `;
}

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
        <div class="row primecolor" style="text-align:center">
            <p><b>Terima kasih sudah melaporkan</b></p>
            <br>
            <p>
            <span>Laporan berhasil diunggah ke blockchain.</span>
            <br>
            <span>Sistem akan diperbarui setelah 3-5 menit.</span>
            </p>
            <p>Kode ticket : <a href="./laporan/info.html?tiket=${response}">${response}</a></p>
        </div>
    `;
//    socket.disconnect();
});