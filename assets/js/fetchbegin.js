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

function updateReport(ticket){
    // hide modal card
    $('#modal-card').modal('hide');

    // change with modal update
    $('#modal-update').modal('show');

    // display ticket id
    document.getElementById('unlock-report-ticket').innerHTML = `${ticket}`;

    // reset form value
    document.getElementById('unlock-key').value = '';

    // button for update
    document.getElementById('unlock-button').innerHTML = `
        <button type="button" class="btn btn-success" onclick="update('${ticket}')">Laporkan Perbaikan</button>
    `;
}


function updateCard(type, ticket, nameOfRoad, description_detail, reportTime){
    document.getElementById('road-img').innerHTML = `
        <img src="./assets/img/warning.png" style="height:200px">
    `;
    document.getElementById('road-name').textContent = nameOfRoad;
    document.getElementById('report-ticket').innerHTML = `${ticket}`;
    document.getElementById('ticket-open-in-new-tab').innerHTML = `
        <a href="./laporan/info.html?tiket=${ticket}" target=_blank><i class='bx bx-link-external'></i></a>
    `;
    document.getElementById('report-time').innerHTML = `
        <span class="badge bg-light text-dark">${reportTime}</span>
    `;
    document.getElementById('description-form').innerHTML = `
        <p id="desc-detail">${description_detail}</p>
    `;
    document.getElementById('keyword-form').innerHTML = `
    `;
    document.getElementById('footer_button').innerHTML = `
        <button type="button" class="btn btn-success" onclick="updateReport('${ticket}')">Laporkan Perbaikan</button>
    `;



    if(type == 'fixing'){
        document.getElementById('report-type').innerHTML = `
            <span class="badge bg-danger">Report</span>
        `;}
    if(type == 'finish'){
        document.getElementById('report-type').innerHTML = `
            <span class="badge bg-warning">Fixing Process</span>
        `;}
}


function getTimeDifference(timestampInSeconds) {
    // Get the current timestamp in milliseconds
    var currentTimestamp = Date.now();

    // Convert the given timestamp to milliseconds
    var givenTimestampInMilliseconds = timestampInSeconds * 1000;

    // Calculate the time difference in milliseconds
    var timeDifference = currentTimestamp - givenTimestampInMilliseconds;

    // Calculate time intervals
    var seconds = Math.floor(timeDifference / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    var months = Math.floor(days / 30); // Assuming an average of 30 days per month

    // Prepare the result string based on time intervals
    var result = "";
    
    if (seconds > 0){result = seconds + " detik lalu";}
    if (minutes > 0){result = minutes + " menit lalu";}
    if (hours > 0){result = hours + " jam lalu";}
    if (days > 0) {result = days + " hari lalu ";}
    if (months > 0) {result = months + " bulan lalu ";}

    return result;
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
            $('#modal-card').modal('show');
            let roadName = blockchainReport[i][1].message.data.roadName;
            let reportTime = blockchainReport[i][1].message.timestamp;

            // Get the time difference in a human-readable format
            var timeDifferenceString = getTimeDifference(reportTime);

            // copy value for blockchain uploading
            clickedLatitude = lat;
            clickedLongitude = long;
            clickedRoad = roadName;

            if(blockchainReport[i][1].message.data.type == 'report'){
                updateCard('fixing', blockchainReport[i][0].msgID, roadName, desc_detail, timeDifferenceString)
            }

            if(blockchainReport[i][1].message.data.type == 'fixing'){
                updateCard('finish', blockchainReport[i][0].msgID, roadName, desc_detail, timeDifferenceString)
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

