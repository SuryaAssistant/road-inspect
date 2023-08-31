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



function updateCard(type, ticket, nameOfRoad){
    document.getElementById('nama_jalan').textContent = nameOfRoad;
    document.getElementById('report-ticket').innerHTML = `${ticket}`;
    document.getElementById('description-form').innerHTML = `
        <label class="form-label form-key">Deskripsi (opsional)</label>
        <textarea class="form-control" id="laporDesc" rows="3" placeholder="Tulis deskripsi di sini ..."></textarea>
    `;
    document.getElementById('ticket-open-in-new-tab').innerHTML = `
        <a href="./laporan/info.html?tiket=${ticket}" target=_blank><i class='bx bx-link-external'></i></a>
    `;

    //<button type="button" class="btn btn-danger mb-3" data-bs-dismiss="modal">Close</button>

    if(type == 'fixing'){
        document.getElementById('report-type').innerHTML = `
            <span class="badge bg-danger">Report</span>
        `;

        document.getElementById('footer_button').innerHTML = `
            <button type="button" class="btn btn-success mb-3" onclick="report_fixing()">Laporkan Perbaikan</button>
        `;
    }

    if(type == 'finish'){
        document.getElementById('report-type').innerHTML = `
            <span class="badge bg-warning">Fixing Process</span>
        `;

        document.getElementById('footer_button').innerHTML = `
            <button type="button" class="btn btn-success mb-3" onclick="report_finish()">Laporkan Selesai</button>
        `;
    }


}


function coockData(choosedBlockchainData){
    // Copy JSON with 'report' to filteredBlockchain
    let filteredBlockchain = []
    copyJSON(choosedBlockchainData, filteredBlockchain, 'report', 1)

    // if there is 'fixing' in choosedBlockchainData,  
    // replace filteredBlockchain to 'fixing'
    replaceJSON(choosedBlockchainData, filteredBlockchain, 'fixing')

    // if there is 'finish' in choosedBlockchainData,  
    // replace filteredBlockchain to 'finish'
    replaceJSON(choosedBlockchainData, filteredBlockchain, 'finish')

    // Copy JSON without 'finish' to blockchainReport
    let blockchainReport = []
    copyJSON(filteredBlockchain, blockchainReport, 'finish', 0)

    // sort JSON
    blockchainReport.sort(compareByTimestamp);

    // show coordinate on map
    for(let i=0; i<blockchainReport.length; i++){
        let lat = blockchainReport[i][1].message.data.lat;
        let long = blockchainReport[i][1].message.data.long

        // Coordinates for the marker and colorize
        const markerCoords = [lat, long];
        var marker = L.marker(markerCoords).addTo(map);
        if(blockchainReport[i][1].message.data.type == 'report'){
            marker._icon.classList.add("red");
        }
        if(blockchainReport[i][1].message.data.type == 'fixing'){
            marker._icon.classList.add("yellow");
        }
        
        marker.on('click', function () {
            $('#modalLaporRusak').modal('show');
            let roadName = blockchainReport[i][1].message.data.roadName;

            // copy value for blockchain uploading
            clickedLatitude = lat;
            clickedLongitude = long;
            clickedRoad = roadName;

            if(blockchainReport[i][1].message.data.type == 'report'){
                updateCard('fixing', blockchainReport[i][0].msgID, roadName)
            }

            if(blockchainReport[i][1].message.data.type == 'fixing'){
                updateCard('finish', blockchainReport[i][0].msgID, roadName)
            }
        });
    }

    document.getElementById("sync-percent").innerHTML = `100%`;


    // only choose last 5 report
    choosedBlockchainData.sort(compareByTimestamp);
    let showedReport = 0;
    for(let i=0; i<choosedBlockchainData.length; i++){
        if(choosedBlockchainData[i][1].message.data.type == 'report'){
            let ticketID = choosedBlockchainData[i][0].msgID;
            let namaJalan = choosedBlockchainData[i][1].message.data.roadName;
            document.getElementById('listLaporan').innerHTML +=`
                <span><a href="./laporan/info.html?tiket=${ticketID}">${ticketID}</a> - ${namaJalan}</span><br>
            `
            if(showedReport >= 4){break;}
            showedReport += 1;
        }
    }

    fetch_begin = true;
    document.getElementById('synchronization-alert').style.display = 'none';
}

// check if there is a cache
const cachedData = localStorage.getItem('dataBlockchain');
let blockchainFullData = [];
let cachedTimestamp = 0;

if (cachedData) {
    // convert cache to JSON
    //console.log("cached data = " + cachedData);
    blockchainFullData = JSON.parse(localStorage['dataBlockchain']);
    if(blockchainFullData[0] == undefined){
        console.log("undefined");
    }
    else{
        cachedTimestamp = blockchainFullData[0][1].message.timestamp;
    }
}


const cachedLastSync = localStorage.getItem('road_inspect_last_sync');
let lastSync = 0;
if (cachedLastSync){
    lastSync = parseInt(cachedLastSync);
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

socket.on('connect', () => {
    if(fetch_begin == false){
        // Send a message to the server
        let inputMessage = "tag_msg_filter/" + blockchainIndex + '/'+ clientSocket + 'fetch' + '/' + '>:' + cachedTimestamp + '/' + '"message"' + '/' + '"timestamp"';
        var timestamp = new Date().getTime();

        // only fetch from blockchain every 5 minutes
        if(timestamp - lastSync > (20*60*1000)){
            socket.emit('submit', inputMessage);
            document.getElementById("sync-percent").innerHTML = `25%`;
        }
        else{
            document.getElementById("sync-percent").innerHTML = `50%`;
            coockData(blockchainFullData);        
        }
    }
});

// Event listener for receiving messages from the server
socket.on((clientSocket + 'fetch'), (msg) => {
    console.log(msg);

    let fullMsg = msg.replace(/'/g, '"');
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

    document.getElementById("sync-percent").innerHTML = `50%`;
    coockData(blockchainFullData);

    var timestamp = new Date().getTime(); 
    localStorage['road_inspect_last_sync'] = timestamp.toString();
});

