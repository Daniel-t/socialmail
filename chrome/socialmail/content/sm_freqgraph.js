this.sm_freqGraph= function sm_freqGraph(id){
	query=Gloda.newQuery(Gloda.NOUN_MESSAGE);
	query.from(id);
	coll=query.getCollection(com.networklighthouse.socialMail.sm_hndlr_freqGraph);
	
	query=Gloda.newQuery(Gloda.NOUN_MESSAGE);
	query.to(id);
	query.fromMe();
	coll=query.getCollection(com.networklighthouse.socialMail.sm_hndlr_sentCnt);
};


this.sm_hndlr_sentCnt ={
		onItemsAdded: function _onItemsAdded(aItems, aCollection) {},
		onItemsModified: function _onItemsModified(aItems, aCollection) {},
		onItemsRemoved: function _onItemsRemoved(aItems, aCollection) {},

		onQueryCompleted: function _onQueryCompleted(msg_coll) {
			var total=0;
						
			while(msg=msg_coll.items.pop()){
				total++;
			}
			
			var r_sentCnt=document.getElementById('sm_sentCnt');
			r_sentCnt.setAttribute("value",total);
			
		}
}


this.sm_hndlr_freqGraph ={
		onItemsAdded: function _onItemsAdded(aItems, aCollection) {},
		onItemsModified: function _onItemsModified(aItems, aCollection) {},
		onItemsRemoved: function _onItemsRemoved(aItems, aCollection) {},

		onQueryCompleted: function _onQueryCompleted(msg_coll) {
			msg_coll.becomeExplicit();
			max_size=90;
			//initialise the hours array
			hours=new Array();
			scale=new Array();
			values=new Array();
			for (hr=0;hr<=23;hr++){hours[hr]=0};
			
			max_hr=0;
			max=0;
			var total=0;
						
			while(msg=msg_coll.items.pop()){
				hour=msg.date.getHours();
				hours[hour]++;
				if (hours[hour]>max){
					max_hr=hour;
					max=hours[hour];				
				}
				v=new Array(hour,hours[hour]);
				values.push(v);
				total++;
			}
			
			var r_receivedCnt=document.getElementById('sm_receivedCnt');
			r_receivedCnt.setAttribute("value",total);
			
			out="";
			unit=max_size/max;
			debugger;
			graph=document.getElementById("sm_svggraph");

			for (hr=0;hr<=23;hr++){
				out+=hr+" "+hours[hr]+" <br\>";
				scale[hr]=Math.round(hours[hr]*unit);
				//new box
				//set size
				//set color
				//addChild
			};
			graph.setValues(scale);
			dlog(out);
			
			//buildBarGraph(table,params);

			//JQuery Style
			
			
			
		}
}
