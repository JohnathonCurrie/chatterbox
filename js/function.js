$(document).ready(function(){

	var config = {
	    apiKey: "AIzaSyDCBc5VRWrcwSjHJ5o_vclbINS69f-BMkQ",
	    authDomain: "chatterbox-e7efe.firebaseapp.com",
	    databaseURL: "https://chatterbox-e7efe.firebaseio.com",
	    storageBucket: "chatterbox-e7efe.appspot.com",
	    messagingSenderId: "850628774559" 
	};
	//runs firebase
  	firebase.initializeApp(config);

  	// some firebase variables
	var facebookProvider = new firebase.auth.FacebookAuthProvider();
	var auth = new firebase.auth();
	var database = new firebase.database();
	var loggedUser = {};
	var profileRef = database.ref('/profiles');

	function handleLogin(user) {

		if (user !== null) {

			// check for your profile
			profileRef.once("value").then(function(snapshot) {

				// get the snapshot value
				var snapshotValue = snapshot.val();

				// if no values present, just add the user
				if (snapshotValue == undefined || snapshotValue == null) {
					loggedUser = addNewUser(user, profileRef);
				}
				else {

					// iterate through the object, and determine if the
					// profile is present
					var keys = Object.keys(snapshotValue);
					var found = false;
					for (var i = 0; i < keys.length; i++) {

						// accessing objects:
						// way 1: objectname.objectvalue
						// way 2: objectname['objectvalue']
						if (snapshotValue[keys[i]].email == user.email) {
							
							// found the profile, access it
							loggedUser = snapshotValue[keys[i]];
							loggedUser.id = keys[i];
							found = true;
						}
					}

					// profile is not found, add a new one
					if (!found) {
						loggedUser = addNewUser(user, profileRef);
					}
				}
								// listen for todos and update on the fly
				var userRef = database.ref('/profiles');

				userRef.on('value', function(snapshot) {

					var snapshotValue = snapshot.val();
					console.log(snapshotValue);
					if (snapshotValue == undefined || snapshotValue == null) {
						$("#users_list").html(`
							<div class="row">
								<div class="col-sm-12">
									No friends
								</div>
							</div>
						`);
					}
					else {
						var keys = Object.keys(snapshotValue);

						// populate the div with the class 'todo-list'
						$("#users_list").html("");
						for (var i = 0; i < keys.length; i++) {
							$("#users_list").append(`
								<div class="row">
									<div class="col-sm-12">
										<a href="#" class="btn-user" data-user-id="${keys[i]}">${snapshotValue[keys[i]]['name']}</a>
									</div>
								</div>
							`);
							// The above creates a button for each user in the system. The button knows what their user id is
							console.log(keys[i]);
							console.log($('.btn-user').length);
						}
					}
				});

				
			});
		}
		else {
			loggedUser = {};
		}
	}
// function to add a new user
// (this isn't in document ready because it doesn't need to be initialized)
function addNewUser(passedUser, ref) {
	var user = {
		name: passedUser.displayName,
		email: passedUser.email
	};

	var newUser = ref.push(user);
	user.id = newUser.key;
	return user;
}

$(document).on('click', ".btn-user", function(){
	$("#chat_message").data('current_user', $(this).data('userId'));
	console.log($("#chat_message").data());

	var chat_key = sort_user_ids(loggedUser.id, $(this).data('userId'));

	load_user_messages(chat_key);

});

// actually adds the todo
$("#btn-add-message").click(function() {

	var current_user = $("#chat_message").data('current_user');

	var chat_key = sort_user_ids(loggedUser.id, current_user);

	var messageRef = database.ref('/messages').child(chat_key);

	// make sure the new todo isn't blank
	if ($("#chat_message").val() != "") {

		// add the todo and update the values. finally close the modal
		messageRef.push($("#chat_message").val());
		$("#chat_message").val("");
	}
});

$("#login").click(function() {

		// sign in via popup
		// PRO TIP: remember, .then usually indicates a promise!
		auth.signInWithPopup(facebookProvider).then(function(result) {

			// this is where the old code was, now in handleLogin()
			handleLogin(result.user);


		}, function(error) {
			console.log("Oops! There was an error");
			console.log(error);
		});
	});	

  	$("#side_collapseback").click(function() {
		$("#sidebar").animate({
			width: "-=100%"
		}, 500, function() {
			$("#chat_content").show(function() {

			});

		});

	});

		$("#side_collapse").click(function() {
			$("#chat_content").hide(function() {

			});
		$("#sidebar").animate({
			width: "+=100%" 
		}, 500, function() {


		});

	});

function load_user_messages(chat_key){
// listen for todos and update on the fly
				var messageRef = database.ref('/messages').child(chat_key);
				messageRef.on('value', function(snapshot) {

					var snapshotValue = snapshot.val();
					if (snapshotValue == undefined || snapshotValue == null) {
						$("#repeating_content_area").html(`
							<div class="row">
								<div class="col-sm-12">
									No content
								</div>
							</div>
						`);
					}
					else {
						var keys = Object.keys(snapshotValue);

						// populate the div with the class 'todo-list'
						$("#repeating_content_area").html("");
						for (var i = 0; i < keys.length; i++) {
							$("#repeating_content_area").append(`
								<div class="row">
									<div class="col-sm-12">
										${snapshotValue[keys[i]]}
									</div>
								</div>
							`);
						}
					}
				});
}

function sort_user_ids(user_1, user_2){

	return [user_1, user_2].sort().join("_");

}


});
