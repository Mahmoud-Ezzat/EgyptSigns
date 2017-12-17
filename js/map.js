/*Class Globals acts as mv optopus*/

class globals {
    constructor() {
        this.myLatLng = {
            lat: 30.0478,
            lng: 31.2336
        };
        this.mapOptions = {
            zoom: 11,
            center: this.myLatLng
        }
        this.CLIENT_ID = 'UBYKFXH4GFBJE3BTNI2VCLAMUI5W042013OGQEOBKWELDPOY';
        this.CLIENT_SECRET = 'FX4QLAPPCQYWZ1E35H5DA3L1BYTNEDFIEKOYFRYN5YXOELOI';
        this.baseURL = `https://api.foursquare.com/v2/venues/search?&client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_SECRET}&v=20170813`;
        this.map;
        this.mapDom = document.getElementById('googleMap');
        this.signs = ko.observableArray([{
                name: 'Pyramids',
                position: {
                    lng: 31.1342,
                    lat: 29.9792
                },
                show: ko.observable(true)
            },
            {
                name: 'Egyptian Museum',
                position: {
                    lng: 31.2336,
                    lat: 30.0478
                },
                show: ko.observable(true)
            },
            {
                name: 'Cairo Tower',
                position: {
                    lng: 31.2243,
                    lat: 30.0459
                },
                show: ko.observable(true)
            }, {
                name: 'Giza Zoo',
                position: {
                    lng: 31.2137,
                    lat: 30.0227
                },
                show: ko.observable(true)
            }, {
                name: 'Cairo Citadel',
                position: {
                    lng: 31.2611,
                    lat: 30.0299
                },
                show: ko.observable(true)
            },
            {
                name: 'Cairo International Airport',
                position: {
                    lng: 31.4003,
                    lat: 30.1124
                },
                show: ko.observable(true)
            }
        ]);
    }
}
/*Class for map initialization , adding markers also calloing forsquare service for details*/
class myMap {

    constructor() {
        this.global = new globals();
        
    }
    inIntMap() {
        console.log(this.global.mapDom);
        this.global.map = new google.maps.Map(this.global.mapDom, this.global.mapOptions);
        this.infowindow = new google.maps.InfoWindow();
    }
    addingMarker() {
        let self = this;
        let pList = [];
        for (let item of this.global.signs()) {
            pList.push(new Promise(function (resolve) {
                $.ajax({
                    url: `${self.global.baseURL}`,
                    dataType: 'json',
                    type: 'GET',
                    'data': {
                        query: item.name,
                        ll: `${item.position.lat},${item.position.lng}`
                    },
                    success: function (data) {
                        console.log(data);
                       let name=data.response.venues[0].name?data.response.venues[0].name:"";
                       let city=data.response.venues[0].location.city?data.response.venues[0].location.city:"";
                       let country=data.response.venues[0].location.country?data.response.venues[0].location.country:"";
                       let phone=data.response.venues[0].contact.phone?data.response.venues[0].contact.phone:"";
                       let url=data.response.venues[0].url?data.response.venues[0].url:"";
                        item.info = `
                        <div class="sign-name">
                        ${name}
                        </div>
                        <div class="sign-position">
                        ${city}
                        ${country}
                        </div>
                        <div class="sign-contact">
                        ${phone}
                        </div>
                        <div class="sign-website">
                        ${url}
                        </div>
                        `;

                        resolve();
                    },
                    error:function(error){
                        alert("error happend in loading data please check your internet connection or refresh");
                    }
                });
            }));
        }
        Promise.all(pList).then(() => {
            for (let item of self.global.signs()) {
                var marker = new google.maps.Marker({
                    position: item.position,
                    map: self.global.map,
                    draggable: true,
                    animation: google.maps.Animation.DROP,
                    title: item.name
                });
                ((marker) => {
                    // var infowindow = new google.maps.InfoWindow({
                    //     content: item.info
                    // });

                    self.infowindow.setContent(item.info);
                    marker.addListener('click', () => {
                        if (marker.getAnimation() !== null) {
                            marker.setAnimation(null);
                        } else {
                            marker.setAnimation(google.maps.Animation.BOUNCE);
                            setTimeout(() => {
                                marker.setAnimation(null);
                            }, 1000);
                        }
                        self.infowindow.open(self.global.map, marker);
                    });
                    item.marker = marker;
                })(marker);

                function toggleBounce() {

                }
            }
        });
    }
}

var mapRender = new myMap();
/*Init function to put it in google maps call back t*/
function mapInit() {
    mapRender.inIntMap();
    mapRender.addingMarker();
    var AppViewModel = function () {
        let self = this;
        this.signs = mapRender.global.signs;
        this.query = ko.observable('');
        this.queryChanged = function (data, event) {
            self.signs().forEach((item) => {
                var flag = (item.name.toLowerCase().indexOf(this.query().toLowerCase()) !== -1);
                item.show(flag);
                item.marker.setMap(flag ? mapRender.global.map : null);
            });
        }
        this.clickAction = function (d) {
            google.maps.event.trigger(d.marker, 'click');
        }
    }
    // RUN KNOCKOUT
    ko.applyBindings(new AppViewModel());
}
function errorHandler(){
    alert("Error in loading Google maps Please Refresh")
}