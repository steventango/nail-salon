const profile = {
  cid: '',
  DOM: {
    dialog: {
      _: new mdc.dialog.MDCDialog(document.getElementById('profile_dialog')),
      textfield: {
        _: document.getElementById('profile_textfields'),
        name: document.getElementById('dialog-text-field__name'),
        email: document.getElementById('dialog-text-field__email'),
        phone: document.getElementById('dialog-text-field__phone'),
        address: document.getElementById('dialog-text-field__address'),
        history: document.getElementById('dialog-text-field__history')
      },
    },
    action_items: document.getElementById('profile_action_items'),
    card: document.getElementById('profile_card'),
    list: document.getElementById('profile_details'),
  },
  display: function(customer) {
    document.querySelector('#profile_card .mdc-dialog__header__title').textContent = customer.name;
    profile.DOM.list.innerHTML = '';
    if (customer.email || customer.phone || customer.address || customer.history) {
      if (customer.email) {
        profile.DOM.list.innerHTML += `
          <a href="mailto:${customer.email}" class="mdc-list-item" target="_blank" data-mdc-auto-init="MDCRipple">
          <span class="mdc-list-item__graphic material-icons" aria-hidden="true">email</span>
          ${customer.email}</a>`;
      }
      if (customer.phone) {
        var matches = customer.phone.replace(/\D/g, '').match(/^(\d{3})(\d{3})(\d{4})$/);
        profile.DOM.list.innerHTML += `<a href="tel:${customer.phone}" class="mdc-list-item" target="_blank" data-mdc-auto-init="MDCRipple">
          <span class="mdc-list-item__graphic material-icons" aria-hidden="true">phone</span>
          ${!matches ? customer.phone : "(" + matches[1] + ") " + matches[2] + "-" + matches[3]}</a>`;
      }
      if (customer.address) {
        profile.DOM.list.innerHTML += `<a href="https://www.google.com/maps/search/?api=1&query=${escape(customer.address)}" class="mdc-list-item" target="_blank" data-mdc-auto-init="MDCRipple">
          <span class="mdc-list-item__graphic material-icons" aria-hidden="true">location_on</span>
          ${customer.address}</a>`;
      }
      if (customer.history) {
        profile.DOM.list.innerHTML += `<a class="mdc-list-item mdc-list-item--large">
          <span class="mdc-list-item__graphic material-icons" aria-hidden="true">book</span>
          <span class="mdc-list-item__text">${customer.history}</span></a>`;
      }
    } else {
      profile.DOM.list.innerHTML += `
        <a class="mdc-list-item mdc-list-item--disabled">
        <span class="mdc-list-item__graphic material-icons" aria-hidden="true">error_outline</span>
        No customer data</a>`;
    }
    profile.DOM.card.classList.add('visible');
    appointments.list();
    appointments.DOM.viewer.classList.replace('visible', 'animating');
    appointments.DOM.editor.classList.replace('visible', 'animating');
    setTimeout(() => {
      appointments.DOM.viewer.classList.remove('animating');
      appointments.DOM.editor.classList.remove('animating');
    }, 120);
    mdc.autoInit(profile.DOM.list);
  },
  render: function(cid) {
    profile.cid = cid;
    if (cid in main.customers) {
      profile.display(main.customers[cid]);
    } else {
      main.DOM.progressbar.style.opacity = 1;
      main.firestore.collection('customers')
        .doc(cid)
        .get()
        .then(doc => {
          main.customers[cid] = doc.data();
          profile.display(main.customers[cid]);
          main.DOM.progressbar.style.opacity = 0;
        })
        .catch(error => main.handle_error(error));
    }
  },
  edit: function(cid) {
    profile.cid = cid;
    let customer = main.customers[profile.cid];
    if (customer) {
      document.querySelector('#profile_dialog .mdc-dialog__header__title').textContent = 'Edit Customer';
      document.querySelectorAll('#profile_dialog .mdc-floating-label').forEach(label => label.classList.add('mdc-floating-label--float-above'));
    } else {
      customer = {};
      document.querySelector('#profile_dialog .mdc-dialog__header__title').textContent = 'Add Customer';
    }
    profile.DOM.dialog.textfield.name.value = customer.name || '';
    profile.DOM.dialog.textfield.email.value = customer.email || '';
    profile.DOM.dialog.textfield.phone.value = customer.phone || '';
    profile.DOM.dialog.textfield.address.value = customer.address || '';
    profile.DOM.dialog.textfield.history.value = customer.history || '';
    profile.DOM.dialog._.show();
  },
  delete: function() {
    const batch = main.firestore.batch();
    batch.delete(main.firestore.collection('customers').doc(profile.cid));
    batch.update(main.firestore.collection('customers').doc('index'), {
      [profile.cid]: firebase.firestore.FieldValue.delete()
    });
    main.DOM.progressbar.style.opacity = 1;
    batch.commit()
      .then(() => {
        delete main.customers[profile.cid];
        delete search.index[profile.cid];
        search.keyup();
        main.DOM.progressbar.style.opacity = 0;
        profile.DOM.card.classList.replace('visible', 'animating');
        appointments.DOM.card.classList.replace('visible', 'animating');
        appointments.DOM.viewer.classList.replace('visible', 'animating');
        appointments.DOM.editor.classList.replace('visible', 'animating');
        setTimeout(() => {
          profile.DOM.card.classList.remove('animating');
          appointments.DOM.card.classList.remove('animating');
          appointments.DOM.viewer.classList.remove('animating');
          appointments.DOM.editor.classList.remove('animating');
        }, 120);
        main.DOM.snackbar.show({
          message: 'Customer deleted'
        });
      }).catch((error) => main.handle_error(error));
  },
  confirmed: function(cid, customer, message) {
    const old_name = search.index[cid];
    search.index[cid] = customer.name;
    main.DOM.progressbar.style.opacity = 0;
    main.firestore.collection('customers')
      .doc('index')
      .update(search.index)
      .then(() => {
        main.customers[cid] = Object.assign(main.customers[cid] || {}, customer);
        if (old_name != customer.name) {
          search.update(cid);
        }
        main.DOM.snackbar.show({
          message: message,
          timeout: 2750
        });
        profile.render(cid);
      });
  },
  cancel: function() {
    var customer = {
      name: profile.DOM.dialog.textfield.name.value,
      email: profile.DOM.dialog.textfield.email.value,
      phone: profile.DOM.dialog.textfield.phone.value,
      address: profile.DOM.dialog.textfield.address.value,
      history: profile.DOM.dialog.textfield.history.value
    };
    if (Object.values(customer).some(value => value.length > 0)) {
      warning.warn('Are you sure you do not want to continue editing this customer?', 'Yes');
    }
  },
  save: function() {
    if (!profile.DOM.dialog.textfield.name.checkValidity()) {
      main.DOM.snackbar.show({
        message: 'A name is required.'
      });
      return;
    }

    if (!profile.DOM.dialog.textfield.email.checkValidity()) {
      main.DOM.snackbar.show({
        message: 'Please enter a valid email address.'
      });
      return;
    }

    if (!profile.DOM.dialog.textfield.phone.checkValidity()) {
      main.DOM.snackbar.show({
        message: 'Please enter a valid phone number.'
      });
      return;
    }

    var customer = {
      name: profile.DOM.dialog.textfield.name.value,
      email: profile.DOM.dialog.textfield.email.value,
      phone: profile.DOM.dialog.textfield.phone.value,
      address: profile.DOM.dialog.textfield.address.value,
      history: profile.DOM.dialog.textfield.history.value
    };

    profile.DOM.dialog._.close();
    main.DOM.progressbar.style.opacity = 1;
    if (profile.cid.length < 1) {
      main.firestore.collection('customers')
        .add(customer)
        .then(docRef => profile.confirmed(docRef.id, customer, 'Customer Saved'))
        .catch(error => main.handle_error(error));
    } else {
      main.firestore.collection('customers').doc(profile.cid)
        .update(customer)
        .then(() => profile.confirmed(profile.cid, customer, 'Customer Updated'))
        .catch(error => main.handle_error(error));
    }
  },
  init: function() {
    document.getElementById('fab').addEventListener('click', () => profile.edit(''));
    document.getElementById('profile_edit').addEventListener('click', () => profile.edit(profile.cid));
    document.getElementById('profile_delete').addEventListener('click', () => warning.warn('Delete this customer?', 'Delete'));
    document.querySelector('.mdc-dialog__footer__button--save').addEventListener('click', this.save);
    document.querySelector('.mdc-dialog__footer__button--cancel').addEventListener('click', this.cancel);
  }
};
