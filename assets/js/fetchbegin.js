// =========================================================================================
// Short data by timestamp
// =========================================================================================
function compareByTimestamp(a, b) {
    if (a[1].message.timestamp < b[1].message.timestamp) {
      return 1;
    }
    if (a[1].message.timestamp > b[1].message.timestamp) {
      return -1;
    }
    return 0;
}

function copyJSON(fromJSON, toJSON, value, equal){
    let count = 0;

    if(equal == 0){
        for(let i=0; i<fromJSON.length; i++){
            if(fromJSON[i][1].message.data.type != value){
                toJSON[count] = fromJSON[i];
                count +=1;
            }
        }
    }

    if(equal == 1){
        for(let i=0; i<fromJSON.length; i++){
            if(fromJSON[i][1].message.data.type == value){
                toJSON[count] = fromJSON[i];
                count +=1;
            }
        }
    }
}

function replaceJSON(fromJSON, toJSON, value){
    for(let i=0; i<fromJSON.length; i++){
        if(fromJSON[i][1].message.data.type == value){
            // search in toJSON with selected id
            let targetTicket = fromJSON[i][1].message.data.ticket;
            for(let i=0; i<toJSON.length; i++){
                if(toJSON[i][0].msgID == targetTicket){
                    toJSON[i][1].message.data.type = value;
                }
            }
        }
    }
}

// check if there is a cache
const cachedData = localStorage.getItem('dataBlockchain');
let blockchainFullData = [];
let cachedTimestamp = 0;

if (cachedData) {
    // convert cache to JSON
    console.log("cached data = " + cachedData);
    blockchainFullData = JSON.parse(localStorage['dataBlockchain']);
    if(blockchainFullData[0] == undefined){
        console.log("undefined");
    }
    else{
        cachedTimestamp = blockchainFullData[0][1].message.timestamp;
        // show data first   
    }
} 

//======================================================================
// Websocket Configuration
//======================================================================
// create random number for socket event
const randomNumber = Math.random() * 10000000;
const clientSocket = String(Math.floor(randomNumber));

//======================================================================
// Websocket Function
//======================================================================
const socket = io.connect(socketAddr);
let fetch_begin = false;

// Event listener for connection
socket.on('connect', () => {
    if(fetch_begin == false){
        // Send a message to the server
        let inputMessage = "tag_msg_filter/" + blockchainIndex + '/'+ clientSocket + '/' + '>:' + cachedTimestamp + '/' + '"message"' + '/' + '"timestamp"';
        socket.emit('submit', inputMessage);
    }
});


