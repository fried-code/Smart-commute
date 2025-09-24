// ------------------ Map Initialization ------------------
const map = L.map("map").setView([31.633, 74.8723], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// ------------------ Bus Icon ------------------
const busIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// ------------------ Layer Groups ------------------
const routeLayerGroup = L.layerGroup().addTo(map);
const busMarkers = {};
const busPaths = {};
const busIndex = {};
let selectedSeatsArray = [];

// ------------------ Bus Data ------------------
const buses = [
  { id:1, code:"101", name:"Bus 101", from:"Amritsar", to:"Jalandhar", stops:["Amritsar","Beas","Jalandhar"], pricePerSeat:120 },
  { id:2, code:"102", name:"Bus 102", from:"Amritsar", to:"Ludhiana", stops:["Amritsar","Beas","Ludhiana"], pricePerSeat:140 },
  { id:3, code:"103", name:"Bus 103", from:"Chandigarh", to:"Ludhiana", stops:["Chandigarh","Kharar","Ludhiana"], pricePerSeat:150 },
  { id:4, code:"104", name:"Bus 104", from:"Jammu", to:"Pathankot", stops:["Jammu","Kathua","Pathankot"], pricePerSeat:200 },
  { id:5, code:"105", name:"Bus 105", from:"Amritsar", to:"Pathankot", stops:["Amritsar","Beas","Pathankot"], pricePerSeat:180 },
  { id:6, code:"106", name:"Bus 106", from:"Chandigarh", to:"Jalandhar", stops:["Chandigarh","Kharar","Jalandhar"], pricePerSeat:130 },
  { id:7, code:"107", name:"Bus 107", from:"Ludhiana", to:"Jalandhar", stops:["Ludhiana","Phagwara","Jalandhar"], pricePerSeat:125 },
  { id:8, code:"108", name:"Bus 108", from:"Jammu", to:"Kathua", stops:["Jammu","Kathua"], pricePerSeat:150 },
  { id:9, code:"109", name:"Bus 109", from:"Chandigarh", to:"Amritsar", stops:["Chandigarh","Rupnagar","Amritsar"], pricePerSeat:160 },
  { id:10, code:"110", name:"Bus 110", from:"Jalandhar", to:"Pathankot", stops:["Jalandhar","Dasuya","Pathankot"], pricePerSeat:145 },
  { id:11, code:"111", name:"Bus 111", from:"Ludhiana", to:"Amritsar", stops:["Ludhiana","Beas","Amritsar"], pricePerSeat:135 },
  { id:12, code:"112", name:"Bus 112", from:"Jammu", to:"Pathankot", stops:["Jammu","Kathua","Pathankot"], pricePerSeat:220 },
  { id:13, code:"113", name:"Bus 113", from:"Chandigarh", to:"Pathankot", stops:["Chandigarh","Rupnagar","Pathankot"], pricePerSeat:170 }
];

// ------------------ Stop Coordinates ------------------
function getCoords(stop){
  const map = {
    "Amritsar":[31.633,74.8723],"Beas":[31.56,75.12],"Jalandhar":[31.326,75.5762],
    "Chandigarh":[30.7333,76.7794],"Kharar":[30.76,76.72],"Ludhiana":[30.901,75.857],
    "Jammu":[32.7266,74.857],"Kathua":[32.37,75.52],"Pathankot":[32.27,75.65],
    "Phagwara":[31.22,75.77],"Rupnagar":[31.38,76.53],"Dasuya":[31.93,75.91]
  };
  return map[stop] || [31.633,74.8723];
}

// ------------------ Display All Buses ------------------
function displayAllBuses(){
  buses.forEach(bus=>{
    const [lat,lng] = getCoords(bus.stops[0]);
    bus.lat = lat; bus.lng = lng;
    const marker = L.marker([lat,lng], {icon: busIcon}).addTo(map)
      .bindPopup(`<b>${bus.name} (${bus.code})</b><br>
                  <button onclick="viewRoute(${bus.id})">View Route</button>
                  <button onclick="openBooking(${bus.id})">Book</button>`);
    busMarkers[bus.id] = marker;
  });
}

// ------------------ Prepare Bus Paths using OSRM ------------------
async function prepareBusPaths(){
  for(const bus of buses){
    const coordStr = bus.stops.map(s=>`${getCoords(s)[1]},${getCoords(s)[0]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if(data.routes?.length>0){
      busPaths[bus.id] = data.routes[0].geometry.coordinates.map(c=>[c[1],c[0]]);
      busIndex[bus.id] = 0;
    }
  }
}

// ------------------ Simulate Live Bus Movement ------------------
function simulateBusMovement(){
  buses.forEach(bus=>{
    if(!busPaths[bus.id]) return;
    const path = busPaths[bus.id];
    busIndex[bus.id] = (busIndex[bus.id]+1)%path.length;
    const [lat,lng] = path[busIndex[bus.id]];
    bus.lat = lat; bus.lng = lng;
    busMarkers[bus.id].setLatLng([lat,lng]);
  });
}

// ------------------ View Bus Route ------------------
function viewRoute(busId){
  routeLayerGroup.clearLayers();
  const bus = buses.find(b=>b.id===busId);
  if(!busPaths[busId]) return;
  const polyline = L.polyline(busPaths[busId], {color:"#368F8B", weight:5, dashArray:"10,10"}).addTo(routeLayerGroup);
  map.fitBounds(polyline.getBounds());
  bus.stops.forEach(s=>{
    const coords = getCoords(s);
    L.marker(coords).addTo(routeLayerGroup).bindPopup(`<b>${s}</b>`);
  });
}

// ------------------ Search / Filter Buses ------------------
function findRoute(){
  const fromPlace=document.getElementById("fromInput").value.trim();
  const toPlace=document.getElementById("toInput").value.trim();
  const busCode=document.getElementById("busCodeInput").value.trim();
  const filtered = buses.filter(bus=>{
    return (!fromPlace || bus.from.toLowerCase()===fromPlace.toLowerCase())
      && (!toPlace || bus.to.toLowerCase()===toPlace.toLowerCase())
      && (!busCode || bus.code===busCode);
  });
  renderBusList(filtered);
}

// ------------------ Render Bus List ------------------
function renderBusList(list){
  const container = document.getElementById("busList");
  container.innerHTML="";
  list.forEach(bus=>{
    const div = document.createElement("div");
    div.className="col-12 p-2 border rounded";
    div.innerHTML=`<b>${bus.name} (${bus.code})</b><br>
      From: ${bus.from} → ${bus.to}<br>
      Price: ₹${bus.pricePerSeat}<br>
      Stops: ${bus.stops.length}<br>
      <button class="btn btn-sm btn-teal mt-2" onclick="viewRoute(${bus.id})">View Route</button>
      <button class="btn btn-sm btn-success mt-2" onclick="openBooking(${bus.id})">Book</button>`;
    container.appendChild(div);
  });
}

// ------------------ Booking Functions ------------------
function openBooking(busId){
  document.getElementById("selectedBusId").value=busId;
  renderSeatMap(busId);
  selectedSeatsArray=[];
  updateSeatInfo();
  new bootstrap.Modal(document.getElementById("bookingModal")).show();
}



// ------------------ Update Selected Seats ------------------
function updateSeatInfo(){
  const busId=parseInt(document.getElementById("selectedBusId").value);
  const bus = buses.find(b=>b.id===busId);
  const total = selectedSeatsArray.length*bus.pricePerSeat;
  document.getElementById("selectedSeats").innerText = selectedSeatsArray.length;
  document.getElementById("totalPrice").innerText = total;
}

// ------------------ Booking Form Submit ------------------
document.getElementById("bookingForm").addEventListener("submit",function(e){
  e.preventDefault();
  const busId=parseInt(document.getElementById("selectedBusId").value);
  const bus=buses.find(b=>b.id===busId);
  const name=document.getElementById("passengerName").value;
  const seats=selectedSeatsArray.join(",");
  const total=selectedSeatsArray.length*bus.pricePerSeat;

  // Generate QR code
  document.getElementById("qrCodeContainer").innerHTML="";
  new QRCode(document.getElementById("qrCodeContainer"),`Bus:${bus.code},Name:${name},Seats:${seats},Total:₹${total}`);

  alert(`Booking Confirmed!\nBus:${bus.name}\nSeats:${seats}\nTotal: ₹${total}`);
  this.reset();
  selectedSeatsArray=[];
  updateSeatInfo();
  bootstrap.Modal.getInstance(document.getElementById("bookingModal")).hide();
});

// ------------------ Initialize ------------------
displayAllBuses();
renderBusList(buses);
prepareBusPaths().then(()=>setInterval(simulateBusMovement,1000));
