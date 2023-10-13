const login = {
  DOM: {
    snackbar: new mdc.snackbar.MDCSnackbar(document.getElementById('snackbar'))
  },
  uiConfig: {
    callbacks: {
      uiShown: () => {
        setTimeout(() => {
          //Add Material Design Compontent Ripples to FirebaseUI
          document.querySelectorAll('.mdl-js-button').forEach((v) => {
            v.classList.remove('mdl-button', 'mdl-button--raised', 'mdl-js-button');
            v.classList.add('mdc-button', 'mdc-button--raised', 'mdc-ripple-surface');
            new mdc.ripple.MDCRipple(v);
          });
        }, 100);
      }
    },
    signInSuccessUrl: '/',
    signInOptions: [{
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      authMethod: 'https://accounts.google.com',
      clientId: '735654958328-crgcv72fgb7vgrt5uvcf15jaajv0g1v4.apps.googleusercontent.com',
      customParameters: {
        // Forces account selection even when one account is available.
        prompt: 'select_account'
      }
    }]
  },
  init() {
    // Initialize Firebase
    firebase.initializeApp({
      apiKey: "AIzaSyAPF1cj2-DjrcFRBtjVv6t07GTdnk_SuDM",
      authDomain: "nail-salon-beta.firebaseapp.com",
      databaseURL: "https://nail-salon-beta.firebaseio.com",
      projectId: "nail-salon-beta",
      storageBucket: "nail-salon-beta.appspot.com",
      messagingSenderId: "645156229259"
    });
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        //user is logged in, redirect to index.html
        window.location.replace('./');
      } else {
        if (window.location.hash === '#signedout') {
          login.DOM.snackbar.show({
            message: 'Signed out.' //Alert user that sign out was successful
          });
          history.pushState('', document.title, window.location.pathname);
        }
        //Initialize FirebaseUI
        const ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', login.uiConfig);
      }
    }, (error) => {
      console.error(error);
      //Alert user if error occurs during sign in or sign out process.
      login.DOM.snackbar.show({
        message: error,
        multiline: true,
        timeout: 5000
      });
    });

  }
}

login.init();
