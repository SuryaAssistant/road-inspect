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


function updateCard(type, ticket, nameOfRoad, description_detail){
    document.getElementById('nama_jalan').textContent = nameOfRoad;
    document.getElementById('report-ticket').innerHTML = `${ticket}`;
    document.getElementById('description-form').innerHTML = `
        <label class="form-label form-key">Deskripsi Kerusakan</label>
        <p id="desc-detail">${description_detail}</p>
    `;
    document.getElementById('keyword-form').innerHTML = `
        <label for="keywordform" class="form-label form-key">Kata Kunci</label>
        <input class="form-control" id="laporKey" placeholder="Masukkan kata kunci">
    `;
    document.getElementById('ticket-open-in-new-tab').innerHTML = `
        <a href="./laporan/info.html?tiket=${ticket}" target=_blank><i class='bx bx-link-external'></i></a>
    `;


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
        let inputMessage = "resume/" + blockchainIndex + '/' + clientSocket + 'fetch';
        var timestamp = new Date().getTime();

        // only fetch from blockchain every 5 minutes
        socket.emit('submit', inputMessage);
        document.getElementById("sync-percent").innerHTML = `50%`;
    }
});

// Event listener for receiving messages from the server
socket.on((clientSocket + 'fetch'), (blockchainReport) => {

    // This is a must to sort it first
    // If not, data on map will shuffled
    blockchainReport.sort(compareByTimestamp);

    // show on map
    // show coordinate on map
    for(let i=0; i<blockchainReport.length; i++){
        let lat = blockchainReport[i][1].message.data.lat;
        let long = blockchainReport[i][1].message.data.long;
        let desc_detail = blockchainReport[i][1].message.data.desc;
        let msgHashKey = '';
        if('hashKey' in blockchainReport[i][1].message.data){
            msgHashKey = blockchainReport[i][1].message.data.hashKey;
        }


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
            userHashKey = msgHashKey;

            if(blockchainReport[i][1].message.data.type == 'report'){
                updateCard('fixing', blockchainReport[i][0].msgID, roadName, desc_detail)
            }

            if(blockchainReport[i][1].message.data.type == 'fixing'){
                updateCard('finish', blockchainReport[i][0].msgID, roadName, desc_detail)
            }
        });
    }

    document.getElementById("sync-percent").innerHTML = `100%`;


    // only choose last 5 report
    blockchainReport.sort(compareByTimestamp);
    let showedReport = 0;
    for(let i=0; i<blockchainReport.length; i++){
        if(blockchainReport[i][1].message.data.type == 'report'){
            let ticketID = blockchainReport[i][0].msgID;
            let namaJalan = blockchainReport[i][1].message.data.roadName;
            document.getElementById('listLaporan').innerHTML +=`
                <span><a href="./laporan/info.html?tiket=${ticketID}">${ticketID}</a> - ${namaJalan}</span><br>
            `
            if(showedReport >= 4){break;}
            showedReport += 1;
        }
    }

    fetch_begin = true;
    document.getElementById('synchronization-alert').style.display = 'none';
});

