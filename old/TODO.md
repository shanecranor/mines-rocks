Phases:

* Load data from Canvas API and display in browser (100%)
* Send Canvas API data to SupaBase (75%)
	* still need to figure out how to get course grading breakdown
* Load Canvas API data from db and display for everyone to see (TODO)

Thoughts
* need to create an API for accessing the uploaded data
	* do calculations on the server so we don't need to load in every piece of data on the home screen
	* API needs to show data for each class (Eventually we need to combine each semester of a given class)
		* overall grade data
			* overall average final grade
			* maximum grade on every assignment
			* Upper quartile grade on every assignment
			* Lower quartile grade on every assignment
			* min grade on every assignment
		* grade breakdown
			* weight of each category
			* average grade on every assignment in the category
			* maximum grade on every assignment in the category
			* Upper quartile grade on every assignment in the category
			* Lower quartile grade on every assignment in the category
			* min grade on every assignment in the category
	* for this we should store the average score data seperately from the other data.
		* avg score data should be in a table with Assignment ID, assignment Name, Assignment Description, Avg Score, and probably any other metric that is not dependent on the uploader
* need to come up with a name for this damn thing\
