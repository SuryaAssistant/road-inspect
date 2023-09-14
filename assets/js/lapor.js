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
    $('#modal-card').modal('show');

    // display value
    document.getElementById('road-name').textContent = clickedRoad;
    document.getElementById('report-ticket').innerHTML = ``;
    document.getElementById('report-type').innerHTML = ``;
    document.getElementById('report-time').innerHTML = ``;
    document.getElementById('ticket-open-in-new-tab').innerHTML = ``;

    // change this part with original image from user
    document.getElementById('road-img').innerHTML = `
        <img src="./assets/img/warning.png" style="height:200px">
    `;

    // box for report description
    document.getElementById('description-form').innerHTML = `
        <label class="form-label form-key">Deskripsi kerusakan</label>
        <textarea class="form-control" id="laporDesc" rows="3" placeholder="Isikan deskripsi kerusakan jalan di sini"></textarea>
    `;

    // use user key to lock the report. only original reporter can update it's report status
    document.getElementById('keyword-form').innerHTML = `
        <label for="keywordform" class="form-label form-key">Kata Kunci</label>
        <input class="form-control" id="report-key" placeholder="Kata yang mudah Anda hapal">
    `;

    // submit button
    document.getElementById('footer_button').innerHTML = `
        <button type="button" class="btn btn-success" onclick="report()">Laporkan</button>
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
    userKeyword = document.getElementById('report-key').value;

    // Calculate userKeyword Hash
    let userKeywordHash = CryptoJS.SHA3(userKeyword, {outputLength: 256}).toString(CryptoJS.enc.Hex);

    // Create special JSON format
    productJSON = "{'type':'report','issuer':'"+issuer+"','roadName':'"+clickedRoad+"','lat':'"+clickedLatitude+"','long':'"+clickedLongitude+"','desc':'"+reportDescription+"','hashKey':'"+userKeywordHash+"'}";
    
    // Send a message to the server
    let inputMessage = "create/" + productJSON + '/'+ clientSocket + 'lapor';
    socket.emit('submit', inputMessage);
    
    // hide button
    document.getElementById('footer_button').innerHTML = ``;
    document.getElementById("description-form").innerHTML=``;
    document.getElementById("keyword-form").innerHTML=``;

    // change display
    document.getElementById("description-form").innerHTML+=`
        <div class="row textprimecolor">
            <p>Sedang mengunggah laporan . . .</p>
            <p>Harap menunggu. Biasanya memerlukan waktu 1-2 menit</p>
        </div>
    `;
}

// =========================================================================================
// Update road status
//
// Description:
// Update road report from 'report' to 'fixing' to 'finish'
// =========================================================================================
function update(ticket){
    // read user keyword
    userKeyword = document.getElementById('unlock-key').value;

    // Send a message to the server
    let inputMessage = "update/" + ticket + '/'+ clientSocket + 'lapor' + '/' + userKeyword;
    socket.emit('submit', inputMessage);

    // hide modal update
    $('#modal-update').modal('hide');

    // show modal card
    $('#modal-card').modal('show');

    // hide button
    document.getElementById('footer_button').innerHTML = ``;
    document.getElementById("description-form").innerHTML=``;
    document.getElementById("keyword-form").innerHTML=``;

    // change display
    document.getElementById("description-form").innerHTML+=`
        <div class="row textprimecolor">
            <p>Mengunggah laporan ke blockchain . . .</p>
            <p>Harap menunggu. Biasanya memerlukan waktu 1-2 menit</p>
        </div>
    `;
}





// If get response from gateway core
socket.on((clientSocket + 'lapor'), (msg) => {
    let response=msg;

    //<br>
    //<button type="button" class="btn btn-light" onclick="copyID()" style="border-radius:50px; font-size:14px; margin-top:10px"><i class='bx bx-link-alt'></i> Copy</button>
    
    // if error
    if(response.length != 64){
        // error image
        document.getElementById('road-img').innerHTML = `
            <img src="./assets/img/circle-error.png" style="height:150px; margin-top:25px; margin-bottom:25px">
        `;
        
        document.getElementById("description-form").innerHTML = `
            <div class="row textprimecolor" style="text-align:center">
                <p>
                    <span><b>${response}</b></span>
                </p>
            </div>
        `;

        // show close button
        document.getElementById('footer_button').innerHTML = `
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Tutup</button>
        `;
    }

    else{
        document.getElementById("description-form").innerHTML = `
            <div class="row textprimecolor" style="text-align:center">
                <p>
                    <b>Terima kasih sudah melaporkan</b>
                </p>
                <p>Kode ticket : <a href="./laporan/info.html?tiket=${response}" id="responseID">${response}</a></p>
            </div>
            <div class="row" id="share-button"></div>
        `;

        // show close button
        document.getElementById('footer_button').innerHTML = `
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Tutup</button>
        `;

        // Share button
        var ticketURL = "https://dalankudus.xyz/laporan/info.html?tiket=" + response;
        var prefilledText = "Saya baru saja melaporkan adanya kerusakan jalan melalui Dalan Kudus. Anda juga dapat melihat lokasi dan progress laporan di sini.%0D%0A %0D%0A";

        var whatsappURL = "https://api.whatsapp.com/send?text=" + prefilledText + ticketURL;
        var facebookURL = "https://www.facebook.com/sharer/sharer.php?u=" + ticketURL + "&quote=" + prefilledText;
        var twitterURL = "https://twitter.com/intent/tweet?url=" + ticketURL + "&text=" + prefilledText;
        
        document.getElementById("share-button").innerHTML += `
            <div class="col">
            </div>
            <div class="col">
                <div class="row">
                <span style="font-size:26px; text-align:right">
                    <a href="${facebookURL}" target="_blank" style="opacity:0.75; color:#4267B2; margin-right:5px"><i class='bx bxl-facebook-circle'></i></a>
                    <a href="${twitterURL}" target="_blank" style="opacity:0.75; color:#00acee; margin-right:5px"><i class='bx bxl-twitter'></i></a>
                    <a href="${whatsappURL}" target="_blank" style="opacity:0.75; color:#075e54; margin-right:5px"><i class='bx bxl-whatsapp'></i></a>
                </span>
                </div>
            </div>
        `;
    }

});