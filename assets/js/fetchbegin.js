// fetch all data in blockchainIndex
MQTTconnectbegin();

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


//======================================================================
// MQTT Function
//======================================================================
// When user is connect to mqtt, subscribe randomized topic and send 
function beginOnConnect(){
    // Subscribe topic
    mqtt.subscribe(topic);

    // Send submit request to gateway
    // format : submit_special/tag_index/data/return_topic
    let mqtt_msg = "tag_msg/" + blockchainIndex + '/'+ returnTopic;
    
    let product_msg = new Paho.MQTT.Message(mqtt_msg);
    product_msg.destinationName = gatewayId + "/submit" ;
    mqtt.send(product_msg);
}

function beginOnFailure(){
    console.log("Failed to connect");
    setTimeout(MQTTconnect, reconnectTimeout);
}

// If gateway give response, display it
function beginOnMessageArrived(msg){
    let IOTAResponse=msg.payloadString;
    IOTAResponse = IOTAResponse.replace(/'/g, '"');
    let blockchainFullData = JSON.parse(IOTAResponse);

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

        marker.on('click', function (event) {
            // Save nama jalan
            document.getElementById('infoJalan').innerHTML = `
            <div class="col mx-auto">
                <div class="row" >
                    <div class="col">
                        <!-- Map here -->
                        <div class="row" style="padding-bottom: 20px;">
                            <div class="card" style="border-radius: 25px; background-color: #efefef;">
                                <div class="card-body">
                                    <div class="col">
                                        <div class="row">
                                            <div class="section-title">
                                                <h1 id="nama_jalan" style="text-align: center;">${blockchainReport[i][1].message.data.roadName}</h1>
                                            </div>
                                            <div class="row" style="text-align: center;" id="lapor_jalan">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;

            if(blockchainReport[i][1].message.data.type == 'report'){
                document.getElementById('lapor_jalan').innerHTML = `
                <div class="col padding-left-right" id="blockchain_data">
                <div class="row align-items-center" >
                    <div class="mx-auto">
                        <span class="badge bg-danger">Jalan Rusak</span>
                        <p class="primecolor" style="padding-top:10px">
                        <span id="laporTiket">${blockchainReport[i][0].msgID}</span>
                        </p>
                        <!-- Latitude -->
                        <div class="mb-3">
                            <label class="form-label form-key primecolor">Latitude</label>
                            <input class="form-control" id="laporLat" value="${getLatitude}" disabled>
                        </div>
                        <!-- Longitude -->
                        <div class="mb-3">
                            <label class="form-label form-key primecolor">Longitude</label>
                            <input class="form-control" id="laporLong" value="${getLongitude}" disabled>
                        </div>
                        <!-- Deskripsi -->
                        <div class="mb-3">
                            <label class="form-label form-key">Deskripsi perbaikan</label>
                            <textarea class="form-control" id="laporDesc" rows="3" placeholder="Diperbaiki oleh ...Perbaikan dilaksanakan tanggal ...Biaya anggaran perbaikan sebesar Rp..."></textarea>
                        </div>
                        <!-- Submit -->
                        <div class="row" style="text-align: right;">
                            <div class="mb-3">
                                <button type="submit" class="btn btn-success mb-3" onclick="perbaikan()">Laporkan Perbaikan</button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                `;
            }

            if(blockchainReport[i][1].message.data.type == 'fixing'){
                document.getElementById('lapor_jalan').innerHTML = `
                <div class="col padding-left-right" id="blockchain_data">
                <div class="row align-items-center" >
                    <div class="mx-auto">
                        <span class="badge bg-warning">Sedang Dalam Perbaikan</span>
                        <p class="primecolor" style="padding-top:10px">
                        <span id="laporTiket">${blockchainReport[i][0].msgID}</span>
                        </p>
                        <!-- Latitude -->
                        <div class="mb-3">
                            <label class="form-label form-key primecolor">Latitude</label>
                            <input class="form-control" id="laporLat" value="${getLatitude}" disabled>
                        </div>
                        <!-- Longitude -->
                        <div class="mb-3">
                            <label class="form-label form-key primecolor">Longitude</label>
                            <input class="form-control" id="laporLong" value="${getLongitude}" disabled>
                        </div>
                        <!-- Deskripsi -->
                        <div class="mb-3">
                            <label class="form-label form-key">Deskripsi perbaikan</label>
                            <textarea class="form-control" id="laporDesc" rows="3" placeholder="Diperbaiki oleh ...Perbaikan dilaksanakan tanggal ...Biaya anggaran perbaikan sebesar Rp..."></textarea>
                        </div>
                        <!-- Submit -->
                        <div class="row" style="text-align: right;">
                            <div class="mb-3">
                                <button type="submit" class="btn btn-success mb-3" onclick="selesaiPerbaikan()">Laporkan Selesai Perbaikan</button>
                            </div>
                        </div>
                    </div>
                </div>
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
}

// connect to mqtt
function MQTTconnectbegin(){
    console.log("connecting MQTT");
    mqtt = new Paho.MQTT.Client(host,port,"clientjs");

    var options = {
        timeout: 3,
        onSuccess: beginOnConnect,
        onFailure: beginOnFailure,
    };

    mqtt.onMessageArrived = beginOnMessageArrived;
    mqtt.connect(options);
}