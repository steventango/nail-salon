const warning = {
  DOM: {
    dialog: new mdc.dialog.MDCDialog(document.getElementById('warning_dialog')),
    description: document.getElementById('warning-dialog-description'),
    button: document.getElementById('warning-dialog-button')
  },
  warn: function(message, button_text) {
    this.message = message;
    this.DOM.description.textContent = message;
    this.DOM.button.textContent = button_text;
    this.DOM.dialog.show();
  },
  init: function() {
    this.DOM.dialog.listen('MDCDialog:cancel', () => {
      switch (this.message) {
        case 'Are you sure you do not want to continue editing this customer?':
          profile.DOM.dialog._.show();
          break;
        }
    });
    this.DOM.dialog.listen('MDCDialog:accept', () => {
      switch (this.message) {
        case 'Delete this customer?':
          profile.delete();
          break;
        case 'Delete this appointment?':
          appointments.delete();
          break;
        case 'Are you sure you do not want to continue editing this appointment?':
          appointments.editor.close();
          break;
      }
    });
  }
};