// Event listener for receiving messages from the server
socket.on(clientSocket, (msg) => {
    if(fetch_begin == false){
        let fullMsg = msg.replace(/'/g, '"');
        console.log(fullMsg);
        let newReportedData;
        if(fullMsg != '[]'){
            newReportedData = JSON.parse(fullMsg);
            let lastLength = blockchainFullData.length;

            // add new data to last cached data
            for(let i=0; i<newReportedData.length; i++){
                blockchainFullData[lastLength + i] = newReportedData[i];
            }

            blockchainFullData.sort(compareByTimestamp);

            // save newest data
            localStorage['dataBlockchain'] = JSON.stringify(blockchainFullData);
        }

        // Copy JSON with 'report' to filteredBlockchain
        let filteredBlockchain = []
        copyJSON(blockchainFullData, filteredBlockchain, 'report', 1)
    
        // if there is 'fixing' in blockchainFullData,  
        // replace filteredBlockchain to 'fixing'
        replaceJSON(blockchainFullData, filteredBlockchain, 'fixing')
    
        // if there is 'finish' in blockchainFullData,  
        // replace filteredBlockchain to 'finish'
        replaceJSON(blockchainFullData, filteredBlockchain, 'finish')
    
        // Copy JSON without 'finish' to blockchainReport
        let blockchainReport = []
        copyJSON(filteredBlockchain, blockchainReport, 'finish', 0)
    
        // sort JSON
        blockchainReport.sort(compareByTimestamp);

        // show coordinate on map
        for(let i=0; i<blockchainReport.length; i++){
            let getLatitude = blockchainReport[i][1].message.data.lat;
            let getLongitude = blockchainReport[i][1].message.data.long
            // Coordinates for the marker and colorize
            const markerCoords = [getLatitude, getLongitude];
            var marker = L.marker(markerCoords).addTo(map);
            if(blockchainReport[i][1].message.data.type == 'report'){
                marker._icon.classList.add("red");
            }
            if(blockchainReport[i][1].message.data.type == 'fixing'){
                marker._icon.classList.add("yellow");
            }
            
            marker.on('click', function () {
                $('#modalLaporRusak').modal('show');
                document.getElementById('nama_jalan').textContent = blockchainReport[i][1].message.data.roadName;
    
                if(blockchainReport[i][1].message.data.type == 'report'){
                    document.getElementById('lapor_jalan').innerHTML = `
                    <div class="col padding-left-right" id="blockchain_data">
                    <div class="row align-items-center">
                        <div class="mx-auto">
                            <div class="row" style="text-align:center">
                            <span class="badge bg-danger">Jalan Rusak</span>
                            </div>
                            <p class="primecolor" style="text-align:center">
                            <span>Kode tiket : </span><span id="laporTiket" class="modal-tiket">${blockchainReport[i][0].msgID}</span>
                            </p>
                            <!-- Latitude -->
                            <div class="mb-3">
                                <label class="form-label form-key primecolor modal-form">Latitude</label>
                                <input class="form-control modal-form" id="laporLat" value="${getLatitude}" disabled>
                            </div>
                            <!-- Longitude -->
                            <div class="mb-3">
                                <label class="form-label form-key primecolor modal-form">Longitude</label>
                                <input class="form-control modal-form" id="laporLong" value="${getLongitude}" disabled>
                            </div>
                            <!-- Deskripsi -->
                            <div class="mb-3">
                                <label class="form-label form-key modal-form">Deskripsi perbaikan</label>
                                <textarea class="form-control modal-form" id="laporDesc" rows="3" placeholder="Tuliskan kerusakan jalan di sini ..."></textarea>
                            </div>
                        </div>
                    </div>
                    </div>
                    `;
    
                    document.getElementById('footer_button').innerHTML = `
                    <div class="mb-3">
                        <button type="button" class="btn btn-danger mb-3" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-success mb-3" onclick="report_fixing()">Laporkan Perbaikan</button>
                    </div>
                    `;
                }
    
                if(blockchainReport[i][1].message.data.type == 'fixing'){
                    document.getElementById('lapor_jalan').innerHTML = `
                    <div class="col padding-left-right" id="blockchain_data">
                    <div class="row align-items-center" >
                        <div class="mx-auto">
                            <div class="row" style="text-align:center">
                            <span class="badge bg-warning">Sedang Dalam Perbaikan</span>
                            </div>
                            <p class="primecolor" style="text-align:center">
                            <span id="laporTiket" class="modal-tiket">${blockchainReport[i][0].msgID}</span>
                            </p>
                            <!-- Latitude -->
                            <div class="mb-3">
                                <label class="form-label form-key primecolor modal-form">Latitude</label>
                                <input class="form-control modal-form" id="laporLat" value="${getLatitude}" disabled>
                            </div>
                            <!-- Longitude -->
                            <div class="mb-3">
                                <label class="form-label form-key primecolor modal-form">Longitude</label>
                                <input class="form-control modal-form" id="laporLong" value="${getLongitude}" disabled>
                            </div>
                            <!-- Deskripsi -->
                            <div class="mb-3">
                                <label class="form-label form-key modal-form">Deskripsi perbaikan</label>
                                <textarea class="form-control modal-form" id="laporDesc" rows="3" placeholder="Tuliskan apa saja yang diperbaiki ..."></textarea>
                            </div>
                        </div>
                    </div>
                    </div>
                    `;
    
                    document.getElementById('footer_button').innerHTML = `
                    <div class="mb-3">
                        <button type="button" class="btn btn-danger mb-3" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-success mb-3" onclick="report_finish()">Perbaikan Selesai</button>
                    </div>
                    `;
                }
            });
    
        }
    
        // only choose last 5 report
        blockchainFullData.sort(compareByTimestamp);
        let showedReport = 0;
        for(let i=0; i<blockchainFullData.length; i++){
            if(blockchainFullData[i][1].message.data.type == 'report'){
                let ticketID = blockchainFullData[i][0].msgID;
                let namaJalan = blockchainFullData[i][1].message.data.roadName;
                document.getElementById('listLaporan').innerHTML +=`
                    <span><a href="./laporan/info.html?tiket=${ticketID}">${ticketID}</a> - ${namaJalan}</span><br>
                `
                if(showedReport >= 4){break;}
                showedReport += 1;
            }
        }
    
        fetch_begin = true;
    }
});

