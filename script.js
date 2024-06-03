// Проверка поддержки HTML5 API
function checkHtml5ApiSupport() {
  var features = {
    "File API": "File" in window,
    "FileReader API": "FileReader" in window,
    LocalStorage: "localStorage" in window,
    SessionStorage: "sessionStorage" in window,
    "Canvas API": "HTMLCanvasElement" in window,
    "Web Workers API": "Worker" in window,
    "Web Socket API": "WebSocket" in window,
    "Geolocation API": "geolocation" in navigator,
    IndexedDB: "indexedDB" in window,
    "Web Storage API": "Storage" in window,
    "History API": "history" in window && "pushState" in history,
    "Drag and Drop API": "draggable" in document.createElement("div"),
    "Audio API": "Audio" in window,
    "Video API": "HTMLVideoElement" in window,
  };
  for (var feature in features) {
    var supported = features[feature] ? "поддерживается" : "не поддерживается";
    var listItem = document.createElement("p");
    listItem.textContent = feature + ": " + supported + "\n";
    let apitest = document.getElementById("test_api");
    apitest.appendChild(listItem);
  }
}

window.onload = checkHtml5ApiSupport;

function getLocation() {
  // Если геолокация поддерживается браузером
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    document.getElementById("location").innerHTML =
      "Геолокация не поддерживается.";
  }
}

function showPosition(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  document.getElementById("location").innerHTML =
    "Ваши координаты: " + "<br>" + "Широта: " + lat + "<br>Долгота: " + lon;
  var mypos = [{ name: "myLastgeo", pos: [lat, lon] }];

  localStorage.setItem("mygeoposition", JSON.stringify(mypos));

  var timed = new Date();
  console.log(timed);
}

getLocation();

function saveLocation(type, name, pos) {
  let marker = JSON.parse(localStorage.getItem(type)) || [];
  marker.push({ name, pos });
  localStorage.setItem(type, JSON.stringify(marker));
}

//  Создаем карту на странице

ymaps.ready(init);

function init() {
  var geolocation = ymaps.geolocation,
    myMap = new ymaps.Map(
      "map",
      {
        center: [55.713425, 37.632022],
        zoom: 10,

        controls: ["routeButtonControl"],
      },
      {
        searchControlProvider: "yandex#search",
      }
    );

  geolocation
    .get({
      provider: "browser",
      mapStateAutoApply: true,
    })
    .then(function (result) {
      // Красным цветом пометим положение, полученное через браузер.
      // Если браузер не поддерживает эту функциональность, метка не будет добавлена на карту.
      result.geoObjects.options.set("preset", "islands#redCircleIcon");
      myMap.geoObjects.add(result.geoObjects);
    });

  // Готовимся считать данные из поисковой строки
  document
    .getElementById("markerForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      var search = document.getElementById("searchInput").value;

      var myGeocoder = ymaps.geocode(search);

      myGeocoder.then(
        function (res) {
          var placemark = new ymaps.Placemark(
            res.geoObjects.get(0).geometry.getCoordinates(),
            {
              hintContent: search,
              balloonContent: search,
            }
          );

          // Добавляем метку в localstorage
          saveLocation(
            "markers",
            search,
            res.geoObjects.get(0).geometry.getCoordinates()
          );
          myMap.geoObjects.add(placemark);
        },

        function (err) {
          alert("Ошибка");
        }
      );
    });

  function showStored(type) {
    const saved = JSON.parse(localStorage.getItem(type));
    for (const i in saved) {
      var marker = saved[i];
      var placemark = new ymaps.Placemark(marker.pos, {
        hintContent: marker.name,
        balloonContent: marker.name,
      });

      myMap.geoObjects.add(placemark);
    }
  }

  showStored("markers");
  navigator.geolocation.getCurrentPosition(
    function(position){
      //действия с полученными данными
    }, function(error){
      // если ошибка (можно проверить код ошибки)
      if(error.PERMISSION_DENIED){
        showStored("mygeoposition");
      }
  });


    
  }


function deleteMarkers() {
  localStorage.removeItem("markers");
  location.reload();
}

