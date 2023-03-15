Blacklight.onLoad(function() {
  var historySupported = !!(window.history && window.history.pushState);

  if (historySupported) {
    History.Adapter.bind(window, 'statechange', function() {
      var state = History.getState();
      updatePage(state.url);
    });
  }

  $('[data-map="index"]').each(function() {
    var data = $(this).data(),
    opts = { baseUrl: data.catalogPath },
    world = L.latLngBounds([[-90, -180], [90, 180]]),
    geoblacklight, bbox;

    if (typeof data.mapBbox === 'string') {
      bbox = L.bboxToBounds(data.mapBbox);
    } else {
      $('.document [data-bbox]').each(function() {

        try {
          var currentBounds = L.bboxToBounds($(this).data().bbox);
          if (!world.contains(currentBounds)) {
            throw "Invalid bounds";
          }
          if (typeof bbox === 'undefined') {
            bbox = currentBounds;
          } else {
            bbox.extend(currentBounds);
          }
        } catch (e) {
          bbox = L.bboxToBounds("-180 -90 180 90");
        }
      });
    }

    if (!historySupported) {
      $.extend(opts, {
        dynamic: false,
        searcher: function() {
          window.location.href = this.getSearchUrl();
        }
      });
    }

    // instantiate new map
    geoblacklight = new GeoBlacklight.Viewer.Map(this, { bbox: bbox });

    // set hover listeners on map
    /*
     YJ added comments on 03/15/2023 11:57AM for display multiple bounding boxes.
     Single bounding box: bbox=-124.85 024.73 -066.76 049.30
     Multiple bounding box: bbox=-095.160000 041.680000 -074.320000 056.930000/-095.160000 041.680000 -074.320000 056.930000/-079.780000 044.990000 -057.110000 062.600000
   */
    $('#content')
      .on('mouseenter', '#documents [data-layer-id]', function() {
        if($(this).data('bbox').length > 0) {
        
          // YJ added to display multiple bounding boxes in list records page.
          bboxArray = $(this).data('bbox').split("/");
          if (bboxArray.length > 1) {
             bboxArray.forEach(function (eachBbox) {
                var eachBounds = L.bboxToBounds(eachBbox);
                geoblacklight.addBoundsOverlay(eachBounds);
             });       
          }
          else {
            var bounds = L.bboxToBounds($(this).data('bbox'));
            geoblacklight.addBoundsOverlay(bounds);
          }
        }
      })
      .on('mouseleave', '#documents [data-layer-id]', function() {
        geoblacklight.removeBoundsOverlay();
      });

    // add geosearch control to map
    geoblacklight.map.addControl(L.control.geosearch(opts));
  });

  function updatePage(url) {
    $.get(url).done(function(data) {
      var resp = $.parseHTML(data);
      $doc = $(resp);
      $('#documents').replaceWith($doc.find('#documents'));
      $('#sidebar').replaceWith($doc.find('#sidebar'));
      $('#sortAndPerPage').replaceWith($doc.find('#sortAndPerPage'));
      $('#appliedParams').replaceWith($doc.find('#appliedParams'));
      $('#pagination').replaceWith($doc.find('#pagination'));
      if ($('#map').next().length) {
        $('#map').next().replaceWith($doc.find('#map').next());
      } else {
        $('#map').after($doc.find('#map').next());
      }
    });
  }
});
