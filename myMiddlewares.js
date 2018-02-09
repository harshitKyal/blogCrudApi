function calculateAge(dateOfBirth){

	var today = new Date();
	var birthdate = new Date(dateOfBirth);
	var age =today.getFullYear() - birthdate.getFullYear();
	var m =today.getMonth() - birthdate.getMonth();
	if (m<0 || (m===0 && today.getDate() - birthdate.getDate())){
		age--;
	} 
	return age;

}


exports.ageFilter = function (req,res,next){

	var age =calculateAge(req.query.dob);
	console.log(age);
	req.age = age;
	if (age >=18){

		console.log("age if ok");
		next();
	}

	else
		res.send("You are not allowed to access this link");
};