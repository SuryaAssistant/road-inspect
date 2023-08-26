//======================================================================
// Websocket Configuration
//======================================================================
// create random number for socket event
const randomNumber = Math.random() * 10000000;
const clientSocket = String(Math.floor(randomNumber));

//======================================================================
// Blockchain Configuration
//======================================================================
let ticketID;                           // Searched Ticket ID
let mainBranchTicket;                   // Main Report Branch

function cariTiket(){
    ticketID = document.getElementById('nomor_tiket').value;

    if(ticketID != ''){
        // Get original payload
        let inputMessage = "payload/" + ticketID +'/'+ clientSocket + 'main';
        socket.emit('submit', inputMessage);

        document.getElementById("detail_laporan").innerHTML+=`
        <div class="row primecolor">
            <p>Mencari tiket di blockchain . . .</p>
        </div>
    `;
    }

}

//======================================================================
// Websocket Function
//======================================================================
const socket = io.connect(socketAddr);
let firstInfo = true;


socket.on((clientSocket+'main'), (msg) => {
    let IOTAResponse = msg.replace(/'/g, '"');
    let blockchainData = JSON.parse(IOTAResponse);
    let tanggalLapor = new Date(((blockchainData.message.timestamp))*1000);
    let simpleTanggalLapor = tanggalLapor.toLocaleDateString();
    let reportType = blockchainData.message.data.type;
    
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
            <h1 style="text-align: left; padding-bottom:10px">Detail Laporan</h1>
        </div>

        <div class="col" id="search_process" style="text-align:center">
            <p>Scanning Blockchain ...</p>
        </div>
        
        <!-- Info laporan -->
        <div class="row" id="progress_timeline">
            <ul class="timeline" id="timeline">
            <li class="li" id="reported">
                <div class="timestamp">
                    <span class="date" id="report_date">???<span>
                </div>
                <div class="status">
                    <h4>REPORT RECEIVED<br><span id="report_id">???<span></h4>
                </div>
            </li>
            <li class="li" id="fixing">
                <div class="timestamp">
                    <span class="date" id="fixing_date">???<span>
                </div>
                <div class="status">
                    <h4>FIXING PROCESS<br><span id="fixing_id">???<span></h4>
                </div>
            </li>
            <li class="li" id="finish">
                <div class="timestamp">
                    <span class="date" id="finish_date">???<span>
                </div>
                <div class="status">
                    <h4>COMPLETED<br><span id="finish_id">???<span></h4>
                </div>
            </li>
        </ul>      
        </div>

        <br>
        <div class="row">
            <div class="col">
                <span class="form-key">KODE TIKET / <i>TICKET ID</i>: </span>
                <br><span>${ticketID}</span><br>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <span class="form-key">JALUR LAPORAN UTAMA / <i>MAIN REPORT BRANCH</i> : </span>
                <br><span id="main_branch"></span><br>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <span class="form-key">PELAPOR / <i>ISSUER</i> : </span>
                <br><span>${blockchainData.message.data.issuer}</span><br>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <span class="form-key">TIPE LAPORAN / <i>REPORT TYPE</i> : </span>
                <br><span id="report_type"></span><br>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <span class="form-key">TANGGAL PELAPORAN / <i>REPORT DATE</i> : </span>
                <br><span>${tanggalLapor}</span><br>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <span class="form-key">NAMA JALAN / <i>ROAD NAME</i> : </span>
                <br><span>${blockchainData.message.data.roadName}</span><br>
                <hr>
            </div>
        </div>                                                            
        <div class="row">
            <div class="col">
                <span class="form-key">LATITUDE, LONGITUDE / <i>LATITUDE, LONGITUDE</i> : </span>
                <br><span>${getLatitude}, ${getLongitude}</span><br>
                <hr>
            </div>
        </div>                                                            
        <div class="row">
            <div class="col">
                <span class="form-key">DESKRIPSI LAPORAN / <i>REPORT DESCRIPTION</i> : </span>
                <br><span>${blockchainData.message.data.desc}</span><br>
                <hr>
            </div>
        </div>
    </div>
    `;

    document.getElementById('progress_timeline').style.display = 'none';
    document.getElementById('search_process').style.display = 'block';

    // edit based on it report type
    if(reportType == 'report'){
        mainBranchTicket = ticketID;

        document.getElementById('report_type').innerHTML = `<span class="badge bg-danger">Report</span>`
        document.getElementById('report_date').innerHTML = `${simpleTanggalLapor}`;
        document.getElementById('reported').classList.add('complete');
        document.getElementById('main_branch').innerHTML = `${ticketID}`;

        const truncatedText = ticketID.substring(0, 12) + "..."; 
        document.getElementById('report_id').innerHTML = `<a href="./laporan/info.html?tiket=${ticketID}">${truncatedText}</a>`;

        // search other two
        let inputMessage = 'tag_msg_filter/' + blockchainIndex +'/'+ clientSocket + 'completed' + '/' + '==:"' + ticketID + '"/"message"/"data"/"ticket"';
        console.log(inputMessage);
        socket.emit('submit', inputMessage);
    }

    if(reportType == 'fixing'){
        mainBranchTicket = blockchainData.message.data.ticket;

        document.getElementById('report_type').innerHTML = `<span class="badge bg-warning">Fixing</span>`
        document.getElementById('fixing_date').innerHTML = `${simpleTanggalLapor}`;
        document.getElementById('fixing').classList.add('complete');
        document.getElementById('main_branch').innerHTML = `${mainBranchTicket}`;

        const truncatedText = ticketID.substring(0, 12) + "..."; 
        document.getElementById('fixing_id').innerHTML = `<a href="info.html?tiket=${ticketID}">${truncatedText}</a>`;

        // search main report
        let inputMessage = "payload/" + mainBranchTicket +'/'+ clientSocket + 'mainbranch';
        socket.emit('submit', inputMessage);
    }

    if(reportType == 'finish'){
        mainBranchTicket = blockchainData.message.data.ticket;

        document.getElementById('report_type').innerHTML = `<span class="badge bg-success">Completed</span>`
        document.getElementById('finish_date').innerHTML = `${simpleTanggalLapor}`;
        document.getElementById('finish').classList.add('complete');
        document.getElementById('main_branch').innerHTML = `${mainBranchTicket}`;

        const truncatedText = ticketID.substring(0, 12) + "..."; 
        document.getElementById('finish_id').innerHTML = `<a href="info.html?tiket=${ticketID}">${truncatedText}</a>`;

        // search main report
        let inputMessage = "payload/" + mainBranchTicket +'/'+ clientSocket + 'mainbranch';
        socket.emit('submit', inputMessage);
    }
});


// Search main branch message
socket.on((clientSocket+'mainbranch'), (msg) => {
    let IOTAResponse = msg.replace(/'/g, '"');
    let blockchainData = JSON.parse(IOTAResponse);
    let tanggalLapor = new Date(((blockchainData.message.timestamp))*1000);
    let simpleTanggalLapor = tanggalLapor.toLocaleDateString();

    document.getElementById('report_date').innerHTML = `${simpleTanggalLapor}`;
    document.getElementById('reported').classList.add('complete');
    
    const truncatedText = mainBranchTicket.substring(0, 12) + "..."; 
    document.getElementById('report_id').innerHTML = `<a href="info.html?tiket=${mainBranchTicket}">${truncatedText}</a>`;


    let inputMessage = 'tag_msg_filter/' + blockchainIndex +'/'+ clientSocket + 'completed' + '/' + '==:"' + mainBranchTicket + '"/"message"/"data"/"ticket"';
    socket.emit('submit', inputMessage);
});


// Search other message that referred to main branch message ID
socket.on((clientSocket+'completed'), (msg) => {
    let IOTAResponse = msg.replace(/'/g, '"');
    let blockchainData = JSON.parse(IOTAResponse);

    if(blockchainData.length != 0){
        for(let i=0; i<blockchainData.length; i++){
            if(blockchainData[i][1].message.data.type == 'finish'){
                let tanggalLapor = new Date(((blockchainData[i][1].message.timestamp))*1000);
                let simpleTanggalLapor = tanggalLapor.toLocaleDateString();

                document.getElementById('finish_date').innerHTML = `${simpleTanggalLapor}`;
                document.getElementById('finish').classList.add('complete');

                const truncatedText = blockchainData[i][0].msgID.substring(0, 12) + "..."; 
                document.getElementById('finish_id').innerHTML = `<a href="info.html?tiket=${blockchainData[i][0].msgID}">${truncatedText}</a>`;
            }
            if(blockchainData[i][1].message.data.type == 'fixing'){
                let tanggalLapor = new Date(((blockchainData[i][1].message.timestamp))*1000);
                let simpleTanggalLapor = tanggalLapor.toLocaleDateString();
                
                document.getElementById('fixing_date').innerHTML = `${simpleTanggalLapor}`;
                document.getElementById('fixing').classList.add('complete');
                const truncatedText = blockchainData[i][0].msgID.substring(0, 12) + "..."; 
                document.getElementById('fixing_id').innerHTML = `<a href="info.html?tiket=${blockchainData[i][0].msgID}">${truncatedText}</a>`;
            }
        }
    }

    document.getElementById('progress_timeline').style.display = 'block';
    document.getElementById('search_process').style.display = 'none';
});