// =========================================================================================
// Blockchain Configuration
// =========================================================================================
let clickedLatitude;
let clickedLongitude;
let clickedRoad;

let productJSON;
let userKeyword;
let userHashKey;

// =========================================================================================
// Data Issuer Identifier
//
// Description: 
// Get issuer ip address and then hash. ==> issuer identifier
// =========================================================================================
let issuer = 'anonymous';
let getIP = false;

if(getIP == false){
    // Fetch the IP address using the ipify API
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
        const ipAddress = data.ip;
        issuer = CryptoJS.SHA3(ipAddress, { outputLength: 256 }).toString(CryptoJS.enc.Hex);
    });
    getIP = true;
}


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
    document.getElementById('report-ticket').innerHTML = ``;
    document.getElementById('report-type').innerHTML = ``;
    document.getElementById('report-time').innerHTML = ``;
    document.getElementById('ticket-open-in-new-tab').innerHTML = ``;
    
    document.getElementById('description-form').innerHTML = `
        <label class="form-label form-key">Deskripsi kerusakan</label>
        <textarea class="form-control" id="laporDesc" rows="3" placeholder="Isikan deskripsi kerusakan jalan di sini"></textarea>
    `;

    document.getElementById('keyword-form').innerHTML = `
        <label for="keywordform" class="form-label form-key">Kata Kunci</label>
        <input class="form-control" id="laporKey" placeholder="Kata yang mudah Anda hapal">
    `;

    document.getElementById('footer_button').innerHTML = `
        <button type="button" class="btn btn-success mb-3" onclick="report()">Laporkan</button>
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
    userKeyword = document.getElementById('laporKey').value;

    // Calculate userKeyword Hash
    let userKeywordHash = CryptoJS.SHA3(userKeyword, {outputLength: 256}).toString(CryptoJS.enc.Hex);

    // Create special JSON format
    productJSON = "{'type':'report','issuer':'"+issuer+"','roadName':'"+clickedRoad+"','lat':'"+clickedLatitude+"','long':'"+clickedLongitude+"','desc':'"+reportDescription+"','hashKey':'"+userKeywordHash+"'}";
    
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
    let roadName = clickedRoad;
    let mainTicket = document.getElementById('report-ticket').textContent;
    let reportLat = clickedLatitude;
    let reportLong = clickedLongitude;
    let reportDescription = document.getElementById('desc-detail').textContent;
    userKeyword = document.getElementById('laporKey').value;

    // Create special JSON format
    productJSON = "{'type':'fixing','issuer':'"+issuer+"','ticket':'"+mainTicket+"','roadName':'"+roadName+"','lat':'"+reportLat+"','long':'"+reportLong+"','desc':'"+reportDescription+"','hashKey':'"+userHashKey+"'}";
    
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
    let roadName = clickedRoad;
    let mainTicket = document.getElementById('report-ticket').textContent;
    let reportLat = clickedLatitude;
    let reportLong = clickedLongitude;
    let reportDescription = document.getElementById('desc-detail').textContent;
    userKeyword = document.getElementById('laporKey').value;

    // Create special JSON format
    productJSON = "{'type':'finish','issuer':'"+issuer+"','ticket':'"+mainTicket+"','roadName':'"+roadName+"','lat':'"+reportLat+"','long':'"+reportLong+"','desc':'"+reportDescription+"','hashKey':'"+userHashKey+"'}";
    //Connect websocket 
    wsConnect();
}


//======================================================================
// Websocket Function
//======================================================================

// connect to websocket
function wsConnect(){
    document.getElementById("description-form").innerHTML=``;
    document.getElementById("keyword-form").innerHTML=``;

    // Send a message to the server
    let inputMessage = "data/" + productJSON + '/'+ clientSocket + 'lapor' + '/' + blockchainIndex + '/' + userKeyword;
    socket.emit('submit', inputMessage);

    // change display
    document.getElementById("description-form").innerHTML+=`
        <div class="row textprimecolor">
            <p>Mengunggah laporan ke blockchain . . .</p>
            <p>Harap menunggu. Biasanya memerlukan waktu 1-2 menit</p>
        </div>
    `;

    // hide button
    document.getElementById('footer_button').innerHTML = ``;
}



socket.on((clientSocket + 'lapor'), (msg) => {
    let response=msg;

    // if error
    if(response.length != 64){
        // show the data in html
        document.getElementById("description-form").innerHTML = `
            <div class="row textprimecolor" style="text-align:center">
                <p>
                <span><b>${response}</b></span>
                </p>
            </div>
        `;

        // show close button
        document.getElementById('footer_button').innerHTML = `
            <button type="button" class="btn btn-danger mb-3" data-bs-dismiss="modal">Tutup</button>
        `;
    }

    else{
        // show the data in html
        document.getElementById("description-form").innerHTML = `
            <div class="row textprimecolor" style="text-align:center">
                <p><b>Terima kasih sudah melaporkan</b>
                </p>
                <p>Kode ticket : <a href="./laporan/info.html?tiket=${response}">${response}</a></p>
            </div>
        `;


        // show close button
        document.getElementById('footer_button').innerHTML = `
            <button type="button" class="btn btn-danger mb-3" data-bs-dismiss="modal">Tutup</button>
        `;
    }

});