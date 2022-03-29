import { xnum, ynum } from './static/constants.js';
import { zoneColors, zoneSymbols } from './static/zones.js';
import {Cell, Plant, Animal, Substrate, Memorial} from './static/classes.js';
import { cells } from './grid.js';

function showSpeech (agent) {
    if ( $('.speechpanel').is(":visible") ){
        hideSpeech();
    } else {
        var $speechPanel =  $('<div/>', {
            class: 'speechpanel',
        })
        .appendTo('#container')
        .html(agent.narrative[Math.floor(Math.random() * agent.narrative.length)] + "</br></br><a target='_blank' href='" + agent.link + "'> read more </a></br>")

        $speechPanel.scrollTop($($speechPanel)[0].scrollHeight);
    }
}
// shows the input form for adding a new memorial
function showMemorialInput (cellID) {
    if ( $('.speechpanel').is(":visible") ){
        hideSpeech();
    }

    else{
        var $speechPanel =  $('<div/>', {
            class: 'speechpanel',
        })
        .appendTo('#container')
        .html("<form action='addmem' method='POST'><p id='errorText' style='color:red;display:none;'>please fill out all required fields in order to share your memorial</p>"
        + "<label for='memTitleInput'>what are you mourning?</label></br><textarea id='memTitleInput' type='text' name='memTitle'></textarea></br></br>"
        + "<label for='memDescInput'>why are you mourning? share a story, emotion, or message for your memorial.</label></br><textarea id='memDescInput' type='text' name='memDesc'></textarea></br></br>"
        + "<label for='memAuthorInput'>what is your name? (optional)</label></br><textarea id='memAuthorInput' type='text' name='memAuthor'></textarea></br></br>"
        + "<label for='memColorInput'>pick a color for your memorial</labl></br><input id='memColorInput' type='color' name='memColor'></input></br></br>"
        + "<button id='addMemorial' type='button'>add memorial</button></form>")

        $('#addMemorial').click(function(){addMemorial(cellID)});
        // var $memAddButton = $('<button/>', {
        //   class: 'addMemorial',
        //   type: 'submit',
        //   click: (function(){ addMemorial(cellID) } )
        // })
        // .appendTo($speechPanel)
        // .html("add memorial");

        $speechPanel.scrollTop($($speechPanel)[0].scrollHeight);
    }
}

function hideSpeech () {
    $('.speechpanel').remove();
}

function addMemorial (cellID) {
  var title = $('#memTitleInput').val();
  var desc = $('#memDescInput').val();
  var color = $('#memColorInput').val();
  var author = $('#memAuthorInput').val();
  if (title && desc && color) {
    if (title.length <= 500 && desc.length <= 5000 && author.length <= 500) {
      $('#errorText').hide();
      var mem = new Memorial(cellID, $('#memTitleInput').val(), $('#memAuthorInput').val(), [$('#memDescInput').val()], $('#memColorInput').val(), zoneSymbols[cells[cellID].zone - 1]);
      var zoneCol = zoneColors[cells[mem.id].zone - 1];
      cells[cellID].zone = 7;
      cells[cellID].memorial = mem;

      console.log(cells[cellID]);
      $(`#${cellID}`).css({'background-color': mem.color, 'color': zoneCol}).html("<span>" + mem.symbol + "</span>");
      hideSpeech();
      $('.infopanel').toggle();

      $.post("/addmem", mem, function(data, status){
        console.log("memorial being added to database");
      });
    } else {
      $('#errorText').html('please limit your information to 500 characters for title and author, and 5000 characters for description').show();
      $('#errorText').scrollTop($('#errorText')[0].scrollHeight);
    }
  } else {
    $('#errorText').html('please fill out all required fields in order to share your memorial').show();
    $('#errorText').scrollTop($('#errorText')[0].scrollHeight);
  }
}

function showInfo (cellID) {
    hideSpeech();
    var cell = cells[cellID];
    $('.infopanel').children().remove();
    $('.infopanel').toggle();

    $('.infopanel').html("<p style='padding:20px'> in " + cell.zoneName + "...</p>");

    if (cell.zone != 6) {
      // panel with information about memorial
      var $memInfo = $('<div/>', {
        class: 'infobox',
      })
      .appendTo('.infopanel')
      if(cell.memorial && $('.infopanel').is(":visible")) {
        // show the memorial title, author, description
        var $symbolInfo =  $('<p/>', {
            class: 'symbolinfo',
        })
        .appendTo($memInfo)
        .html(cell.memorial.title + "[<font color='" + cell.memorial.color + "'>" + cell.memorial.symbol + "</font>]   </br><i>"
        + cell.memorial.author + "</i>" + "</br></br>"
        + cell.memorial.narrative + "</br></br>");

        // $('<span/>', {
        //     class: 'companion',
        //     click: (function(){ showSpeech(cell.memorial) } ),
        // }).appendTo($symbolInfo)
        // .html("show description")
      } else {
        // input field to add a new memorial
        var $symbolInfo =  $('<p/>', {
            class: 'symbolinfo',
            click: (function(){ showMemorialInput(cellID) } )
        })
        .appendTo($memInfo)
        .html("<span class='addMemLink'>add memorial</span>")
      }
    }



    // var $substrateInfo =  $('<div/>', {
    //     class: 'infobox',
    // })
    // .appendTo('.infopanel')
    //
    // var $symbolInfo =  $('<p/>', {
    //     class: 'symbolinfo',
    // })
    // .appendTo($substrateInfo)
    // .html(cell.substrate.name + "   " + "[<font color= "+ cell.substrate.color +">" + cell.substrate.symbol + "</font>]" + "<br>" +
    //     "a kind of " + cell.substrate.type + "</br> </br>")
    //
    // $('<span/>', {
    //     class: 'companion',
    //     click: (function(){   showSpeech(cell.substrate) }),
    // }).appendTo($symbolInfo)
    // .html("show narrative")

    if(cell.plant && $('.infopanel').is(":visible")){
        var $plantInfo = $('<div/>', {
            class: 'infobox',
        }).appendTo('.infopanel')

        var $symbolInfo =  $('<p/>', {
            class: 'symbolinfo',
        })
        .appendTo($plantInfo)
        .html(cell.plant.name + "   " + "[<font color= "+ cell.plant.color +">" + cell.plant.symbol + "</font>]" + "<br>" +
            "<i>" + cell.plant.author + "</i>" + "</br></br>")

        if(cell.plant.notes !== '') $symbolInfo.append(cell.plant.notes + "</br> </br>" )

        $('<span/>', {
            class: 'companion',
            click: (function(){ showSpeech(cell.plant) } ),
        }).appendTo($symbolInfo)
        .html("read memorial")

    }

    if(cell.occupant){
        var occupant = cell.occupant.parentArray[cell.occupant.id];

        var $occupantInfo = $('<div/>', {
            class: 'infobox',
        }).appendTo('.infopanel')

        var $symbolInfo =  $('<p/>', {
            class: 'symbolinfo',
        })
        .appendTo($occupantInfo)
        .html(cell.occupant.name + "   " + "[<font color= "+ cell.occupant.color +">" + cell.occupant.symbol + "</font>]" + "<br>" +
             "<i>" + cell.occupant.author + "</i>" + "</br></br>")

        $('<span/>', {
            class: 'companion',
            click: (function(){   showSpeech(occupant) } ),
        }).appendTo($symbolInfo)
        .html("read memorial")
    }

}

export { showInfo };
