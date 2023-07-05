const appointments = {
  current: [],
  DOM: { //references to elements used by component in DOM
    card: document.getElementById('appointments_card'),
    list: document.getElementById('appointments_list'),
    viewer: document.getElementById('viewer_card'),
    editor: document.getElementById('editor_card'),
    textfield_date: document.getElementById('appointment_date'),
    textarea: document.getElementById('appointment_comment'),
    title: document.querySelector('#editor_card .mdc-dialog__header__title'),
    date_picker_button: document.getElementById('appointment_date_picker')
  },
  date_picker: new mdDateTimePicker.default({ //initialize date picker component
    type: 'date',
    future: moment().add(2, 'years')
  }),
  edit: function() {
    appointments.editor.open();
    //Set state for date picker component and textfield
    let date;
    if (appointments.current) {
      appointments.DOM.title.textContent = 'Edit Appointment';
      appointments.DOM.textarea.value = appointments.current[1] || '';
      date = moment(appointments.current[0]);
    } else {
      appointments.DOM.title.textContent = 'Add Appointment';
      appointments.DOM.textarea.value = '';
      date = moment();
    }
    appointments.date_picker.time = date;
    appointments.DOM.textfield_date.value = date.format('MMMM DD YYYY');
  },
  editor: {
    open: function() {
      //Display Appointment Editor Component
      appointments.DOM.viewer.classList.remove('visible');
      appointments.DOM.editor.classList.add('visible');
      appointments.DOM.viewer.style.height = '0';
      appointments.DOM.editor.style.height = 'auto';
    },
    close: function() {
      //Hide Appointment Editor Componenet
      appointments.DOM.editor.classList.replace('visible', 'animating');
      setTimeout(() => {
        appointments.DOM.editor.classList.remove('animating');
      }, 120);
    }
  },
  viewer: {
    display: function(timestamp, comment) {
      //Display Appointment Viewer
      appointments.current = [timestamp, comment];
      appointments.DOM.editor.classList.remove('visible');
      appointments.DOM.viewer.classList.add('visible');
      appointments.DOM.viewer.style.height = 'auto';
      appointments.DOM.editor.style.height = '0';
      appointments.DOM.title.textContent = moment(timestamp).format('MMMM DD YYYY');
      document.getElementById('appointment_comments_display').textContent = comment;
    }
  },
  list: function() {
    //Display Appointment List Card
    const data = main.customers[profile.cid].appointments;
    //Clear Elements From List
    while (appointments.DOM.list.firstChild) {
      appointments.DOM.list.removeChild(appointments.DOM.list.firstChild);
    }
    if (data) {
      let timestamps = Object.keys(data).map(timestamp => Number(timestamp)).sort();
      for (let i = 0; i < timestamps.length; i++) {
        let timestamp = timestamps[i];
        const list_item = document.createElement('li');
        list_item.classList.add('mdc-list-item');
        list_item.textContent = moment(timestamp).format('MMMM DD YYYY');
        mdc.ripple.MDCRipple.attachTo(list_item);
        list_item.addEventListener('click', () => {
          appointments.viewer.display(timestamp, data[timestamp]);
          if (appointments.selected) {
            appointments.selected.classList.remove('mdc-list-item--selected');
          }
          appointments.selected = list_item;
          appointments.selected.classList.add('mdc-list-item--selected');
        });
        appointments.DOM.list.appendChild(list_item);
      }
    } else {
      const list_item = document.createElement('li');
      list_item.classList.add('mdc-list-item');
      list_item.textContent = 'No appointments';
      appointments.DOM.list.appendChild(list_item);
    }
    appointments.DOM.card.classList.add('visible');
  },
  cancel: function() {
    if (appointments.DOM.textarea.value.length > 0) {
      warning.warn('Are you sure you do not want to continue editing this appointment?', 'Yes');
    } else {
      appointments.editor.close();
    }
  },
  delete: function() {
    //Delete Appointment From Database
    delete main.customers[profile.cid].appointments[appointments.current[0]];
    //Display progressbar while updating database
    main.DOM.progressbar.style.opacity = 1;
    main.firestore.collection('customers').doc(profile.cid).update({
      appointments: main.customers[profile.cid].appointments
    }).then(() => {
      //Hide progressbar on successful database update
      main.DOM.progressbar.style.opacity = 0;
      appointments.DOM.viewer.classList.replace('visible', 'animating');
      setTimeout(() => {
        appointments.DOM.viewer.classList.remove('animating');
      }, 120);
      appointments.list();
      main.DOM.snackbar.show({
        message: 'Appointment Deleted'
      });
    }).catch(error => main.handle_error(error));
  },
  save: function() {
    //If Date Textfield value is matches the validation regex
    if (appointments.DOM.textfield_date.checkValidity()) {
      const timestamp = appointments.date_picker.time.valueOf();
      if (!main.customers[profile.cid].appointments) {
        main.customers[profile.cid].appointments = {};
      } else if (appointments.current) {
        delete main.customers[profile.cid].appointments[appointments.current[0]];
      }
      main.customers[profile.cid].appointments[timestamp] = appointments.DOM.textarea.value || '';
      //Display progressbar while updating database
      main.DOM.progressbar.style.opacity = 1;
      //Update Database with Appointment
      main.firestore.collection('customers').doc(profile.cid)
        .update({
          appointments: main.customers[profile.cid].appointments
        })
        .then(() => {
          //Hide progressbar on successful database update
          main.DOM.progressbar.style.opacity = 0;
          main.DOM.snackbar.show({
            message: 'Appointment Saved',
            timeout: 2750
          });
          //Hide Appointment Editor Component
          appointments.DOM.editor.classList.replace('visible', 'animating');
          setTimeout(() => {
            appointments.DOM.editor.classList.remove('animating');
          }, 120);
          //Update Appointment List
          appointments.list();
        })
        .catch(error => main.handle_error(error));
    } else {
      main.DOM.snackbar.show({
        message: 'A date is required.'
      });
    }
  },
  init: function() {
    document.getElementById('appointment_add').addEventListener('click', () => {
      appointments.current = null;
      appointments.edit();
    });

    document.getElementById('appointment_edit').addEventListener('click', this.edit);
    document.getElementById('appointment_delete').addEventListener('click', () => warning.warn('Delete this appointment?', 'Delete'));
    document.getElementById('appointment_cancel').addEventListener('click', this.cancel);
    document.getElementById('appointment_save').addEventListener('click', this.save);

    //Add Custom Styles to Date Picker Component
    document.querySelectorAll('#editor_card .mdc-floating-label').forEach(label => label.classList.add('mdc-floating-label--float-above'));
    appointments.DOM.textfield_date.addEventListener('click', () => {
      appointments.date_picker.trigger = appointments.DOM.textfield_date;
      appointments.date_picker.toggle();
      document.querySelector('.mddtp-prev-handle').innerHTML = `<i class="material-icons">keyboard_arrow_left</i>`;
      document.querySelector('.mddtp-next-handle').innerHTML = `<i class="material-icons">keyboard_arrow_right</i>`;
    });

    //When Date is Manually Edited
    appointments.DOM.textfield_date.addEventListener('onOk', () => {
      appointments.DOM.textfield_date.value = appointments.date_picker.time.format('MMMM DD YYYY'); //Reformat Date
    });
  }
};
