var main = {
  DOM: {
    snackbar: new mdc.snackbar.MDCSnackbar(document.getElementById('snackbar')),
    progressbar: document.getElementById('progressbar')
  },
  customers: {},
  pull: function()  {
    main.firestore.collection('customers')
      .doc('index')
      .get()
      .then(doc => {
        search.index = doc.data() || {};
        main.DOM.progressbar.style.opacity = 0;
        search.init();

        if (!doc.data()) {
          main.firestore.collection('customers')
            .doc('index')
            .set({})
            .catch(error => main.handle_error(error));
        }
        profile.init();
        warning.init();
        appointments.init();
      })
      .catch(error => main.handle_error(error));
  },
  init: function() {
    mdc.autoInit();

    firebase.initializeApp({
      apiKey: "AIzaSyAPF1cj2-DjrcFRBtjVv6t07GTdnk_SuDM",
      authDomain: "nail-salon-beta.firebaseapp.com",
      databaseURL: "https://nail-salon-beta.firebaseio.com",
      projectId: "nail-salon-beta",
      storageBucket: "nail-salon-beta.appspot.com",
      messagingSenderId: "645156229259"
    });

    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        window.location.replace('./login#signedout');
      }
    }, (error) => main.handle_error(error));

    main.firestore = firebase.firestore();
    main.firestore.settings({
      timestampsInSnapshots: true
    });

    main.pull();
    document.getElementById('signout').addEventListener('click', () => firebase.auth().signOut());
  },
  handle_error: function(error) {
    main.DOM.progressbar.style.opacity = 0;
    console.error(error);
    main.DOM.snackbar.show({
      message: error
    });
  }
}

main.init();
