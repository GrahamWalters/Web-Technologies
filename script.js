$(function() {
  // Create a backup of the schedule table
  var scheduleHTML = $('#schedule').html();

  $.getJSON(
    'https://tracker.napier.ac.uk/timetable/data.pl', {
      'action':'list'
    }, function(l) {

      var schools = ['<option>Please Select a School</option>'];
      for (var s in l.school) {
        schools.push('<option value="'+ l.school[s].id +'">'+ l.school[s].name +'</option>');
      }
      $('#schools').html(schools.join(''));
    }
  );


  $('#schools').change(function(e) {
    $.getJSON(
      'https://tracker.napier.ac.uk/timetable/data.pl', {
        'action':'list'
      }, function(l) {

        var school = $('#schools').val();

        var modules = ['<option>Please Select a Module</option>'];
        if (school != null) {
          /*
            loop thought the subject in the school.
          */

          for (var s in l.school[school].subjects) {
            for (var m in l.module[l.school[school].subjects[s]])
              modules.push('<option value="'+
                l.module[l.school[school].subjects[s]][m][0] +
                '">' +
                l.module[l.school[school].subjects[s]][m][1] +
                '</option>'
              );
          }
        }

        $('#modules').html(modules.join(''));
      }
    );
  });



  $('#modules').change(function() {
    // Clear out the previous table.
    $('#schedule').html(scheduleHTML);

    $.getJSON(
      'https://tracker.napier.ac.uk/timetable/cw.pl', {
        'module': $('#modules').val()
      }, function(m) {
        // console.log(m);
        $('#moduleCode').text(m.SITS_MOD_CODE);
        $('#moduleName').text(m.SITS_MOD_NAME);
        $('#moduleLeader').text(m.SITS_MOD_LEADER);
        $('#credit').text(m.SITS_MOD_CRDT);


        // Set the school name using m.SITS_DPT_CODE
        $.getJSON(
          'https://tracker.napier.ac.uk/timetable/cw.pl', {
          'action':'list'
          }, function(s) {
            $('#school').text(
              s.school[ $('#schools').val() ].name
            );
          }
        );

        // Loop through each Event.
        for (var e in m.events) {

          // Some events are listed multiple times which fucks up the duration cycle.
          $('#'+m.events[e].slot+':empty').each(function() {

            // Add the events to the timetable.
            $(this).html(
              m.SITS_MOD_NAME  + '<br />' +
              m.events[e].type + '<br />' +
              m.events[e].rooms.join(', ')
            );

            // Loop throught the event duration.
            // For each cycle we remove the next hour.
            for (var i = 1; i < m.events[e].duration; i++) {
              $(this).next().remove();
            }

            // Now we set the colspan to the length of the event.
            $(this).attr('colspan', m.events[e].duration);
          });
        }

        $('#schedule th td:empty').html('<br /><br /><br />');

      }
    );

    $.getJSON(
      'https://tracker.napier.ac.uk/timetable/cw.pl', {
        'module': $('#modules').val(),
        'action':'related'
      }, function(r) {

        var relatedModules = [];
        for (var m in r.alsotaking) {
          relatedModules.push( '(' + r.alsotaking[m][0] + ') ' + r.alsotaking[m][1] );
        }

        $('#related-modules').html(relatedModules.join('<br />'));
      }
    );

  });
});

