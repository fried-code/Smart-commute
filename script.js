// ------------------ Map ------------------
const map = L.map("map").setView([31.633,74.8723], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map);

const busIcon = L.icon({ iconUrl:"https://cdn-icons-png.flaticon.com/512/61/61205.png", iconSize:[32,32], iconAnchor:[16,16] });
const busMarkersGroup = L.layerGroup().addTo(map);
const routeLayerGroup = L.layerGroup().addTo(map);

const buses = [
  { id:1, code:"101", name:"Bus 101", from:"Amritsar", to:"Jalandhar", pricePerSeat:120, coords:[31.633,74.8723], stops:["Amritsar","Beas","Jalandhar"], duration:"2h 15m", onTime:true },
  { id:2, code:"102", name:"Bus 102", from:"Amritsar", to:"Ludhiana", pricePerSeat:140, coords:[31.56,75.12], stops:["Amritsar","Beas","Ludhiana"], duration:"3h 10m", onTime:false },
  { id:3, code:"103", name:"Bus 103", from:"Chandigarh", to:"Ludhiana", pricePerSeat:150, coords:[30.7333,76.7794], stops:["Chandigarh","Kharar","Ludhiana"], duration:"1h 50m", onTime:true },
  { id:4, code:"104", name:"Bus 104", from:"Jammu", to:"Pathankot", pricePerSeat:200, coords:[32.7266,74.857], stops:["Jammu","Kathua","Pathankot"], duration:"4h 05m", onTime:true }
];

function getCoords(stop){
  const map = { "Amritsar":[31.633,74.8723],"Beas":[31.56,75.12],"Jalandhar":[31.326,75.5762],
                "Chandigarh":[30.7333,76.7794],"Kharar":[30.76,76.72],"Ludhiana":[30.901,75.857],
                "Jammu":[32.7266,74.857],"Kathua":[32.37,75.52],"Pathankot":[32.27,75.65] };
  return map[stop] || [31.633,74.8723];
}

// ------------------ Render Bus List ------------------
function renderBusList(list){
  const container = document.getElementById("busList");
  container.innerHTML = "";
  list.forEach(bus=>{
    const div = document.createElement("div");
    div.className = "col-12 p-2 border rounded mb-2";
    div.innerHTML = `<b>${bus.name} (${bus.code})</b><br>
      From: ${bus.from} → ${bus.to}<br>
      Stops: ${bus.stops.join(" → ")}<br>
      Duration: ${bus.duration} | Status: <span style="color:${bus.onTime?'green':'red'}">${bus.onTime?'On Time':'Delayed'}</span><br>
      Price: ₹${bus.pricePerSeat}<br>
      <button class="btn btn-sm btn-success mt-2" onclick="openBooking(${bus.id})">Book</button>
      <button class="btn btn-sm btn-info mt-2" onclick="viewRoute(${bus.id})">View Route</button>`;
    container.appendChild(div);
  });
}

// ------------------ Display Buses on Map ------------------
function displayAllBuses(){
  busMarkersGroup.clearLayers();
  buses.forEach(bus=>{
    L.marker(bus.coords, {icon: busIcon}).addTo(busMarkersGroup)
      .bindPopup(`<b>${bus.name} (${bus.code})</b><br>
                  From: ${bus.from} → ${bus.to}<br>
                  Stops: ${bus.stops.join(" → ")}<br>
                  Duration: ${bus.duration} | Status: <span style="color:${bus.onTime?'green':'red'}">${bus.onTime?'On Time':'Delayed'}</span><br>
                  Price: ₹${bus.pricePerSeat}<br>
                  <button class="btn btn-sm btn-success mt-2" onclick="openBooking(${bus.id})">Book</button>
                  <button class="btn btn-sm btn-info mt-2" onclick="viewRoute(${bus.id})">View Route</button>`);
  });
}

// ------------------ Route ------------------
function viewRoute(busId){
  routeLayerGroup.clearLayers();
  const bus = buses.find(b => b.id===busId);
  if(!bus) return;
  const latlngs = bus.stops.map(stop=>{
    const coords = getCoords(stop);
    L.marker(coords).addTo(routeLayerGroup).bindPopup(`<b>${stop}</b>`);
    return coords;
  });
  L.polyline(latlngs, {color:"#368F8B", weight:5, dashArray:"10,10"}).addTo(routeLayerGroup);
  map.fitBounds(latlngs);
}

// ------------------ Booking ------------------
function openBooking(busId){
  document.getElementById("selectedBusId").value = busId;
  const bus = buses.find(b => b.id===busId);
  document.getElementById("totalPrice").innerText = bus.pricePerSeat;
  new bootstrap.Modal(document.getElementById("bookingModal")).show();
}

document.getElementById("bookingForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("passengerName").value.trim();
  const mobile = document.getElementById("passengerMobile").value.trim();
  const busId = parseInt(document.getElementById("selectedBusId").value);
  const bus = buses.find(b => b.id === busId);
  const total = bus.pricePerSeat;

  if(name === "" || mobile === "" || !/^\d{10}$/.test(mobile)){
    alert("Please enter a valid Name and 10-digit Mobile Number.");
    return;
  }

  window.currentBooking = { bus, name, mobile, seats:"N/A", total };
  document.getElementById("paymentAmount").innerText = total;
  new bootstrap.Modal(document.getElementById("paymentModal")).show();
});

// ------------------ Payment ------------------
document.getElementById("payNowBtn").addEventListener("click", function(){
  const booking = window.currentBooking;
  if(!booking) return;

  const activeTab = document.querySelector("#paymentTabs .nav-link.active").id;
  let method = "Card";
  if(activeTab==="upi-tab") method="UPI";
  if(activeTab==="netbanking-tab") method="Net Banking";

  alert(`Payment Successful via ${method}! 🎉\nBus: ${booking.bus.name}\nTotal Paid: ₹${booking.total}`);

  const qrDiv = document.getElementById("qrCodeContainer");
  qrDiv.innerHTML = "";
  new QRCode(qrDiv, `Bus:${booking.bus.code},Name:${booking.name},Mobile:${booking.mobile},Total:₹${booking.total},Method:${method}`);

  const downloadBtn = document.getElementById("downloadQRBtn");
  downloadBtn.style.display = "block";
  downloadBtn.onclick = function(){
    const img = qrDiv.querySelector("img") || qrDiv.querySelector("canvas");
    let src;
    if(img.tagName==="IMG") src = img.src;
    else if(img.tagName==="CANVAS") src = img.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = src;
    link.download = `BusTicket_${booking.bus.code}_${booking.name}.png`;
    link.click();
  };

  document.getElementById("bookingForm").reset();
  bootstrap.Modal.getInstance(document.getElementById("paymentModal")).hide();
  bootstrap.Modal.getInstance(document.getElementById("bookingModal")).show();
});

// ------------------ Initialize ------------------
renderBusList(buses);
displayAllBuses();


// ------------------ Initialize ------------------
renderBusList(buses);
displayAllBuses();

