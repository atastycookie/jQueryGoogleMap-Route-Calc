(function($){  
var img = 'img/';
//////////////////////// FUNCTION TO GIVE AUTOCOMPLETE TO EACH CALC INPUTS //////////////
function autocomplete_map(container){
  container.find("input").each(function(){
     new google.maps.places.Autocomplete($(this)[0]);
     $(this).attr('placeholder','')   
  });
}

////////////////////////// FUNCTION TO PRIN ROUTE INFO ///////////
function print_route(panel){
 var a = window.open('','','width=300,height=300');
 a.document.open("text/html");
 a.document.write(panel.html());
 a.document.close();
 a.print();
}

////////////////////////// START GOOGLE MAP API /////////////////
  var myOptions = {
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
  , geocoder = new google.maps.Geocoder();

  
function center(imap,iaddress,info_window,zoom){
	var map;
    map = new google.maps.Map(imap, {
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var address = iaddress;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
        if(info_window != ''){
          var infowindow = new google.maps.InfoWindow({
            content: info_window
          });   
          infowindow.open(map,marker);
           google.maps.event.addListener(marker, 'click', function() {
              infowindow.open(map,marker);              
           });
        }
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
    setTimeout(function(){$('.map_container').find('img').css({'max-width':'none','max-height':'none'});},500);
}    

  function initialize(imap,ipanel,start,end,wp,travel_mode_select,opt_wp,printable_panel,DivContainerDistance) {
	var directionsDisplay = new google.maps.DirectionsRenderer({draggable: true})
	  , directionsService = new google.maps.DirectionsService()
	  , oldDirections = []
	  , currentDirections;	  
    map = new google.maps.Map(imap, myOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(ipanel); 
    google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
        if (currentDirections) {
          oldDirections.push(currentDirections);
        }
        currentDirections = directionsDisplay.getDirections();  
        computeTotalDistance(directionsDisplay.directions,DivContainerDistance);
    });    
    var waypts = []
    , dest = wp
    , request = {
      origin: start,
      destination: end,
      waypoints:waypts,
      optimizeWaypoints:opt_wp,
      travelMode: google.maps.DirectionsTravelMode[travel_mode_select]
    };    
    for (var i = 0; i < dest.length; i++) {
      if (dest[i].value != "") {
        waypts.push({
            location:dest[i].value,
            stopover:true});
      }
    }  
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        printable_panel.html('')
        var route = response.routes[0];
        for (var i = 0; i < route.legs.length; i++) {
          var routeSegment = i + 1;
          printable_panel.append("<b>Route Segment: " + routeSegment + "</b><br />"
                               +route.legs[i].start_address + " to "+route.legs[i].end_address + "<br />"
                               +route.legs[i].distance.text + "<br /><br />");          
        }        
      }
      if ( status != 'OK' ){ alert(status); return false;}
      setTimeout(function(){$('.map_container').find('img').css({'max-width':'none','max-height':'none'});},500);
    }); 
    setTimeout(function(){$('.map_container').find('img').css({'max-width':'none','max-height':'none'});},500); 
  }

 
  function computeTotalDistance(result,DivContainerDistance) {
    var total = 0;
    var myroute = result.routes[0];
    for (i = 0; i < myroute.legs.length; i++) {
      total += myroute.legs[i].distance.value;
    }
    total = total / 1000.
    $(DivContainerDistance).html('Total distance: '+total + " km")
  } 
////////////////////////// END GOOGLE MAP API /////////////////
  
 $.fn.JQMap = function(options) {  
            /***************************************/
            /** List of available default options **/
            /***************************************/
            var defaults = {  
            jqm_Height           :  '100%',//--> height of map container
            jqm_Width            :  '100%',//--> width of map container
            jqm_PercentCalcPanel :  '40',//--> width in percentual of overlay calc panel 
            jqm_PercentCalcDir   :  '60',//--> width in percentual of overlay directions panel
            jqm_StartOpacity     :  10,//--> start Opacity of search and direction overlay div
            jqm_OverlayColor     :  '#ccc',//--> color of search and direction overlay div
            jqm_TextCalc         :  'ROUTE CALC FORM',//--> text of button to slide calc form
            jqm_TextDirection    :  'DIRECTIONS',//--> text of button to slide directions
            jqm_PrintRouteText   :  'Print route',//--> text of print route button
            jqm_WpExtra          :  'You can use only 50 destinations plus start and destination, form more destination you nedd a business account',//--> text for wp excess
            jqm_TextButtonCalc   :  'Calculate',//--> text of button to calculate route            
            jqm_TextTravelMode   :  'Travel Mode',//--> text of travel mode select
            jqm_TextDriving      :  'DRIVING',//--> text DRIVING mode
            jqm_TextWalking      :  'WALKING',//--> text WALKING mode
            jqm_TextBicy         :  'BICYCLING',//--> text BICYCLING mode
            jqm_TextWP           :  'Optimize Waypoints',//--> text Optimize Waypoints             
            jqm_Fixdestination   :  '',//--> Set a fix destination
            jqm_TexStartPoint         :  '',//--> text of Info Window on page load
            jqm_ZoomStartPoint      : 17,
            jqm_TextButtonAdd    :  'Add Destination'//--> text of button to add a destination
            }; 
          
   var o = $.extend(defaults, options); 
    return this.each(function() {                     
//--------------------------------------------------------------------------////---------------------------------------------------------//    
          /************** create map, form to calc route and info panel *********************/    
               var $this = $(this)
                   ,$input_destination = '<div style="padding:5px" class="container_dest">\
                                            <span id="marcker2"><img src="http://maps.gstatic.com/mapfiles/markers2/icon_greenB.png" alt="" style="vertical-align:middle" /></span>\
                                            <input type="text" value="" /><span class="elimina" style="cursor:pointer;display:none"><img src="'+img+'el.gif" alt="" /></span>\
                                         </div>';
               if( o.jqm_Width == '' || o.jqm_Width == 0){
                 alert('must give a width in options to continue')
                 $this.html('must give a width in options to continue')
                 return false;
               }
               if( o.jqm_Height == '' || o.jqm_Height == 0){
                alert('must give a height in options to continue')
                $this.html('must give a height in options to continue')
                return false;
               }       
               if( o.jqm_Fixdestination != ''){
                 $input_destination = '<input type="hidden" value="'+o.jqm_Fixdestination+'" class="final_destination" />';
               }                 
               /******* calculate number of map ************/
               var number_map = $('.map').length + 1                    
               $this.css('width',o.jqm_Width+'px').html('<span class="jqm_option jqm_route">'+o.jqm_TextCalc+'</span> '
                          +'<span class="jqm_option jqm_indication">'+o.jqm_TextDirection+'</span> '
                          +'<span class="jqm_option jqm_distance"></span>'
                          +'<div class="map_container" style="width:'+o.jqm_Width+'px;height:'+o.jqm_Height+'px;position:relative;">'
                          +'  <div class="opacity_search" style="width:'+o.jqm_PercentCalcPanel+'%;height:100%;position:absolute;top:0px;z-index:9;filter:alpha(opacity='+o.jqm_StartOpacity*10+');-moz-opacity:'+o.jqm_StartOpacity/10+';opacity:'+o.jqm_StartOpacity/10+';background:'+o.jqm_OverlayColor+';left:0px;display:none"></div>'
                          +'  <div class="opacity_panel" style="width:'+o.jqm_PercentCalcDir+'%;height:100%;position:absolute;top:0px;z-index:9;filter:alpha(opacity='+o.jqm_StartOpacity*10+');-moz-opacity:'+o.jqm_StartOpacity/10+';opacity:'+o.jqm_StartOpacity/10+';background:'+o.jqm_OverlayColor+';right:0px;display:none"></div>'
                          +'  <div class="panel" style="overflow:auto;width:'+o.jqm_PercentCalcDir+'%;height:100%;position:absolute;top:0px;z-index:999;right:0px;display:none"></div>'
                          +'  <div class="form_search" style="height:100%;width:'+o.jqm_PercentCalcPanel+'%;overflow:auto;position:absolute;z-index:99;top:0px;left:0px;display:none">'
                          +'    <div class="destinations">'
                          +'      <div style="padding:5px" class="container_dest">'
                          +'         <span id="marcker1"><img src="http://maps.gstatic.com/mapfiles/markers2/icon_greenA.png" alt="" style="vertical-align:middle" /></span><input type="text" value="" /><span class="elimina" style="cursor:pointer;display:none"><img src="'+img+'el.gif" alt="" /></span>'
                          +'      </div>'
                          +      $input_destination
                          +'    </div>'
                          +      o.jqm_TextTravelMode+'<br/><select class="TravelMode">'
                          +'     <option value="DRIVING" selected="selected">'+o.jqm_TextDriving+'</option>'
                          +'     <option value="WALKING">'+o.jqm_TextWalking+'</option>'
                          +'     <option value="BICYCLING">'+o.jqm_TextBicy+'</option>'
                          +'    </select> <input type="checkbox" name="opt_wp" class="opt_wp" id="'+number_map+'" value="1" /><label for="'+number_map+'">'+o.jqm_TextWP+'</label><br/>'
                          +'    <button class="button-primary add_destination"><img style="vertical-align:middle" src="'+img+'add.png" alt="" /><span>'+o.jqm_TextButtonAdd+'</span></button>'
                          +'    <button class="button-primary start_calc"><img style="vertical-align:middle" src="'+img+'calc.png" alt="" /><span>'+o.jqm_TextButtonCalc+'</span></button>'
                          +'    <button class="button-primary print_route"><img style="vertical-align:middle" src="'+img+'print_route.png" alt="" /><span>'+o.jqm_PrintRouteText+'</span></button>'
                          +'   </div>'
                          +'   <div class="map" style="width:100%;height:100%;"><div style="width:100%;text-align:center;position:absolute;top:50%;">CLICK ON ROUTE CALC FORM AND START</div></div>'
                          +'   <div class="printable_panel" style="display:none;"></div>'
                          +'  </div>');
               var $start_calc = $this.find('.start_calc')
               ,   $map = $this.find('.map')
			   ,   $div_distance = $this.find('.jqm_distance')
               ,   $panel = $this.find('.panel')
               ,   $destination = $this.find('.destinations')
               ,   $add_destination = $this.find('.add_destination')
               ,   $button_route = $this.find('.jqm_route')
               ,   $button_indications = $this.find('.jqm_indication') 
               ,   $travel_select = $this.find('.TravelMode')
               ,   $printable_panel = $this.find('.printable_panel')
               ,   $opt_wp = $this.find('.opt_wp')
               ,   $print_route = $this.find('.print_route') 
               ,   $form_search = $this.find('.form_search') 
               ,   $opacity_search = $this.find('.opacity_search')
               ,   $opacity_panel = $this.find('.opacity_panel')
               ,   marck_array = ",A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z"
               ,   marck = marck_array.split(",");               
               autocomplete_map($destination);
               $start_calc.click(function(){
                   initialize($map[0],$panel[0],$destination.find("input:first").val(),$destination.find("input:last").val(),$this.find('.wp'),$travel_select.val(),$opt_wp.prop('checked'),$printable_panel,$div_distance);
               });
               $travel_select.change(function(){
                 initialize($map[0],$panel[0],$destination.find("input:first").val(),$destination.find("input:last").val(),$this.find('.wp'),$(this).val(),$opt_wp.prop('checked'),$printable_panel,$div_distance);
               });
               $opt_wp.click(function(){
                 initialize($map[0],$panel[0],$destination.find("input:first").val(),$destination.find("input:last").val(),$this.find('.wp'),$travel_select.val(),$(this).prop('checked'),$printable_panel,$div_distance);
               });
               $print_route.click(function(){
                print_route($printable_panel);
               });
               if(o.jqm_Fixdestination != ''){
                 center($map[0],o.jqm_Fixdestination,o.jqm_TexStartPoint,o.jqm_ZoomStartPoint);          
               }   
               $add_destination.click(function(){
                 if ($destination.find("input").length >= 50){ alert(o.jqm_WpExtra); return false;};
                 var d_lenght = $destination.find("input").not('.final_destination').length+1
                 , marcker = '<img src="http://maps.gstatic.com/mapfiles/markers2/icon_green'+marck[d_lenght]+'.png" alt="" style="vertical-align:middle" />';
                 if( o.jqm_Fixdestination != ''){
                   $('<div style="padding:5px" class="container_dest"><span id="marcker'+d_lenght+'">'+marcker+'</span><input type="text" value="" /><span class="elimina" style="cursor:pointer"><img src="'+img+'el.gif" alt="" /></span></div>').insertBefore($destination.find(".final_destination"));
                 }else{
                  $destination.append('<div style="padding:5px" class="container_dest"><span id="marcker'+d_lenght+'">'+marcker+'</span><input type="text" value="" /><span class="elimina" style="cursor:pointer"><img src="'+img+'el.gif" alt="" /></span></div>');
                 }
                 $destination.find("input").not('.final_destination').addClass("wp");
                 $destination.find("input:first,input:last").not('.final_destination').removeClass("wp");
                 if( o.jqm_Fixdestination != ''){
                  var max_input = 2;
                 }else{
                  var max_input = 3;
                 }
                 if($destination.find("input").not('.final_destination').length < max_input){
                    $destination.find("input").not('.final_destination').eq(0).next("span").css("display","none");
                    $destination.find("input").not('.final_destination').eq(1).next("span").css("display","none");
                 }else{
                    $destination.find("input").not('.final_destination').next("span").css("display","");
                 }  
                 autocomplete_map($destination);
                 $this.find('.elimina').click(function(){
                   $(this).parent("div").remove();
                   $destination.find('.container_dest').each(function(i){
                     i++; 
                     marcker =  '<img src="http://maps.gstatic.com/mapfiles/markers2/icon_green'+marck[i]+'.png" alt="" style="vertical-align:middle" />';   
                     $(this).find('span[id^="marcker"]').attr({'id':'marcker'+i}).html(marcker);  
                   });
                   var tot_input = $destination.find("input").not('.final_destination').length;
                   $destination.find("input").not('.final_destination').addClass("wp");
                   $destination.find("input:first,input:last").not('.final_destination').removeClass("wp");
                   if($destination.find("input").not('.final_destination').length < max_input){
                    $destination.find("input").not('.final_destination').eq(0).next("span").css("display","none");
                    $destination.find("input").not('.final_destination').eq(1).next("span").css("display","none");
                   }else{
                    $destination.find("input").not('.final_destination').next("span").css("display","");
                   }
                   autocomplete_map($destination)
                  });                 
                });  
                
                $button_route.click(function(){
                   $(this).toggleClass('jqm_option-c');
                   $form_search.slideToggle('slow');
                   $opacity_search.slideToggle('slow');
                });                
                $button_indications.click(function(){
                   $(this).toggleClass('jqm_option-c');
                   $panel.slideToggle('slow');
                   $opacity_panel.slideToggle('slow');
                });                               
//--------------------------------------------------------------------------////---------------------------------------------------------//

    });  
 };  
})(jQuery);