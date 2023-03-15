//= require geoblacklight/viewers/viewer

GeoBlacklight.Viewer.Map = GeoBlacklight.Viewer.extend({

  options: {
    /**
    * Initial bounds of map
    * @type {L.LatLngBounds}
    */
    /* YJ added comments on 03/15/2023 10:48AM.
       Corner of SouthWest, NorthEast: [[south, west], [north, east]]
       YUL MARC 034 field subfields defg: [[g, d], [f, e]]
       YUL GBLJSON ENVELOPE(d,e,f,g)
    */
    bbox: [[-82, -144], [77, 161]],
    opacity: 0.75
  },

  overlay: L.layerGroup(),

  load: function() { 
  /* YJ updated to display multiple bounding boxes in detail record page.
    if (this.data.mapBbox) {
      this.options.bbox = L.bboxToBounds(this.data.mapBbox);
    } 
  */
    // This is for list record initializing.
    if (this.data.mapBbox) {
      bboxArray = this.data.mapBbox.split("/");
      this.options.bbox = L.bboxToBounds(bboxArray[0]);
    }

    this.map = L.map(this.element).fitBounds(this.options.bbox);

    // Add initial bbox to map element for easier testing
    if (this.map.getBounds().isValid()) {
      this.element.setAttribute('data-js-map-render-bbox', this.map.getBounds().toBBoxString());
    }

    this.map.addLayer(this.selectBasemap());
    this.map.addLayer(this.overlay);
    
    if (this.data.map !== 'index') {
      this.addBoundsOverlay(this.options.bbox);
    }

    /*
      YJ added on 03/15/2023 1:17PM.
      List records page data.map=index
      Detail record page data.map=item
    */
    if (this.data.mapBbox) {
      for (let i = 0; i < bboxArray.length; i++) {
           this.options.bbox = L.bboxToBounds(bboxArray[i]);
           if (this.data.map !== 'index') {
              this.addBoundsOverlay(this.options.bbox);
           }
      }
    }
  },

  /**
   * Add a bounding box overlay to map.
   * @param {L.LatLngBounds} bounds Leaflet LatLngBounds
   */ 
  addBoundsOverlay: function(bounds) {
    if (bounds instanceof L.LatLngBounds) {
      this.overlay.addLayer(L.polygon([
        bounds.getSouthWest(),
        bounds.getSouthEast(),
        bounds.getNorthEast(),
        bounds.getNorthWest()
      ])); 
    }
    /* Sample Leaflet polygon coordinates
     082.22(d),147.32(e),054.53(f),016.36(g)
     18.739046(s), 80.505755(w), 15.892787(n), 77.236081(e)
     var latlngs = [[18.739046, 80.505755], [18.739046, 77.236081], [15.892787, 77.236081], [15.892787, 80.505755]];
     var polygon = L.polygon(latlngs, {color: 'red'});
     this.overlay.addLayer(polygon);
    */
  }, 

  /**
   * Remove bounding box overlay from map.
   */
  removeBoundsOverlay: function() {
    this.overlay.clearLayers();
  },

  /**
  * Selects basemap if specified in data options, if not return positron.
  */
  selectBasemap: function() {
    var _this = this;
    if (_this.data.basemap) {
      return GeoBlacklight.Basemaps[_this.data.basemap];
    } else {
      return GeoBlacklight.Basemaps.positron;
    }
  }
});
