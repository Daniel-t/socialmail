
this.smDB = {

  onLoad: function() {
    // initialization code
	if (!this.initialized){
		this.initialized = true;
    	this.dbInit();
	}
  },

  dbConnection: null,

  dbSchema: {
     tables: {
       attachments:"email	TEXT, \
                    filename TEXT, \
                    URL TEXT, \
                    contentType	TEXT, \
                    msgUri	TEXT",
       numbers:"email	TEXT, \
            phoneNumber TEXT, \
            PRIMARY KEY(email, phoneNumber)",
	  urls:"email	TEXT, \
	      url TEXT, \
	      PRIMARY KEY(email, url)"

  	},
    
  },

  dbInit: function() {
    var dirService = Components.classes["@mozilla.org/file/directory_service;1"].
      getService(Components.interfaces.nsIProperties);

    var dbFile = dirService.get("ProfD", Components.interfaces.nsIFile);
    dbFile.append("socialMailDB.sqlite");

    var dbService = Components.classes["@mozilla.org/storage/service;1"].
      getService(Components.interfaces.mozIStorageService);

    var dbConnection;

    if (!dbFile.exists())
      dbConnection = this._dbCreate(dbService, dbFile);
    else {
      dbConnection = dbService.openDatabase(dbFile);
    }
    this.dbConnection = dbConnection;
  },
  	
  doUpgrade: function (version){
	  //Upgrade path
	  // MUST specify every released version, even if no changes are made to the schema
	  switch(version){
	  case "0.0.1":
		//call func that upgrades schema from 0.0.1 to 0.0.3  
	  case "0.0.3":
		 //call func that upgrades schema 0.0.3 to current
	  default:
		//nothing doing	  
			  
	  }
  },
  
  _dbCreate: function(aDBService, aDBFile) {
    var dbConnection = aDBService.openDatabase(aDBFile);
    this._dbCreateTables(dbConnection);
    return dbConnection;
  },

  _dbCreateTables: function(aDBConnection) {
    for(var name in this.dbSchema.tables)
      aDBConnection.createTable(name, this.dbSchema.tables[name]);
  },
  
  _insertHandler: {
	  handleResult: function(aResultSet) {},

	  handleError: function(aError) {
	    alert("Insert Error: " + aError.message);
	  },

	  handleCompletion: function(aReason) {}
  },
  
	_alertHandler:{
	  handleResult: function(aResultSet) {
	  	for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
			let part1 = row.getResultByIndex(0);
			let part2 = row.getResultByIndex(1);
			alert("Results: "+part1+" "+part2);
		}
  		}

  	},
  	
  addNumber: function(email,number) {
	  var statement = this.dbConnection.createStatement("insert or ignore into numbers (email, phoneNumber) values (:email , :pnumber)");  
	  statement.params.email = email;
	  statement.params.pnumber = escape(number);
	  
	  statement.executeAsync(this._insertHandler);
  },
  
  modifyNumber: function(email,old_number,new_number) {
	  var statement = this.dbConnection.createStatement("update numbers set phoneNumber=:new_number where email=:email AND phoneNumber=:old_number");  
	  statement.params.email = email;
	  statement.params.new_number = escape(new_number);
	  statement.params.old_number = escape(old_number);
	  statement.executeAsync(this._insertHandler);
  },

  deleteNumber: function(email,old_number,new_number) {
	  var statement = this.dbConnection.createStatement("delete from numbers where email=:email AND phoneNumber=:old_number");  
	  statement.params.email = email;
	  statement.params.old_number = escape(old_number);
	  statement.executeAsync(this._insertHandler);
  },
  
  getNumbers: function(email,handler) {
	 var statement = this.dbConnection.createStatement("SELECT * FROM numbers WHERE email = :email");  
	 statement.params.email = email;
	 
	 statement.executeAsync(handler);
  },
  
  addURL: function(email,url) {
	  var statement = this.dbConnection.createStatement("insert or ignore into urls (email, url) values (:email , :url)");  
	  statement.params.email = email;
	  statement.params.url = escape(url);
	  
	  statement.executeAsync(this._insertHandler);
  },
  
  modifyURL: function(email,old_url,new_url) {
	  var statement = this.dbConnection.createStatement("update urls set url=:new_url where email=:email AND url=:old_url");  
	  statement.params.email = email;
	  statement.params.new_url = escape(new_url);
	  statement.params.old_url = escape(old_url);
	  statement.executeAsync(this._insertHandler);
  },

  deleteURL: function(email,old_url,new_url) {
	  var statement = this.dbConnection.createStatement("delete from urls where email=:email AND url=:old_url");  
	  statement.params.email = email;
	  statement.params.old_url = escape(old_url);
	  statement.executeAsync(this._insertHandler);
  },
  
  getURLs: function(email,handler) {
	 var statement = this.dbConnection.createStatement("SELECT * FROM urls WHERE email = :email");  
	 statement.params.email = email;
	 
	 statement.executeAsync(handler);
  },
  
  
};

this.smDB.onLoad(); 
//window.addEventListener("load", function(e) { smDB.onLoad(e); }, false);